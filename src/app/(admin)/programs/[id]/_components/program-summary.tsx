 "use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { useDashboardProgramSummary } from "@/app/(admin)/dashboard/_hooks/use-dashboard-summary";

type ProgramSummaryProps = {
  programId: string;
};

export function ProgramSummary({ programId }: ProgramSummaryProps) {
  const { data, error, isLoading } = useDashboardProgramSummary(programId);
  const summary = data?.[0];
  const totalRevenue = summary?.total_revenue ?? 0;
  const totalExpense = summary?.total_expense ?? 0;
  const netProfit = summary?.net_profit ?? 0;

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: "Total revenue from program payments",
      valueClassName: totalRevenue >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpense),
      description: "Total expenses for this program",
      valueClassName: "text-red-600",
    },
    {
      title: "Net Profit",
      value: formatCurrency(netProfit),
      description: "Revenue minus expenses",
      valueClassName: "text-green-600",
    },
  ];

  return (
    <>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Error loading program totals</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-muted/50 bg-muted/10 p-4 text-sm text-muted-foreground">
          Loading program summary...
        </div>
      ) : (
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
      )}
    </>
  );
}
