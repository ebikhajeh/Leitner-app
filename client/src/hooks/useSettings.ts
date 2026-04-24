import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Settings {
  id: string | null;
  userId: string;
  dailyReviewLimit: number;
  dailyDueCards: number | null;
  autoSave: boolean;
}

export type UpdateSettingsInput = Partial<Pick<Settings, "dailyReviewLimit" | "dailyDueCards" | "autoSave">>;

const SETTINGS_QUERY_KEY = ["settings"] as const;

function useSetSettingsCache() {
  const qc = useQueryClient();
  return (settings: Settings) => qc.setQueryData(SETTINGS_QUERY_KEY, settings);
}

export function useSettings() {
  return useQuery<Settings>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => api.get("/settings").then((r) => r.data.settings),
  });
}

export function useUpdateSettings() {
  const setCache = useSetSettingsCache();
  return useMutation({
    mutationFn: (data: UpdateSettingsInput) =>
      api.patch("/settings", data).then((r) => r.data.settings as Settings),
    onSuccess: setCache,
  });
}

export function useResetSettings() {
  const setCache = useSetSettingsCache();
  return useMutation({
    mutationFn: () => api.delete("/settings").then((r) => r.data.settings as Settings),
    onSuccess: setCache,
  });
}
