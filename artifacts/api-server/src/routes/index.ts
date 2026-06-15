import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import usersRouter from "./users";
import scenariosRouter from "./scenarios";
import lookupsRouter from "./lookups";
import escalaRouter from "./escala";
import contatosRouter from "./contatos";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(usersRouter);
router.use(scenariosRouter);
router.use(lookupsRouter);
router.use(escalaRouter);
router.use(contatosRouter);
router.use(dashboardRouter);

export default router;
