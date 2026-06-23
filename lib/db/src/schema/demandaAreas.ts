import {
  pgTable,
  serial,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { demandasTable } from "./demandas";
import { areasImpactadasTable } from "./areasImpactadas";

export const demandaAreasTable = pgTable(
  "demanda_areas",
  {
    id: serial("id").primaryKey(),
    demandaId: integer("demanda_id")
      .notNull()
      .references(() => demandasTable.id, { onDelete: "cascade" }),
    areaId: integer("area_id")
      .notNull()
      .references(() => areasImpactadasTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.demandaId, t.areaId)],
);

export type DemandaArea = typeof demandaAreasTable.$inferSelect;
