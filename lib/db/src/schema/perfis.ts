import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const perfisTable = pgTable("perfis", {
  id: serial("id").primaryKey(),
  chave: text("chave").notNull().unique(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  // Perfis de sistema (Administrador e Usuário) não podem ser excluídos.
  sistema: boolean("sistema").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Perfil = typeof perfisTable.$inferSelect;
