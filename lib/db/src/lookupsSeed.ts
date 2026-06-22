import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "./schema";
import { lookupsTable } from "./schema";
import { STATUS_CENARIO_CATEGORY, STATUS_EVIDENCIAS_ENVIADAS } from "./constants";

type Database = NodePgDatabase<typeof schema>;

// Garante que o status "Evidências Enviadas" exista na categoria status_cenario,
// já que ele é definido programaticamente pelo botão de conclusão de uploads.
// Idempotente: não duplica o valor caso já exista.
export async function ensureStatusEvidenciasEnviadas(
  database: Database,
): Promise<void> {
  const [existing] = await database
    .select({ id: lookupsTable.id })
    .from(lookupsTable)
    .where(
      and(
        eq(lookupsTable.category, STATUS_CENARIO_CATEGORY),
        eq(lookupsTable.value, STATUS_EVIDENCIAS_ENVIADAS),
      ),
    );
  if (existing) return;
  await database.insert(lookupsTable).values({
    category: STATUS_CENARIO_CATEGORY,
    value: STATUS_EVIDENCIAS_ENVIADAS,
  });
}
