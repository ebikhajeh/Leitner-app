export type ReviewMode = "normal" | "reverse";

export interface Word {
  id: string;
  word: string;
  meaning: string;
  exampleSentence: string | null;
  createdAt: string;
}
