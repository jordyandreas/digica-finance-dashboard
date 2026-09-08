"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getExpenses,
  getExpensesCategorySummary,
  getExpensesPaginated,
  getExpensesSummary,
  type ExpenseCategory,
  type ExpensesListParams,
} from "@/services/expenses.service";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";

export const expensesQueryKey = (programId: string) =>
  ["expenses", programId] as const;

export const expensesPaginatedQueryKey = (
  programId: string,
  page: number,
  limit: number,
  filters: Pick<ExpensesListParams, "search" | "category"> = {},
) =>
  [
    "expenses",
    programId,
    "paginated",
    page,
    limit,
    filters.search?.trim() || "",
    filters.category ?? "all",
  ] as const;

export const expensesSummaryQueryKey = (programId: string) =>
  ["expenses-summary", programId] as const;

export const expensesCategorySummaryQueryKey = (programId: string) =>
  ["expenses-category-summary", programId] as const;

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

export function useExpensesPaginated(
  programId: string,
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  filters: { search?: string; category?: ExpenseCategory } = {},
) {
  return useQuery({
    queryKey: expensesPaginatedQueryKey(programId, page, limit, filters),
    queryFn: async () => {
      const { data, error } = await getExpensesPaginated(programId, {
        page,
        limit,
        search: filters.search,
        category: filters.category,
      });
      if (error) {
        throw error;
      }
      return data!;
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

export function useExpensesCategorySummary(programId: string) {
  return useQuery({
    queryKey: expensesCategorySummaryQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getExpensesCategorySummary(programId);
      if (error) {
        throw error;
      }
      return data ?? { items: [], totalAmount: 0, totalCount: 0 };
    },
    enabled: Boolean(programId),
  });
}
