import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { eq, and, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  perfisTable,
  objetosTable,
  perfilPermissoesTable,
  ADMIN_PROFILE_CHAVE,
  type User,
} from "@workspace/db";

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

export function isAdminProfile(user: User): boolean {
  return user.status === "APROVADO" && user.profile === ADMIN_PROFILE_CHAVE;
}

/**
 * Returns the flat list of permissions ("objetoChave:acao") granted to a user
 * by their profile. Administrators implicitly receive every action of every
 * object. Not-approved users receive none.
 */
export async function getUserPermissions(user: User): Promise<string[]> {
  if (user.status !== "APROVADO") return [];

  if (user.profile === ADMIN_PROFILE_CHAVE) {
    const objetos = await db.select().from(objetosTable);
    return objetos.flatMap((o) => o.acoes.map((a) => `${o.chave}:${a}`));
  }

  const rows = await db
    .select({
      chave: objetosTable.chave,
      acao: perfilPermissoesTable.acao,
    })
    .from(perfilPermissoesTable)
    .innerJoin(perfisTable, eq(perfilPermissoesTable.perfilId, perfisTable.id))
    .innerJoin(
      objetosTable,
      eq(perfilPermissoesTable.objetoId, objetosTable.id),
    )
    .where(eq(perfisTable.chave, user.profile));

  return rows.map((r) => `${r.chave}:${r.acao}`);
}

/**
 * Checks whether a user is allowed to perform a single action on an object.
 * Administrators are always allowed; otherwise the grant must exist for the
 * user's profile.
 */
export async function hasPermission(
  user: User,
  objetoChave: string,
  acao: string,
): Promise<boolean> {
  if (user.status !== "APROVADO") return false;
  if (user.profile === ADMIN_PROFILE_CHAVE) return true;

  const rows = await db
    .select({ id: perfilPermissoesTable.id })
    .from(perfilPermissoesTable)
    .innerJoin(perfisTable, eq(perfilPermissoesTable.perfilId, perfisTable.id))
    .innerJoin(
      objetosTable,
      eq(perfilPermissoesTable.objetoId, objetosTable.id),
    )
    .where(
      and(
        eq(perfisTable.chave, user.profile),
        eq(objetosTable.chave, objetoChave),
        eq(perfilPermissoesTable.acao, acao),
        // A ação concedida só é válida se ainda fizer parte das ações
        // definidas para o objeto; evita grants órfãos após remoção de ação.
        sql`${perfilPermissoesTable.acao} = ANY(${objetosTable.acoes})`,
      ),
    );

  return rows.length > 0;
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
    if (!isAdminProfile(user)) {
      res.status(403).json({ error: "Acesso restrito a administradores" });
      return;
    }
    next();
  })().catch(next);
}

/**
 * Middleware factory that enforces a single (object, action) permission
 * server-side. The UI gating is advisory only — this is the real gate.
 */
export function requirePermission(objetoChave: string, acao: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
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
      if (!(await hasPermission(user, objetoChave, acao))) {
        res.status(403).json({ error: "Permissão negada" });
        return;
      }
      next();
    })().catch(next);
  };
}

/**
 * Middleware factory that allows access when the user holds ANY of the given
 * (object, action) grants. Useful for shared reference data (e.g. lookups)
 * consumed by several screens, so a user who can read any consuming screen can
 * load the reference lists. Administrators always pass.
 */
export function requireAnyPermission(pairs: [string, string][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
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
      if (user.profile === ADMIN_PROFILE_CHAVE) {
        next();
        return;
      }
      const checks = await Promise.all(
        pairs.map(([objeto, acao]) => hasPermission(user, objeto, acao)),
      );
      if (!checks.some(Boolean)) {
        res.status(403).json({ error: "Permissão negada" });
        return;
      }
      next();
    })().catch(next);
  };
}

/**
 * Legacy upload eligibility, preserved so existing @natura.net accounts and
 * authorized terceiros keep their ability to upload evidence regardless of
 * profile permissions.
 */
export function canUploadEvidenciasLegacy(user: User): boolean {
  if (user.status !== "APROVADO") return false;
  return (
    user.email.toLowerCase().endsWith(NATURA_DOMAIN) ||
    user.terceiro === true ||
    user.profile === ADMIN_PROFILE_CHAVE
  );
}

/**
 * Allows evidence upload when the user is eligible by the legacy rule OR has
 * been granted the special "enviar_evidencia" permission on the evidencias
 * object through a custom profile.
 */
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
    if (user.status !== "APROVADO") {
      res.status(403).json({ error: "Acesso ainda não aprovado" });
      return;
    }
    const allowed =
      canUploadEvidenciasLegacy(user) ||
      (await hasPermission(user, "evidencias", "enviar_evidencia"));
    if (!allowed) {
      res.status(403).json({
        error:
          "Você não tem permissão para enviar evidências. Solicite acesso ao administrador.",
      });
      return;
    }
    next();
  })().catch(next);
}
