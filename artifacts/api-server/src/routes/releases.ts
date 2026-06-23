import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, releasesTable } from "@workspace/db";
import {
  ListReleasesQueryParams,
  ListReleasesResponse,
  ListReleasesResponseItem,
  CreateReleaseBody,
  UpdateReleaseParams,
  UpdateReleaseBody,
  UpdateReleaseResponse,
  DeleteReleaseParams,
} from "@workspace/api-zod";
import { requirePermission } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

router.get(
  "/releases",
  requirePermission("releases", "consultar"),
  async (req, res): Promise<void> => {
    const query = ListReleasesQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    const like = query.data.search ? `%${query.data.search}%` : null;
    const rows = await db
      .select()
      .from(releasesTable)
      .where(
        like
          ? or(
              ilike(releasesTable.sigla, like),
              ilike(releasesTable.liderNome, like),
              ilike(releasesTable.login, like),
              ilike(releasesTable.tipo, like),
            )
          : undefined,
      )
      .orderBy(releasesTable.sigla);

    res.json(ListReleasesResponse.parse(toJson(rows)));
  },
);

router.post(
  "/releases",
  requirePermission("releases", "criar"),
  async (req, res): Promise<void> => {
    const body = CreateReleaseBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [release] = await db
      .insert(releasesTable)
      .values({
        sigla: body.data.sigla,
        liderNome: body.data.liderNome,
        login: body.data.login,
        tipo: body.data.tipo,
        goLiveInicio: toDate(body.data.goLiveInicio),
        goLiveTermino: toDate(body.data.goLiveTermino),
        sistemas: body.data.sistemas ?? [],
      })
      .returning();

    res.status(201).json(ListReleasesResponseItem.parse(toJson(release)));
  },
);

router.patch(
  "/releases/:id",
  requirePermission("releases", "atualizar"),
  async (req, res): Promise<void> => {
    const params = UpdateReleaseParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateReleaseBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const values: Record<string, unknown> = {};
    if (body.data.sigla !== undefined) values.sigla = body.data.sigla;
    if (body.data.liderNome !== undefined)
      values.liderNome = body.data.liderNome;
    if (body.data.login !== undefined) values.login = body.data.login;
    if (body.data.tipo !== undefined) values.tipo = body.data.tipo;
    if (body.data.goLiveInicio !== undefined)
      values.goLiveInicio = toDate(body.data.goLiveInicio);
    if (body.data.goLiveTermino !== undefined)
      values.goLiveTermino = toDate(body.data.goLiveTermino);
    if (body.data.sistemas !== undefined) values.sistemas = body.data.sistemas;

    const [release] = await db
      .update(releasesTable)
      .set(values)
      .where(eq(releasesTable.id, params.data.id))
      .returning();

    if (!release) {
      res.status(404).json({ error: "Registro não encontrado" });
      return;
    }

    res.json(UpdateReleaseResponse.parse(toJson(release)));
  },
);

router.delete(
  "/releases/:id",
  requirePermission("releases", "excluir"),
  async (req, res): Promise<void> => {
    const params = DeleteReleaseParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [release] = await db
      .delete(releasesTable)
      .where(eq(releasesTable.id, params.data.id))
      .returning();

    if (!release) {
      res.status(404).json({ error: "Registro não encontrado" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
