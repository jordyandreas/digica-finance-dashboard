"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { useDashboardProgramSummary } from "./_hooks/use-dashboard-summary";
import { DashboardSummaryTable } from "./_table";

export default function DashboardPage() {
  const { data, error, isLoading } = useDashboardProgramSummary();
  const programSummary = data ?? [];

  const totals = programSummary.reduce(
    (acc, item) => ({
      totalRevenue: acc.totalRevenue + item.total_revenue,
      totalExpense: acc.totalExpense + item.total_expense,
      netProfit: acc.netProfit + item.net_profit,
    }),
    { totalRevenue: 0, totalExpense: 0, netProfit: 0 },
  );

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totals.totalRevenue),
      description: "Total revenue from all payments",
    },
    {
      title: "Net Profit",
      value: formatCurrency(totals.netProfit),
      description: "Revenue minus expenses",
    },
    {
      title: "Total Expense",
      value: formatCurrency(totals.totalExpense),
      description: "Total expenses across all programs",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your finance dashboard
        </p>
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading program summaries...
            </p>
          ) : (
            <DashboardSummaryTable data={programSummary} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
