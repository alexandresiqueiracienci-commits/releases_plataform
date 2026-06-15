import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lookupsTable = pgTable("lookups", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  value: text("value").notNull(),
  ordem: integer("ordem"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertLookupSchema = createInsertSchema(lookupsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLookup = z.infer<typeof insertLookupSchema>;
export type Lookup = typeof lookupsTable.$inferSelect;
