import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { releasesTable } from "./releases";

export const demandasTable = pgTable("demandas", {
  id: serial("id").primaryKey(),
  releaseId: integer("release_id")
    .notNull()
    .references(() => releasesTable.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  codigoServiceNow: text("codigo_service_now"),
  wps: integer("wps"),
  liderDemanda: text("lider_demanda"),
  pep: text("pep"),
  projetoSspId: text("projeto_ssp_id"),
  origem: text("origem"),
  resumoExecutivo: text("resumo_executivo"),
  liderGerenteProjetos: text("lider_gerente_projetos"),
  liderancaArea: text("lideranca_area"),
  tamanho: text("tamanho"),
  urlKickoff: text("url_kickoff"),
  urlBusinessCase: text("url_business_case"),
  urlCronograma: text("url_cronograma"),
  processosNegocio: text("processos_negocio"),
  sistemasDePara: text("sistemas_de_para"),
  dataAprovacaoL2: timestamp("data_aprovacao_l2", { withTimezone: true }),
  cienteModeloCustos: boolean("ciente_modelo_custos"),
  pepOpexDetalhes: text("pep_opex_detalhes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertDemandaSchema = createInsertSchema(demandasTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDemanda = z.infer<typeof insertDemandaSchema>;
export type Demanda = typeof demandasTable.$inferSelect;
