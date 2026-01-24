"use client";

import { Modal } from "@/components/molecules/modals";
import { PaymentFormFields } from "../_components/payment-form";
import { useAddPayment } from "../_hooks/use-add-payment";

export interface AddPaymentModalProps {
  programId?: string;
  onSuccess?: () => void;
}

export function AddPaymentModal({
  programId,
  onSuccess,
}: AddPaymentModalProps) {
  const {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
    participants,
    filteredParticipants,
    isParticipantsLoading,
  } = useAddPayment({ programId, onSuccess });

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title="Add Payment"
      description="Fill in the details to add a new payment."
      onApply={handleSubmit}
      applyLabel="Create"
      applyDisabled={applyDisabled}
      onCancel={close}
    >
      <PaymentFormFields
        form={form}
        participants={participants}
        filteredParticipants={filteredParticipants}
        isParticipantsLoading={isParticipantsLoading}
      />
    </Modal>
  );
}
