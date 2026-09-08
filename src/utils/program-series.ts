import type { ProgramStatus, ProgramType } from "@/services/programs.service";

export const PARTICIPANT_TREND_METRIC_ALL = "all" as const;

export const PARTICIPANT_TREND_CATEGORIES = [
  "payment",
  "package",
  "source",
  "plan",
  "finance",
] as const;

export type ParticipantTrendCategory =
  (typeof PARTICIPANT_TREND_CATEGORIES)[number];

export type ParticipantTrendSeriesMetric =
  | "paid"
  | "on_progress"
  | "pending"
  | "individual"
  | "bareng_teman"
  | "social"
  | "workshop"
  | "full"
  | "tenor"
  | "scholarship"
  | "revenue"
  | "expense";

export type ParticipantTrendMetric =
  | typeof PARTICIPANT_TREND_METRIC_ALL
  | ParticipantTrendSeriesMetric;

export type ParticipantTrendCounts = Record<ParticipantTrendSeriesMetric, number>;

export type ParticipantTrendDeltas = Record<
  ParticipantTrendSeriesMetric,
  { deltaCount: number | null; deltaPct: number | null }
>;

export type ProgramSeriesInput = {
  id: string;
  name: string;
  type: ProgramType;
  batch: number | null;
  year: number | null;
  start_date: string | null;
  created_at: string;
  status: ProgramStatus;
  counts: ParticipantTrendCounts;
};

export type ParticipantTrendPoint = {
  programId: string;
  programName: string;
  batch: number | null;
  year: number | null;
  startDate: string | null;
  status: ProgramStatus;
  counts: ParticipantTrendCounts;
  deltas: ParticipantTrendDeltas;
};

export type ParticipantTrendSeries = {
  seriesKey: string;
  seriesLabel: string;
  type: ProgramType;
  points: ParticipantTrendPoint[];
};

export const PARTICIPANT_TREND_CATEGORY_OPTIONS: {
  value: ParticipantTrendCategory;
  label: string;
}[] = [
  { value: "payment", label: "Payment" },
  { value: "package", label: "Package" },
  { value: "source", label: "Source" },
  { value: "plan", label: "Plan" },
  { value: "finance", label: "Finance" },
];

const PAYMENT_SERIES_METRICS: ParticipantTrendSeriesMetric[] = [
  "paid",
  "on_progress",
  "pending",
];

const PACKAGE_SERIES_METRICS: ParticipantTrendSeriesMetric[] = [
  "individual",
  "bareng_teman",
];

const SOURCE_SERIES_METRICS: ParticipantTrendSeriesMetric[] = [
  "social",
  "workshop",
];

const PLAN_SERIES_METRICS: ParticipantTrendSeriesMetric[] = [
  "full",
  "tenor",
  "scholarship",
];

const FINANCE_SERIES_METRICS: ParticipantTrendSeriesMetric[] = [
  "revenue",
  "expense",
];

export const PARTICIPANT_TREND_METRIC_OPTIONS_BY_CATEGORY: Record<
  ParticipantTrendCategory,
  { value: ParticipantTrendMetric; label: string }[]
> = {
  payment: [
    { value: PARTICIPANT_TREND_METRIC_ALL, label: "All" },
    { value: "paid", label: "Paid" },
    { value: "on_progress", label: "On Progress" },
    { value: "pending", label: "Pending" },
  ],
  package: [
    { value: PARTICIPANT_TREND_METRIC_ALL, label: "All" },
    { value: "individual", label: "Individual" },
    { value: "bareng_teman", label: "Bareng Teman" },
  ],
  source: [
    { value: "social", label: "Social" },
    { value: "workshop", label: "Workshop" },
  ],
  plan: [
    { value: PARTICIPANT_TREND_METRIC_ALL, label: "All" },
    { value: "full", label: "Full" },
    { value: "tenor", label: "Tenor" },
    { value: "scholarship", label: "Scholarship" },
  ],
  finance: [
    { value: PARTICIPANT_TREND_METRIC_ALL, label: "All" },
    { value: "revenue", label: "Revenue" },
    { value: "expense", label: "Expense" },
  ],
};

