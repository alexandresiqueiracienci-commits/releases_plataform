import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, escalaTable } from "@workspace/db";
import {
  ListEscalaQueryParams,
  ListEscalaResponse,
  ListEscalaResponseItem,
  CreateEscalaBody,
  UpdateEscalaParams,
  UpdateEscalaBody,
  UpdateEscalaResponse,
  DeleteEscalaParams,
} from "@workspace/api-zod";
import { requirePermission } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get(
  "/escala",
  requirePermission("escala", "consultar"),
  async (req, res): Promise<void> => {
  const query = ListEscalaQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const like = query.data.search ? `%${query.data.search}%` : null;
  const rows = await db
    .select()
    .from(escalaTable)
    .where(
      like
        ? or(
            ilike(escalaTable.pessoa, like),
            ilike(escalaTable.empresa, like),
            ilike(escalaTable.papel, like),
          )
        : undefined,
    )
    .orderBy(escalaTable.id);

  res.json(ListEscalaResponse.parse(toJson(rows)));
});

router.post(
  "/escala",
  requirePermission("escala", "criar"),
  async (req, res): Promise<void> => {
  const body = CreateEscalaBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [entry] = await db.insert(escalaTable).values(body.data).returning();

  res.status(201).json(ListEscalaResponseItem.parse(toJson(entry)));
});

router.patch(
  "/escala/:id",
  requirePermission("escala", "atualizar"),
  async (req, res): Promise<void> => {
  const params = UpdateEscalaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateEscalaBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [entry] = await db
    .update(escalaTable)
    .set(body.data)
    .where(eq(escalaTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Registro não encontrado" });
    return;
  }

  res.json(UpdateEscalaResponse.parse(toJson(entry)));
});

router.delete(
  "/escala/:id",
  requirePermission("escala", "excluir"),
  async (req, res): Promise<void> => {
  const params = DeleteEscalaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .delete(escalaTable)
    .where(eq(escalaTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Registro não encontrado" });
    return;
  }

  res.sendStatus(204);
});

export default router;
