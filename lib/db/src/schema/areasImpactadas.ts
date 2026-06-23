import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const areasImpactadasTable = pgTable("areas_impactadas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertAreaImpactadaSchema = createInsertSchema(
  areasImpactadasTable,
).omit({
  id: true,
  createdAt: true,
});
export type InsertAreaImpactada = z.infer<typeof insertAreaImpactadaSchema>;
export type AreaImpactada = typeof areasImpactadasTable.$inferSelect;
