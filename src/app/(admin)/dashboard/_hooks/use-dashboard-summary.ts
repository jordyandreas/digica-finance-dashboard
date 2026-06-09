"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardProgramSummary,
  getDashboardProgramSummaryPaginated,
  getDashboardStats,
} from "@/services/dashboard.service";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";

export const dashboardProgramSummaryQueryKey = (
  programId?: string,
  year?: number,
) => ["dashboard-program-summary", programId ?? "all", year ?? "all"] as const;

export const dashboardProgramSummaryPaginatedQueryKey = (
  page: number,
  limit: number,
  year?: number,
) =>
  [
    "dashboard-program-summary",
    "all",
    "paginated",
    page,
    limit,
    year ?? "all",
  ] as const;

export const dashboardStatsQueryKey = (year?: number) =>
  ["dashboard-stats", year ?? "all"] as const;

export function useDashboardProgramSummary(programId?: string, year?: number) {
  return useQuery({
    queryKey: dashboardProgramSummaryQueryKey(programId, year),
    queryFn: async () => {
      const { data, error } = await getDashboardProgramSummary(programId, year);
      if (error) {
        throw error;
      }
      return data ?? [];
    },
  });
}

export function useDashboardProgramSummaryPaginated(
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  year?: number,
) {
  return useQuery({
    queryKey: dashboardProgramSummaryPaginatedQueryKey(page, limit, year),
    queryFn: async () => {
      const { data, error } = await getDashboardProgramSummaryPaginated({
        page,
        limit,
        year,
      });
      if (error) {
        throw error;
      }
      return data!;
    },
  });
}

export function useDashboardStats(year?: number) {
  return useQuery({
    queryKey: dashboardStatsQueryKey(year),
    queryFn: async () => getDashboardStats(year),
  });
}
