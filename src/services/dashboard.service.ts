import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  buildPaginationMeta,
  type PaginatedResponse,
  type PaginationParams,
} from "@/types/pagination";
import {
  buildParticipantTrendSeries,
  buildProgramSeriesKey,
  emptyTrendCounts,
  formatProgramSeriesLabel,
  isIncludedInParticipantTrend,
  type ParticipantTrendSeries,
} from "@/utils/program-series";
import {
  compareProgramsByStatusAndDate,
  getProgramIdsByYear,
  type ProgramSortFields,
  type ProgramStatus,
  type ProgramType,
} from "./programs.service";
import { getPaymentsSummary } from "./payments.service";
import { getExpensesSummary, type ExpenseCategory } from "./expenses.service";
import { getParticipantCountsByProgramIds } from "./participants.service";
import { REVENUE_PAYMENT_STATUSES } from "@/constants/payment-status";
import { fetchAllPages } from "@/utils/supabase-fetch-all";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ORDER,
  isExpenseCategory,
} from "@/utils/expense-category";
import {
  groupIncompleteTenorCounts,
  isIncompleteTenorPayment,
  type IncompleteTenorGroup,
} from "@/utils/incomplete-tenor";
import type { Payment } from "./payments.service";

type ProgramTrendRow = {
  id: string;
  name: string;
  type: ProgramType;
  batch: number | null;
  year: number | null;
  start_date: string | null;
  created_at: string;
  status: ProgramStatus;
};

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
      total_revenue: toFiniteNumber(row.total_revenue),
      total_expense: toFiniteNumber(row.total_expense),
      net_profit: toFiniteNumber(row.net_profit),
    };
  });
}

function toFiniteNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

type ProgramPaymentDerivedTotals = {
  revenue: number;
  expense: number;
  full: number;
  tenor: number;
  scholarship: number;
};

