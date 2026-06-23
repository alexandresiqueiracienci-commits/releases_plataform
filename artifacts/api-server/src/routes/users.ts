import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  ListUsersQueryParams,
  ListUsersResponse,
  ListUsersResponseItem,
  CreateUserBody,
  UpdateUserParams,
  UpdateUserBody,
  UpdateUserResponse,
} from "@workspace/api-zod";
import { ListUserOptionsResponse } from "@workspace/api-zod";
import { requireAdmin, requireApproved } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get(
  "/users/options",
  requireApproved,
  async (_req, res): Promise<void> => {
    const rows = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
      })
      .from(usersTable)
      .where(eq(usersTable.status, "APROVADO"))
      .orderBy(usersTable.name);

    res.json(ListUserOptionsResponse.parse(toJson(rows)));
  },
);

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

router.post("/users", requireAdmin, async (req, res): Promise<void> => {
  const body = CreateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const email = body.data.email.trim().toLowerCase();
  const name = body.data.name?.trim() || null;

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "E-mail já cadastrado" });
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      email,
      name,
      profile: "USUARIO",
      status: "APROVADO",
      terceiro: true,
    })
    .returning();

  res.status(201).json(ListUsersResponseItem.parse(toJson(user)));
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
