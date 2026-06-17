import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { perfisTable } from "./perfis";
import { objetosTable } from "./objetos";

export const perfilPermissoesTable = pgTable(
  "perfil_permissoes",
  {
    id: serial("id").primaryKey(),
    perfilId: integer("perfil_id")
      .notNull()
      .references(() => perfisTable.id, { onDelete: "cascade" }),
    objetoId: integer("objeto_id")
      .notNull()
      .references(() => objetosTable.id, { onDelete: "cascade" }),
    acao: text("acao").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.perfilId, t.objetoId, t.acao)],
);

export type PerfilPermissao = typeof perfilPermissoesTable.$inferSelect;