export async function getPaymentDerivedTotalsByProgramIds(
  programIds: string[],
): Promise<{
  data: Record<string, ProgramPaymentDerivedTotals>;
  error: PostgrestError | null;
}> {
  const totalsByProgramId: Record<string, ProgramPaymentDerivedTotals> = {};

  for (const programId of programIds) {
    totalsByProgramId[programId] = {
      revenue: 0,
      expense: 0,
      full: 0,
      tenor: 0,
      scholarship: 0,
    };
  }

  if (programIds.length === 0) {
    return { data: totalsByProgramId, error: null };
  }

  const revenueStatuses = new Set<string>(REVENUE_PAYMENT_STATUSES);

  const [paymentsResult, expensesResult] = await Promise.all([
    fetchAllPages<{
      program_id: string | null;
      amount: number | string | null;
      status: string | null;
      payment_type: string | null;
    }>((from, to) =>
      supabase
        .from("payments")
        .select("program_id, amount, status, payment_type")
        .in("program_id", programIds)
        .order("id", { ascending: true })
        .range(from, to),
    ),
    fetchAllPages<{
      program_id: string | null;
      amount: number | string | null;
    }>((from, to) =>
      supabase
        .from("expenses")
        .select("program_id, amount")
        .in("program_id", programIds)
        .order("id", { ascending: true })
        .range(from, to),
    ),
  ]);

  if (paymentsResult.error) {
    return { data: {}, error: paymentsResult.error };
  }
  if (expensesResult.error) {
    return { data: {}, error: expensesResult.error };
  }

  for (const row of paymentsResult.data) {
    if (!row.program_id) continue;
    const bucket = totalsByProgramId[String(row.program_id)];
    if (!bucket) continue;

    const paymentType = row.payment_type?.trim().toLowerCase() ?? "";
    if (paymentType === "full") {
      bucket.full += 1;
    } else if (paymentType === "tenor") {
      bucket.tenor += 1;
    } else if (paymentType === "scholarship") {
      bucket.scholarship += 1;
    }

    if (row.status && revenueStatuses.has(row.status)) {
      bucket.revenue += toFiniteNumber(row.amount);
    }
  }

  for (const row of expensesResult.data) {
    if (!row.program_id) continue;
    const bucket = totalsByProgramId[String(row.program_id)];
    if (!bucket) continue;
    bucket.expense += toFiniteNumber(row.amount);
  }

  return { data: totalsByProgramId, error: null };
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

export type { ParticipantTrendSeries };

export async function getParticipantTrendsBySeries(year?: number): Promise<{
  data: ParticipantTrendSeries[];
  error: PostgrestError | null;
}> {
  let query = supabase
    .from("programs")
    .select(
      "id, name, type, batch, year, start_date, created_at, status",
    );

  if (year != null) {
    query = query.eq("year", year);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error };
  }

  const programs = ((data ?? []) as ProgramTrendRow[]).filter((program) =>
    isIncludedInParticipantTrend(program.status),
  );

  if (programs.length === 0) {
    return { data: [], error: null };
  }

  const programIds = programs.map((program) => String(program.id));

  const [countsResult, paymentDerivedResult] = await Promise.all([
    getParticipantCountsByProgramIds(programIds),
    getPaymentDerivedTotalsByProgramIds(programIds),
  ]);

  if (countsResult.error) {
    return { data: [], error: countsResult.error };
  }
  if (paymentDerivedResult.error) {
    return { data: [], error: paymentDerivedResult.error };
  }

  const series = buildParticipantTrendSeries(
    programs.map((program) => {
      const programId = String(program.id);
      const counts = countsResult.data[programId];
      const derived = paymentDerivedResult.data[programId];
      return {
        id: programId,
        name: program.name,
        type: program.type,
        batch: program.batch,
        year: program.year,
        start_date: program.start_date,
        created_at: program.created_at,
        status: program.status,
        counts: {
          ...emptyTrendCounts(),
          paid: counts?.paid ?? 0,
          on_progress: counts?.on_progress ?? 0,
          pending: counts?.pending ?? 0,
          individual: counts?.workshop_individual ?? 0,
          bareng_teman: counts?.workshop_bareng_teman ?? 0,
          social: counts?.social ?? 0,
          workshop: counts?.workshop ?? 0,
          full: derived?.full ?? 0,
          tenor: derived?.tenor ?? 0,
          scholarship: derived?.scholarship ?? 0,
          revenue: derived?.revenue ?? 0,
          expense: derived?.expense ?? 0,
        },
      };
    }),
  );

  return { data: series, error: null };
}

export type DashboardExpenseCategoryItem = {
  id: string;
  description: string | null;
  amount: number;
  expenseDate: string | null;
};

export type DashboardExpenseCategoryRow = {
  category: ExpenseCategory | "other";
  label: string;
  amount: number;
  count: number;
  percent: number;
  items: DashboardExpenseCategoryItem[];
};

export type DashboardExpenseSeriesOption = {
  seriesKey: string;
  seriesLabel: string;
  type: ProgramType;
  totalAmount: number;
  totalCount: number;
  rows: DashboardExpenseCategoryRow[];
};

export type DashboardExpenseBreakdown = {
  series: DashboardExpenseSeriesOption[];
};

