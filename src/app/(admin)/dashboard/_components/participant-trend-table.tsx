"use client";

import { StatusBadge } from "@/components/atoms/status-badge";
import { Typography } from "@/components/atoms";
import {
  formatMaskedCurrency,
} from "@/components/molecules/financial-visibility";
import { useFinancialVisibility } from "@/hooks/use-financial-visibility";
import { cn } from "@/lib/utils";
import { formatProgramShortDateRange } from "@/utils/programs";
import type {
  ParticipantTrendCategory,
  ParticipantTrendMetric,
  ParticipantTrendPoint,
  ParticipantTrendSeriesMetric,
} from "@/utils/program-series";
import {
  PARTICIPANT_TREND_SERIES_TEXT_CLASS,
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

type ParticipantTrendTableProps = {
  points: ParticipantTrendPoint[];
  category: ParticipantTrendCategory;
  metric: ParticipantTrendMetric;
};

function deltaClassName(value: number | null): string {
  if (value == null || value === 0) return "text-muted-foreground";
  if (value > 0) return "text-emerald-700";
  return "text-red-700";
}

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

export function ParticipantTrendTable({
  points,
  category,
  metric,
}: ParticipantTrendTableProps) {
  const { isVisible } = useFinancialVisibility();
  const isCurrency = isFinanceTrendCategory(category);

  if (points.length === 0) {
    return null;
  }

  const isAll = isAllTrendMetric(metric);
  const seriesMetrics = getChartMetrics(category, metric);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table
        className={cn(
          "w-full text-left text-sm",
          isAll ? "min-w-[760px]" : "min-w-[640px]",
        )}
      >
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-4 py-3 font-medium">Batch</th>
            <th className="px-4 py-3 font-medium">Year</th>
            <th className="px-4 py-3 font-medium">Start</th>
            {isAll ? (
              seriesMetrics.map((seriesMetric) => (
                <th key={seriesMetric} className="px-4 py-3 font-medium">
                  {formatTrendMetricLabel(seriesMetric)}
                </th>
              ))
            ) : (
              <>
                <th className="px-4 py-3 font-medium">
                  {formatTrendMetricLabel(metric)}
                </th>
                <th className="px-4 py-3 font-medium">
                  {isCurrency ? "Δ Amount" : "Δ Count"}
                </th>
                <th className="px-4 py-3 font-medium">Δ %</th>
              </>
            )}
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) =>
            isAll ? (
              <AllMetricRow
                key={point.programId}
                point={point}
                seriesMetrics={seriesMetrics}
                isCurrency={isCurrency}
                isVisible={isVisible}
              />
            ) : (
              <SingleMetricRow
                key={point.programId}
                point={point}
                metric={metric}
                isCurrency={isCurrency}
                isVisible={isVisible}
              />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function BatchCell({ point }: { point: ParticipantTrendPoint }) {
  return (
    <td className="px-4 py-3">
      <Typography variant="body3" className="font-medium">
        {formatBatchLabel(point.batch)}
      </Typography>
      <p className="text-xs text-muted-foreground">{point.programName}</p>
    </td>
  );
}

function AllMetricRow({
  point,
  seriesMetrics,
  isCurrency,
  isVisible,
}: {
  point: ParticipantTrendPoint;
  seriesMetrics: ParticipantTrendSeriesMetric[];
  isCurrency: boolean;
  isVisible: boolean;
}) {
  return (
    <tr className="border-b last:border-b-0">
      <BatchCell point={point} />
      <td className="px-4 py-3 tabular-nums">{point.year ?? "—"}</td>
      <td className="px-4 py-3">
        {formatProgramShortDateRange(point.startDate, null)}
      </td>
      {seriesMetrics.map((seriesMetric) => (
        <td
          key={seriesMetric}
          className={cn(
            "px-4 py-3 tabular-nums font-medium",
            PARTICIPANT_TREND_SERIES_TEXT_CLASS[seriesMetric],
          )}
        >
          {formatTrendValue(
            getMetricCount(point.counts, seriesMetric),
            isCurrency,
            isVisible,
          )}
        </td>
      ))}
      <td className="px-4 py-3">
        <StatusBadge status={point.status} />
      </td>
    </tr>
  );
}

function SingleMetricRow({
  point,
  metric,
  isCurrency,
  isVisible,
}: {
  point: ParticipantTrendPoint;
  metric: ParticipantTrendSeriesMetric;
  isCurrency: boolean;
  isVisible: boolean;
}) {
  const delta = getMetricDelta(point.deltas, metric);

  return (
    <tr className="border-b last:border-b-0">
      <BatchCell point={point} />
      <td className="px-4 py-3 tabular-nums">{point.year ?? "—"}</td>
      <td className="px-4 py-3">
        {formatProgramShortDateRange(point.startDate, null)}
      </td>
      <td className="px-4 py-3 tabular-nums font-medium">
        {formatTrendValue(
          getMetricCount(point.counts, metric),
          isCurrency,
          isVisible,
        )}
      </td>
      <td
        className={cn(
          "px-4 py-3 tabular-nums font-medium",
          deltaClassName(delta.deltaCount),
        )}
      >
        {formatTrendDelta(delta.deltaCount, isCurrency, isVisible)}
      </td>
      <td
        className={cn(
          "px-4 py-3 tabular-nums font-medium",
          deltaClassName(delta.deltaPct),
        )}
      >
        {formatDeltaPct(delta.deltaPct)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={point.status} />
      </td>
    </tr>
  );
}
