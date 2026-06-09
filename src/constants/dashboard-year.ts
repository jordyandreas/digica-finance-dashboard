export const CURRENT_DASHBOARD_YEAR = new Date().getFullYear();

export const YEAR_FILTER_ALL = "all" as const;

export type YearFilterValue = number | typeof YEAR_FILTER_ALL;

export const PROGRAM_YEAR_OPTIONS = [2029, 2028, 2027, 2026] as const;

export function toYearFilterParam(year: YearFilterValue): number | undefined {
  return year === YEAR_FILTER_ALL ? undefined : year;
}

export function formatYearFilterLabel(year: YearFilterValue): string {
  return year === YEAR_FILTER_ALL ? "all years" : String(year);
}
