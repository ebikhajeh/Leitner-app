import { z } from "zod";
import { MAX_WORD_LENGTH, isPromptLike } from "@shared/wordValidation";

export const addWordSchema = z.object({
  word: z
    .string()
    .min(1, "Word is required")
    .max(MAX_WORD_LENGTH, `Word must be ${MAX_WORD_LENGTH} characters or fewer`)
    .refine((v) => !isPromptLike(v), {
      message: "Please enter a word or short phrase, not a sentence or prompt",
    }),
  meaning: z.string().min(1, "Meaning is required"),
  exampleSentence: z.string().optional(),
});

export type AddWordFormValues = z.infer<typeof addWordSchema>;

export const inputClass =
  "w-full bg-card border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all";

export const aiInputClass =
  "w-full bg-blue-50/5 border border-blue-400/40 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all";
