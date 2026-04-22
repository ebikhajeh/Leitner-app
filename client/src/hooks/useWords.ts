import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Word } from "@/features/review/types";

async function fetchWords(): Promise<Word[]> {
  const res = await api.get<{ words: Word[] }>("/words");
  return res.data.words;
}

export function useWords() {
  return useQuery({ queryKey: ["words"], queryFn: fetchWords });
}
