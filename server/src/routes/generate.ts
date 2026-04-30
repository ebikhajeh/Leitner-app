import { Router } from "express";
import { generateObject } from "ai";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { validateWord } from "../lib/validateWord";
import { openai } from "../lib/openai";

// Only non-Latin scripts can be detected reliably via Unicode ranges.
const LANGUAGE_SCRIPT_PATTERNS: Record<string, RegExp> = {
  Persian: /[؀-ۿ]/,
  Arabic: /[؀-ۿ]/,
  Chinese: /[一-鿿㐀-䶿]/,
  Japanese: /[぀-ヿ一-鿿]/,
  Korean: /[가-힯]/,
};

const MAX_WORD_COUNT = 15;

function detectInputLanguage(word: string, targetLanguage: string): "english" | "target" {
  const pattern = LANGUAGE_SCRIPT_PATTERNS[targetLanguage];
  return pattern && pattern.test(word) ? "target" : "english";
}

// English inputs are always treated as word/phrase regardless of length.
// Only target-language inputs longer than 3 words become "sentence".
function detectInputType(word: string, inputLanguage: "english" | "target"): "word" | "sentence" {
  if (inputLanguage === "english") return "word";
  return word.trim().split(/\s+/).length > 3 ? "sentence" : "word";
}

const wordAiSchema = z.object({
  english: z.string(),
  definition: z.string(),
  translation: z.string(),
  synonyms: z.array(z.string()),
  examples: z.array(z.string()),
  tip: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

const sentenceAiSchema = z.object({
  english: z.string(),
  translation: z.string(),
  improved: z.string(),
  notes: z.string(),
});

function buildWordPrompt(
  word: string,
  targetLanguage: string,
  inputLanguage: "english" | "target"
): string {
  const fromTarget = inputLanguage === "target";
  return `You are a conversational English learning assistant.

Input: "${word}"
Target language: ${targetLanguage}
${fromTarget ? `The input is written in ${targetLanguage}. Find its natural English equivalent.` : "The input is in English."}

### CRITICAL RULES — FOLLOW EXACTLY

1. "translation" MUST be in ${targetLanguage} — NEVER return translation in English.
2. "definition" MUST be a simple English explanation at A2/B1 level — NOT a paraphrase, NOT a sentence rewrite.
3. "examples" MUST be EXACTLY 2 natural conversational English sentences — no more, no less.
4. If the input is a phrase (e.g. "I will take care of it"):
   - definition = explain what the phrase means simply (e.g. "to handle something or deal with it")
   - translation = the phrase meaning in ${targetLanguage}
   - examples = 2 natural English sentences using the phrase

Return a JSON object with exactly these fields:
- "english": the English word or phrase (${fromTarget ? "converted from input" : "same as input"})
- "definition": simple English meaning — A2/B1 level, 1 short sentence, not a rewrite of the input
- "translation": meaning in ${targetLanguage} — MUST be ${targetLanguage}, never English
- "synonyms": JSON array of 2–3 English synonyms or related words/phrases
- "examples": JSON array of EXACTLY 2 natural conversational English sentences
- "tip": one short practical usage tip
- "difficulty": "easy", "medium", or "hard"`;
}

function buildSentencePrompt(sentence: string, targetLanguage: string): string {
  return `You are a conversational English learning assistant.

Input sentence: "${sentence}"
Target language: ${targetLanguage}

Convert this to natural, conversational English — how people actually speak, not a literal or textbook translation.

Return a JSON object with:
- "english": the natural conversational English version (required)
- "translation": the sentence in ${targetLanguage} (use original if input is already in ${targetLanguage})
- "improved": a more fluent or polished English version if meaningfully different from "english", otherwise empty string
- "notes": one-sentence explanation of any non-obvious translation choice, otherwise empty string

IMPORTANT: "english" must sound natural — for example:
  GOOD: "Can you give me that glass?"
  BAD:  "Give that glass to me"`;
}

function mapWordResult(
  result: z.infer<typeof wordAiSchema>
): { meaning: string; exampleSentence: string } {
  return {
    meaning: `${result.definition}\n${result.translation}`,
    exampleSentence: result.examples.slice(0, 2).join("\n"),
  };
}

function mapSentenceResult(
  result: z.infer<typeof sentenceAiSchema>
): { meaning: string; exampleSentence: string } {
  const improved =
    result.improved && result.improved !== result.english ? result.improved : "";
  return { meaning: result.english, exampleSentence: improved };
}

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const { word, targetLanguage } = req.body as {
    word?: string;
    targetLanguage?: string;
  };

  if (!word?.trim() || !targetLanguage?.trim()) {
    res.status(400).json({ message: "word and targetLanguage are required" });
    return;
  }

  const wordCheck = validateWord(word);
  if (!wordCheck.ok) {
    res.status(400).json({ message: wordCheck.message });
    return;
  }

  const wordCount = word.trim().split(/\s+/).length;
  if (wordCount > MAX_WORD_COUNT) {
    res
      .status(400)
      .json({ message: `Input is too long. Please enter at most ${MAX_WORD_COUNT} words.` });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({ message: "AI generation is not configured" });
    return;
  }

  try {
    const trimmedWord = word.trim();
    const inputLanguage = detectInputLanguage(trimmedWord, targetLanguage);
    const inputType = detectInputType(trimmedWord, inputLanguage);

    let result: { meaning: string; exampleSentence: string };

    if (inputType === "sentence") {
      const { object } = await generateObject({
        model: openai("gpt-5.4-nano"),
        schema: sentenceAiSchema,
        prompt: buildSentencePrompt(trimmedWord, targetLanguage),
      });
      result = mapSentenceResult(object);
    } else {
      const { object } = await generateObject({
        model: openai("gpt-5.4-nano"),
        schema: wordAiSchema,
        prompt: buildWordPrompt(trimmedWord, targetLanguage, inputLanguage),
      });
      result = mapWordResult(object);
    }

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-word] Error:", message);
    res.status(500).json({ message });
  }
});

export default router;
