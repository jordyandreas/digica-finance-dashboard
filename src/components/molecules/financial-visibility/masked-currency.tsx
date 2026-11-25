"use client";

import { useFinancialVisibility } from "@/hooks/use-financial-visibility";
import { formatMaskedCurrency } from "./format-masked-currency";

type MaskedCurrencyProps = {
  value: number | null | undefined;
};

export function MaskedCurrency({ value }: MaskedCurrencyProps) {
  const { isVisible } = useFinancialVisibility();

  return <>{formatMaskedCurrency(value, isVisible)}</>;
}
