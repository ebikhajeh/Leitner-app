import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { getStats } from "../lib/statsService";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const stats = await getStats(res.locals.user.id);
  res.json(stats);
});

export default router;
