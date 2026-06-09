export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "on_progress",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_ALL = "all";

function formatPaymentStatusLabel(status: PaymentStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export const PAYMENT_STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: PAYMENT_STATUS_ALL },
  ...PAYMENT_STATUSES.map((status) => ({
    label: formatPaymentStatusLabel(status),
    value: status,
  })),
];
