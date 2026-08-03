"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/molecules/data-table";
import { useFinancialVisibility } from "@/hooks/use-financial-visibility";
import type { DashboardProgramSummary } from "@/services/dashboard.service";
import { getDashboardColumns } from "./columns";

interface DashboardSummaryTableProps {
  data: DashboardProgramSummary[];
}

export function DashboardSummaryTable({ data }: DashboardSummaryTableProps) {
  const { isVisible } = useFinancialVisibility();
  const columns = useMemo(
    () => getDashboardColumns(isVisible),
    [isVisible],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(row) => row.program_id}
    />
  );
}
