"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getParticipants,
  getParticipantsPaginated,
  type ParticipantsListParams,
} from "@/services/participants.service";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import { PAYMENT_STATUS_ALL } from "@/constants/payment-status";
import { SECURE_SEAT_INTEREST_ALL } from "@/constants/secure-seat-interest";

export const participantsQueryKey = (programId: string) =>
  ["participants", programId] as const;

export const participantsPaginatedQueryKey = (
  programId: string,
  page: number,
  limit: number,
  search = "",
  status = PAYMENT_STATUS_ALL,
  secureSeatInterest = SECURE_SEAT_INTEREST_ALL,
) =>
  [
    "participants",
    programId,
    "paginated",
    page,
    limit,
    search,
    status,
    secureSeatInterest,
  ] as const;

export function useParticipants(programId: string) {
  return useQuery({
    queryKey: participantsQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getParticipants(programId);
      if (error) {
        throw error;
      }
      return data ?? [];
    },
    enabled: Boolean(programId),
  });
}

export function useParticipantsPaginated(
  programId: string,
  {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    search = "",
    status = PAYMENT_STATUS_ALL,
    secureSeatInterest = SECURE_SEAT_INTEREST_ALL,
  }: ParticipantsListParams = {},
) {
  return useQuery({
    queryKey: participantsPaginatedQueryKey(
      programId,
      page,
      limit,
      search,
      status,
      secureSeatInterest,
    ),
    queryFn: async () => {
      const { data, error } = await getParticipantsPaginated(programId, {
        page,
        limit,
        search,
        status,
        secureSeatInterest,
      });
      if (error) {
        throw error;
      }
      return data!;
    },
    enabled: Boolean(programId),
    placeholderData: keepPreviousData,
  });
}
