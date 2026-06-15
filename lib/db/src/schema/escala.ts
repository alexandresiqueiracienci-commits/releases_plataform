import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const escalaTable = pgTable("escala", {
  id: serial("id").primaryKey(),
  pessoa: text("pessoa").notNull(),
  empresa: text("empresa"),
  papel: text("papel"),
  dia: text("dia"),
  horaInicio: text("hora_inicio"),
  horaFim: text("hora_fim"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertEscalaSchema = createInsertSchema(escalaTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEscala = z.infer<typeof insertEscalaSchema>;
export type Escala = typeof escalaTable.$inferSelect;
