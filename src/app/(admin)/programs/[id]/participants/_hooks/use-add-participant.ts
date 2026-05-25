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
  participantSchema,
  type ParticipantFormState,
} from "../_components/participant-form";
import type { AddParticipantModalProps } from "../_modals/add-participant";
import type { EditParticipantModalProps } from "../_modals/edit-participant";
import { participantsQueryKey } from "./use-participants";
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
  program_id: programId,
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
  const [loading, setLoading] = React.useState(false);
  const resolvedProgramId =
    programId ?? addParticipantModal.props?.programId ?? "";
  const resolvedOnSuccess =
    onSuccess ?? addParticipantModal.props?.onSuccess;
  const form = useForm<ParticipantFormState>({
    defaultValues: defaultFormState(resolvedProgramId),
  });
  const name = form.watch("name");
  const email = form.watch("email");
  const phone = form.watch("phone");
  const joinedDate = form.watch("joined_date");

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

  const handleSuccess = async () => {
    if (resolvedOnSuccess) {
      resolvedOnSuccess();
      return;
    }
    await invalidateParticipants();
  };

  const handleAddClick = () => {
    addParticipantModal.open({
      programId: resolvedProgramId,
      onSuccess: handleSuccess,
    });
  };

  const handleEdit = (participant: Participant) => {
    editParticipantModal.open({
      participant,
      programId: resolvedProgramId,
      onSuccess: handleSuccess,
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
      await invalidateParticipants();
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
          program_id: values.program_id || resolvedProgramId,
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
        await handleSuccess();
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
    !joinedDate?.trim();

  return {
    isOpen: addParticipantModal.isOpen,
    close: addParticipantModal.close,
    form,
    handleSubmit,
    applyDisabled,
    handleAddClick,
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
