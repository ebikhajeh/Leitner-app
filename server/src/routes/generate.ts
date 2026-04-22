import { Router } from "express";
import { generateObject } from "ai";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { validateWord } from "../lib/validateWord";
import { openai } from "../lib/openai";

// Maps target language names to their Unicode script range.
// Only non-Latin scripts can be detected reliably this way.
const LANGUAGE_SCRIPT_PATTERNS: Record<string, RegExp> = {
  Persian: /[\u0600-\u06FF]/,
  Arabic: /[\u0600-\u06FF]/,
  Chinese: /[\u4E00-\u9FFF\u3400-\u4DBF]/,
  Japanese: /[\u3040-\u30FF\u4E00-\u9FFF]/,
  Korean: /[\uAC00-\uD7AF]/,
};

function detectOutputLanguage(word: string, targetLanguage: string): string {
  const pattern = LANGUAGE_SCRIPT_PATTERNS[targetLanguage];
  const inputIsInTargetLanguage = pattern ? pattern.test(word) : false;
  return inputIsInTargetLanguage ? "English" : targetLanguage;
}

function buildGenerateWordPrompt(word: string, targetLanguage: string): string {
  const isPhrase = word.includes(" ");
  const outputLanguage = detectOutputLanguage(word, targetLanguage);

  if (isPhrase) {
    return `You are a vocabulary assistant helping language learners.

Phrase: "${word}"
Output Language: ${outputLanguage}

The input is a multi-word phrase, not a single vocabulary word.

Generate:
1. meaning: A single line containing only the translation of the entire phrase into ${outputLanguage}. Do not provide an English definition.
2. exampleSentence: Two natural English sentences using the phrase, separated by a newline character (\\n). Do not number them.

Example for phrase "give up" with Persian output:
meaning: "تسلیم شدن / دست کشیدن"
exampleSentence: "He decided to give up smoking.\\nShe refused to give up on her dream."`;
  }

  return `You are a vocabulary assistant helping language learners.

Word: "${word}"
Output Language: ${outputLanguage}

The input is a single vocabulary word.

Generate:
1. meaning: Two lines separated by a newline character (\\n). First line: a short English definition. Second line: the translation in ${outputLanguage}.
2. exampleSentence: Two natural English sentences using the word, separated by a newline character (\\n). Do not number them.

Example for word "abandon" with Persian output:
meaning: "to leave behind permanently\\nترک کردن / رها کردن"
exampleSentence: "He abandoned the old house.\\nShe abandoned the plan."`;
}

const router = Router();

const resultSchema = z.object({
  meaning: z.string(),
  exampleSentence: z.string(),
});

router.post("/", requireAuth, async (req, res) => {
  const { word, targetLanguage } = req.body as { word?: string; targetLanguage?: string };

  if (!word?.trim() || !targetLanguage?.trim()) {
    res.status(400).json({ message: "word and targetLanguage are required" });
    return;
  }

  const wordCheck = validateWord(word);
  if (!wordCheck.ok) {
    res.status(400).json({ message: wordCheck.message });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({ message: "AI generation is not configured" });
    return;
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-5.4-nano"),
      schema: resultSchema,
      prompt: buildGenerateWordPrompt(word.trim(), targetLanguage),
    });

    res.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-word] Error:", message);
    res.status(500).json({ message });
  }
});

export default router;
