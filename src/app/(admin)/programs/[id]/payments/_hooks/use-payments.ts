"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getPayments,
  getPaymentsPaginated,
  getPaymentsSummary,
  type PaymentsListParams,
} from "@/services/payments.service";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import { PAYMENT_STATUS_ALL } from "@/constants/payment-status";
import { PAYMENT_TYPE_ALL } from "@/constants/payment-type";

export const paymentsQueryKey = (programId: string) =>
  ["payments", programId] as const;

export const paymentsPaginatedQueryKey = (
  programId: string,
  page: number,
  limit: number,
  search = "",
  status = PAYMENT_STATUS_ALL,
  paymentType = PAYMENT_TYPE_ALL,
) =>
  [
    "payments",
    programId,
    "paginated",
    page,
    limit,
    search,
    status,
    paymentType,
  ] as const;

export const paymentsSummaryQueryKey = (programId: string) =>
  ["payments-summary", programId] as const;

export function usePayments(programId: string) {
  return useQuery({
    queryKey: paymentsQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getPayments(programId);
      if (error) {
        throw error;
      }
      return data ?? [];
    },
    enabled: Boolean(programId),
  });
}

export function usePaymentsPaginated(
  programId: string,
  {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    search = "",
    status = PAYMENT_STATUS_ALL,
    paymentType = PAYMENT_TYPE_ALL,
  }: PaymentsListParams = {},
) {
  return useQuery({
    queryKey: paymentsPaginatedQueryKey(
      programId,
      page,
      limit,
      search,
      status,
      paymentType,
    ),
    queryFn: async () => {
      const { data, error } = await getPaymentsPaginated(programId, {
        page,
        limit,
        search,
        status,
        paymentType,
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

export function usePaymentsSummary(programId: string) {
  return useQuery({
    queryKey: paymentsSummaryQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getPaymentsSummary(programId);
      if (error) {
        throw error;
      }
      return data ?? { total: 0, count: 0 };
    },
    enabled: Boolean(programId),
  });
}

