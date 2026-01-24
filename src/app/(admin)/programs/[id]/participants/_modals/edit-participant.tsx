"use client";

import { Modal } from "@/components/molecules/modals";
import type { Participant } from "@/services/participants.service";
import { ParticipantFormFields } from "../_components/participant-form";
import { useEditParticipantModal } from "../_hooks/use-edit-participant-modal";

export interface EditParticipantModalProps {
  participant?: Participant | null;
  programId?: string;
  onSuccess?: () => void;
}

export function EditParticipantModal({
  participant,
  programId,
  onSuccess,
}: EditParticipantModalProps) {
  const {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
  } = useEditParticipantModal({ participant, programId, onSuccess });

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title="Edit Participant"
      description="Update the participant information below."
      onApply={handleSubmit}
      applyLabel="Update"
      applyDisabled={applyDisabled}
      onCancel={close}
    >
      <ParticipantFormFields
        form={form}
      />
    </Modal>
  );
}
