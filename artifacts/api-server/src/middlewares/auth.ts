import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";

const ADMIN_EMAIL = "alexandresiqueira.cienci@natura.net";
const NATURA_DOMAIN = "@natura.net";

/**
 * Resolves the current Clerk user to a local DB user record, provisioning the
 * record on first login. Access rules:
 *  - the initial admin email -> ADMINISTRADOR / APROVADO
 *  - any @natura.net email   -> USUARIO / APROVADO
 *  - everyone else (third parties) -> USUARIO / PENDENTE (awaits admin approval)
 */
export async function getOrProvisionUser(req: Request): Promise<User | null> {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;
  if (!clerkUserId) return null;

  const existingByClerk = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId));
  if (existingByClerk[0]) return existingByClerk[0];

  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = (
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase();
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  let profile = "USUARIO";
  let status = "PENDENTE";
  if (email === ADMIN_EMAIL) {
    profile = "ADMINISTRADOR";
    status = "APROVADO";
  } else if (email.endsWith(NATURA_DOMAIN)) {
    profile = "USUARIO";
    status = "APROVADO";
  }

  // Link an existing pre-seeded record (matched by email) to this Clerk id,
  // preserving any profile/status an admin already assigned.
  if (email) {
    const existingByEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (existingByEmail[0]) {
      const [linked] = await db
        .update(usersTable)
        .set({ clerkUserId, name: existingByEmail[0].name ?? name })
        .where(eq(usersTable.id, existingByEmail[0].id))
        .returning();
      return linked;
    }
  }

  const [created] = await db
    .insert(usersTable)
    .values({ clerkUserId, email, name, profile, status })
    .returning();
  return created;
}

export function requireApproved(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  void (async () => {
    const user = await getOrProvisionUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (user.status !== "APROVADO") {
      res.status(403).json({ error: "Acesso ainda não aprovado" });
      return;
    }
    next();
  })().catch(next);
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  void (async () => {
    const user = await getOrProvisionUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (user.status !== "APROVADO" || user.profile !== "ADMINISTRADOR") {
      res.status(403).json({ error: "Acesso restrito a administradores" });
      return;
    }
    next();
  })().catch(next);
}

/**
 * Returns true if the user is allowed to upload test evidences:
 * @natura.net accounts, terceiros autorizados, or administradores.
 */
export function canUploadEvidencias(user: User): boolean {
  if (user.status !== "APROVADO") return false;
  return (
    user.email.toLowerCase().endsWith(NATURA_DOMAIN) ||
    user.terceiro === true ||
    user.profile === "ADMINISTRADOR"
  );
}

export function requireUploader(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  void (async () => {
    const user = await getOrProvisionUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!canUploadEvidencias(user)) {
      res.status(403).json({
        error:
          "Apenas contas @natura.net ou terceiros autorizados podem enviar evidencias",
      });
      return;
    }
    next();
  })().catch(next);
}
