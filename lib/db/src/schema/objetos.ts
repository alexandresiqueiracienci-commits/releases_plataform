import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const objetosTable = pgTable("objetos", {
  id: serial("id").primaryKey(),
  chave: text("chave").notNull().unique(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  // Ações disponíveis para este objeto (consultar, criar, atualizar, excluir e
  // ações especiais como enviar_evidencia e alterar_status).
  acoes: text("acoes")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  // Objetos de sistema (telas internas) não podem ser excluídos.
  sistema: boolean("sistema").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Objeto = typeof objetosTable.$inferSelect;
