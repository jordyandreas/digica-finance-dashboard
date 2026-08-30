"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ProgramModalProps } from "@/app/(admin)/programs/_modals/add-program";
import { useModal } from "@/hooks/use-modal";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import { Program, deleteProgram } from "@/services/programs.service";
import { programsQueryKey } from "./use-programs";

export function useProgramsActions() {
  const queryClient = useQueryClient();
  const programModal = useModal<ProgramModalProps>("programModal");
  const deleteConfirmation = useDeleteConfirmation<Program>({
    title: "Do you want to delete a registered program?",
    description: "You can't take it back when you delete it",
  });
  const [isDeleting, setIsDeleting] = React.useState(false);

  const invalidatePrograms = () => {
    queryClient.invalidateQueries({ queryKey: programsQueryKey });
  };

  const handleModalSuccess = () => {
    invalidatePrograms();
  };

  const handleAddClick = () => {
    programModal.open({
      program: null,
      onSuccess: handleModalSuccess,
    });
  };

  const handleEdit = (program: Program) => {
    programModal.open({
      program,
      onSuccess: handleModalSuccess,
    });
  };

  const handleDelete = (program: Program) => {
    deleteConfirmation.openConfirmation(
      program,
      `Do you want to delete "${program.name}"?`,
      "You can't take it back when you delete it",
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.item) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProgram(deleteConfirmation.item.id);
      invalidatePrograms();
      toast.success("Program deleted successfully");
      deleteConfirmation.closeConfirmation();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    handleAddClick,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    deleteConfirmation,
    isDeleting,
  };
}
