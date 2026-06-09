"use client"

import * as React from "react"
import type { ProgramModalProps } from "@/app/(admin)/programs/_modals/add-program";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import { YearFilterSelect } from "@/components/molecules/year-filter-select";
import {
  formatYearFilterLabel,
  type YearFilterValue,
} from "@/constants/dashboard-year";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import { useModal } from "@/hooks/use-modal";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import { Program, deleteProgram } from "@/services/programs.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { programsQueryKey } from "../_hooks/use-programs";
import { ProgramsTable } from "../_table";
import { DataTablePaginationControl } from "@/components/molecules/data-table";
import { type PaginationMeta } from "@/types/pagination";

interface ProgramsPageContentProps {
  programs: Program[];
  pagination?: PaginationMeta;
  page: number;
  limit: number;
  yearFilter: YearFilterValue;
  onYearChange: (year: YearFilterValue) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function ProgramsPageContent({
  programs,
  pagination,
  page,
  limit,
  yearFilter,
  onYearChange,
  onPageChange,
  onLimitChange,
}: ProgramsPageContentProps) {
  const yearLabel = formatYearFilterLabel(yearFilter);
  const queryClient = useQueryClient()
  const programModal = useModal<ProgramModalProps>("programModal")
  const deleteConfirmation = useDeleteConfirmation<Program>({
    title: "Do you want to delete a registered program?",
    description: "You can't take it back when you delete it",
  })
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleAddClick = () => {
    programModal.open({
      program: null,
      onSuccess: handleModalSuccess,
    })
  }

  const handleEdit = (program: Program) => {
    programModal.open({
      program,
      onSuccess: handleModalSuccess,
    })
  }

  const handleDeleteClick = (program: Program) => {
    deleteConfirmation.openConfirmation(
      program,
      `Do you want to delete "${program.name}"?`,
      "You can't take it back when you delete it"
    )
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.item) return
    
    setIsDeleting(true)
    try {
      await deleteProgram(deleteConfirmation.item.id)
      await queryClient.invalidateQueries({ queryKey: programsQueryKey })
      toast.success("Program deleted successfully")
    } catch (error) {
      console.error("Error deleting program:", error)
      toast.error("Failed to delete program. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: programsQueryKey })
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
            <p className="text-muted-foreground">
              Total {pagination?.total ?? programs.length} programs in {yearLabel}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <YearFilterSelect value={yearFilter} onChange={onYearChange} />
            <Button onClick={handleAddClick} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Program
            </Button>
          </div>
        </div>

        <Card>
          <ProgramsTable
            data={programs || []}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
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

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setOpen}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  )
}
