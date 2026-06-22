import { Router, type IRouter } from "express";
import { eq, and, or, ilike, count, max } from "drizzle-orm";
import {
  db,
  evidenciasTable,
  scenariosTable,
  STATUS_EVIDENCIAS_ENVIADAS,
  type Scenario,
} from "@workspace/db";
import {
  ListEvidenciasParams,
  ListEvidenciasResponse,
  ListEvidenciasResponseItem,
  CreateEvidenciaParams,
  CreateEvidenciaBody,
  DeleteEvidenciaParams,
  ConcluirEvidenciasParams,
  GetEvidenciasMonitorQueryParams,
  GetEvidenciasMonitorResponse,
} from "@workspace/api-zod";
import {
  requirePermission,
  requireUploader,
  requireApproved,
  hasPermission,
  getOrProvisionUser,
} from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get(
  "/scenarios/:id/evidencias",
  requirePermission("evidencias", "consultar"),
  async (req, res): Promise<void> => {
    const params = ListEvidenciasParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const rows = await db
      .select()
      .from(evidenciasTable)
      .where(eq(evidenciasTable.scenarioId, params.data.id))
      .orderBy(evidenciasTable.createdAt);

    res.json(ListEvidenciasResponse.parse(toJson(rows)));
  },
);

router.post(
  "/scenarios/:id/evidencias",
  requireUploader,
  async (req, res): Promise<void> => {
    const params = CreateEvidenciaParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = CreateEvidenciaBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    // Only allow canonical upload paths issued by request-url
    // (/objects/uploads/<id>) so a client cannot register arbitrary private
    // objects as evidence.
    if (!/^\/objects\/uploads\/[A-Za-z0-9_-]+$/.test(body.data.objectPath)) {
      res.status(400).json({ error: "objectPath inválido" });
      return;
    }

    const [scenario] = await db
      .select({ id: scenariosTable.id })
      .from(scenariosTable)
      .where(eq(scenariosTable.id, params.data.id));
    if (!scenario) {
      res.status(404).json({ error: "Cenário não encontrado" });
      return;
    }

    const user = await getOrProvisionUser(req);

    const [evidencia] = await db
      .insert(evidenciasTable)
      .values({
        scenarioId: params.data.id,
        objectPath: body.data.objectPath,
        fileName: body.data.fileName,
        contentType: body.data.contentType ?? null,
        size: body.data.size ?? null,
        uploadedByEmail: user?.email ?? null,
      })
      .returning();

    res.status(201).json(ListEvidenciasResponseItem.parse(toJson(evidencia)));
  },
);

router.delete(
  "/evidencias/:id",
  requireApproved,
  async (req, res): Promise<void> => {
    const params = DeleteEvidenciaParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [existing] = await db
      .select()
      .from(evidenciasTable)
      .where(eq(evidenciasTable.id, params.data.id));
    if (!existing) {
      res.status(404).json({ error: "Evidência não encontrada" });
      return;
    }

    const user = await getOrProvisionUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const isOwner =
      user.email &&
      existing.uploadedByEmail &&
      user.email.toLowerCase() === existing.uploadedByEmail.toLowerCase();
    // Permissão RBAC explícita (admin sempre passa via hasPermission) OU o
    // próprio autor da evidência pode removê-la.
    const canExcluir = await hasPermission(user, "evidencias", "excluir");
    if (!canExcluir && !isOwner) {
      res.status(403).json({
        error:
          "Você não tem permissão para excluir esta evidência.",
      });
      return;
    }

    await db
      .delete(evidenciasTable)
      .where(eq(evidenciasTable.id, params.data.id));

    res.sendStatus(204);
  },
);

// Marca todos os uploads das evidências como concluídos: muda o status do
// cenário para "Evidências Enviadas". Permitido para os mesmos usuários que
// podem enviar evidências (requireUploader).
router.post(
  "/scenarios/:id/evidencias/concluir",
  requireUploader,
  async (req, res): Promise<void> => {
    const params = ConcluirEvidenciasParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [scenario] = await db
      .update(scenariosTable)
      .set({ statusCenario: STATUS_EVIDENCIAS_ENVIADAS })
      .where(eq(scenariosTable.id, params.data.id))
      .returning();
    if (!scenario) {
      res.status(404).json({ error: "Cenário não encontrado" });
      return;
    }

    res.json(toJson(scenario));
  },
);

