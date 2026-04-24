import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardStats } from "@/features/dashboard/types";

async function fetchDashboard(): Promise<DashboardStats> {
  const res = await api.get<DashboardStats>("/dashboard");
  return res.data;
}

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });
}
