"use client";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import { YearFilterSelect } from "@/components/molecules/year-filter-select";
import {
  formatYearFilterLabel,
  type YearFilterValue,
} from "@/constants/dashboard-year";
import {
  PROGRAM_STATUS_FILTER_OPTIONS,
  PROGRAM_TYPE_ALL,
  PROGRAM_TYPE_FILTER_OPTIONS,
} from "@/constants/program-filters";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import {
  DataTableFilters,
  DataTablePaginationControl,
} from "@/components/molecules/data-table";
import { FinancialVisibilityToggle } from "@/components/molecules/financial-visibility";
import { ProgramListItem } from "@/services/programs.service";
import { Plus } from "lucide-react";
import { ProgramsTable } from "../_table";
import { type PaginationMeta } from "@/types/pagination";
import { useProgramsActions } from "../_hooks/use-programs-actions";
import { cn } from "@/lib/utils";

interface ProgramsPageContentProps {
  programs: ProgramListItem[];
  pagination?: PaginationMeta;
  page: number;
  limit: number;
  yearFilter: YearFilterValue;
  search: string;
  typeFilter: string;
  statusFilter: string;
  isFetching?: boolean;
  onYearChange: (year: YearFilterValue) => void;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function ProgramsPageContent({
  programs,
  pagination,
  page,
  limit,
  yearFilter,
  search,
  typeFilter,
  statusFilter,
  isFetching = false,
  onYearChange,
  onSearchChange,
  onTypeFilterChange,
  onStatusFilterChange,
  onPageChange,
  onLimitChange,
}: ProgramsPageContentProps) {
  const yearLabel = formatYearFilterLabel(yearFilter);
  const {
    handleAddClick,
    handleEdit,
    handleDuplicate,
    handleDelete,
    handleConfirmDelete,
    deleteConfirmation,
    isDeleting,
  } = useProgramsActions();

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
            <p className="text-muted-foreground">
              Total {pagination?.total ?? programs.length} programs in{" "}
              {yearLabel}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <FinancialVisibilityToggle showLabel />
            <YearFilterSelect value={yearFilter} onChange={onYearChange} />
            <Button onClick={handleAddClick} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Program
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <DataTableFilters
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search program name"
            status={statusFilter}
            onStatusChange={onStatusFilterChange}
            statusOptions={PROGRAM_STATUS_FILTER_OPTIONS}
            statusPlaceholder="Status"
            secondaryFilter={typeFilter}
            onSecondaryFilterChange={onTypeFilterChange}
            secondaryFilterOptions={PROGRAM_TYPE_FILTER_OPTIONS}
            secondaryFilterPlaceholder="Type"
            secondaryFilterAllValue={PROGRAM_TYPE_ALL}
          />

          <Card
            className={cn(
              isFetching ? "opacity-60 transition-opacity" : undefined,
            )}
          >
            <ProgramsTable
              data={programs || []}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
            <DataTablePaginationControl
              currentPage={pagination?.page ?? page}
              totalPages={pagination?.total_page ?? 1}
              onPageChange={onPageChange}
              pageSize={limit}
              onPageSizeChange={onLimitChange}
            />
          </Card>
        </div>
      </div>

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setOpen}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