const NAO_INFORMADO = "Não informado";
function normLabel(value: string | null): string {
  const trimmed = (value ?? "").trim();
  return trimmed.length ? trimmed : NAO_INFORMADO;
}

function groupDeliveries(
  rows: { scenario: Scenario; entregue: boolean }[],
  pick: (s: Scenario) => string | null,
): { label: string; total: number; entregues: number; pendentes: number }[] {
  const map = new Map<string, { total: number; entregues: number }>();
  for (const { scenario, entregue } of rows) {
    const key = normLabel(pick(scenario));
    const acc = map.get(key) ?? { total: 0, entregues: 0 };
    acc.total += 1;
    if (entregue) acc.entregues += 1;
    map.set(key, acc);
  }
  return Array.from(map.entries())
    .map(([label, { total, entregues }]) => ({
      label,
      total,
      entregues,
      pendentes: total - entregues,
    }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

// Monitoramento consolidado das entregas de evidências por cenário, com
// agrupamentos por macro processo, site, sistema e prioridade.
router.get(
  "/evidencias/monitor",
  requirePermission("evidencias", "consultar"),
  async (req, res): Promise<void> => {
    const query = GetEvidenciasMonitorQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }
    const { search, prioridade, site, sistema, macroProcesso } = query.data;

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(scenariosTable.idTeste, `%${search}%`),
          ilike(scenariosTable.cenario, `%${search}%`),
        ),
      );
    }
    if (prioridade)
      conditions.push(eq(scenariosTable.prioridade, prioridade));
    if (site) conditions.push(eq(scenariosTable.site, site));
    if (sistema) conditions.push(eq(scenariosTable.sistema, sistema));
    if (macroProcesso)
      conditions.push(eq(scenariosTable.macroProcesso, macroProcesso));

    const scenarios = await db
      .select()
      .from(scenariosTable)
      .where(conditions.length ? and(...conditions) : undefined);

    const counts = await db
      .select({
        scenarioId: evidenciasTable.scenarioId,
        total: count(),
        ultimo: max(evidenciasTable.createdAt),
      })
      .from(evidenciasTable)
      .groupBy(evidenciasTable.scenarioId);

    const countByScenario = new Map(
      counts.map((c) => [
        c.scenarioId,
        { total: Number(c.total), ultimo: c.ultimo as Date | null },
      ]),
    );

    const enriched = scenarios.map((scenario) => {
      const ev = countByScenario.get(scenario.id);
      const totalEvidencias = ev?.total ?? 0;
      const entregue =
        (scenario.statusCenario ?? "").trim().toLowerCase() ===
        STATUS_EVIDENCIAS_ENVIADAS.toLowerCase();
      return { scenario, entregue, totalEvidencias, ultimo: ev?.ultimo ?? null };
    });

    const entregues = enriched.filter((e) => e.entregue).length;
    const comArquivos = enriched.filter((e) => e.totalEvidencias > 0).length;
    const totalArquivos = enriched.reduce(
      (sum, e) => sum + e.totalEvidencias,
      0,
    );

    const rows = enriched
      .map((e) => ({
        scenarioId: e.scenario.id,
        idTeste: e.scenario.idTeste,
        cenario: e.scenario.cenario,
        macroProcesso: e.scenario.macroProcesso,
        site: e.scenario.site,
        sistema: e.scenario.sistema,
        prioridade: e.scenario.prioridade,
        statusCenario: e.scenario.statusCenario,
        entregue: e.entregue,
        totalEvidencias: e.totalEvidencias,
        ultimoUpload: e.ultimo ? e.ultimo.toISOString() : null,
      }))
      .sort((a, b) => (a.idTeste ?? "").localeCompare(b.idTeste ?? ""));

    res.json(
      GetEvidenciasMonitorResponse.parse({
        summary: {
          total: enriched.length,
          entregues,
          pendentes: enriched.length - entregues,
          comArquivos,
          totalArquivos,
        },
        byMacroProcesso: groupDeliveries(enriched, (s) => s.macroProcesso),
        bySite: groupDeliveries(enriched, (s) => s.site),
        bySistema: groupDeliveries(enriched, (s) => s.sistema),
        byPrioridade: groupDeliveries(enriched, (s) => s.prioridade),
        rows,
      }),
    );
  },
);

export default router;
