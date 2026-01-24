"use client";

import { Modal } from "@/components/molecules/modals";
import type { Program } from "@/services/programs.service";
import { ProgramForm } from "../_components/program-form";
import { useAddProgram } from "../_hooks/use-add-program";

export interface ProgramModalProps {
  program?: Program | null;
  onSuccess?: () => void;
}

export function ProgramModal({ program, onSuccess }: ProgramModalProps) {
  const {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
  } = useAddProgram({ program, onSuccess });

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title={program ? "Edit Program" : "Add New Program"}
      description={
        program
          ? "Update the program information below."
          : "Fill in the details to create a new program."
      }
      onApply={handleSubmit}
      applyLabel={program ? "Update" : "Create"}
      applyDisabled={applyDisabled}
      onCancel={close}
    >
      <ProgramForm form={form} />
    </Modal>
  );
}
