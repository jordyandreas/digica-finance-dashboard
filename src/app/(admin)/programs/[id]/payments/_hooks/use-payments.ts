"use client";

import { useQuery } from "@tanstack/react-query";
import { getPayments, getPaymentsSummary } from "@/services/payments.service";

export const paymentsQueryKey = (programId: string) =>
  ["payments", programId] as const;
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

