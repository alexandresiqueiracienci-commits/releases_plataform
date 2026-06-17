import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, evidenciasTable, scenariosTable } from "@workspace/db";
import {
  ListEvidenciasParams,
  ListEvidenciasResponse,
  ListEvidenciasResponseItem,
  CreateEvidenciaParams,
  CreateEvidenciaBody,
  DeleteEvidenciaParams,
} from "@workspace/api-zod";
import {
  requirePermission,
  requireUploader,
  getOrProvisionUser,
} from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get(
  "/scenarios/:id/evidencias",
  requirePermission("evidencias", "consultar"),
  async (req, res): Promise<void> => {
    const params = ListEvidenciasParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const rows = await db
      .select()
      .from(evidenciasTable)
      .where(eq(evidenciasTable.scenarioId, params.data.id))
      .orderBy(evidenciasTable.createdAt);

    res.json(ListEvidenciasResponse.parse(toJson(rows)));
  },
);

router.post(
  "/scenarios/:id/evidencias",
  requireUploader,
  async (req, res): Promise<void> => {
    const params = CreateEvidenciaParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = CreateEvidenciaBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    // Only allow canonical upload paths issued by request-url
    // (/objects/uploads/<id>) so a client cannot register arbitrary private
    // objects as evidence.
    if (!/^\/objects\/uploads\/[A-Za-z0-9_-]+$/.test(body.data.objectPath)) {
      res.status(400).json({ error: "objectPath inválido" });
      return;
    }

    const [scenario] = await db
      .select({ id: scenariosTable.id })
      .from(scenariosTable)
      .where(eq(scenariosTable.id, params.data.id));
    if (!scenario) {
      res.status(404).json({ error: "Cenário não encontrado" });
      return;
    }

    const user = await getOrProvisionUser(req);

    const [evidencia] = await db
      .insert(evidenciasTable)
      .values({
        scenarioId: params.data.id,
        objectPath: body.data.objectPath,
        fileName: body.data.fileName,
        contentType: body.data.contentType ?? null,
        size: body.data.size ?? null,
        uploadedByEmail: user?.email ?? null,
      })
      .returning();

    res.status(201).json(ListEvidenciasResponseItem.parse(toJson(evidencia)));
  },
);

router.delete(
  "/evidencias/:id",
  requireUploader,
  async (req, res): Promise<void> => {
    const params = DeleteEvidenciaParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [existing] = await db
      .select()
      .from(evidenciasTable)
      .where(eq(evidenciasTable.id, params.data.id));
    if (!existing) {
      res.status(404).json({ error: "Evidência não encontrada" });
      return;
    }

    const user = await getOrProvisionUser(req);
    const isOwner =
      user?.email &&
      existing.uploadedByEmail &&
      user.email.toLowerCase() === existing.uploadedByEmail.toLowerCase();
    const isAdmin = user?.profile === "ADMINISTRADOR";
    if (!isOwner && !isAdmin) {
      res.status(403).json({
        error: "Você só pode excluir evidências enviadas por você",
      });
      return;
    }

    await db
      .delete(evidenciasTable)
      .where(eq(evidenciasTable.id, params.data.id));

    res.sendStatus(204);
  },
);

export default router;
