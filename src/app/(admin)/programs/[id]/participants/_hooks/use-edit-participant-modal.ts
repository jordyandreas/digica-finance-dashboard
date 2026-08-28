"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Participant,
  UpdateParticipantInput,
} from "@/services/participants.service";
import { useModal } from "@/hooks/use-modal";
import { useForm } from "react-hook-form";
import {
  buildParticipantPackageFields,
  isParticipantPackageReady,
  participantSchema,
  type ParticipantFormState,
} from "../_components/participant-form";
import type { EditParticipantModalProps } from "../_modals/edit-participant";
import { useProgram } from "../../_hooks/useProgram";
import { participantsQueryKey } from "./use-participants";
import { isBootcampProgram } from "@/utils/programs";
import {
  normalizeParticipantPhoneForSubmit,
  parsePhoneForInput,
} from "@/utils/phone";

const buildFormState = (
  participant: Participant | null | undefined,
  programId: string,
): ParticipantFormState => ({
  name: participant?.name || "",
  email: participant?.email || "",
  phone:
    parsePhoneForInput(participant?.phone)?.e164 || participant?.phone || "",
  occupation: participant?.occupation || "",
  organization: participant?.organization || "",
  status: participant?.status || "active",
  payment_status: participant?.payment_status || "pending",
  joined_date: participant?.joined_date
    ? participant.joined_date.split("T")[0]
    : "",
  notes: participant?.notes || "",
  reference_name: participant?.reference_name || "none",
  program_id: participant?.program_id || programId,
  registration_source: participant?.registration_source || "none",
  selected_package: participant?.selected_package || "none",
  friend_name: participant?.friend_name || "",
  friend_phone:
    parsePhoneForInput(participant?.friend_phone)?.e164 ||
    participant?.friend_phone ||
    "",
});

export function useEditParticipantModal({
  participant,
  programId,
  onSuccess,
}: EditParticipantModalProps) {
  const queryClient = useQueryClient();
  const { isOpen, close } = useModal<EditParticipantModalProps>(
    "editParticipantModal",
  );
  const [loading, setLoading] = React.useState(false);
  const resolvedProgramId = programId ?? "";
  const { data: program } = useProgram(resolvedProgramId);
  const isPaidProgram = isBootcampProgram(program?.type);
  const form = useForm<ParticipantFormState>({
    defaultValues: buildFormState(participant, resolvedProgramId),
  });
  const name = form.watch("name");
  const email = form.watch("email");
  const phone = form.watch("phone");
  const joinedDate = form.watch("joined_date");
  const selectedPackage = form.watch("selected_package");
  const friendName = form.watch("friend_name");
  const friendPhone = form.watch("friend_phone");

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

      if (!participant) {
        toast.error("Participant data is missing.");
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
        const { updateParticipant } = await import(
          "@/services/participants.service"
        );

        const participantData: UpdateParticipantInput = {
          name: values.name.toLowerCase(),
          email: values.email,
          phone: normalizeParticipantPhoneForSubmit(values.phone),
          occupation: values.occupation || undefined,
          organization: values.organization?.toLowerCase() || undefined,
          status: values.status || undefined,
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
        await queryClient.invalidateQueries({
          queryKey: participantsQueryKey(resolvedProgramId),
        });
        if (onSuccess) {
          await onSuccess();
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
    !joinedDate?.trim() ||
    !isParticipantPackageReady({
      selected_package: selectedPackage,
      friend_name: friendName,
      friend_phone: friendPhone,
    });

  return {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
  };
}
