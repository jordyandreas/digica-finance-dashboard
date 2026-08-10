import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  buildPaginationMeta,
  type PaginatedResponse,
  type PaginationParams,
} from "@/types/pagination";
import {
  compareProgramsByStatusAndDate,
  getProgramIdsByYear,
  type ProgramSortFields,
  type ProgramStatus,
} from "./programs.service";
import { getPaymentsSummary } from "./payments.service";
import { getExpensesSummary } from "./expenses.service";

export interface DashboardProgramSummary {
  program_id: string;
  program_name: string;
  program_year: number | null;
  status: ProgramStatus;
  start_date: string | null;
  created_at: string;
  total_revenue: number;
  total_expense: number;
  net_profit: number;
}

type DashboardProgramSummaryRow = {
  program_id: string;
  program_name: string;
  program_year: number | null;
  status?: ProgramStatus | null;
  start_date?: string | null;
  created_at?: string | null;
  total_revenue: number;
  total_expense: number;
  net_profit: number;
};

export interface DashboardYearParams {
  year?: number;
}

async function getProgramSortFieldsByIds(
  programIds: string[],
): Promise<Map<string, ProgramSortFields>> {
  const map = new Map<string, ProgramSortFields>();
  if (programIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from("programs")
    .select("id, status, start_date, created_at")
    .in("id", programIds);

  if (error || !data) {
    return map;
  }

  for (const row of data) {
    map.set(String(row.id), {
      status: row.status as ProgramStatus,
      start_date: row.start_date,
      created_at: row.created_at,
    });
  }

  return map;
}

async function hydrateDashboardSummaries(
  rows: DashboardProgramSummaryRow[],
): Promise<DashboardProgramSummary[]> {
  const needsLookup = rows.some(
    (row) => !row.status || !row.start_date || !row.created_at,
  );

  const sortFieldsById = needsLookup
    ? await getProgramSortFieldsByIds(rows.map((row) => String(row.program_id)))
    : new Map<string, ProgramSortFields>();

  return rows.map((row) => {
    const programId = String(row.program_id);
    const fields = sortFieldsById.get(programId);

    return {
      program_id: programId,
      program_name: row.program_name,
      program_year: row.program_year,
      status: row.status ?? fields?.status ?? "draft",
      start_date: row.start_date ?? fields?.start_date ?? null,
      created_at: row.created_at ?? fields?.created_at ?? "",
      total_revenue: row.total_revenue,
      total_expense: row.total_expense,
      net_profit: row.net_profit,
    };
  });
}

function sortDashboardSummaries(
  summaries: DashboardProgramSummary[],
): DashboardProgramSummary[] {
  return [...summaries].sort((a, b) =>
    compareProgramsByStatusAndDate(
      {
        status: a.status,
        start_date: a.start_date,
        created_at: a.created_at,
      },
      {
        status: b.status,
        start_date: b.start_date,
        created_at: b.created_at,
      },
    ),
  );
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
  let query = supabase.from("dashboard_program_summary").select("*");

  if (programId) {
    query = query.eq("program_id", programId);
  }

  if (year != null) {
    query = query.eq("program_year", year);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  const hydrated = await hydrateDashboardSummaries(
    (data ?? []) as DashboardProgramSummaryRow[],
  );

  if (programId || hydrated.length <= 1) {
    return { data: hydrated, error: null };
  }

  return {
    data: sortDashboardSummaries(hydrated),
    error: null,
  };
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
  const to = from + limit;

  let query = supabase
    .from("dashboard_program_summary")
    .select("*", { count: "exact" });

  if (year != null) {
    query = query.eq("program_year", year);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: null, error };
  }

  const hydrated = await hydrateDashboardSummaries(
    (data ?? []) as DashboardProgramSummaryRow[],
  );
  const sorted = sortDashboardSummaries(hydrated);

  return {
    data: {
      data: sorted.slice(from, to),
      pagination: buildPaginationMeta(count ?? 0, page, limit),
    },
    error: null,
  };
}
