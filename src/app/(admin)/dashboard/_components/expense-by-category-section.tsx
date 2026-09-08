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
import { InfoPopover } from "@/components/molecules/info-popover";
import { useFinancialVisibility } from "@/hooks/use-financial-visibility";
import { formatDate } from "@/utils/date";
import type {
  DashboardExpenseBreakdown,
  DashboardExpenseCategoryItem,
} from "@/services/dashboard.service";

type ExpenseByCategorySectionProps = {
  data: DashboardExpenseBreakdown | undefined;
  isLoading: boolean;
  errorMessage?: string | null;
};

export function ExpenseByCategorySection({
  data,
  isLoading,
  errorMessage,
}: ExpenseByCategorySectionProps) {
  const { isVisible } = useFinancialVisibility();
  const seriesList = data?.series ?? [];
  const [selectedSeriesKey, setSelectedSeriesKey] = useState<string | null>(
    null,
  );

  const selectedSeries =
    seriesList.find((series) => series.seriesKey === selectedSeriesKey) ??
    seriesList[0] ??
    null;

  const rows = selectedSeries?.rows ?? [];
  const totalAmount = selectedSeries?.totalAmount ?? 0;
  const totalCount = selectedSeries?.totalCount ?? 0;

  return (
    <div className="flex h-[380px] flex-col space-y-4">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          Expense by Category
        </h2>
        {seriesList.length > 0 && selectedSeries ? (
          <div className="w-full sm:w-60">
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
        ) : null}
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CardHeader className="shrink-0 pb-3">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Total{" "}
            <span className="font-semibold text-foreground">
              {formatMaskedCurrency(totalAmount, isVisible)}
            </span>
            {totalCount > 0 ? (
              <span className="ml-1 font-normal">
                · {totalCount} {totalCount === 1 ? "entry" : "entries"}
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto">
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`expense-skeleton-${index}`} className="space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-full animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : !selectedSeries ? (
            <p className="text-sm text-muted-foreground">
              No program series found for this period.
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expenses found for this series.
            </p>
          ) : (
            <div className="space-y-4">
              {rows.map((row) => (
                <div key={row.category} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <p className="inline-flex items-center gap-1.5 font-medium">
                      <span>{row.label}</span>
                      <span className="font-normal text-muted-foreground">
                        {row.count}
                      </span>
                      {row.items.length > 0 ? (
                        <InfoPopover
                          title={`${row.label} · ${row.count}`}
                          triggerLabel={`Show ${row.label} details`}
                        >
                          <ExpenseCategoryItemsList
                            items={row.items}
                            isVisible={isVisible}
                          />
                        </InfoPopover>
                      ) : null}
                    </p>
                    <p className="tabular-nums text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {formatMaskedCurrency(row.amount, isVisible)}
                      </span>
                      <span className="ml-2">
                        {Math.round(row.percent * 10) / 10}%
                      </span>
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-red-500/80"
                      style={{ width: `${Math.min(row.percent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExpenseCategoryItemsList({
  items,
  isVisible,
}: {
  items: DashboardExpenseCategoryItem[];
  isVisible: boolean;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const description = item.description?.trim();
        return (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-md px-1 py-0.5 text-sm"
          >
            <div className="min-w-0">
              <p className="leading-snug text-foreground">
                {description || "No description"}
              </p>
              {item.expenseDate ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(item.expenseDate)}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 tabular-nums font-medium text-red-700">
              {formatMaskedCurrency(item.amount, isVisible)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
