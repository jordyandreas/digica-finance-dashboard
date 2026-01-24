"use client";

import * as React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Payment, UpdatePaymentInput } from "@/services/payments.service";
import { useModal } from "@/hooks/use-modal";
import { useForm } from "react-hook-form";
import { paymentSchema } from "../../../../../../schemas/payment-schema";
import type { EditPaymentModalProps } from "../_modals/edit-payment";
import type { PaymentFormState } from "../_components/payment-form";
import {
  participantsQueryKey,
  useParticipants,
} from "../../participants/_hooks/use-participants";
import { dashboardProgramSummaryQueryKey } from "@/app/(admin)/dashboard/_hooks/use-dashboard-summary";

const buildFormState = (
  payment: Payment | null | undefined,
  programId: string,
): PaymentFormState => ({
  participant_id: payment?.participant_id || "",
  amount: payment?.amount ?? undefined,
  payment_type: (payment?.payment_type as "tenor" | "full") || "",
  tenor: payment?.tenor?.toString() || "",
  status: payment?.status || "pending",
  paid_at: payment?.paid_at
    ? new Date(payment.paid_at).toISOString().slice(0, 16)
    : "",
  payment_method: payment?.payment_method || "",
  reference_name: payment?.reference_name || "none",
  program_id: payment?.program_id || programId,
});

export function useEditPayment({
  payment,
  programId,
  onSuccess,
}: EditPaymentModalProps) {
  const { isOpen, close } = useModal<EditPaymentModalProps>(
    "editPaymentModal",
  );
  const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(false);
  const resolvedProgramId = programId ?? "";
  const form = useForm<PaymentFormState>({
    defaultValues: buildFormState(payment, resolvedProgramId),
  });
  const { data: participants = [], isLoading: isParticipantsLoading } =
    useParticipants(resolvedProgramId);
  const participantId = form.watch("participant_id");
  const amount = form.watch("amount");
  const paymentType = form.watch("payment_type");
  const status = form.watch("status");
  const tenor = form.watch("tenor");

  React.useEffect(() => {
    if (isOpen) {
      form.reset(buildFormState(payment, resolvedProgramId));
      form.clearErrors();
    }
  }, [form, payment, isOpen, resolvedProgramId]);

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

    if (!payment) {
      toast.error("Payment data is missing.");
      return;
    }

    if (!resolvedProgramId) {
      toast.error("Program ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const { updatePayment } = await import("@/services/payments.service");

      const paymentData: UpdatePaymentInput = {
        amount: values.amount as number,
        participant_id: values.participant_id || undefined,
        program_id: values.program_id || resolvedProgramId,
        payment_type: values.payment_type as "tenor" | "full" | undefined,
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

      const result = await updatePayment(payment.id, paymentData);

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

      toast.success("Payment updated successfully");
      if (onSuccess) {
        onSuccess();
      } else if (resolvedProgramId) {
        await queryClient.invalidateQueries({
          queryKey: participantsQueryKey(resolvedProgramId),
        });
        await queryClient.invalidateQueries({
          queryKey: dashboardProgramSummaryQueryKey(resolvedProgramId),
        });
      }
      close();
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
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
    participants,
    isParticipantsLoading,
  };
}
