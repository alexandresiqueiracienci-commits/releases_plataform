import { Router, type IRouter } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, areasImpactadasTable } from "@workspace/db";
import {
  ListAreasQueryParams,
  ListAreasResponse,
  ListAreasResponseItem,
  CreateAreaBody,
  UpdateAreaParams,
  UpdateAreaBody,
  UpdateAreaResponse,
  DeleteAreaParams,
} from "@workspace/api-zod";
import { requirePermission } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get(
  "/areas",
  requirePermission("areas", "consultar"),
  async (req, res): Promise<void> => {
    const query = ListAreasQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    const like = query.data.search ? `%${query.data.search}%` : null;
    const rows = await db
      .select()
      .from(areasImpactadasTable)
      .where(like ? ilike(areasImpactadasTable.nome, like) : undefined)
      .orderBy(areasImpactadasTable.nome);

    res.json(ListAreasResponse.parse(toJson(rows)));
  },
);

router.post(
  "/areas",
  requirePermission("areas", "criar"),
  async (req, res): Promise<void> => {
    const body = CreateAreaBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [existing] = await db
      .select()
      .from(areasImpactadasTable)
      .where(eq(areasImpactadasTable.nome, body.data.nome));
    if (existing) {
      res.status(409).json({ error: "Área já cadastrada" });
      return;
    }

    const [area] = await db
      .insert(areasImpactadasTable)
      .values({ nome: body.data.nome })
      .returning();

    res.status(201).json(ListAreasResponseItem.parse(toJson(area)));
  },
);

router.patch(
  "/areas/:id",
  requirePermission("areas", "atualizar"),
  async (req, res): Promise<void> => {
    const params = UpdateAreaParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateAreaBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [area] = await db
      .update(areasImpactadasTable)
      .set(body.data)
      .where(eq(areasImpactadasTable.id, params.data.id))
      .returning();

    if (!area) {
      res.status(404).json({ error: "Registro não encontrado" });
      return;
    }

    res.json(UpdateAreaResponse.parse(toJson(area)));
  },
);

router.delete(
  "/areas/:id",
  requirePermission("areas", "excluir"),
  async (req, res): Promise<void> => {
    const params = DeleteAreaParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [area] = await db
      .delete(areasImpactadasTable)
      .where(eq(areasImpactadasTable.id, params.data.id))
      .returning();

    if (!area) {
      res.status(404).json({ error: "Registro não encontrado" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
