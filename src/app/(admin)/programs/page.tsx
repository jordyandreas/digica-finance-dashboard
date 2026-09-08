"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YearFilterSelect } from "@/components/molecules/year-filter-select";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  CURRENT_DASHBOARD_YEAR,
  toYearFilterParam,
  type YearFilterValue,
} from "@/constants/dashboard-year";
import {
  PROGRAM_STATUS_ALL,
  PROGRAM_TYPE_ALL,
} from "@/constants/program-filters";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ProgramStatus, ProgramType } from "@/services/programs.service";
import { useProgramsPaginated } from "./_hooks/use-programs";
import { ProgramsPageContent } from "./_components/programs-content";
import { ProgramsTableSkeleton } from "./_table/programs-table-skeleton";

export default function ProgramsPage() {
  const [yearFilter, setYearFilter] = useState<YearFilterValue>(
    CURRENT_DASHBOARD_YEAR,
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(PROGRAM_TYPE_ALL);
  const [statusFilter, setStatusFilter] = useState(PROGRAM_STATUS_ALL);
  const debouncedSearch = useDebouncedValue(search);
  const selectedYear = toYearFilterParam(yearFilter);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, statusFilter, yearFilter]);

  const { data: programsResult, error, isLoading, isFetching } =
    useProgramsPaginated(page, limit, {
      year: selectedYear,
      search: debouncedSearch,
      type:
        typeFilter === PROGRAM_TYPE_ALL
          ? undefined
          : (typeFilter as ProgramType),
      status:
        statusFilter === PROGRAM_STATUS_ALL
          ? undefined
          : (statusFilter as ProgramStatus),
    });

  const handleYearChange = (nextYear: YearFilterValue) => {
    setYearFilter(nextYear);
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
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            {yearFilterControl}
            <div className="h-9 w-full animate-pulse rounded-md bg-muted sm:w-32" />
          </div>
        </div>
        <Card>
          <ProgramsTableSkeleton rows={limit} />
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
      search={search}
      typeFilter={typeFilter}
      statusFilter={statusFilter}
      isFetching={isFetching}
      onYearChange={handleYearChange}
      onSearchChange={setSearch}
      onTypeFilterChange={setTypeFilter}
      onStatusFilterChange={setStatusFilter}
      onPageChange={setPage}
      onLimitChange={(nextLimit) => {
        setLimit(nextLimit);
        setPage(1);
      }}
    />
  );
}
