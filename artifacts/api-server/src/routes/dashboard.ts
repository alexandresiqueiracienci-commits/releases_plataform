import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, scenariosTable, type Scenario } from "@workspace/db";
import {
  GetDashboardSummaryQueryParams,
  GetDashboardSummaryResponse,
  GetDashboardMatrixQueryParams,
  GetDashboardMatrixResponse,
} from "@workspace/api-zod";
import { requireApproved } from "../middlewares/auth";

const router: IRouter = Router();

const NAO_INFORMADO = "Não informado";

function norm(value: string | null): string {
  const trimmed = (value ?? "").trim();
  return trimmed.length ? trimmed : NAO_INFORMADO;
}

function countBy(
  rows: Scenario[],
  pick: (s: Scenario) => string | null,
): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = norm(pick(row));
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

async function loadScenarios(prioridade?: string): Promise<Scenario[]> {
  return db
    .select()
    .from(scenariosTable)
    .where(prioridade ? eq(scenariosTable.prioridade, prioridade) : undefined);
}

router.get(
  "/dashboard/summary",
  requireApproved,
  async (req, res): Promise<void> => {
    const query = GetDashboardSummaryQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    const rows = await loadScenarios(query.data.prioridade);

    res.json(
      GetDashboardSummaryResponse.parse({
        total: rows.length,
        byStatus: countBy(rows, (s) => s.statusCenario),
        bySite: countBy(rows, (s) => s.site),
        bySistema: countBy(rows, (s) => s.sistema),
        byPrioridade: countBy(rows, (s) => s.prioridade),
      }),
    );
  },
);

router.get(
  "/dashboard/matrix",
  requireApproved,
  async (req, res): Promise<void> => {
    const query = GetDashboardMatrixQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    const rows = await loadScenarios(query.data.prioridade);

    const statusSet = new Set<string>();
    const siteSet = new Set<string>();
    for (const row of rows) {
      statusSet.add(norm(row.statusCenario));
      siteSet.add(norm(row.site));
    }
    const statuses = Array.from(statusSet).sort((a, b) =>
      a.localeCompare(b),
    );
    const sites = Array.from(siteSet).sort((a, b) => a.localeCompare(b));
    const statusIndex = new Map(statuses.map((s, i) => [s, i]));

    const cellsBySite = new Map<string, number[]>(
      sites.map((s) => [s, new Array(statuses.length).fill(0)]),
    );
    for (const row of rows) {
      const site = norm(row.site);
      const idx = statusIndex.get(norm(row.statusCenario));
      if (idx === undefined) continue;
      const arr = cellsBySite.get(site);
      if (arr) arr[idx] += 1;
    }

    const matrixRows = sites.map((site) => {
      const cells = cellsBySite.get(site) ?? new Array(statuses.length).fill(0);
      const total = cells.reduce((sum, n) => sum + n, 0);
      return { site, cells, total };
    });

    const columnTotals = statuses.map((_, i) =>
      matrixRows.reduce((sum, r) => sum + r.cells[i], 0),
    );
    const grandTotal = columnTotals.reduce((sum, n) => sum + n, 0);
    const statusPercentages = columnTotals.map((c) =>
      grandTotal ? Math.round((c / grandTotal) * 1000) / 10 : 0,
    );

    res.json(
      GetDashboardMatrixResponse.parse({
        statuses,
        rows: matrixRows,
        columnTotals,
        grandTotal,
        statusPercentages,
      }),
    );
  },
);

export default router;
