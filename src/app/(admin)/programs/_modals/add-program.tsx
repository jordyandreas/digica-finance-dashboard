"use client";

import { Modal } from "@/components/molecules/modals";
import type { Program } from "@/services/programs.service";
import { ProgramForm } from "../_components/program-form";
import { useAddProgram } from "../_hooks/use-add-program";

export interface ProgramModalProps {
  program?: Program | null;
  duplicateFrom?: Program | null;
  onSuccess?: () => void;
}

export function ProgramModal({
  program,
  duplicateFrom,
  onSuccess,
}: ProgramModalProps) {
  const {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
    registrationBannerFile,
    setRegistrationBannerFile,
    promoBannerFile,
    setPromoBannerFile,
  } = useAddProgram({ program, duplicateFrom, onSuccess });

  const isDuplicate = Boolean(duplicateFrom) && !program;
  const title = program
    ? "Edit Program"
    : isDuplicate
      ? "Duplicate Program"
      : "Add New Program";
  const description = program
    ? "Update the program information below."
    : isDuplicate
      ? "Review the copied details, then create the new program."
      : "Fill in the details to create a new program.";
  const applyLabel = program ? "Update" : "Create";

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title={title}
      description={description}
      onApply={handleSubmit}
      applyLabel={applyLabel}
      applyDisabled={applyDisabled}
      onCancel={close}
    >
      <ProgramForm
        form={form}
        registrationBannerFile={registrationBannerFile}
        onRegistrationBannerFileChange={setRegistrationBannerFile}
        promoBannerFile={promoBannerFile}
        onPromoBannerFileChange={setPromoBannerFile}
      />
    </Modal>
  );
}