export async function getDashboardExpenseBreakdown(year?: number): Promise<{
  data: DashboardExpenseBreakdown;
  error: PostgrestError | null;
}> {
  const empty: DashboardExpenseBreakdown = {
    series: [],
  };

  let programsQuery = supabase.from("programs").select("id, name, type");
  if (year != null) {
    programsQuery = programsQuery.eq("year", year);
  }

  const { data: programs, error: programsError } = await programsQuery;
  if (programsError) {
    return { data: empty, error: programsError };
  }

  const programRows = (programs ?? []) as Array<{
    id: string;
    name: string;
    type: ProgramType;
  }>;

  if (programRows.length === 0) {
    return { data: empty, error: null };
  }

  const programsById = new Map(
    programRows.map((program) => [String(program.id), program]),
  );
  const programIds = [...programsById.keys()];

  const { data, error } = await fetchAllPages<{
    id: string;
    amount: number | string | null;
    category: string | null;
    description: string | null;
    expense_date: string | null;
    program_id: string | null;
  }>((from, to) =>
    supabase
      .from("expenses")
      .select("id, amount, category, description, expense_date, program_id")
      .in("program_id", programIds)
      .order("id", { ascending: true })
      .range(from, to),
  );

  if (error) {
    return { data: empty, error };
  }

  type CategoryBucket = {
    amount: number;
    count: number;
    items: DashboardExpenseCategoryItem[];
  };

  type SeriesBucket = {
    seriesLabel: string;
    type: ProgramType;
    totals: Map<ExpenseCategory | "other", CategoryBucket>;
  };

  const seriesMap = new Map<string, SeriesBucket>();

  for (const program of programRows) {
    const seriesKey = buildProgramSeriesKey(program.type, program.name);
    if (seriesMap.has(seriesKey)) continue;
    const totals = new Map<ExpenseCategory | "other", CategoryBucket>();
    for (const category of EXPENSE_CATEGORY_ORDER) {
      totals.set(category, { amount: 0, count: 0, items: [] });
    }
    seriesMap.set(seriesKey, {
      seriesLabel: formatProgramSeriesLabel(program.name),
      type: program.type,
      totals,
    });
  }

  for (const row of data) {
    const program = programsById.get(String(row.program_id ?? ""));
    if (!program) continue;

    const seriesKey = buildProgramSeriesKey(program.type, program.name);
    const series = seriesMap.get(seriesKey);
    if (!series) continue;

    const key: ExpenseCategory | "other" = isExpenseCategory(row.category ?? "")
      ? (row.category as ExpenseCategory)
      : "other";
    const bucket = series.totals.get(key) ?? {
      amount: 0,
      count: 0,
      items: [],
    };
    const amount = toFiniteNumber(row.amount);
    bucket.amount += amount;
    bucket.count += 1;
    bucket.items.push({
      id: String(row.id),
      description: row.description,
      amount,
      expenseDate: row.expense_date,
    });
    series.totals.set(key, bucket);
  }

  const series: DashboardExpenseSeriesOption[] = [...seriesMap.entries()]
    .map(([seriesKey, bucket]) => {
      const totalAmount = [...bucket.totals.values()].reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const totalCount = [...bucket.totals.values()].reduce(
        (sum, item) => sum + item.count,
        0,
      );
      const rows: DashboardExpenseCategoryRow[] = EXPENSE_CATEGORY_ORDER.map(
        (category) => {
          const categoryBucket = bucket.totals.get(category) ?? {
            amount: 0,
            count: 0,
            items: [],
          };
          return {
            category,
            label: EXPENSE_CATEGORY_LABELS[category],
            amount: categoryBucket.amount,
            count: categoryBucket.count,
            percent:
              totalAmount > 0
                ? (categoryBucket.amount / totalAmount) * 100
                : 0,
            items: [...categoryBucket.items].sort(
              (a, b) =>
                b.amount - a.amount ||
                (a.expenseDate ?? "").localeCompare(b.expenseDate ?? ""),
            ),
          };
        },
      )
        .filter((row) => row.count > 0 || row.amount > 0)
        .sort((a, b) => b.amount - a.amount);

      return {
        seriesKey,
        seriesLabel: bucket.seriesLabel,
        type: bucket.type,
        totalAmount,
        totalCount,
        rows,
      };
    })
    .sort((a, b) => a.seriesLabel.localeCompare(b.seriesLabel));

  return {
    data: { series },
    error: null,
  };
}

