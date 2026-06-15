import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scenariosTable = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  idTeste: text("id_teste").notNull(),
  chaveamento: text("chaveamento"),
  sequencia: text("sequencia"),
  blocoExecucao: text("bloco_execucao"),
  fisicoSistemico: text("fisico_sistemico"),
  prioridade: text("prioridade"),
  cenario: text("cenario"),
  dependenciaCenarioExterno: text("dependencia_cenario_externo"),
  quemExecuta: text("quem_executa"),
  baselineCustomizado: text("baseline_customizado"),
  facilitador: text("facilitador"),
  keyUser: text("key_user"),
  superUser: text("super_user"),
  endUser: text("end_user"),
  macroProcesso: text("macro_processo"),
  sequenciaPassoAPasso: text("sequencia_passo_a_passo"),
  evidenciasObrigatorias: text("evidencias_obrigatorias"),
  quemDefineMassa: text("quem_define_massa"),
  massaDados: text("massa_dados"),
  celula: text("celula"),
  agrupamento: text("agrupamento"),
  tipoCenario: text("tipo_cenario"),
  liberacao: text("liberacao"),
  observacoes: text("observacoes"),
  sistema: text("sistema"),
  site: text("site"),
  statusCenario: text("status_cenario"),
  idDefeitoJira: text("id_defeito_jira"),
  idCenarioJira: text("id_cenario_jira"),
  statusCheckPoint: text("status_check_point"),
  diretorio: text("diretorio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertScenarioSchema = createInsertSchema(scenariosTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenariosTable.$inferSelect;
