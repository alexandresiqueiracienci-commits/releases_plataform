import { Router, type IRouter } from "express";
import { GetMeResponse } from "@workspace/api-zod";
import { getOrProvisionUser } from "../middlewares/auth";
import { toJson } from "../lib/serialize";

const router: IRouter = Router();

router.get("/me", async (req, res): Promise<void> => {
  const user = await getOrProvisionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(GetMeResponse.parse(toJson(user)));
});

export default router;
