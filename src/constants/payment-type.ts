export const PAYMENT_TYPE_ALL = "all";

export const PAYMENT_TYPE_FILTER_VALUES = ["tenor", "full"] as const;

export type PaymentTypeFilterValue =
  | typeof PAYMENT_TYPE_ALL
  | (typeof PAYMENT_TYPE_FILTER_VALUES)[number];

export function formatPaymentTypeLabel(
  paymentType: string | null | undefined,
): string {
  if (!paymentType) {
    return "";
  }
  return paymentType.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const PAYMENT_TYPE_FILTER_OPTIONS = [
  { label: "All types", value: PAYMENT_TYPE_ALL },
  ...PAYMENT_TYPE_FILTER_VALUES.map((paymentType) => ({
    label: formatPaymentTypeLabel(paymentType),
    value: paymentType,
  })),
];
