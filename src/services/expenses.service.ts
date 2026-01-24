import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

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
    .order("expense_date", { ascending: false });

  if (programId) {
    query = query.eq("program_id", programId);
  }

  const { data, error } = await query;

  return { data, error };
}

export async function getExpensesSummary(programId?: string): Promise<{
  data: { total: number; count: number } | null;
  error: PostgrestError | null;
}> {
  let query = supabase.from("expenses").select("amount");

  if (programId) {
    query = query.eq("program_id", programId);
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
