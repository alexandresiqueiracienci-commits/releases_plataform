import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, lookupsTable } from "@workspace/db";
import {
  ListLookupsQueryParams,
  ListLookupsResponse,
  ListLookupsResponseItem,
  CreateLookupBody,
  UpdateLookupParams,
  UpdateLookupBody,
  UpdateLookupResponse,
  DeleteLookupParams,
} from "@workspace/api-zod";
import { requireApproved, requireAdmin } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get("/lookups", requireApproved, async (req, res): Promise<void> => {
  const query = ListLookupsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(lookupsTable)
    .where(
      query.data.category
        ? eq(lookupsTable.category, query.data.category)
        : undefined,
    )
    .orderBy(asc(lookupsTable.ordem), asc(lookupsTable.value));

  res.json(ListLookupsResponse.parse(toJson(rows)));
});

router.post("/lookups", requireAdmin, async (req, res): Promise<void> => {
  const body = CreateLookupBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [lookup] = await db.insert(lookupsTable).values(body.data).returning();

  res.status(201).json(ListLookupsResponseItem.parse(toJson(lookup)));
});

router.patch("/lookups/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateLookupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateLookupBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [lookup] = await db
    .update(lookupsTable)
    .set(body.data)
    .where(eq(lookupsTable.id, params.data.id))
    .returning();

  if (!lookup) {
    res.status(404).json({ error: "Registro não encontrado" });
    return;
  }

  res.json(UpdateLookupResponse.parse(toJson(lookup)));
});

router.delete("/lookups/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteLookupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lookup] = await db
    .delete(lookupsTable)
    .where(eq(lookupsTable.id, params.data.id))
    .returning();

  if (!lookup) {
    res.status(404).json({ error: "Registro não encontrado" });
    return;
  }

  res.sendStatus(204);
});

export default router;
