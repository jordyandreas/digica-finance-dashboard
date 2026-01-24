"use client";

import { useQuery } from "@tanstack/react-query";
import { getExpenses, getExpensesSummary } from "@/services/expenses.service";

export const expensesQueryKey = (programId: string) =>
  ["expenses", programId] as const;
export const expensesSummaryQueryKey = (programId: string) =>
  ["expenses-summary", programId] as const;

export function useExpenses(programId: string) {
  return useQuery({
    queryKey: expensesQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getExpenses(programId);
      if (error) {
        throw error;
      }
      return data ?? [];
    },
    enabled: Boolean(programId),
  });
}

export function useExpensesSummary(programId: string) {
  return useQuery({
    queryKey: expensesSummaryQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getExpensesSummary(programId);
      if (error) {
        throw error;
      }
      return data ?? { total: 0, count: 0 };
    },
    enabled: Boolean(programId),
  });
}
