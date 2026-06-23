import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const releasesTable = pgTable("releases", {
  id: serial("id").primaryKey(),
  sigla: text("sigla").notNull(),
  liderNome: text("lider_nome").notNull(),
  login: text("login").notNull(),
  tipo: text("tipo").notNull(),
  goLiveInicio: timestamp("go_live_inicio", { withTimezone: true }),
  goLiveTermino: timestamp("go_live_termino", { withTimezone: true }),
  sistemas: text("sistemas").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertReleaseSchema = createInsertSchema(releasesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releasesTable.$inferSelect;
