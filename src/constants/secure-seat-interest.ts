export const SECURE_SEAT_INTEREST_VALUES = [
  "yes",
  "undecided",
  "no",
] as const;

export type SecureSeatInterest =
  (typeof SECURE_SEAT_INTEREST_VALUES)[number];

export const SECURE_SEAT_INTEREST_LABELS: Record<SecureSeatInterest, string> =
  {
    yes: "Ya, aku mau secure promo sekarang",
    undecided: "Masih mempertimbangkan",
    no: "Belum bisa join saat ini",
  };

export const SECURE_SEAT_INTEREST_OPTIONS = SECURE_SEAT_INTEREST_VALUES.map(
  (value) => ({
    value,
    label: SECURE_SEAT_INTEREST_LABELS[value],
  }),
);

export function isSecureSeatInterest(
  value: string | null | undefined,
): value is SecureSeatInterest {
  return (
    value === "yes" || value === "undecided" || value === "no"
  );
}

export function formatSecureSeatInterest(
  value: string | null | undefined,
): string {
  if (!isSecureSeatInterest(value)) {
    return "-";
  }

  return SECURE_SEAT_INTEREST_LABELS[value];
}
