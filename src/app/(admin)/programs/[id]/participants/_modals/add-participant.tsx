"use client";

import { Modal } from "@/components/molecules/modals";
import { ParticipantFormFields } from "../_components/participant-form";
import { useAddParticipant } from "../_hooks/use-add-participant";

export interface AddParticipantModalProps {
  programId?: string;
  onSuccess?: () => void;
}

export function AddParticipantModal({
  programId,
  onSuccess,
}: AddParticipantModalProps) {
  const {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
  } = useAddParticipant({ programId, onSuccess });

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title="Add Participant"
      description="Fill in the details to add a new participant."
      onApply={handleSubmit}
      applyLabel="Create"
      applyDisabled={applyDisabled}
      onCancel={close}
    >
      <ParticipantFormFields
        form={form}
      />
    </Modal>
  );
}