export const PARTICIPANT_TREND_DEFAULT_METRIC: Record<
  ParticipantTrendCategory,
  ParticipantTrendMetric
> = {
  payment: "paid",
  package: "individual",
  source: "social",
  plan: "full",
  finance: "revenue",
};

export const PARTICIPANT_TREND_SERIES_COLORS: Record<
  ParticipantTrendSeriesMetric,
  string
> = {
  paid: "#047857",
  on_progress: "#0369a1",
  pending: "#b45309",
  individual: "#4338ca",
  bareng_teman: "#a21caf",
  social: "#620a79",
  workshop: "#0f766e",
  full: "#1d4ed8",
  tenor: "#7c3aed",
  scholarship: "#be123c",
  revenue: "#620a79",
  expense: "#b91c1c",
};

export const PARTICIPANT_TREND_SERIES_TEXT_CLASS: Record<
  ParticipantTrendSeriesMetric,
  string
> = {
  paid: "text-emerald-700",
  on_progress: "text-sky-700",
  pending: "text-amber-700",
  individual: "text-indigo-700",
  bareng_teman: "text-fuchsia-700",
  social: "text-brand-royal",
  workshop: "text-teal-700",
  full: "text-blue-700",
  tenor: "text-violet-700",
  scholarship: "text-rose-700",
  revenue: "text-brand-royal",
  expense: "text-red-700",
};

