import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { scenariosTable } from "./scenarios";

export const evidenciasTable = pgTable("evidencias", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id")
    .notNull()
    .references(() => scenariosTable.id, { onDelete: "cascade" }),
  objectPath: text("object_path").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type"),
  size: integer("size"),
  uploadedByEmail: text("uploaded_by_email"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertEvidenciaSchema = createInsertSchema(evidenciasTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEvidencia = z.infer<typeof insertEvidenciaSchema>;
export type Evidencia = typeof evidenciasTable.$inferSelect;
