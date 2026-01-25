"use client"

import * as React from "react"
import type { ProgramModalProps } from "@/app/(admin)/programs/_modals/add-program";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import { useModal } from "@/hooks/use-modal";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import { Program, deleteProgram } from "@/services/programs.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { programsQueryKey } from "../_hooks/use-programs";
import { ProgramsTable } from "../_table";

interface ProgramsPageContentProps {
  programs: Program[]
}

export function ProgramsPageContent({ programs }: ProgramsPageContentProps) {
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
              onDelete={handleDeleteClick}
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
