import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import { PAYMENT_STATUS_ALL } from "@/constants/payment-status";
import {
  buildPaginationMeta,
  type ListParams,
  type PaginatedResponse,
} from "@/types/pagination";
import { toIlikePattern } from "@/utils/search";

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

type PaymentWithParticipant = Payment & {
  participants?: { name?: string | null } | null;
};

function mapPaymentsWithParticipants(
  data: PaymentWithParticipant[] | null,
): Payment[] {
  return (
    data?.map((payment) => {
      const { participants, ...rest } = payment;
      const participantName =
        participants?.name || payment.participant_name || null;
      return {
        ...rest,
        participant_name: participantName,
        referral_name: payment.reference_name || null,
      };
    }) ?? []
  );
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

  return { data: mapPaymentsWithParticipants(data), error: null };
}

export async function getPaymentsPaginated(
  programId: string,
  { page = 1, limit = 10, search, status }: ListParams = {},
): Promise<{
  data: PaginatedResponse<Payment> | null;
  error: PostgrestError | null;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const searchPattern = search ? toIlikePattern(search) : "";
  const select = searchPattern
    ? `
      *,
      participants!participant_id!inner (
        name
      )
    `
    : `
      *,
      participants:participant_id (
        name
      )
    `;

  let query = supabase
    .from("payments")
    .select(select, { count: "exact" })
    .eq("program_id", programId);

  if (searchPattern) {
    query = query.ilike("participants.name", searchPattern);
  }

  if (status && status !== PAYMENT_STATUS_ALL) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: true })
    .range(from, to);

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      data: mapPaymentsWithParticipants(data),
      pagination: buildPaginationMeta(count ?? 0, page, limit),
    },
    error: null,
  };
}

export async function getPaymentsByParticipantIds(
  participantIds: string[],
  programId?: string,
): Promise<{
  data: Payment[] | null;
  error: PostgrestError | null;
}> {
  if (participantIds.length === 0) {
    return { data: [], error: null };
  }

  let query = supabase
    .from("payments")
    .select("*")
    .in("participant_id", participantIds);

  if (programId) {
    query = query.eq("program_id", programId);
  }

  const { data, error } = await query;

  return { data, error };
}

export async function getPaymentsSummary(
  programId?: string,
  programIds?: string[],
): Promise<{
  data: { total: number; count: number } | null;
  error: PostgrestError | null;
}> {
  if (programIds && programIds.length === 0) {
    return { data: { total: 0, count: 0 }, error: null };
  }

  let query = supabase.from("payments").select("amount");

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
