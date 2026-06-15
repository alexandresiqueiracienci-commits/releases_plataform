import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contatosTable = pgTable("contatos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  empresa: text("empresa").notNull(),
  contato1: text("contato1"),
  contato2: text("contato2"),
  localidade: text("localidade"),
  papel: text("papel"),
  email: text("email"),
  escalonamento: text("escalonamento"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertContatoSchema = createInsertSchema(contatosTable).omit({
  id: true,
  createdAt: true,
});
export type InsertContato = z.infer<typeof insertContatoSchema>;
export type Contato = typeof contatosTable.$inferSelect;
