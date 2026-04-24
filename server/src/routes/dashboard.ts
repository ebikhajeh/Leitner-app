import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { getDashboardStats } from "../lib/dashboardService";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const stats = await getDashboardStats(res.locals.user.id);
  res.json(stats);
});

export default router;
