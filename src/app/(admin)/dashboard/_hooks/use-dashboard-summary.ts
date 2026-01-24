"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardProgramSummary } from "@/services/dashboard.service";

export const dashboardProgramSummaryQueryKey = (programId?: string) =>
  ["dashboard-program-summary", programId ?? "all"] as const;

export function useDashboardProgramSummary(programId?: string) {
  return useQuery({
    queryKey: dashboardProgramSummaryQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getDashboardProgramSummary(programId);
      if (error) {
        throw error;
      }
      return data ?? [];
    },
  });
}
