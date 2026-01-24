import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import { getPaymentsSummary } from "./payments.service";
import { getExpensesSummary } from "./expenses.service";

export interface DashboardProgramSummary {
  program_id: string;
  program_name: string;
  total_revenue: number;
  total_expense: number;
  net_profit: number;
}

export async function getDashboardStats() {
  const [paymentsResult, expensesResult] = await Promise.all([
    getPaymentsSummary(),
    getExpensesSummary(),
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

export async function getDashboardProgramSummary(programId?: string): Promise<{
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

  const { data, error } = await query;

  return { data, error };
}