export type DashboardOutstandingTenorProgram = {
  programId: string;
  programName: string;
  totalIncomplete: number;
  groups: IncompleteTenorGroup[];
};

export type DashboardOutstandingTenorSummary = {
  totalIncomplete: number;
  programs: DashboardOutstandingTenorProgram[];
};

export async function getDashboardOutstandingTenor(year?: number): Promise<{
  data: DashboardOutstandingTenorSummary;
  error: PostgrestError | null;
}> {
  const empty: DashboardOutstandingTenorSummary = {
    totalIncomplete: 0,
    programs: [],
  };

  let programsQuery = supabase
    .from("programs")
    .select("id, name, type, status, year")
    .in("type", ["bootcamp", "mini_bootcamp"])
    .in("status", ["active", "completed"]);

  if (year != null) {
    programsQuery = programsQuery.eq("year", year);
  }

  const { data: programs, error: programsError } = await programsQuery;

  if (programsError) {
    return { data: empty, error: programsError };
  }

  const bootcampPrograms = programs ?? [];
  if (bootcampPrograms.length === 0) {
    return { data: empty, error: null };
  }

  const programMeta = new Map(
    bootcampPrograms.map((program) => [
      String(program.id),
      { name: program.name as string },
    ]),
  );
  const programIds = [...programMeta.keys()];

  const { data: paymentRows, error: paymentsError } = await fetchAllPages<{
    id: string;
    program_id: string | null;
    payment_type: string | null;
    tenor: number | null;
    paid_tenor: number | null;
    participant_id: string | null;
    participants:
      | { name: string | null }
      | { name: string | null }[]
      | null;
  }>((from, to) =>
    supabase
      .from("payments")
      .select(
        `
          id,
          program_id,
          payment_type,
          tenor,
          paid_tenor,
          participant_id,
          participants:participant_id ( name )
        `,
      )
      .in("program_id", programIds)
      .eq("payment_type", "tenor")
      .order("id", { ascending: true })
      .range(from, to),
  );

  if (paymentsError) {
    return { data: empty, error: paymentsError };
  }

  const paymentsByProgramId = new Map<string, Payment[]>();

  for (const row of paymentRows) {
    if (!row.program_id) continue;
    const programId = String(row.program_id);
    const participantRelation = Array.isArray(row.participants)
      ? row.participants[0]
      : row.participants;
    const payment: Payment = {
      id: row.id,
      amount: null,
      payment_date: null,
      participant_id: row.participant_id,
      participant_name: participantRelation?.name || null,
      participant_phone: null,
      program_id: programId,
      program_name: programMeta.get(programId)?.name ?? null,
      payment_method: null,
      payment_type: row.payment_type,
      tenor: row.tenor,
      paid_tenor: row.paid_tenor,
      status: null,
      reference_name: null,
      referral_name: null,
      notes: null,
      created_at: null,
      paid_at: null,
    };

    if (!isIncompleteTenorPayment(payment)) continue;

    const list = paymentsByProgramId.get(programId) ?? [];
    list.push(payment);
    paymentsByProgramId.set(programId, list);
  }

  const programsWithOutstanding: DashboardOutstandingTenorProgram[] = [];

  for (const [programId, payments] of paymentsByProgramId) {
    const groups = groupIncompleteTenorCounts(payments);
    const totalIncomplete = groups.reduce((sum, group) => sum + group.count, 0);
    if (totalIncomplete === 0) continue;

    programsWithOutstanding.push({
      programId,
      programName: programMeta.get(programId)?.name ?? "Unknown program",
      totalIncomplete,
      groups,
    });
  }

  programsWithOutstanding.sort(
    (a, b) => b.totalIncomplete - a.totalIncomplete,
  );

  const totalIncomplete = programsWithOutstanding.reduce(
    (sum, program) => sum + program.totalIncomplete,
    0,
  );

  return {
    data: { totalIncomplete, programs: programsWithOutstanding },
    error: null,
  };
}
