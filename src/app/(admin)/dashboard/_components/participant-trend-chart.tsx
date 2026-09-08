"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatMaskedCurrency,
} from "@/components/molecules/financial-visibility";
import { useFinancialVisibility } from "@/hooks/use-financial-visibility";
import type {
  ParticipantTrendCategory,
  ParticipantTrendCounts,
  ParticipantTrendDeltas,
  ParticipantTrendMetric,
  ParticipantTrendPoint,
  ParticipantTrendSeriesMetric,
} from "@/utils/program-series";
import {
  PARTICIPANT_TREND_SERIES_COLORS,
  formatBatchLabel,
  formatDeltaCount,
  formatDeltaPct,
  formatTrendMetricLabel,
  getChartMetrics,
  getMetricCount,
  getMetricDelta,
  isAllTrendMetric,
  isFinanceTrendCategory,
} from "@/utils/program-series";

type ParticipantTrendChartProps = {
  points: ParticipantTrendPoint[];
  category: ParticipantTrendCategory;
  metric: ParticipantTrendMetric;
};

type ChartRow = {
  label: string;
  counts: ParticipantTrendCounts;
  deltas: ParticipantTrendDeltas;
};

function formatTrendValue(
  value: number,
  isCurrency: boolean,
  isVisible: boolean,
): string {
  if (isCurrency) {
    return formatMaskedCurrency(value, isVisible);
  }
  return String(value);
}

function formatTrendDelta(
  deltaCount: number | null,
  isCurrency: boolean,
  isVisible: boolean,
): string {
  if (deltaCount == null) return "—";
  if (!isCurrency) return formatDeltaCount(deltaCount);
  const formatted = formatMaskedCurrency(Math.abs(deltaCount), isVisible);
  if (deltaCount === 0) return formatted;
  return deltaCount > 0 ? `+${formatted}` : `-${formatted}`;
}

function compactCurrencyTick(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return String(value);
}

function ChartTooltip({
  active,
  payload,
  lines,
  isCurrency,
  isVisible,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartRow }>;
  lines: ParticipantTrendSeriesMetric[];
  isCurrency: boolean;
  isVisible: boolean;
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{row.label}</p>
      {lines.map((seriesMetric) => {
        const delta = getMetricDelta(row.deltas, seriesMetric);
        return (
          <div
            key={seriesMetric}
            className="mt-1 tabular-nums text-muted-foreground"
          >
            <span
              style={{ color: PARTICIPANT_TREND_SERIES_COLORS[seriesMetric] }}
            >
              {formatTrendMetricLabel(seriesMetric)}
            </span>
            :{" "}
            {formatTrendValue(
              getMetricCount(row.counts, seriesMetric),
              isCurrency,
              isVisible,
            )}{" "}
            · Δ {formatTrendDelta(delta.deltaCount, isCurrency, isVisible)} (
            {formatDeltaPct(delta.deltaPct)})
          </div>
        );
      })}
    </div>
  );
}

export function ParticipantTrendChart({
  points,
  category,
  metric,
}: ParticipantTrendChartProps) {
  const { isVisible } = useFinancialVisibility();
  const isCurrency = isFinanceTrendCategory(category);
  const lines = getChartMetrics(category, metric);
  const data: ChartRow[] = points.map((point, index) => ({
    label:
      point.batch != null
        ? formatBatchLabel(point.batch)
        : `Point ${index + 1}`,
    counts: point.counts,
    deltas: point.deltas,
    ...point.counts,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No batch data for this series.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            width={isCurrency ? 52 : 36}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) =>
              isCurrency
                ? isVisible
                  ? compactCurrencyTick(value)
                  : "••"
                : String(value)
            }
          />
          <Tooltip
            content={
              <ChartTooltip
                lines={lines}
                isCurrency={isCurrency}
                isVisible={isVisible}
              />
            }
          />
          {isAllTrendMetric(metric) ? <Legend /> : null}
          {lines.map((seriesMetric) => (
            <Line
              key={seriesMetric}
              type="monotone"
              dataKey={seriesMetric}
              name={formatTrendMetricLabel(seriesMetric)}
              stroke={PARTICIPANT_TREND_SERIES_COLORS[seriesMetric]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
