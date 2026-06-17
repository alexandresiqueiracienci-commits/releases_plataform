import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  perfisTable,
  objetosTable,
  perfilPermissoesTable,
  usersTable,
  ADMIN_PROFILE_CHAVE,
  DEFAULT_PROFILE_CHAVE,
} from "@workspace/db";
import {
  ListPerfisResponse,
  ListPerfisResponseItem,
  CreatePerfilBody,
  UpdatePerfilParams,
  UpdatePerfilBody,
  UpdatePerfilResponse,
  DeletePerfilParams,
  GetPerfilPermissoesParams,
  GetPerfilPermissoesResponse,
  SetPerfilPermissoesParams,
  SetPerfilPermissoesBody,
  SetPerfilPermissoesResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

function slugifyChave(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

router.get("/perfis", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(perfisTable).orderBy(perfisTable.id);
  res.json(ListPerfisResponse.parse(toJson(rows)));
});

router.post("/perfis", requireAdmin, async (req, res): Promise<void> => {
  const body = CreatePerfilBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const nome = body.data.nome.trim();
  const chaveBase = (body.data.chave?.trim() || slugifyChave(nome)) || "PERFIL";
  if (!chaveBase) {
    res.status(400).json({ error: "Chave inválida" });
    return;
  }

  const [existing] = await db
    .select()
    .from(perfisTable)
    .where(eq(perfisTable.chave, chaveBase));
  if (existing) {
    res.status(409).json({ error: "Já existe um perfil com essa chave" });
    return;
  }

  const [perfil] = await db
    .insert(perfisTable)
    .values({
      chave: chaveBase,
      nome,
      descricao: body.data.descricao?.trim() || null,
      sistema: false,
    })
    .returning();

  res.status(201).json(ListPerfisResponseItem.parse(toJson(perfil)));
});

router.patch("/perfis/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdatePerfilParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdatePerfilBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (body.data.nome !== undefined) updates.nome = body.data.nome.trim();
  if (body.data.descricao !== undefined)
    updates.descricao = body.data.descricao.trim() || null;

  const [perfil] = await db
    .update(perfisTable)
    .set(updates)
    .where(eq(perfisTable.id, params.data.id))
    .returning();

  if (!perfil) {
    res.status(404).json({ error: "Perfil não encontrado" });
    return;
  }

  res.json(UpdatePerfilResponse.parse(toJson(perfil)));
});

router.delete("/perfis/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeletePerfilParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [perfil] = await db
    .select()
    .from(perfisTable)
    .where(eq(perfisTable.id, params.data.id));
  if (!perfil) {
    res.status(404).json({ error: "Perfil não encontrado" });
    return;
  }
  if (perfil.sistema) {
    res.status(400).json({ error: "Perfis de sistema não podem ser excluídos" });
    return;
  }

  await db.transaction(async (tx) => {
    // Reassign users on this profile to the default profile to avoid orphans.
    await tx
      .update(usersTable)
      .set({ profile: DEFAULT_PROFILE_CHAVE })
      .where(eq(usersTable.profile, perfil.chave));
    // perfil_permissoes rows cascade on perfil delete.
    await tx.delete(perfisTable).where(eq(perfisTable.id, perfil.id));
  });

  res.sendStatus(204);
});

router.get(
  "/perfis/:id/permissoes",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = GetPerfilPermissoesParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [perfil] = await db
      .select()
      .from(perfisTable)
      .where(eq(perfisTable.id, params.data.id));
    if (!perfil) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }

    // The administrator profile implicitly has every action of every object.
    if (perfil.chave === ADMIN_PROFILE_CHAVE) {
      const objetos = await db.select().from(objetosTable);
      const all = objetos.flatMap((o) =>
        o.acoes.map((acao) => ({ objetoId: o.id, acao })),
      );
      res.json(GetPerfilPermissoesResponse.parse(all));
      return;
    }

    const rows = await db
      .select({
        objetoId: perfilPermissoesTable.objetoId,
        acao: perfilPermissoesTable.acao,
      })
      .from(perfilPermissoesTable)
      .where(eq(perfilPermissoesTable.perfilId, perfil.id));

    res.json(GetPerfilPermissoesResponse.parse(rows));
  },
);

router.put(
  "/perfis/:id/permissoes",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = SetPerfilPermissoesParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = SetPerfilPermissoesBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [perfil] = await db
      .select()
      .from(perfisTable)
      .where(eq(perfisTable.id, params.data.id));
    if (!perfil) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }
    if (perfil.chave === ADMIN_PROFILE_CHAVE) {
      res.status(400).json({
        error: "O perfil Administrador tem acesso total e não é editável",
      });
      return;
    }

    // Validate every grant references an existing object/action pair.
    const objetos = await db.select().from(objetosTable);
    const objetoById = new Map(objetos.map((o) => [o.id, o]));
    for (const perm of body.data.permissoes) {
      const objeto = objetoById.get(perm.objetoId);
      if (!objeto || !objeto.acoes.includes(perm.acao)) {
        res.status(400).json({
          error: `Permissão inválida: objeto ${perm.objetoId} / ação ${perm.acao}`,
        });
        return;
      }
    }

    // Deduplicate to satisfy the unique (perfil, objeto, acao) constraint.
    const seen = new Set<string>();
    const unique = body.data.permissoes.filter((p) => {
      const key = `${p.objetoId}:${p.acao}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    await db.transaction(async (tx) => {
      await tx
        .delete(perfilPermissoesTable)
        .where(eq(perfilPermissoesTable.perfilId, perfil.id));
      if (unique.length > 0) {
        await tx.insert(perfilPermissoesTable).values(
          unique.map((p) => ({
            perfilId: perfil.id,
            objetoId: p.objetoId,
            acao: p.acao,
          })),
        );
      }
    });

    const rows = await db
      .select({
        objetoId: perfilPermissoesTable.objetoId,
        acao: perfilPermissoesTable.acao,
      })
      .from(perfilPermissoesTable)
      .where(eq(perfilPermissoesTable.perfilId, perfil.id));

    res.json(SetPerfilPermissoesResponse.parse(rows));
  },
);

export default router;
