export function formatCurrency(
  amount: number | null | undefined,
  currency = "IDR"
): string {
  if (amount === null || amount === undefined) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
    }).format(0)
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
  }).format(amount)
}
