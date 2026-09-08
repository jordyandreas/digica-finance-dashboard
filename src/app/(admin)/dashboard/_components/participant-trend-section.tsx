"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatMaskedCurrency,
} from "@/components/molecules/financial-visibility";
import { useFinancialVisibility } from "@/hooks/use-financial-visibility";
import { cn } from "@/lib/utils";
import { formatProgramType } from "@/utils/programs";
import {
  PARTICIPANT_TREND_CATEGORY_OPTIONS,
  PARTICIPANT_TREND_DEFAULT_METRIC,
  PARTICIPANT_TREND_METRIC_OPTIONS_BY_CATEGORY,
  PARTICIPANT_TREND_SERIES_TEXT_CLASS,
  formatBatchLabel,
  formatDeltaCount,
  formatDeltaPct,
  formatTrendCategoryLabel,
  formatTrendMetricLabel,
  getChartMetrics,
  getSeriesMetricSummary,
  isAllTrendMetric,
  isFinanceTrendCategory,
  isMetricValidForCategory,
  sumMetricCounts,
  type ParticipantTrendCategory,
  type ParticipantTrendMetric,
  type ParticipantTrendSeries,
} from "@/utils/program-series";
import { ParticipantTrendChart } from "./participant-trend-chart";
import { ParticipantTrendTable } from "./participant-trend-table";

type ParticipantTrendSectionProps = {
  seriesList: ParticipantTrendSeries[];
  isLoading: boolean;
  errorMessage?: string | null;
  yearLabel: string;
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
  return String(Math.round(value * 10) / 10);
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

function SummaryStat({
  title,
  value,
  valueClassName,
}: {
  title: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          valueClassName ?? "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ParticipantTrendSection({
  seriesList,
  isLoading,
  errorMessage,
  yearLabel,
}: ParticipantTrendSectionProps) {
  const { isVisible } = useFinancialVisibility();
  const [selectedSeriesKey, setSelectedSeriesKey] = useState<string | null>(
    null,
  );
  const [category, setCategory] =
    useState<ParticipantTrendCategory>("payment");
  const [metric, setMetric] = useState<ParticipantTrendMetric>(
    PARTICIPANT_TREND_DEFAULT_METRIC.payment,
  );

  const selectedSeries =
    seriesList.find((series) => series.seriesKey === selectedSeriesKey) ??
    seriesList[0] ??
    null;

  const metricOptions = PARTICIPANT_TREND_METRIC_OPTIONS_BY_CATEGORY[category];
  const resolvedMetric = isMetricValidForCategory(category, metric)
    ? metric
    : PARTICIPANT_TREND_DEFAULT_METRIC[category];
  const isAllMetric = isAllTrendMetric(resolvedMetric);
  const isCurrency = isFinanceTrendCategory(category);
  const seriesMetrics = getChartMetrics(category, resolvedMetric);
  const latestPoint = selectedSeries?.points[selectedSeries.points.length - 1];
  const singleSummary =
    selectedSeries && !isAllMetric
      ? getSeriesMetricSummary(selectedSeries, resolvedMetric)
      : null;

  const handleCategoryChange = (nextCategory: ParticipantTrendCategory) => {
    const nextMetric = PARTICIPANT_TREND_DEFAULT_METRIC[nextCategory];
    setCategory(nextCategory);
    setMetric(nextMetric);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between xl:gap-6">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-balance">
            Program Series Trends
          </h2>
        </div>

        {seriesList.length > 0 && selectedSeries ? (
          <div className="flex w-full shrink-0 flex-nowrap items-center gap-2 xl:w-auto xl:justify-end">
            <div className="w-[8.5rem] shrink-0">
              <Select
                value={category}
                onValueChange={(value) =>
                  handleCategoryChange(value as ParticipantTrendCategory)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {PARTICIPANT_TREND_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[9.5rem] shrink-0">
              <Select
                value={resolvedMetric}
                onValueChange={(value) =>
                  setMetric(value as ParticipantTrendMetric)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 flex-1 xl:w-60 xl:flex-none">
              <Select
                value={selectedSeries.seriesKey}
                onValueChange={setSelectedSeriesKey}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select series" />
                </SelectTrigger>
                <SelectContent>
                  {seriesList.map((series) => (
                    <SelectItem key={series.seriesKey} value={series.seriesKey}>
                      {series.seriesLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Error loading participant trends</p>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
      ) : null}

      {isLoading ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`trend-skeleton-${index}`} className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="h-64 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ) : !selectedSeries || !latestPoint ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No active or completed programs found for {yearLabel}.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg">
                {selectedSeries.seriesLabel}
              </CardTitle>
              <p className="text-sm capitalize text-muted-foreground">
                {formatProgramType(selectedSeries.type)} ·{" "}
                {selectedSeries.points.length}{" "}
                {selectedSeries.points.length === 1 ? "batch" : "batches"} ·{" "}
                {formatTrendCategoryLabel(category)} ·{" "}
                {formatTrendMetricLabel(resolvedMetric)}
              </p>
            </div>

            {isAllMetric ? (
              <div
                className={cn(
                  "grid gap-4 sm:grid-cols-2",
                  seriesMetrics.length + 1 >= 4
                    ? "lg:grid-cols-4"
                    : "lg:grid-cols-3",
                )}
              >
                <SummaryStat
                  title={
                    isCurrency
                      ? `Net (${formatBatchLabel(latestPoint.batch)})`
                      : `Latest (${formatBatchLabel(latestPoint.batch)})`
                  }
                  value={
                    isCurrency
                      ? formatMaskedCurrency(
                          latestPoint.counts.revenue - latestPoint.counts.expense,
                          isVisible,
                        )
                      : String(
                          sumMetricCounts(latestPoint.counts, seriesMetrics),
                        )
                  }
                  valueClassName={
                    isCurrency
                      ? latestPoint.counts.revenue - latestPoint.counts.expense <
                        0
                        ? "text-red-700"
                        : "text-brand-royal"
                      : undefined
                  }
                />
                {seriesMetrics.map((seriesMetric) => (
                  <SummaryStat
                    key={seriesMetric}
                    title={formatTrendMetricLabel(seriesMetric)}
                    value={formatTrendValue(
                      latestPoint.counts[seriesMetric] ?? 0,
                      isCurrency,
                      isVisible,
                    )}
                    valueClassName={
                      PARTICIPANT_TREND_SERIES_TEXT_CLASS[seriesMetric]
                    }
                  />
                ))}
              </div>
            ) : singleSummary ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryStat
                  title={`Latest (${formatBatchLabel(singleSummary.latestBatch)})`}
                  value={formatTrendValue(
                    singleSummary.latestCount,
                    isCurrency,
                    isVisible,
                  )}
                />
                <SummaryStat
                  title="Δ vs previous"
                  value={`${formatTrendDelta(singleSummary.latestDeltaCount, isCurrency, isVisible)} (${formatDeltaPct(singleSummary.latestDeltaPct)})`}
                  valueClassName={deltaClassName(singleSummary.latestDeltaPct)}
                />
                <SummaryStat
                  title="Peak batch"
                  value={formatTrendValue(
                    singleSummary.peakCount,
                    isCurrency,
                    isVisible,
                  )}
                />
                <SummaryStat
                  title="Avg per batch"
                  value={formatTrendValue(
                    singleSummary.averageCount,
                    isCurrency,
                    isVisible,
                  )}
                />
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-6">
            <ParticipantTrendChart
              points={selectedSeries.points}
              category={category}
              metric={resolvedMetric}
            />
            <ParticipantTrendTable
              points={selectedSeries.points}
              category={category}
              metric={resolvedMetric}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