/** Strip batch markers so programs in the same product line share a series. */
export function normalizeProgramSeriesLabel(name: string): string {
  return name
    .replace(/\bbatch\s*#?\s*\d+\b/gi, " ")
    .replace(/#\s*\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildProgramSeriesKey(type: ProgramType, name: string): string {
  const label = normalizeProgramSeriesLabel(name).toLowerCase();
  return `${type}::${label}`;
}

export function formatProgramSeriesLabel(name: string): string {
  const normalized = normalizeProgramSeriesLabel(name);
  if (!normalized) {
    return name.trim() || "Untitled series";
  }

  return normalized
    .split(" ")
    .map((word) => {
      if (word.includes("/")) {
        return word
          .split("/")
          .map((part) => titleCaseWord(part))
          .join("/");
      }
      return titleCaseWord(word);
    })
    .join(" ");
}

function titleCaseWord(word: string): string {
  if (!word) return word;
  if (word.toUpperCase() === word && word.length <= 4) {
    return word.toUpperCase();
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function compareProgramsForSeriesTrend(
  a: Pick<ProgramSeriesInput, "batch" | "start_date" | "created_at">,
  b: Pick<ProgramSeriesInput, "batch" | "start_date" | "created_at">,
): number {
  const aBatch = a.batch;
  const bBatch = b.batch;

  if (aBatch != null && bBatch != null && aBatch !== bBatch) {
    return aBatch - bBatch;
  }
  if (aBatch != null && bBatch == null) return -1;
  if (aBatch == null && bBatch != null) return 1;

  const aDate = a.start_date?.split("T")[0] ?? "";
  const bDate = b.start_date?.split("T")[0] ?? "";
  if (aDate !== bDate) {
    if (!aDate) return 1;
    if (!bDate) return -1;
    return aDate.localeCompare(bDate);
  }

  return a.created_at.localeCompare(b.created_at);
}

export function calcBatchDelta(
  current: number,
  previous: number | null,
): { deltaCount: number | null; deltaPct: number | null } {
  if (previous == null) {
    return { deltaCount: null, deltaPct: null };
  }

  const deltaCount = current - previous;
  if (previous === 0) {
    return { deltaCount, deltaPct: null };
  }

  return {
    deltaCount,
    deltaPct: (deltaCount / previous) * 100,
  };
}

export function getSeriesMetricsForCategory(
  category: ParticipantTrendCategory,
): ParticipantTrendSeriesMetric[] {
  switch (category) {
    case "payment":
      return PAYMENT_SERIES_METRICS;
    case "package":
      return PACKAGE_SERIES_METRICS;
    case "source":
      return SOURCE_SERIES_METRICS;
    case "plan":
      return PLAN_SERIES_METRICS;
    case "finance":
      return FINANCE_SERIES_METRICS;
  }
}

export function getChartMetrics(
  category: ParticipantTrendCategory,
  metric: ParticipantTrendMetric,
): ParticipantTrendSeriesMetric[] {
  if (metric === PARTICIPANT_TREND_METRIC_ALL) {
    return getSeriesMetricsForCategory(category);
  }
  return [metric];
}

export function isAllTrendMetric(
  metric: ParticipantTrendMetric,
): metric is typeof PARTICIPANT_TREND_METRIC_ALL {
  return metric === PARTICIPANT_TREND_METRIC_ALL;
}

export function isFinanceTrendCategory(
  category: ParticipantTrendCategory,
): boolean {
  return category === "finance";
}

export function getMetricCount(
  counts: ParticipantTrendCounts,
  metric: ParticipantTrendSeriesMetric,
): number {
  const value = Number(counts[metric] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function getMetricDelta(
  deltas: ParticipantTrendDeltas,
  metric: ParticipantTrendSeriesMetric,
): { deltaCount: number | null; deltaPct: number | null } {
  return deltas[metric] ?? { deltaCount: null, deltaPct: null };
}

export function formatTrendMetricLabel(metric: ParticipantTrendMetric): string {
  switch (metric) {
    case PARTICIPANT_TREND_METRIC_ALL:
      return "All";
    case "paid":
      return "Paid";
    case "on_progress":
      return "On Progress";
    case "pending":
      return "Pending";
    case "individual":
      return "Individual";
    case "bareng_teman":
      return "Bareng Teman";
    case "social":
      return "Social";
    case "workshop":
      return "Workshop";
    case "full":
      return "Full";
    case "tenor":
      return "Tenor";
    case "scholarship":
      return "Scholarship";
    case "revenue":
      return "Revenue";
    case "expense":
      return "Expense";
  }
}

export function formatTrendCategoryLabel(
  category: ParticipantTrendCategory,
): string {
  switch (category) {
    case "payment":
      return "Payment";
    case "package":
      return "Package";
    case "source":
      return "Source";
    case "plan":
      return "Plan";
    case "finance":
      return "Finance";
  }
}

export function sumMetricCounts(
  counts: ParticipantTrendCounts,
  metrics: ParticipantTrendSeriesMetric[],
): number {
  return metrics.reduce((sum, metric) => sum + (counts[metric] ?? 0), 0);
}

function emptyDeltas(): ParticipantTrendDeltas {
  return {
    paid: { deltaCount: null, deltaPct: null },
    on_progress: { deltaCount: null, deltaPct: null },
    pending: { deltaCount: null, deltaPct: null },
    individual: { deltaCount: null, deltaPct: null },
    bareng_teman: { deltaCount: null, deltaPct: null },
    social: { deltaCount: null, deltaPct: null },
    workshop: { deltaCount: null, deltaPct: null },
    full: { deltaCount: null, deltaPct: null },
    tenor: { deltaCount: null, deltaPct: null },
    scholarship: { deltaCount: null, deltaPct: null },
    revenue: { deltaCount: null, deltaPct: null },
    expense: { deltaCount: null, deltaPct: null },
  };
}

export function emptyTrendCounts(): ParticipantTrendCounts {
  return {
    paid: 0,
    on_progress: 0,
    pending: 0,
    individual: 0,
    bareng_teman: 0,
    social: 0,
    workshop: 0,
    full: 0,
    tenor: 0,
    scholarship: 0,
    revenue: 0,
    expense: 0,
  };
}

const ALL_SERIES_METRICS: ParticipantTrendSeriesMetric[] = [
  ...PAYMENT_SERIES_METRICS,
  ...PACKAGE_SERIES_METRICS,
  ...SOURCE_SERIES_METRICS,
  ...PLAN_SERIES_METRICS,
  ...FINANCE_SERIES_METRICS,
];

export function buildParticipantTrendSeries(
  programs: ProgramSeriesInput[],
): ParticipantTrendSeries[] {
  const grouped = new Map<string, ProgramSeriesInput[]>();

  for (const program of programs) {
    const seriesKey = buildProgramSeriesKey(program.type, program.name);
    const bucket = grouped.get(seriesKey);
    if (bucket) {
      bucket.push(program);
    } else {
      grouped.set(seriesKey, [program]);
    }
  }

  const seriesList: ParticipantTrendSeries[] = [];

  for (const [seriesKey, members] of grouped) {
    const sorted = [...members].sort(compareProgramsForSeriesTrend);
    const first = sorted[0];
    if (!first) continue;

    const points: ParticipantTrendPoint[] = sorted.map((program, index) => {
      const previous = index === 0 ? null : sorted[index - 1]!;
      const deltas = emptyDeltas();

      for (const metric of ALL_SERIES_METRICS) {
        deltas[metric] = calcBatchDelta(
          program.counts[metric] ?? 0,
          previous?.counts[metric] ?? null,
        );
      }

      return {
        programId: program.id,
        programName: program.name,
        batch: program.batch,
        year: program.year,
        startDate: program.start_date,
        status: program.status,
        counts: program.counts,
        deltas,
      };
    });

    seriesList.push({
      seriesKey,
      seriesLabel: formatProgramSeriesLabel(first.name),
      type: first.type,
      points,
    });
  }

  return seriesList.sort((a, b) => {
    const typeOrder = typeSortOrder(a.type) - typeSortOrder(b.type);
    if (typeOrder !== 0) return typeOrder;
    return a.seriesLabel.localeCompare(b.seriesLabel);
  });
}

export function getSeriesMetricSummary(
  series: ParticipantTrendSeries,
  metric: ParticipantTrendSeriesMetric,
): {
  latestCount: number;
  latestBatch: number | null;
  latestDeltaCount: number | null;
  latestDeltaPct: number | null;
  peakCount: number;
  averageCount: number;
} {
  const points = series.points;
  const latest = points[points.length - 1];
  if (!latest) {
    return {
      latestCount: 0,
      latestBatch: null,
      latestDeltaCount: null,
      latestDeltaPct: null,
      peakCount: 0,
      averageCount: 0,
    };
  }

  const counts = points.map((point) => getMetricCount(point.counts, metric));
  const peakCount = counts.length > 0 ? Math.max(...counts) : 0;
  const averageCount =
    counts.length === 0
      ? 0
      : counts.reduce((sum, count) => sum + count, 0) / counts.length;
  const delta = getMetricDelta(latest.deltas, metric);

  return {
    latestCount: getMetricCount(latest.counts, metric),
    latestBatch: latest.batch,
    latestDeltaCount: delta.deltaCount,
    latestDeltaPct: delta.deltaPct,
    peakCount,
    averageCount,
  };
}

function typeSortOrder(type: ProgramType): number {
  switch (type) {
    case "bootcamp":
      return 0;
    case "mini_bootcamp":
      return 1;
    case "workshop":
      return 2;
    default:
      return 99;
  }
}

export function formatBatchLabel(batch: number | null): string {
  if (batch == null) return "—";
  return `Batch ${batch}`;
}

export function formatDeltaCount(deltaCount: number | null): string {
  if (deltaCount == null) return "—";
  if (deltaCount > 0) return `+${deltaCount}`;
  return String(deltaCount);
}

export function formatDeltaPct(deltaPct: number | null): string {
  if (deltaPct == null) return "—";
  const rounded = Math.round(deltaPct * 10) / 10;
  const formatted = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
  if (rounded > 0) return `+${formatted}%`;
  return `${formatted}%`;
}

export function isIncludedInParticipantTrend(
  status: ProgramStatus,
): boolean {
  return status === "active" || status === "completed";
}

export function isMetricValidForCategory(
  category: ParticipantTrendCategory,
  metric: ParticipantTrendMetric,
): boolean {
  return PARTICIPANT_TREND_METRIC_OPTIONS_BY_CATEGORY[category].some(
    (option) => option.value === metric,
  );
}
