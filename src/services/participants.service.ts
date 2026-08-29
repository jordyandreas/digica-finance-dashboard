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

export interface ParticipantProgramCounts {
  total: number;
  paid: number;
  on_progress: number;
  pending: number;
  social: number;
  workshop_individual: number;
  workshop_bareng_teman: number;
  secure_seat_yes: number;
  secure_seat_undecided: number;
  secure_seat_no: number;
}

const EMPTY_PARTICIPANT_COUNTS: ParticipantProgramCounts = {
  total: 0,
  paid: 0,
  on_progress: 0,
  pending: 0,
  social: 0,
  workshop_individual: 0,
  workshop_bareng_teman: 0,
  secure_seat_yes: 0,
  secure_seat_undecided: 0,
  secure_seat_no: 0,
};

export async function getParticipantCountsByProgramIds(
  programIds: string[],
): Promise<{
  data: Record<string, ParticipantProgramCounts>;
  error: PostgrestError | null;
}> {
  const countsByProgramId: Record<string, ParticipantProgramCounts> = {};

  for (const programId of programIds) {
    countsByProgramId[programId] = { ...EMPTY_PARTICIPANT_COUNTS };
  }

  if (programIds.length === 0) {
    return { data: countsByProgramId, error: null };
  }

  const { data, error } = await fetchAllPages<{
    program_id: string | null;
    payment_status: string | null;
    registration_source: string | null;
    selected_package: string | null;
    secure_seat_interest: string | null;
  }>((from, to) =>
    supabase
      .from("participants")
      .select(
        "program_id, payment_status, registration_source, selected_package, secure_seat_interest",
      )
      .in("program_id", programIds)
      .range(from, to),
  );

  if (error) {
    return { data: {}, error };
  }

  for (const row of data) {
    if (!row.program_id) continue;

    const bucket = countsByProgramId[row.program_id];
    if (!bucket) continue;

    bucket.total += 1;

    if (row.payment_status === "paid") {
      bucket.paid += 1;
    } else if (row.payment_status === "on_progress") {
      bucket.on_progress += 1;
    } else if (row.payment_status === "pending") {
      bucket.pending += 1;
    }

    if (row.registration_source === "social") {
      bucket.social += 1;
    }

    if (row.selected_package === "individual") {
      bucket.workshop_individual += 1;
    } else if (row.selected_package === "bareng_teman") {
      bucket.workshop_bareng_teman += 1;
    }

    if (row.secure_seat_interest === "yes") {
      bucket.secure_seat_yes += 1;
    } else if (row.secure_seat_interest === "undecided") {
      bucket.secure_seat_undecided += 1;
    } else if (row.secure_seat_interest === "no") {
      bucket.secure_seat_no += 1;
    }
  }

  return { data: countsByProgramId, error: null };
}

export async function getParticipantCountsByProgramId(programId: string): Promise<{
  data: ParticipantProgramCounts;
  error: PostgrestError | null;
}> {
  const { data, error } = await getParticipantCountsByProgramIds([programId]);

  if (error) {
    return { data: { ...EMPTY_PARTICIPANT_COUNTS }, error };
  }

  return {
    data: data[programId] ?? { ...EMPTY_PARTICIPANT_COUNTS },
    error: null,
  };
}

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