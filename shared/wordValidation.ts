export const MAX_WORD_LENGTH = 60;

export const PROMPT_VERBS = [
  "write", "tell", "explain", "describe", "generate", "create",
  "show", "make", "give", "find", "help", "provide",
  "summarize", "translate", "define", "calculate", "solve",
  "analyze", "compare", "list",
  "what\\s+is", "what\\s+are", "how\\s+to", "how\\s+do",
  "why\\s+is", "why\\s+does",
];

export const PROMPT_TARGETS = [
  "a", "an", "the",
  "me", "us", "my", "your",
  "this", "that", "some", "it",
];

// Matches imperative prompt verbs followed by a determiner/pronoun, e.g.
// "write a paragraph", "tell me a story", "explain this", "describe the process"
export const PROMPT_PATTERN = new RegExp(
  `^(${PROMPT_VERBS.join("|")})\\s+(${PROMPT_TARGETS.join("|")})\\b`,
  "i"
);

export function isPromptLike(value: string): boolean {
  return PROMPT_PATTERN.test(value.trim());
}

export function validateWordInput(value: string): { ok: true } | { ok: false; message: string } {
  const trimmed = value.trim();

  if (trimmed.length > MAX_WORD_LENGTH) {
    return { ok: false, message: `Word must be ${MAX_WORD_LENGTH} characters or fewer` };
  }

  if (isPromptLike(trimmed)) {
    return { ok: false, message: "Please enter a word or short phrase, not a sentence or prompt" };
  }

  return { ok: true };
}
