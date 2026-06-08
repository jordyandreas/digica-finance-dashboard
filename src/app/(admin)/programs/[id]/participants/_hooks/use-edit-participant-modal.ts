"use client";

import * as React from "react";
import { toast } from "sonner";
import type {
  Participant,
  UpdateParticipantInput,
} from "@/services/participants.service";
import { useModal } from "@/hooks/use-modal";
import { useForm } from "react-hook-form";
import {
  participantSchema,
  type ParticipantFormState,
} from "../_components/participant-form";
import type { EditParticipantModalProps } from "../_modals/edit-participant";

const buildFormState = (
  participant: Participant | null | undefined,
  programId: string,
): ParticipantFormState => ({
  name: participant?.name || "",
  email: participant?.email || "",
  phone: participant?.phone || "",
  occupation: participant?.occupation || "",
  organization: participant?.organization || "",
  status: participant?.status || "active",
  payment_status: participant?.payment_status || "pending",
  joined_date: participant?.joined_date
    ? participant.joined_date.split("T")[0]
    : "",
  notes: participant?.notes || "",
  program_id: participant?.program_id || programId,
});

export function useEditParticipantModal({
  participant,
  programId,
  onSuccess,
}: EditParticipantModalProps) {
  const { isOpen, close } = useModal<EditParticipantModalProps>(
    "editParticipantModal",
  );
  const [loading, setLoading] = React.useState(false);
  const resolvedProgramId = programId ?? "";
  const form = useForm<ParticipantFormState>({
    defaultValues: buildFormState(participant, resolvedProgramId),
  });
  const name = form.watch("name");
  const email = form.watch("email");
  const phone = form.watch("phone");
  const joinedDate = form.watch("joined_date");

  React.useEffect(() => {
    if (isOpen) {
      form.reset(buildFormState(participant, resolvedProgramId));
      form.clearErrors();
    }
  }, [form, participant, isOpen, resolvedProgramId]);

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

      if (!participant) {
        toast.error("Participant data is missing.");
        return;
      }

      if (!resolvedProgramId) {
        toast.error("Program ID is missing.");
        return;
      }

      setLoading(true);
      try {
        const { updateParticipant } = await import(
          "@/services/participants.service"
        );

        const participantData: UpdateParticipantInput = {
          name: values.name.toLowerCase(),
          email: values.email,
          phone: values.phone.trim().startsWith("+62")
            ? values.phone.trim()
            : `+62${values.phone.trim()}`,
          occupation: values.occupation || undefined,
          organization: values.organization?.toLowerCase() || undefined,
          status: values.status || undefined,
          // payment_status: values.payment_status || undefined,
          joined_date: values.joined_date,
          notes: values.notes?.trim() || undefined,
          program_id: values.program_id || resolvedProgramId,
        };

        const result = await updateParticipant(participant.id, participantData);

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

        toast.success("Participant updated successfully");
        if (onSuccess) {
          onSuccess();
        }
        close();
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
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
  };
}
