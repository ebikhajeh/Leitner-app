import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { updateSettingsSchema } from "../lib/settingsSchemas";
import {
  getSettingsHandler,
  updateSettingsHandler,
  resetSettingsHandler,
} from "../controllers/settingsController";

const router = Router();

router.get("/", requireAuth, getSettingsHandler);
router.patch("/", requireAuth, validate(updateSettingsSchema), updateSettingsHandler);
router.delete("/", requireAuth, resetSettingsHandler);

export default router;
