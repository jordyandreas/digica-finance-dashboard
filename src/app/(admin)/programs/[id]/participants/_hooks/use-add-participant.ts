"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateParticipantInput,
  Participant,
} from "@/services/participants.service";
import { deleteParticipant } from "@/services/participants.service";
import { useModal } from "@/hooks/use-modal";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import { useForm } from "react-hook-form";
import {
  buildParticipantPackageFields,
  isParticipantPackageReady,
  participantSchema,
  type ParticipantFormState,
} from "../_components/participant-form";
import type { AddParticipantModalProps } from "../_modals/add-participant";
import type { EditParticipantModalProps } from "../_modals/edit-participant";
import type { AddPaymentModalProps } from "../../payments/_modals/add-payment";
import { useProgram } from "../../_hooks/useProgram";
import { isBootcampProgram } from "@/utils/programs";
import { participantsQueryKey } from "./use-participants";
import {
  paymentsQueryKey,
  paymentsSummaryQueryKey,
} from "../../payments/_hooks/use-payments";
import { dashboardProgramSummaryQueryKey } from "@/app/(admin)/dashboard/_hooks/use-dashboard-summary";
import { getLocalDateInputValue } from "@/utils/date";
import { normalizeParticipantPhoneForSubmit } from "@/utils/phone";

const defaultFormState = (programId: string): ParticipantFormState => ({
  name: "",
  email: "",
  phone: "",
  occupation: "",
  organization: "",
  status: "active",
  payment_status: "pending",
  joined_date: getLocalDateInputValue(),
  notes: "",
  reference_name: "none",
  program_id: programId,
  registration_source: "none",
  selected_package: "none",
  friend_name: "",
  friend_phone: "",
});

type UseAddParticipantOptions = {
  programId?: string;
  onSuccess?: () => void;
};

