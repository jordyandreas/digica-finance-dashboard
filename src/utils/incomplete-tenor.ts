import type { Payment } from "@/services/payments.service";

export type IncompleteTenorCount = {
  paidTenor: number;
  count: number;
};

export function isIncompleteTenorPayment(payment: Payment): boolean {
  return (
    payment.payment_type === "tenor" &&
    payment.paid_tenor != null &&
    payment.tenor != null &&
    payment.paid_tenor < payment.tenor
  );
}

/** Groups incomplete tenor payments by current paid_tenor (ascending). */
export function groupIncompleteTenorCounts(
  payments: Payment[],
): IncompleteTenorCount[] {
  const counts = new Map<number, number>();

  for (const payment of payments) {
    if (!isIncompleteTenorPayment(payment) || payment.paid_tenor == null) {
      continue;
    }
    counts.set(payment.paid_tenor, (counts.get(payment.paid_tenor) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([paidTenor, count]) => ({ paidTenor, count }));
}
