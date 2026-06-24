const IDR_CURRENCY_FORMAT: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

export function formatCurrency(
  amount: number | null | undefined,
  currency = "IDR",
): string {
  const options =
    currency === "IDR"
      ? IDR_CURRENCY_FORMAT
      : {
          style: "currency" as const,
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        };

  const value = amount ?? 0;

  return new Intl.NumberFormat("id-ID", options).format(value);
}
