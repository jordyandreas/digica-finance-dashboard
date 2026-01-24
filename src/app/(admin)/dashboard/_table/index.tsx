"use client";

import { DataTable } from "@/components/molecules/data-table";
import type { DashboardProgramSummary } from "@/services/dashboard.service";
import { dashboardColumns } from "./columns";

interface DashboardSummaryTableProps {
  data: DashboardProgramSummary[];
}

export function DashboardSummaryTable({ data }: DashboardSummaryTableProps) {
  return (
    <DataTable
      data={data}
      columns={dashboardColumns}
      keyExtractor={(row) => row.program_id}
    />
  );
}
