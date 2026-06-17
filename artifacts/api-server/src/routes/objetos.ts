import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, objetosTable } from "@workspace/db";
import {
  ListObjetosResponse,
  ListObjetosResponseItem,
  CreateObjetoBody,
  UpdateObjetoParams,
  UpdateObjetoBody,
  UpdateObjetoResponse,
  DeleteObjetoParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

function slugifyChave(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

router.get("/objetos", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(objetosTable).orderBy(objetosTable.id);
  res.json(ListObjetosResponse.parse(toJson(rows)));
});

router.post("/objetos", requireAdmin, async (req, res): Promise<void> => {
  const body = CreateObjetoBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const chave = (body.data.chave?.trim() && slugifyChave(body.data.chave)) ||
    slugifyChave(body.data.nome);
  if (!chave) {
    res.status(400).json({ error: "Chave inválida" });
    return;
  }

  const [existing] = await db
    .select()
    .from(objetosTable)
    .where(eq(objetosTable.chave, chave));
  if (existing) {
    res.status(409).json({ error: "Já existe um objeto com essa chave" });
    return;
  }

  const acoes = Array.from(new Set(body.data.acoes));

  const [objeto] = await db
    .insert(objetosTable)
    .values({
      chave,
      nome: body.data.nome.trim(),
      descricao: body.data.descricao?.trim() || null,
      acoes,
      sistema: false,
    })
    .returning();

  res.status(201).json(ListObjetosResponseItem.parse(toJson(objeto)));
});

router.patch("/objetos/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateObjetoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateObjetoBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (body.data.nome !== undefined) updates.nome = body.data.nome.trim();
  if (body.data.descricao !== undefined)
    updates.descricao = body.data.descricao.trim() || null;
  if (body.data.acoes !== undefined)
    updates.acoes = Array.from(new Set(body.data.acoes));

  const [objeto] = await db
    .update(objetosTable)
    .set(updates)
    .where(eq(objetosTable.id, params.data.id))
    .returning();

  if (!objeto) {
    res.status(404).json({ error: "Objeto não encontrado" });
    return;
  }

  res.json(UpdateObjetoResponse.parse(toJson(objeto)));
});

router.delete("/objetos/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteObjetoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [objeto] = await db
    .select()
    .from(objetosTable)
    .where(eq(objetosTable.id, params.data.id));
  if (!objeto) {
    res.status(404).json({ error: "Objeto não encontrado" });
    return;
  }
  if (objeto.sistema) {
    res.status(400).json({ error: "Objetos de sistema não podem ser excluídos" });
    return;
  }

  // perfil_permissoes rows referencing this object cascade on delete.
  await db.delete(objetosTable).where(eq(objetosTable.id, objeto.id));

  res.sendStatus(204);
});

export default router;