export function useAddParticipant({
  programId,
  onSuccess,
}: UseAddParticipantOptions = {}) {
  const queryClient = useQueryClient();
  const addParticipantModal = useModal<AddParticipantModalProps>(
    "addParticipantModal",
  );
  const editParticipantModal = useModal<EditParticipantModalProps>(
    "editParticipantModal",
  );
  const addPaymentModal = useModal<AddPaymentModalProps>("addPaymentModal");
  const [loading, setLoading] = React.useState(false);
  const resolvedProgramId =
    programId ?? addParticipantModal.props?.programId ?? "";
  const { data: program } = useProgram(resolvedProgramId);
  const isPaidProgram = isBootcampProgram(program?.type);
  const form = useForm<ParticipantFormState>({
    defaultValues: defaultFormState(resolvedProgramId),
  });
  const name = form.watch("name");
  const email = form.watch("email");
  const phone = form.watch("phone");
  const joinedDate = form.watch("joined_date");
  const selectedPackage = form.watch("selected_package");
  const friendName = form.watch("friend_name");
  const friendPhone = form.watch("friend_phone");

  React.useEffect(() => {
    if (addParticipantModal.isOpen) {
      form.reset(defaultFormState(resolvedProgramId));
      form.clearErrors();
    }
  }, [form, addParticipantModal.isOpen, resolvedProgramId]);

  const invalidateParticipants = async () => {
    if (!resolvedProgramId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: participantsQueryKey(resolvedProgramId),
    });
  };

  const invalidateOverviewData = async () => {
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
    await invalidateParticipants();
  };

  const handleMutationSuccess = async () => {
    await invalidateParticipants();
    if (onSuccess) {
      await onSuccess();
    }
  };

  const handleAddClick = () => {
    addParticipantModal.open({
      programId: resolvedProgramId,
    });
  };

  const handleAddPayment = (participant: Participant) => {
    addPaymentModal.open({
      programId: resolvedProgramId,
      participantId: participant.id,
    });
  };

  const handleEdit = (participant: Participant) => {
    editParticipantModal.open({
      participant,
      programId: resolvedProgramId,
      onSuccess: invalidateParticipants,
    });
  };

  const deleteConfirmation = useDeleteConfirmation<Participant>({
    title: "Do you want to delete a registered member account?",
    description: "You can't take it back when you delete it",
  });
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = (participant: Participant) => {
    deleteConfirmation.openConfirmation(
      participant,
      `Do you want to delete "${participant.name ?? "this participant"}"?`,
      "You can't take it back when you delete it"
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.item) return;

    setIsDeleting(true);
    try {
      await deleteParticipant(deleteConfirmation.item.id);
      await invalidateOverviewData();
      toast.success("Participant deleted successfully");
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast.error("Failed to delete participant. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = form.handleSubmit(
    async (values: ParticipantFormState) => {
      const validation = participantSchema.safeParse({
        name: values.name,
        email: values.email,
        phone: values.phone,
        occupation: values.occupation,
        organization: values.organization,
        joined_date: values.joined_date,
        notes: values.notes,
        reference_name: values.reference_name,
        registration_source:
          values.registration_source === "none"
            ? ""
            : values.registration_source,
        selected_package:
          values.selected_package === "none" ? "" : values.selected_package,
        friend_name: values.friend_name,
        friend_phone: values.friend_phone,
      });

      if (!validation.success) {
        for (const issue of validation.error.issues) {
          const field = issue.path[0] as keyof ParticipantFormState | undefined;
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

      const packageFields = buildParticipantPackageFields(
        values,
        {
          promo_individual_price: program?.promo_individual_price ?? null,
          promo_bareng_teman_price: program?.promo_bareng_teman_price ?? null,
          price: program?.price ?? null,
        },
        isPaidProgram,
      );

      if ("error" in packageFields) {
        toast.error(packageFields.error);
        return;
      }

      setLoading(true);
      try {
        const { createParticipant } = await import(
          "@/services/participants.service"
        );

        const participantData: CreateParticipantInput = {
          name: values.name.toLowerCase(),
          email: values.email,
          phone: normalizeParticipantPhoneForSubmit(values.phone),
          occupation: values.occupation || undefined,
          organization: values.organization?.toLowerCase() || undefined,
          status: values.status || undefined,
          // payment_status: values.payment_status || undefined,
          joined_date: values.joined_date,
          notes: values.notes?.trim() || undefined,
          reference_name:
            values.reference_name && values.reference_name !== "none"
              ? values.reference_name
              : null,
          program_id: values.program_id || resolvedProgramId,
          registration_source: packageFields.registration_source,
          selected_package: packageFields.selected_package,
          package_price: packageFields.package_price,
          friend_name: packageFields.friend_name,
          friend_phone: packageFields.friend_phone
            ? normalizeParticipantPhoneForSubmit(packageFields.friend_phone)
            : null,
        };

        const result = await createParticipant(participantData);

        if (result.error) {
          console.error("Error saving participant:", result.error);
          const errorMessage =
            result.error.message || JSON.stringify(result.error);
          toast.error("Error saving participant", {
            description: errorMessage,
          });
          setLoading(false);
          throw new Error(errorMessage);
        }

        toast.success("Participant created successfully");
        await handleMutationSuccess();
        addParticipantModal.close();
        setLoading(false);
      } catch (error) {
        console.error("Error saving participant:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast.error("Error saving participant", {
          description: errorMessage,
        });
        setLoading(false);
      }
    },
  );

  const applyDisabled =
    loading ||
    !name?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !joinedDate?.trim() ||
    !isParticipantPackageReady({
      selected_package: selectedPackage,
      friend_name: friendName,
      friend_phone: friendPhone,
    });

  return {
    isOpen: addParticipantModal.isOpen,
    close: addParticipantModal.close,
    form,
    handleSubmit,
    applyDisabled,
    handleAddClick,
    handleAddPayment,
    handleEdit,
    handleDelete,
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
