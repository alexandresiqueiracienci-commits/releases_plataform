import { Router, type IRouter } from "express";
import { and, eq, ilike, or, inArray, type SQL } from "drizzle-orm";
import {
  db,
  demandasTable,
  demandaAreasTable,
  areasImpactadasTable,
  releasesTable,
} from "@workspace/db";
import {
  ListDemandasQueryParams,
  ListDemandasResponse,
  CreateDemandaBody,
  GetDemandaParams,
  GetDemandaResponse,
  UpdateDemandaParams,
  UpdateDemandaBody,
  UpdateDemandaResponse,
  DeleteDemandaParams,
} from "@workspace/api-zod";
import { requirePermission } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

class BadRequestError extends Error {}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError("Data inválida");
  }
  return date;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | Tx;

// Garante que todos os areaIds existem; lança BadRequestError caso contrário.
async function assertAreasExist(
  exec: DbOrTx,
  areaIds: number[],
): Promise<void> {
  const unique = [...new Set(areaIds)];
  if (unique.length === 0) return;
  const found = await exec
    .select({ id: areasImpactadasTable.id })
    .from(areasImpactadasTable)
    .where(inArray(areasImpactadasTable.id, unique));
  if (found.length !== unique.length) {
    throw new BadRequestError("Uma ou mais áreas informadas não existem");
  }
}

type DemandaRow = typeof demandasTable.$inferSelect;
type AreaRow = typeof areasImpactadasTable.$inferSelect;

// Anexa releaseSigla, areaIds e areas a cada demanda.
async function decorate(
  rows: DemandaRow[],
): Promise<Record<string, unknown>[]> {
  if (rows.length === 0) return [];

  const demandaIds = rows.map((r) => r.id);
  const releaseIds = [...new Set(rows.map((r) => r.releaseId))];

  const releases = await db
    .select()
    .from(releasesTable)
    .where(inArray(releasesTable.id, releaseIds));
  const releaseById = new Map(releases.map((r) => [r.id, r]));

  const links = await db
    .select({
      demandaId: demandaAreasTable.demandaId,
      area: areasImpactadasTable,
    })
    .from(demandaAreasTable)
    .innerJoin(
      areasImpactadasTable,
      eq(demandaAreasTable.areaId, areasImpactadasTable.id),
    )
    .where(inArray(demandaAreasTable.demandaId, demandaIds));

  const areasByDemanda = new Map<number, AreaRow[]>();
  for (const link of links) {
    const list = areasByDemanda.get(link.demandaId) ?? [];
    list.push(link.area);
    areasByDemanda.set(link.demandaId, list);
  }

  return rows.map((row) => {
    const areas = (areasByDemanda.get(row.id) ?? []).sort((a, b) =>
      a.nome.localeCompare(b.nome),
    );
    return {
      ...row,
      releaseSigla: releaseById.get(row.releaseId)?.sigla ?? null,
      areaIds: areas.map((a) => a.id),
      areas,
    };
  });
}

async function setAreas(
  exec: DbOrTx,
  demandaId: number,
  areaIds: number[],
): Promise<void> {
  await exec
    .delete(demandaAreasTable)
    .where(eq(demandaAreasTable.demandaId, demandaId));
  const unique = [...new Set(areaIds)];
  if (unique.length > 0) {
    await exec
      .insert(demandaAreasTable)
      .values(unique.map((areaId) => ({ demandaId, areaId })))
      .onConflictDoNothing();
  }
}

