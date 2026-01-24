"use client";

import { Modal } from "@/components/molecules/modals";
import type { Payment } from "@/services/payments.service";
import { PaymentFormFields } from "../_components/payment-form";
import { useEditPayment } from "../_hooks/use-edit-payment";

export interface EditPaymentModalProps {
  payment?: Payment | null;
  programId?: string;
  onSuccess?: () => void;
}

export function EditPaymentModal({
  payment,
  programId,
  onSuccess,
}: EditPaymentModalProps) {
  const {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
    participants,
    isParticipantsLoading,
  } = useEditPayment({ payment, programId, onSuccess });

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title="Edit Payment"
      description="Update the payment information below."
      onApply={handleSubmit}
      applyLabel="Update"
      applyDisabled={applyDisabled}
      onCancel={close}
    >
      <PaymentFormFields
        form={form}
        disableParticipant
        participants={participants}
        filteredParticipants={participants}
        isParticipantsLoading={isParticipantsLoading}
      />
    </Modal>
  );
}
