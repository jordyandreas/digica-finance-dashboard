"use client";

import {
  DateTimePickerController,
  SelectController,
  TextInputController,
  TextareaController,
} from "@/components/controllers";
import { useNumberInput } from "@/hooks/use-number-input";
import type { Participant } from "@/services/participants.service";
import { type UseFormReturn } from "react-hook-form";

export type PaymentFormState = {
  participant_id: string;
  amount: number | undefined;
  payment_type: "tenor" | "full" | "";
  tenor: string;
  paid_tenor: string;
  status: string;
  paid_at: string;
  payment_method: string;
  reference_name: string;
  notes: string;
  program_id: string;
};

interface PaymentFormFieldsProps {
  form: UseFormReturn<PaymentFormState>;
  disableParticipant?: boolean;
  participants?: Participant[];
  filteredParticipants?: Participant[];
  isParticipantsLoading?: boolean;
}

export function PaymentFormFields({
  form,
  disableParticipant = false,
  participants,
  filteredParticipants,
  isParticipantsLoading = false,
}: PaymentFormFieldsProps) {
  const { formatNumberValue, createNumberInputHandler } = useNumberInput();
  const amount = form.watch("amount");
  const paymentType = form.watch("payment_type");
  const selectedTenor = form.watch("tenor");
  const selectedParticipantId = form.watch("participant_id");

  const paidTenorOptions = selectedTenor
    ? Array.from({ length: Number.parseInt(selectedTenor, 10) }, (_, index) => {
        const value = String(index + 1);
        return { label: value, value };
      })
    : [];
  const participantsSource = participants ?? [];
  const participantCandidates = filteredParticipants ?? participantsSource;

  const participantOptions: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }> = participantCandidates.map((participant) => ({
    label: participant.name || "Unnamed participant",
    value: participant.id,
  }));

  const referralParticipants = participantsSource.filter(
    (participant) => participant.id !== selectedParticipantId,
  );

  const referralOptions = [
    { label: "No referral", value: "none" },
    ...referralParticipants.map((participant) => ({
      label: participant.name || "Unnamed participant",
      value: participant.id,
    })),
  ];

  return (
    <div className="space-y-4">
      <SelectController
        form={form}
        name="participant_id"
        label={<>Participant</>}
        placeholder={
          isParticipantsLoading
            ? "Loading participants..."
            : "Select participant"
        }
        options={
          participantOptions.length
            ? participantOptions
            : [
                {
                  label: isParticipantsLoading
                    ? "Loading participants..."
                    : "No participants found",
                  value: "no-participants",
                  disabled: true,
                },
              ]
        }
        componentProps={{
          selectTrigger: { className: "mt-2", id: "participant_id" },
          select: {
            disabled:
              isParticipantsLoading ||
              participantOptions.length === 0 ||
              disableParticipant,
          },
        }}
      />

      <TextInputController
        form={form}
        name="amount"
        label="Amount"
        required
        placeholder="Enter amount"
        componentProps={{
          input: {
            type: "text",
            required: true,
            value: formatNumberValue(amount),
            onChange: createNumberInputHandler(form, "amount", true),
          },
        }}
      />

      <SelectController
        form={form}
        name="payment_type"
        label={<>Payment Type</>}
        placeholder="Select payment type"
        options={[
          { label: "Full", value: "full" },
          { label: "Tenor", value: "tenor" },
        ]}
        componentProps={{
          selectTrigger: { className: "mt-2", id: "payment_type" },
          select: {
            onValueChange: (value) => {
              if (value !== "tenor") {
                form.setValue("tenor", "", { shouldDirty: true });
                form.setValue("paid_tenor", "", { shouldDirty: true });
              }
            },
          },
        }}
      />

      {paymentType === "tenor" && (
        <div className="grid grid-cols-2 gap-4">
          <SelectController
            form={form}
            name="tenor"
            label={<>Tenor</>}
            placeholder="Select tenor"
            options={[
              { label: "2", value: "2" },
              { label: "3", value: "3" },
            ]}
            componentProps={{
              selectTrigger: { className: "mt-2", id: "tenor" },
              select: {
                onValueChange: () => {
                  form.setValue("paid_tenor", "1", { shouldDirty: true });
                },
              },
            }}
          />
          <SelectController
            form={form}
            name="paid_tenor"
            label={<>Paid Tenor</>}
            placeholder="Select paid tenor"
            options={paidTenorOptions}
            componentProps={{
              selectTrigger: { className: "mt-2", id: "paid_tenor" },
              select: {
                disabled: paidTenorOptions.length === 0,
              },
            }}
          />
        </div>
      )}

      <SelectController
        form={form}
        name="status"
        label={<>Status</>}
        placeholder="Select status"
        options={[
          { label: "Pending", value: "pending" },
          { label: "Paid", value: "paid" },
          { label: "On Progress", value: "on_progress" },
          { label: "Failed", value: "failed" },
          { label: "Refunded", value: "refunded" },
        ]}
        componentProps={{
          selectTrigger: { className: "mt-2", id: "status" },
        }}
      />

      <DateTimePickerController
        form={form}
        name="paid_at"
        label="Paid At"
        placeholder="Pick payment date and time"
      />

      {/* <TextInputController
        form={form}
        name="payment_method"
        label={"Payment Method"}
        componentProps={{
          input: {
            disabled: true,
            value: "Bank Transfer" as const,
          },
        }}
      /> */}

      <SelectController
        form={form}
        name="reference_name"
        label="Referral"
        placeholder={
          isParticipantsLoading ? "Loading participants..." : "Select referral"
        }
        options={referralOptions}
        componentProps={{
          selectTrigger: { className: "mt-2", id: "reference_name" },
          select: {
            disabled: isParticipantsLoading,
          },
        }}
      />

      <TextareaController
        form={form}
        name="notes"
        label="Notes"
        placeholder="Optional notes"
      />
    </div>
  );
}