router.get(
  "/demandas",
  requirePermission("demandas", "consultar"),
  async (req, res): Promise<void> => {
    const query = ListDemandasQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    const like = query.data.search ? `%${query.data.search}%` : null;
    const conditions: SQL[] = [];
    if (like) {
      const searchClause = or(
        ilike(demandasTable.nome, like),
        ilike(demandasTable.codigoServiceNow, like),
        ilike(demandasTable.liderDemanda, like),
        ilike(demandasTable.pep, like),
      );
      if (searchClause) conditions.push(searchClause);
    }
    if (query.data.releaseId !== undefined) {
      conditions.push(eq(demandasTable.releaseId, query.data.releaseId));
    }

    const rows = await db
      .select()
      .from(demandasTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(demandasTable.id);

    res.json(ListDemandasResponse.parse(toJson(await decorate(rows))));
  },
);

router.post(
  "/demandas",
  requirePermission("demandas", "criar"),
  async (req, res): Promise<void> => {
    const body = CreateDemandaBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const { areaIds, ...rest } = body.data;
    try {
      const dataAprovacaoL2 = toDate(rest.dataAprovacaoL2);
      const demanda = await db.transaction(async (tx) => {
        if (areaIds && areaIds.length > 0) {
          await assertAreasExist(tx, areaIds);
        }
        const [created] = await tx
          .insert(demandasTable)
          .values({
            releaseId: rest.releaseId,
            nome: rest.nome,
            codigoServiceNow: rest.codigoServiceNow ?? null,
            wps: rest.wps ?? null,
            liderDemanda: rest.liderDemanda ?? null,
            pep: rest.pep ?? null,
            projetoSspId: rest.projetoSspId ?? null,
            origem: rest.origem ?? null,
            resumoExecutivo: rest.resumoExecutivo ?? null,
            liderGerenteProjetos: rest.liderGerenteProjetos ?? null,
            liderancaArea: rest.liderancaArea ?? null,
            tamanho: rest.tamanho ?? null,
            urlKickoff: rest.urlKickoff ?? null,
            urlBusinessCase: rest.urlBusinessCase ?? null,
            urlCronograma: rest.urlCronograma ?? null,
            processosNegocio: rest.processosNegocio ?? null,
            sistemasDePara: rest.sistemasDePara ?? null,
            dataAprovacaoL2,
            cienteModeloCustos: rest.cienteModeloCustos ?? null,
            pepOpexDetalhes: rest.pepOpexDetalhes ?? null,
          })
          .returning();
        if (areaIds && areaIds.length > 0) {
          await setAreas(tx, created.id, areaIds);
        }
        return created;
      });

      const [decorated] = await decorate([demanda]);
      res.status(201).json(GetDemandaResponse.parse(toJson(decorated)));
    } catch (err) {
      if (err instanceof BadRequestError) {
        res.status(400).json({ error: err.message });
        return;
      }
      throw err;
    }
  },
);

router.get(
  "/demandas/:id",
  requirePermission("demandas", "consultar"),
  async (req, res): Promise<void> => {
    const params = GetDemandaParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [demanda] = await db
      .select()
      .from(demandasTable)
      .where(eq(demandasTable.id, params.data.id));
    if (!demanda) {
      res.status(404).json({ error: "Registro não encontrado" });
      return;
    }

    const [decorated] = await decorate([demanda]);
    res.json(GetDemandaResponse.parse(toJson(decorated)));
  },
);

router.patch(
  "/demandas/:id",
  requirePermission("demandas", "atualizar"),
  async (req, res): Promise<void> => {
    const params = UpdateDemandaParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateDemandaBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const { areaIds, dataAprovacaoL2, ...rest } = body.data;
    const values: Record<string, unknown> = { ...rest };

    try {
      if (dataAprovacaoL2 !== undefined) {
        values.dataAprovacaoL2 = toDate(dataAprovacaoL2);
      }

      const demanda = await db.transaction(async (tx) => {
        if (areaIds !== undefined && areaIds.length > 0) {
          await assertAreasExist(tx, areaIds);
        }

        let row: DemandaRow | undefined;
        if (Object.keys(values).length > 0) {
          [row] = await tx
            .update(demandasTable)
            .set(values)
            .where(eq(demandasTable.id, params.data.id))
            .returning();
        } else {
          [row] = await tx
            .select()
            .from(demandasTable)
            .where(eq(demandasTable.id, params.data.id));
        }

        if (!row) return undefined;

        if (areaIds !== undefined) {
          await setAreas(tx, row.id, areaIds);
        }
        return row;
      });

      if (!demanda) {
        res.status(404).json({ error: "Registro não encontrado" });
        return;
      }

      const [decorated] = await decorate([demanda]);
      res.json(UpdateDemandaResponse.parse(toJson(decorated)));
    } catch (err) {
      if (err instanceof BadRequestError) {
        res.status(400).json({ error: err.message });
        return;
      }
      throw err;
    }
  },
);

router.delete(
  "/demandas/:id",
  requirePermission("demandas", "excluir"),
  async (req, res): Promise<void> => {
    const params = DeleteDemandaParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [demanda] = await db
      .delete(demandasTable)
      .where(eq(demandasTable.id, params.data.id))
      .returning();

    if (!demanda) {
      res.status(404).json({ error: "Registro não encontrado" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
