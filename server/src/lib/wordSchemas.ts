import { z } from "zod";
import { validateWordInput } from "@shared/wordValidation";

export const createWordSchema = z.object({
  word: z.string().trim().min(1, "Word is required").superRefine((val, ctx) => {
    const check = validateWordInput(val);
    if (!check.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: check.message });
  }),
  meaning: z.string().trim().min(1, "Meaning is required"),
  exampleSentence: z.string().trim().optional().transform((v) => v || null),
});
