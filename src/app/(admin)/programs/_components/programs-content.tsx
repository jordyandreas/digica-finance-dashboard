"use client"

import type { ProgramModalProps } from "@/app/(admin)/programs/_modals/add-program";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import { useModal } from "@/hooks/use-modal";
import { Program, deleteProgram } from "@/services/programs.service";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { programsQueryKey } from "../_hooks/use-programs";
import { ProgramsTable } from "../_table";

interface ProgramsPageContentProps {
  programs: Program[]
}

export function ProgramsPageContent({ programs }: ProgramsPageContentProps) {
  const queryClient = useQueryClient()
  const programModal = useModal<ProgramModalProps>("programModal")

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

  const handleDelete = async (program: Program) => {
    if (
      confirm(
        `Are you sure you want to delete "${program.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteProgram(program.id)
        await queryClient.invalidateQueries({ queryKey: programsQueryKey })
      } catch (error) {
        console.error("Error deleting program:", error)
        alert("Failed to delete program. Please try again.")
      }
    }
  }

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: programsQueryKey })
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
            <p className="text-muted-foreground">
              Manage your programs and initiatives
            </p>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4" />
            Add Program
          </Button>
        </div>

        <Card>
            <ProgramsTable
              data={programs || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
        </Card>
      </div>

    </>
  )
}
