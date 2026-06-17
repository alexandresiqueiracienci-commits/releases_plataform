import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "./schema";
import { perfisTable } from "./schema/perfis";
import { objetosTable } from "./schema/objetos";
import { perfilPermissoesTable } from "./schema/perfilPermissoes";
import {
  DEFAULT_PERFIS,
  DEFAULT_OBJETOS,
  USUARIO_DEFAULT_PERMS,
  DEFAULT_PROFILE_CHAVE,
} from "./rbac";

type Database = NodePgDatabase<typeof schema>;

/**
 * Idempotently ensures the default RBAC profiles, system objects and the
 * default "Usuário" consultation permissions exist. Safe to run on every
 * startup: existing custom profiles, objects and grants are preserved.
 */
export async function seedRbacDefaults(database: Database): Promise<void> {
  for (const perfil of DEFAULT_PERFIS) {
    await database
      .insert(perfisTable)
      .values({ ...perfil, sistema: true })
      .onConflictDoNothing({ target: perfisTable.chave });
  }

  for (const objeto of DEFAULT_OBJETOS) {
    await database
      .insert(objetosTable)
      .values({
        chave: objeto.chave,
        nome: objeto.nome,
        descricao: objeto.descricao,
        acoes: [...objeto.acoes],
        sistema: true,
      })
      .onConflictDoUpdate({
        target: objetosTable.chave,
        set: {
          nome: objeto.nome,
          descricao: objeto.descricao,
          acoes: [...objeto.acoes],
          sistema: true,
        },
      });
  }

  const [usuario] = await database
    .select()
    .from(perfisTable)
    .where(eq(perfisTable.chave, DEFAULT_PROFILE_CHAVE));
  if (!usuario) return;

  for (const perm of USUARIO_DEFAULT_PERMS) {
    const [objeto] = await database
      .select()
      .from(objetosTable)
      .where(eq(objetosTable.chave, perm.objeto));
    if (!objeto) continue;
    await database
      .insert(perfilPermissoesTable)
      .values({ perfilId: usuario.id, objetoId: objeto.id, acao: perm.acao })
      .onConflictDoNothing();
  }
}
