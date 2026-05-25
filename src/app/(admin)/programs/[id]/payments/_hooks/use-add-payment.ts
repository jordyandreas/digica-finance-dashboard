"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreatePaymentInput,
  Payment,
} from "@/services/payments.service";
import { deletePayment } from "@/services/payments.service";
import { useModal } from "@/hooks/use-modal";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import { useForm } from "react-hook-form";
import { paymentSchema } from "../../../../../../schemas/payment-schema";
import {
  participantsQueryKey,
  useParticipants,
} from "../../participants/_hooks/use-participants";
import { dashboardProgramSummaryQueryKey } from "@/app/(admin)/dashboard/_hooks/use-dashboard-summary";
import type { AddPaymentModalProps } from "../_modals/add-payment";
import type { EditPaymentModalProps } from "../_modals/edit-payment";
import type { PaymentFormState } from "../_components/payment-form";
import { formatDateTimeLocalString } from "@/lib/date-utils";
import { paymentsQueryKey, paymentsSummaryQueryKey, usePayments } from "./use-payments";

const defaultFormState = (programId: string): PaymentFormState => ({
  participant_id: "",
  amount: undefined,
  payment_type: "full",
  tenor: "",
  status: "pending",
  paid_at: formatDateTimeLocalString(new Date()),
  payment_method: "bank_transfer",
  reference_name: "none",
  program_id: programId,
});

type UseAddPaymentOptions = {
  programId?: string;
  onSuccess?: () => void;
};

export function useAddPayment({
  programId,
  onSuccess,
}: UseAddPaymentOptions = {}) {
  const queryClient = useQueryClient();
  const addPaymentModal = useModal<AddPaymentModalProps>("addPaymentModal");
  const editPaymentModal = useModal<EditPaymentModalProps>("editPaymentModal");
  const [loading, setLoading] = React.useState(false);
  const resolvedProgramId =
    programId ?? addPaymentModal.props?.programId ?? "";
  const resolvedOnSuccess = onSuccess ?? addPaymentModal.props?.onSuccess;
  const form = useForm<PaymentFormState>({
    defaultValues: defaultFormState(resolvedProgramId),
  });
  const participantId = form.watch("participant_id");
  const amount = form.watch("amount");
  const paymentType = form.watch("payment_type");
  const status = form.watch("status");
  const tenor = form.watch("tenor");
  const { data: participants = [], isLoading: isParticipantsLoading } =
    useParticipants(resolvedProgramId);
  const { data: payments } = usePayments(resolvedProgramId);
  const paidParticipantIds = new Set(
    (payments ?? [])
      .map((payment) => payment.participant_id)
      .filter((id): id is string => Boolean(id)),
  );
  const filteredParticipants = participants.filter(
    (participant) => !paidParticipantIds.has(participant.id),
  );

  React.useEffect(() => {
    if (addPaymentModal.isOpen) {
      form.reset(defaultFormState(resolvedProgramId));
      form.clearErrors();
    }
  }, [form, addPaymentModal.isOpen, resolvedProgramId]);

  const invalidatePayments = async () => {
    if (!resolvedProgramId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: paymentsQueryKey(resolvedProgramId),
    });
    await queryClient.invalidateQueries({
      queryKey: paymentsSummaryQueryKey(resolvedProgramId),
    });
    await queryClient.invalidateQueries({
      queryKey: dashboardProgramSummaryQueryKey(resolvedProgramId),
    });
  };

  const invalidateParticipants = async () => {
    if (!resolvedProgramId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: participantsQueryKey(resolvedProgramId),
    });
  };

  const handleSuccess = async () => {
    if (resolvedOnSuccess) {
      resolvedOnSuccess();
      return;
    }
    await invalidatePayments();
    await invalidateParticipants();
  };

  const handleAddClick = () => {
    addPaymentModal.open({
      programId: resolvedProgramId,
      onSuccess: handleSuccess,
    });
  };

  const handleEdit = (payment: Payment) => {
    editPaymentModal.open({
      payment,
      programId: resolvedProgramId,
      onSuccess: handleSuccess,
    });
  };

  const deleteConfirmation = useDeleteConfirmation<Payment>({
    title: "Do you want to delete this payment?",
    description: "You can't take it back when you delete it",
  });
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = (payment: Payment) => {
    deleteConfirmation.openConfirmation(
      payment,
      "Do you want to delete this payment?",
      "You can't take it back when you delete it"
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.item) return;

    setIsDeleting(true);
    try {
      await deletePayment(deleteConfirmation.item.id);
      await invalidatePayments();
      await invalidateParticipants();
      toast.success("Payment deleted successfully");
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values: PaymentFormState) => {
    const validation = paymentSchema.safeParse({
      participant_id: values.participant_id,
      amount: values.amount ?? 0,
      payment_type: values.payment_type as "tenor" | "full",
      tenor:
        values.payment_type === "tenor" && values.tenor
          ? parseInt(values.tenor, 10)
          : undefined,
      status: values.status,
      paid_at: values.paid_at || undefined,
      payment_method: values.payment_method || undefined,
      reference_name:
        values.reference_name && values.reference_name !== "none"
          ? values.reference_name
          : undefined,
    });

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof PaymentFormState | undefined;
        if (field && !form.formState.errors[field]) {
          form.setError(field, { type: "manual", message: issue.message });
        }
      }
      toast.error("Please fix the highlighted fields.");
      return;
    }

    if (!resolvedProgramId) {
      toast.error("Program ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const { createPayment } = await import("@/services/payments.service");

      const paymentData: CreatePaymentInput = {
        amount: values.amount as number,
        participant_id: values.participant_id,
        program_id: values.program_id || resolvedProgramId,
        payment_type: values.payment_type as "tenor" | "full",
        tenor:
          values.payment_type === "tenor" && values.tenor
            ? parseInt(values.tenor, 10)
            : undefined,
        status: values.status || undefined,
        paid_at: values.paid_at || undefined,
        payment_method: values.payment_method || undefined,
        reference_name:
          values.reference_name && values.reference_name !== "none"
            ? values.reference_name
            : undefined,
      };

      const result = await createPayment(paymentData);

      if (result.error) {
        console.error("Error saving payment:", result.error);
        const errorMessage =
          result.error.message || JSON.stringify(result.error);
        toast.error("Error saving payment", {
          description: errorMessage,
        });
        setLoading(false);
        throw new Error(errorMessage);
      }

      toast.success("Payment created successfully");
      await handleSuccess();
      addPaymentModal.close();
      setLoading(false);
    } catch (error) {
      console.error("Error saving payment:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error("Error saving payment", {
        description: errorMessage,
      });
      setLoading(false);
    }
  });

  const applyDisabled =
    loading ||
    !participantId?.trim() ||
    amount === undefined ||
    !paymentType ||
    !status?.trim() ||
    (paymentType === "tenor" && !tenor?.trim());

  return {
    isOpen: addPaymentModal.isOpen,
    close: addPaymentModal.close,
    form,
    handleSubmit,
    applyDisabled,
    handleAddClick,
    handleEdit,
    handleDelete,
    participants,
    filteredParticipants,
    isParticipantsLoading,
    deleteConfirmation: {
      isOpen: deleteConfirmation.isOpen,
      setOpen: deleteConfirmation.setOpen,
      title: deleteConfirmation.title,
      description: deleteConfirmation.description,
      onConfirm: handleConfirmDelete,
      isDeleting,
    },
  };
}

