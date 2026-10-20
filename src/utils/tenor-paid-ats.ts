import { formatDateTimeLocalString } from "@/lib/date-utils";

export function createEmptyTenorPaidAts(tenor: number): string[] {
  return Array.from({ length: tenor }, () => "");
}

export function resizeTenorPaidAts(
  dates: readonly string[],
  tenor: number,
): string[] {
  return Array.from({ length: tenor }, (_, index) => dates[index] ?? "");
}

export function countPaidTenorFromDates(dates: readonly string[]): number {
  return dates.filter((date) => date.trim().length > 0).length;
}

/** Last filled installment date in tenor order (for syncing legacy paid_at). */
export function getLatestTenorPaidAt(
  dates: readonly string[],
): string | undefined {
  for (let index = dates.length - 1; index >= 0; index -= 1) {
    const value = dates[index]?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
}

export function normalizeTenorPaidAtsForStorage(
  dates: readonly string[],
): (string | null)[] {
  return dates.map((date) => {
    const trimmed = date.trim();
    return trimmed.length > 0 ? trimmed : null;
  });
}

function formatStoredTenorPaidAt(value: string | null | undefined): string {
  if (!value?.trim()) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return formatDateTimeLocalString(parsed);
}

/**
 * Builds form tenor date slots from stored payment data.
 * Falls back to filling the first `paid_tenor` slots with `paid_at` for legacy rows.
 */
export function buildTenorPaidAtsFromPayment(
  tenor: number | null | undefined,
  tenorPaidAts: readonly (string | null)[] | null | undefined,
  paidTenor: number | null | undefined,
  paidAt: string | null | undefined,
): string[] {
  if (!tenor || tenor < 1) {
    return [];
  }

  if (Array.isArray(tenorPaidAts) && tenorPaidAts.length > 0) {
    return resizeTenorPaidAts(
      tenorPaidAts.map((date) => formatStoredTenorPaidAt(date)),
      tenor,
    );
  }

  const dates = createEmptyTenorPaidAts(tenor);
  const filledCount =
    paidTenor != null && paidTenor > 0 ? Math.min(paidTenor, tenor) : 0;
  const legacyPaidAt = formatStoredTenorPaidAt(paidAt);

  if (legacyPaidAt && filledCount > 0) {
    for (let index = 0; index < filledCount; index += 1) {
      dates[index] = legacyPaidAt;
    }
  }

  return dates;
}
