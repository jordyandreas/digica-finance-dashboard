"use client";

import { useQuery } from "@tanstack/react-query";
import { getParticipantTrendsBySeries } from "@/services/dashboard.service";

export const dashboardParticipantTrendsQueryKey = (year?: number) =>
  ["dashboard-participant-trends", "v2-plan-finance", year ?? "all"] as const;

export function useDashboardParticipantTrends(year?: number) {
  return useQuery({
    queryKey: dashboardParticipantTrendsQueryKey(year),
    queryFn: async () => {
      const { data, error } = await getParticipantTrendsBySeries(year);
      if (error) {
        throw error;
      }
      return data;
    },
  });
}
