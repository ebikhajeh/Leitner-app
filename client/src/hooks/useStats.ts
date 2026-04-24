import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Stats } from "@/features/stats/types";

async function fetchStats(): Promise<Stats> {
  const res = await api.get<Stats>("/stats");
  return res.data;
}

export const STATS_QUERY_KEY = ["stats"] as const;

export function useStats() {
  return useQuery({ queryKey: STATS_QUERY_KEY, queryFn: fetchStats });
}
