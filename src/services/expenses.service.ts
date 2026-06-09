import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  buildPaginationMeta,
  type PaginatedResponse,
  type PaginationParams,
} from "@/types/pagination";

export type ExpenseCategory =
  | "ads"
  | "mentor_fee"
  | "tools"
  | "operational"
  | "referral_cashback"
  | "other";

export interface Expense {
  id: string;
  amount: number;
  expense_date: string;
  description: string | null;
  category: ExpenseCategory;
  program_id: string;
  created_at: string;
}

export interface CreateExpenseInput {
  program_id: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expense_date?: string;
}

export interface UpdateExpenseInput {
  program_id?: string;
  amount?: number;
  category?: ExpenseCategory;
  description?: string;
  expense_date?: string;
}

export async function getExpenses(programId?: string): Promise<{
  data: Expense[] | null;
  error: PostgrestError | null;
}> {
  let query = supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: true });

  if (programId) {
    query = query.eq("program_id", programId);
  }

  const { data, error } = await query;

  return { data, error };
}

export async function getExpensesPaginated(
  programId: string,
  { page = 1, limit = 10 }: PaginationParams = {},
): Promise<{
  data: PaginatedResponse<Expense> | null;
  error: PostgrestError | null;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("expenses")
    .select("*", { count: "exact" })
    .eq("program_id", programId)
    .order("created_at", { ascending: true })
    .range(from, to);

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

export async function getExpensesSummary(
  programId?: string,
  programIds?: string[],
): Promise<{
  data: { total: number; count: number } | null;
  error: PostgrestError | null;
}> {
  if (programIds && programIds.length === 0) {
    return { data: { total: 0, count: 0 }, error: null };
  }

  let query = supabase.from("expenses").select("amount");

  if (programId) {
    query = query.eq("program_id", programId);
  } else if (programIds) {
    query = query.in("program_id", programIds);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  const total =
    data?.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0) || 0;
  const count = data?.length || 0;

  return { data: { total, count }, error: null };
}

export async function createExpense(
  input: CreateExpenseInput,
): Promise<{
  data: Expense | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("expenses")
    .insert([input])
    .select()
    .single();

  return { data, error };
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput,
): Promise<{
  data: Expense | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("expenses")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteExpense(id: string): Promise<{
  error: PostgrestError | null;
}> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  return { error };
}
