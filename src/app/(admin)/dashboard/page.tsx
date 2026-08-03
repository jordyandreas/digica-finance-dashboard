"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DataTablePaginationControl,
  DataTableSkeleton,
} from "@/components/molecules/data-table";
import {
  FinancialVisibilityToggle,
  formatMaskedCurrency,
} from "@/components/molecules/financial-visibility";
import { YearFilterSelect } from "@/components/molecules/year-filter-select";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  CURRENT_DASHBOARD_YEAR,
  formatYearFilterLabel,
  toYearFilterParam,
  type YearFilterValue,
} from "@/constants/dashboard-year";
import { useFinancialVisibility } from "@/hooks/use-financial-visibility";
import {
  useDashboardProgramSummaryPaginated,
  useDashboardStats,
} from "./_hooks/use-dashboard-summary";
import { DashboardSummaryTable } from "./_table";

export default function DashboardPage() {
  const [yearFilter, setYearFilter] = useState<YearFilterValue>(
    CURRENT_DASHBOARD_YEAR,
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const selectedYear = toYearFilterParam(yearFilter);
  const yearLabel = formatYearFilterLabel(yearFilter);
  const { data: summaryResult, error, isLoading } =
    useDashboardProgramSummaryPaginated(page, limit, selectedYear);
  const { data: dashboardStats } = useDashboardStats(selectedYear);
  const { isVisible } = useFinancialVisibility();

  const totals = {
    totalRevenue: dashboardStats?.totalRevenue ?? 0,
    totalExpense: dashboardStats?.totalExpense ?? 0,
    netProfit: dashboardStats?.netProfit ?? 0,
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatMaskedCurrency(totals.totalRevenue, isVisible),
      description: `Total revenue from payments in ${yearLabel}`,
      valueClassName: isVisible
        ? totals.totalRevenue >= 0
          ? "text-brand-royal"
          : "text-red-600"
        : "text-muted-foreground",
    },
    {
      title: "Total Expense",
      value: formatMaskedCurrency(totals.totalExpense, isVisible),
      description: `Total expenses across programs in ${yearLabel}`,
      valueClassName: isVisible ? "text-red-600" : "text-muted-foreground",
    },
    {
      title: "Net Profit",
      value: formatMaskedCurrency(totals.netProfit, isVisible),
      description: `Revenue minus expenses in ${yearLabel}`,
      valueClassName: isVisible ? "text-brand-royal" : "text-muted-foreground",
    },
  ];

  const handleYearChange = (nextYear: YearFilterValue) => {
    setYearFilter(nextYear);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Digica Academy dashboard
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FinancialVisibilityToggle />
          <YearFilterSelect value={yearFilter} onChange={handleYearChange} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Error loading data</p>
          <p className="text-muted-foreground">
            {error.message}
          </p>
          <p className="mt-2 text-xs">
            Please ensure your Supabase tables are set up correctly.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.valueClassName}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Program Summary
          </h2>
          <p className="text-sm text-muted-foreground">
            Total {summaryResult?.pagination.total ?? 0} programs in {yearLabel}
          </p>
        </div>

        <Card>
          {isLoading ? (
            <DataTableSkeleton rows={limit} columns={5} />
          ) : (
            <>
              <DashboardSummaryTable data={summaryResult?.data ?? []} />
              <DataTablePaginationControl
                currentPage={summaryResult?.pagination.page ?? page}
                totalPages={summaryResult?.pagination.total_page ?? 1}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={(nextLimit) => {
                  setLimit(nextLimit);
                  setPage(1);
                }}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
