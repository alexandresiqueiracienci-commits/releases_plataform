import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  ListUsersQueryParams,
  ListUsersResponse,
  UpdateUserParams,
  UpdateUserBody,
  UpdateUserResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get("/users", requireAdmin, async (req, res): Promise<void> => {
  const query = ListUsersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  const filtered = query.data.status
    ? rows.filter((u) => u.status === query.data.status)
    : rows;

  res.json(ListUsersResponse.parse(toJson(filtered)));
});

router.patch("/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set(body.data)
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  res.json(UpdateUserResponse.parse(toJson(user)));
});

export default router;
