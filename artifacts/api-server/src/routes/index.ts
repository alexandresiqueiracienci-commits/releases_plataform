import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import usersRouter from "./users";
import perfisRouter from "./perfis";
import objetosRouter from "./objetos";
import scenariosRouter from "./scenarios";
import lookupsRouter from "./lookups";
import escalaRouter from "./escala";
import contatosRouter from "./contatos";
import dashboardRouter from "./dashboard";
import evidenciasRouter from "./evidencias";
import storageRouter from "./storage";
import releasesRouter from "./releases";
import areasRouter from "./areas";
import demandasRouter from "./demandas";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(usersRouter);
router.use(perfisRouter);
router.use(objetosRouter);
router.use(scenariosRouter);
router.use(lookupsRouter);
router.use(escalaRouter);
router.use(contatosRouter);
router.use(dashboardRouter);
router.use(evidenciasRouter);
router.use(storageRouter);
router.use(releasesRouter);
router.use(areasRouter);
router.use(demandasRouter);

export default router;
