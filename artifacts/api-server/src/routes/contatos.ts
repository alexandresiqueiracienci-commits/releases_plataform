import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, contatosTable } from "@workspace/db";
import {
  ListContatosQueryParams,
  ListContatosResponse,
  ListContatosResponseItem,
  CreateContatoBody,
  UpdateContatoParams,
  UpdateContatoBody,
  UpdateContatoResponse,
  DeleteContatoParams,
} from "@workspace/api-zod";
import { requirePermission } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get(
  "/contatos",
  requirePermission("contatos", "consultar"),
  async (req, res): Promise<void> => {
  const query = ListContatosQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const like = query.data.search ? `%${query.data.search}%` : null;
  const rows = await db
    .select()
    .from(contatosTable)
    .where(
      like
        ? or(
            ilike(contatosTable.nome, like),
            ilike(contatosTable.empresa, like),
            ilike(contatosTable.contato1, like),
            ilike(contatosTable.contato2, like),
            ilike(contatosTable.localidade, like),
            ilike(contatosTable.papel, like),
            ilike(contatosTable.email, like),
          )
        : undefined,
    )
    .orderBy(contatosTable.id);

  res.json(ListContatosResponse.parse(toJson(rows)));
});

router.post(
  "/contatos",
  requirePermission("contatos", "criar"),
  async (req, res): Promise<void> => {
  const body = CreateContatoBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [contato] = await db
    .insert(contatosTable)
    .values(body.data)
    .returning();

  res.status(201).json(ListContatosResponseItem.parse(toJson(contato)));
});

router.patch(
  "/contatos/:id",
  requirePermission("contatos", "atualizar"),
  async (req, res): Promise<void> => {
  const params = UpdateContatoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateContatoBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [contato] = await db
    .update(contatosTable)
    .set(body.data)
    .where(eq(contatosTable.id, params.data.id))
    .returning();

  if (!contato) {
    res.status(404).json({ error: "Registro não encontrado" });
    return;
  }

  res.json(UpdateContatoResponse.parse(toJson(contato)));
});

router.delete(
  "/contatos/:id",
  requirePermission("contatos", "excluir"),
  async (req, res): Promise<void> => {
    const params = DeleteContatoParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [contato] = await db
      .delete(contatosTable)
      .where(eq(contatosTable.id, params.data.id))
      .returning();

    if (!contato) {
      res.status(404).json({ error: "Registro não encontrado" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
