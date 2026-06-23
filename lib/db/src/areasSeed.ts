import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "./schema";
import { areasImpactadasTable } from "./schema";

type Database = NodePgDatabase<typeof schema>;

// Áreas impactadas padrão do catálogo. Idempotente: não duplica valores
// existentes (conflito por nome é ignorado), preservando ajustes do admin.
export const DEFAULT_AREAS_IMPACTADAS = [
  "Fiscal",
  "O&L",
  "Indústria",
  "Ciclo de Pedidos",
  "Compras",
  "Contas a Pagar/Receber",
  "Contábil",
  "Cadastro",
  "Captação VD",
  "Minha Loja",
  "Seller Center",
  "Pay",
  "Backoffice",
  "Dados e Integrações",
] as const;

export async function ensureAreasImpactadasDefaults(
  database: Database,
): Promise<void> {
  for (const nome of DEFAULT_AREAS_IMPACTADAS) {
    await database
      .insert(areasImpactadasTable)
      .values({ nome })
      .onConflictDoNothing({ target: areasImpactadasTable.nome });
  }
}
