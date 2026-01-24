"use client";

import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { Typography } from "@/components/atoms";
import { formatCurrency } from "@/utils/currency";
import type { DashboardProgramSummary } from "@/services/dashboard.service";

export const dashboardColumns: ColumnDef<DashboardProgramSummary>[] = [
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
    accessorKey: "total_revenue",
    header: "Revenue",
    enableSorting: true,
    className: "text-left",
    cell: (summary) => (
      <Typography variant="body3" className="text-green-700 font-bold">
        {formatCurrency(summary.total_revenue)}
      </Typography>
    ),
  },
  {
    accessorKey: "total_expense",
    header: "Expense",
    enableSorting: true,
    className: "text-left",
    cell: (summary) => (
      <Typography variant="body3" className="text-red-700 font-bold">
        {formatCurrency(summary.total_expense)}
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
          summary.net_profit < 0 ? "text-red-700" : "text-green-700"
        }`}
      >
        {formatCurrency(summary.net_profit)}
      </Typography>
    ),
  },
];
