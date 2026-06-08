import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export interface Payment {
  id: string;
  amount: number | null;
  payment_date: string | null;
  participant_id: string | null;
  participant_name: string | null;
  program_id: string | null;
  program_name: string | null;
  payment_method: string | null;
  payment_type: string | null; // "tenor" or "full"
  tenor: number | null;
  paid_tenor: number | null;
  status: string | null;
  reference_name: string | null;
  referral_name: string | null;
  notes: string | null;
  created_at: string | null;
  paid_at: string | null;
}

export interface CreatePaymentInput {
  amount: number;
  participant_id: string;
  program_id: string;
  payment_type: "tenor" | "full";
  tenor?: number; // Required if payment_type is "tenor"
  paid_tenor?: number; // Required if payment_type is "tenor"
  status?: string;
  paid_at?: string;
  payment_method?: string;
  reference_name?: string;
  notes?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  participant_id?: string;
  program_id?: string;
  payment_type?: "tenor" | "full";
  tenor?: number;
  paid_tenor?: number | null;
  status?: string;
  paid_at?: string;
  payment_method?: string;
  reference_name?: string;
  notes?: string;
}

export async function getPayments(programId?: string): Promise<{
  data: Payment[] | null;
  error: PostgrestError | null;
}> {
  let query = supabase
    .from("payments")
    .select(`
      *,
      participants:participant_id (
        name
      )
    `)
    .order("created_at", { ascending: true });

  if (programId) {
    query = query.eq("program_id", programId);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  type PaymentWithParticipant = Payment & {
    participants?: { name?: string | null } | null;
  };

  // Map the joined data to include participant_name
  const mappedData = data?.map((payment: PaymentWithParticipant) => {
    const { participants, ...rest } = payment;
    const participantName = participants?.name || payment.participant_name || null;
    return {
      ...rest,
      participant_name: participantName,
      referral_name: payment.reference_name || null,
    };
  });

  return { data: mappedData || null, error: null };
}

export async function getPaymentsSummary(programId?: string): Promise<{
  data: { total: number; count: number } | null;
  error: PostgrestError | null;
}> {
  let query = supabase.from("payments").select("amount");

  if (programId) {
    query = query.eq("program_id", programId);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  const total =
    data?.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) || 0;
  const count = data?.length || 0;

  return { data: { total, count }, error: null };
}

export async function createPayment(
  input: CreatePaymentInput,
): Promise<{
  data: Payment | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("payments")
    .insert([input])
    .select()
    .single();

  return { data, error };
}

export async function updatePayment(
  id: string,
  input: UpdatePaymentInput,
): Promise<{
  data: Payment | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("payments")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deletePayment(id: string): Promise<{
  error: PostgrestError | null;
}> {
  const { error } = await supabase.from("payments").delete().eq("id", id);

  return { error };
}
