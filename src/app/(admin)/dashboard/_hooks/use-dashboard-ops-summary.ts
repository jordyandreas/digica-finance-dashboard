"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardExpenseBreakdown,
  getDashboardOutstandingTenor,
} from "@/services/dashboard.service";

export const dashboardExpenseBreakdownQueryKey = (year?: number) =>
  ["dashboard-expense-breakdown", "v4-category-items", year ?? "all"] as const;

export const dashboardOutstandingTenorQueryKey = (year?: number) =>
  ["dashboard-outstanding-tenor", year ?? "all"] as const;

export function useDashboardExpenseBreakdown(year?: number) {
  return useQuery({
    queryKey: dashboardExpenseBreakdownQueryKey(year),
    queryFn: async () => {
      const { data, error } = await getDashboardExpenseBreakdown(year);
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useDashboardOutstandingTenor(year?: number) {
  return useQuery({
    queryKey: dashboardOutstandingTenorQueryKey(year),
    queryFn: async () => {
      const { data, error } = await getDashboardOutstandingTenor(year);
      if (error) {
        throw error;
      }
      return data;
    },
  });
}
