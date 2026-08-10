"use client";

import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { Typography } from "@/components/atoms";
import { StatusBadge } from "@/components/atoms/status-badge";
import { formatMaskedCurrency } from "@/components/molecules/financial-visibility";
import type { DashboardProgramSummary } from "@/services/dashboard.service";

export function getDashboardColumns(
  isVisible: boolean,
): ColumnDef<DashboardProgramSummary>[] {
  return [
    {
      accessorKey: "program_name",
      header: "Program",
      enableSorting: true,
      cell: (summary) => (
        <Typography variant="body3" className="font-medium">
          {summary.program_name}
        </Typography>
      ),
    },
    {
      accessorKey: "program_year",
      header: "Year",
      enableSorting: true,
      cell: (summary) => (
        <Typography variant="body3">
          {summary.program_year ?? "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "total_revenue",
      header: "Revenue",
      enableSorting: true,
      className: "text-left",
      cell: (summary) => (
        <Typography
          variant="body3"
          className={`font-bold ${
            isVisible ? "text-brand-royal" : "text-muted-foreground"
          }`}
        >
          {formatMaskedCurrency(summary.total_revenue, isVisible)}
        </Typography>
      ),
    },
    {
      accessorKey: "total_expense",
      header: "Expense",
      enableSorting: true,
      className: "text-left",
      cell: (summary) => (
        <Typography
          variant="body3"
          className={`font-bold ${
            isVisible ? "text-red-700" : "text-muted-foreground"
          }`}
        >
          {formatMaskedCurrency(summary.total_expense, isVisible)}
        </Typography>
      ),
    },
    {
      accessorKey: "net_profit",
      header: "Net Profit",
      enableSorting: true,
      className: "text-left",
      cell: (summary) => (
        <Typography
          variant="body3"
          className={`font-bold ${
            !isVisible
              ? "text-muted-foreground"
              : summary.net_profit < 0
                ? "text-red-700"
                : "text-brand-royal"
          }`}
        >
          {formatMaskedCurrency(summary.net_profit, isVisible)}
        </Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: (summary) => <StatusBadge status={summary.status} />,
    },
  ];
}
