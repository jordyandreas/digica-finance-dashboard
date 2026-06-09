import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  buildPaginationMeta,
  type PaginatedResponse,
  type PaginationParams,
} from "@/types/pagination";
import { getProgramIdsByYear } from "./programs.service";
import { getPaymentsSummary } from "./payments.service";
import { getExpensesSummary } from "./expenses.service";

export interface DashboardProgramSummary {
  program_id: string;
  program_name: string;
  program_year: number | null;
  total_revenue: number;
  total_expense: number;
  net_profit: number;
}

export interface DashboardYearParams {
  year?: number;
}

export async function getDashboardStats(year?: number) {
  let programIds: string[] | undefined;

  if (year != null) {
    const { data, error } = await getProgramIdsByYear(year);
    if (error) {
      return {
        totalRevenue: 0,
        totalExpense: 0,
        netProfit: 0,
        errors: {
          payments: error,
          expenses: null,
        },
      };
    }
    programIds = data;
  }

  const [paymentsResult, expensesResult] = await Promise.all([
    getPaymentsSummary(undefined, programIds),
    getExpensesSummary(undefined, programIds),
  ]);

  const totalRevenue = paymentsResult.data?.total || 0;
  const totalExpense = expensesResult.data?.total || 0;
  const netProfit = totalRevenue - totalExpense;

  return {
    totalRevenue,
    totalExpense,
    netProfit,
    errors: {
      payments: paymentsResult.error,
      expenses: expensesResult.error,
    },
  };
}

export async function getDashboardProgramSummary(
  programId?: string,
  year?: number,
): Promise<{
  data: DashboardProgramSummary[] | null;
  error: PostgrestError | null;
}> {
  let query = supabase
    .from("dashboard_program_summary")
    .select("*")
    .order("program_name", { ascending: true });

  if (programId) {
    query = query.eq("program_id", programId);
  }

  if (year != null) {
    query = query.eq("program_year", year);
  }

  const { data, error } = await query;

  return { data, error };
}

export async function getDashboardProgramSummaryPaginated({
  page = 1,
  limit = 10,
  year,
}: PaginationParams & DashboardYearParams = {}): Promise<{
  data: PaginatedResponse<DashboardProgramSummary> | null;
  error: PostgrestError | null;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("dashboard_program_summary")
    .select("*", { count: "exact" })
    .order("program_name", { ascending: true });

  if (year != null) {
    query = query.eq("program_year", year);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      data: data ?? [],
      pagination: buildPaginationMeta(count ?? 0, page, limit),
    },
    error: null,
  };
}
