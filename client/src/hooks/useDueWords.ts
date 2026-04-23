import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Word } from "@/features/review/types";

async function fetchDueWords(): Promise<Word[]> {
  const res = await api.get<{ words: Word[] }>("/words/due");
  return res.data.words;
}

export function useDueWords() {
  return useQuery({ queryKey: ["words", "due"], queryFn: fetchDueWords });
}
