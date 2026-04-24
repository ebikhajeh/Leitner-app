import { z } from "zod";

export const updateSettingsSchema = z.object({
  dailyReviewLimit: z.number().int().min(1).max(500).optional(),
  dailyDueCards: z.number().int().min(1).max(500).nullable().optional(),
  autoSave: z.boolean().optional(),
});
