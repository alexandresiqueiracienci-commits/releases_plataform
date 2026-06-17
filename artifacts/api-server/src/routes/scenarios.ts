import { Router, type IRouter } from "express";
import { eq, ilike, or, and, type SQL } from "drizzle-orm";
import { db, scenariosTable } from "@workspace/db";
import {
  ListScenariosQueryParams,
  ListScenariosResponse,
  CreateScenarioBody,
  GetScenarioParams,
  GetScenarioResponse,
  UpdateScenarioParams,
  UpdateScenarioBody,
  UpdateScenarioResponse,
  DeleteScenarioParams,
  UpdateScenarioStatusParams,
  UpdateScenarioStatusBody,
} from "@workspace/api-zod";
import { requirePermission } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get(
  "/scenarios",
  requirePermission("cenarios", "consultar"),
  async (req, res): Promise<void> => {
  const query = ListScenariosQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { search, prioridade, site, sistema, statusCenario } = query.data;

  const conditions: SQL[] = [];
  if (prioridade) conditions.push(eq(scenariosTable.prioridade, prioridade));
  if (site) conditions.push(eq(scenariosTable.site, site));
  if (sistema) conditions.push(eq(scenariosTable.sistema, sistema));
  if (statusCenario)
    conditions.push(eq(scenariosTable.statusCenario, statusCenario));
  if (search) {
    const like = `%${search}%`;
    const searchCond = or(
      ilike(scenariosTable.idTeste, like),
      ilike(scenariosTable.cenario, like),
      ilike(scenariosTable.macroProcesso, like),
      ilike(scenariosTable.quemExecuta, like),
      ilike(scenariosTable.facilitador, like),
    );
    if (searchCond) conditions.push(searchCond);
  }

  const rows = await db
    .select()
    .from(scenariosTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(scenariosTable.id);

  res.json(ListScenariosResponse.parse(toJson(rows)));
});

router.post(
  "/scenarios",
  requirePermission("cenarios", "criar"),
  async (req, res): Promise<void> => {
  const body = CreateScenarioBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [scenario] = await db
    .insert(scenariosTable)
    .values(body.data)
    .returning();

  res.status(201).json(GetScenarioResponse.parse(toJson(scenario)));
});

router.get(
  "/scenarios/:id",
  requirePermission("cenarios", "consultar"),
  async (req, res): Promise<void> => {
  const params = GetScenarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scenario] = await db
    .select()
    .from(scenariosTable)
    .where(eq(scenariosTable.id, params.data.id));

  if (!scenario) {
    res.status(404).json({ error: "Cenário não encontrado" });
    return;
  }

  res.json(GetScenarioResponse.parse(toJson(scenario)));
});

router.patch(
  "/scenarios/:id",
  requirePermission("cenarios", "atualizar"),
  async (req, res): Promise<void> => {
  const params = UpdateScenarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateScenarioBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [scenario] = await db
    .update(scenariosTable)
    .set(body.data)
    .where(eq(scenariosTable.id, params.data.id))
    .returning();

  if (!scenario) {
    res.status(404).json({ error: "Cenário não encontrado" });
    return;
  }

  res.json(UpdateScenarioResponse.parse(toJson(scenario)));
});

// Dedicated status-only update so a custom profile can change the status of the
// scenario it is uploading evidence to without full scenario-edit access.
router.patch(
  "/scenarios/:id/status",
  requirePermission("cenarios", "alterar_status"),
  async (req, res): Promise<void> => {
    const params = UpdateScenarioStatusParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateScenarioStatusBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [scenario] = await db
      .update(scenariosTable)
      .set({ statusCenario: body.data.statusCenario })
      .where(eq(scenariosTable.id, params.data.id))
      .returning();

    if (!scenario) {
      res.status(404).json({ error: "Cenário não encontrado" });
      return;
    }

    res.json(UpdateScenarioResponse.parse(toJson(scenario)));
  },
);

router.delete(
  "/scenarios/:id",
  requirePermission("cenarios", "excluir"),
  async (req, res): Promise<void> => {
    const params = DeleteScenarioParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [scenario] = await db
      .delete(scenariosTable)
      .where(eq(scenariosTable.id, params.data.id))
      .returning();

    if (!scenario) {
      res.status(404).json({ error: "Cenário não encontrado" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
