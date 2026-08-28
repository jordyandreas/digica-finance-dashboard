import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import { PAYMENT_STATUS_ALL } from "@/constants/payment-status";
import {
  SECURE_SEAT_INTEREST_ALL,
  type SecureSeatInterest,
} from "@/constants/secure-seat-interest";
import type {
  RegistrationPackage,
  RegistrationSource,
} from "@/constants/registration-offers";
import {
  REGISTRATION_PACKAGE_ALL,
  REGISTRATION_SOURCE_ALL,
} from "@/constants/registration-offers";
import {
  buildPaginationMeta,
  type ListParams,
  type PaginatedResponse,
} from "@/types/pagination";
import { toOrIlikeFilter } from "@/utils/search";
import { fetchAllPages } from "@/utils/supabase-fetch-all";

export interface Participant {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  occupation: string | null;
  organization: string | null;
  program_id: string | null;
  program_name: string | null;
  status: string | null;
  payment_status: string | null;
  joined_date: string | null;
  notes: string | null;
  reference_name: string | null;
  secure_seat_interest: SecureSeatInterest | null;
  registration_source: RegistrationSource | null;
  selected_package: RegistrationPackage | null;
  package_price: number | null;
  friend_name: string | null;
  friend_phone: string | null;
  created_at: string | null;
}

export interface CreateParticipantInput {
  name: string;
  email?: string;
  phone?: string;
  occupation?: string;
  organization?: string;
  program_id: string;
  program_name?: string;
  status?: string;
  payment_status?: string;
  joined_date?: string;
  notes?: string;
  reference_name?: string | null;
  secure_seat_interest?: SecureSeatInterest | null;
  registration_source?: RegistrationSource | null;
  selected_package?: RegistrationPackage | null;
  package_price?: number | null;
  friend_name?: string | null;
  friend_phone?: string | null;
}

export interface UpdateParticipantInput {
  name?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  organization?: string;
  program_id?: string;
  program_name?: string;
  status?: string;
  payment_status?: string;
  joined_date?: string;
  notes?: string;
  reference_name?: string | null;
  secure_seat_interest?: SecureSeatInterest | null;
  registration_source?: RegistrationSource | null;
  selected_package?: RegistrationPackage | null;
  package_price?: number | null;
  friend_name?: string | null;
  friend_phone?: string | null;
}

export type ParticipantsListParams = ListParams & {
  secureSeatInterest?: string;
  registrationSource?: string;
  selectedPackage?: string;
};

export async function getParticipants(programId?: string): Promise<{
  data: Participant[] | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await fetchAllPages<Participant>((from, to) => {
    let query = supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: true });

    if (programId) {
      query = query.eq("program_id", programId);
    }

    return query.range(from, to);
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getParticipantsPaginated(
  programId: string,
  {
    page = 1,
    limit = 10,
    search,
    status,
    secureSeatInterest,
    registrationSource,
    selectedPackage,
  }: ParticipantsListParams = {},
): Promise<{
  data: PaginatedResponse<Participant> | null;
  error: PostgrestError | null;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const searchFilter = search
    ? toOrIlikeFilter(["name", "email", "phone"], search)
    : "";

  let query = supabase
    .from("participants")
    .select("*", { count: "exact" })
    .eq("program_id", programId);

  if (searchFilter) {
    query = query.or(searchFilter);
  }

  if (status && status !== PAYMENT_STATUS_ALL) {
    query = query.eq("payment_status", status);
  }

  if (
    secureSeatInterest &&
    secureSeatInterest !== SECURE_SEAT_INTEREST_ALL
  ) {
    query = query.eq("secure_seat_interest", secureSeatInterest);
  }

  if (
    registrationSource &&
    registrationSource !== REGISTRATION_SOURCE_ALL
  ) {
    query = query.eq("registration_source", registrationSource);
  }

  if (selectedPackage && selectedPackage !== REGISTRATION_PACKAGE_ALL) {
    query = query.eq("selected_package", selectedPackage);
  }

  const { data, error, count } = await query
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

export async function createParticipant(
  input: CreateParticipantInput,
): Promise<{
  data: Participant | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("participants")
    .insert([input])
    .select()
    .single();

  return { data, error };
}

export async function updateParticipant(
  id: string,
  input: UpdateParticipantInput,
): Promise<{
  data: Participant | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("participants")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteParticipant(id: string): Promise<{
  error: PostgrestError | null;
}> {
  const { error } = await supabase.from("participants").delete().eq("id", id);

  return { error };
}