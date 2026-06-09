"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/molecules/data-table";
import { YearFilterSelect } from "@/components/molecules/year-filter-select";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  CURRENT_DASHBOARD_YEAR,
  toYearFilterParam,
  type YearFilterValue,
} from "@/constants/dashboard-year";
import { useProgramsPaginated } from "./_hooks/use-programs";
import { ProgramsPageContent } from "./_components/programs-content";

export default function ProgramsPage() {
  const [yearFilter, setYearFilter] = useState<YearFilterValue>(
    CURRENT_DASHBOARD_YEAR,
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const selectedYear = toYearFilterParam(yearFilter);
  const { data: programsResult, error, isLoading } = useProgramsPaginated(
    page,
    limit,
    selectedYear,
  );

  const handleYearChange = (nextYear: YearFilterValue) => {
    setYearFilter(nextYear);
    setPage(1);
  };

  const yearFilterControl = (
    <YearFilterSelect value={yearFilter} onChange={handleYearChange} />
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
            <p className="text-muted-foreground">
              Manage your programs and initiatives
            </p>
          </div>
          {yearFilterControl}
        </div>
        <Card>
          <DataTableSkeleton rows={limit} columns={7} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
            <p className="text-muted-foreground">
              Manage your programs and initiatives
            </p>
          </div>
          {yearFilterControl}
        </div>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error loading programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <p className="mt-2 text-xs">
              Please ensure your Supabase &quot;programs&quot; table exists and
              has the correct schema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProgramsPageContent
      programs={programsResult?.data ?? []}
      pagination={programsResult?.pagination}
      page={page}
      limit={limit}
      yearFilter={yearFilter}
      onYearChange={handleYearChange}
      onPageChange={setPage}
      onLimitChange={(nextLimit) => {
        setLimit(nextLimit);
        setPage(1);
      }}
    />
  );
}
