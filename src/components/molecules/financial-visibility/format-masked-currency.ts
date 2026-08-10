import { formatCurrency } from "@/utils/currency";

const MASKED_CURRENCY = "Rp.••••••";

export function formatMaskedCurrency(
  value: number | null | undefined,
  isVisible: boolean,
): string {
  if (!isVisible) {
    return MASKED_CURRENCY;
  }

  return formatCurrency(value);
}
