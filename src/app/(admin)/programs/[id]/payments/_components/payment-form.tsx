"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DateTimePickerController,
  SelectController,
  TextInputController,
  TextareaController,
} from "@/components/controllers";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { useNumberInput } from "@/hooks/use-number-input";
import type { PaymentType } from "@/schemas/payment-schema";
import type { Participant } from "@/services/participants.service";
import type { ProgramType } from "@/services/programs.service";
import { formatNumber } from "@/utils/number";
import {
  countPaidTenorFromDates,
  createEmptyTenorPaidAts,
  resizeTenorPaidAts,
} from "@/utils/tenor-paid-ats";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { useProgram } from "../../_hooks/useProgram";

const MINI_BOOTCAMP_PRESET_AMOUNTS = [
  149000, 179000, 199000, 249000, 299000, 349000, 399000, 449000, 499000, 549000,
] as const;

const BOOTCAMP_PRESET_AMOUNTS = [
  249000, 299000, 349000, 399000, 449000, 499000, 549000, 599000, 649000, 699000,
  749000, 799000, 999000,
] as const;

function getPresetAmountsForProgramType(
  programType: ProgramType | null | undefined,
): readonly number[] {
  if (programType === "bootcamp") {
    return BOOTCAMP_PRESET_AMOUNTS;
  }
  return MINI_BOOTCAMP_PRESET_AMOUNTS;
}

const PRESET_SCROLL_STEP = 160;

interface PresetAmountScrollRowProps {
  amounts: readonly number[];
  selectedAmount: number | undefined;
  onSelect: (amount: number) => void;
}

function PresetAmountScrollRow({
  amounts,
  selectedAmount,
  onSelect,
}: PresetAmountScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(element.scrollLeft < maxScrollLeft - 1);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    updateScrollButtons();

    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [amounts, updateScrollButtons]);

  const scrollByStep = (direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.scrollBy({
      left: direction === "left" ? -PRESET_SCROLL_STEP : PRESET_SCROLL_STEP,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex h-8 items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-8 shrink-0 p-0"
        disabled={!canScrollLeft}
        onClick={() => scrollByStep("left")}
        aria-label="Scroll preset amounts left"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex h-8 min-w-0 flex-1 items-center overflow-x-auto"
        onScroll={updateScrollButtons}
      >
        <div className="flex items-center gap-2">
          {amounts.map((presetAmount) => (
            <Button
              key={presetAmount}
              type="button"
              variant={selectedAmount === presetAmount ? "default" : "outline"}
              size="sm"
              className="h-8 shrink-0"
              onClick={() => onSelect(presetAmount)}
            >
              {formatNumber(presetAmount)}
            </Button>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-8 shrink-0 p-0"
        disabled={!canScrollRight}
        onClick={() => scrollByStep("right")}
        aria-label="Scroll preset amounts right"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export type PaymentFormState = {
  participant_id: string;
  amount: number | undefined;
  payment_type: PaymentType | "";
  tenor: string;
  paid_tenor: string;
  tenor_paid_ats: string[];
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
  const status = form.watch("status");
  const selectedTenor = form.watch("tenor");
  const tenorPaidAts = form.watch("tenor_paid_ats");
  const selectedParticipantId = form.watch("participant_id");
  const programId = form.watch("program_id");
  const { data: program } = useProgram(programId);
  const presetAmounts = getPresetAmountsForProgramType(program?.type);
  const isAmountRequired = status === "paid";
  const selectedTenorCount = selectedTenor
    ? Number.parseInt(selectedTenor, 10)
    : 0;
  const paidTenorCount = countPaidTenorFromDates(tenorPaidAts ?? []);
  const participantsSource = participants ?? [];
  const participantCandidates = filteredParticipants ?? participantsSource;

  const syncPaidTenorFromDates = (dates: string[]) => {
    const nextPaidTenor = String(countPaidTenorFromDates(dates));
    if (form.getValues("paid_tenor") === nextPaidTenor) {
      return;
    }
    form.setValue("paid_tenor", nextPaidTenor, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (paymentType !== "tenor") {
      return;
    }
    syncPaidTenorFromDates(tenorPaidAts ?? []);
    // Keep paid_tenor derived from date slots only.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form identity is stable; sync on dates/type
  }, [paymentType, tenorPaidAts]);

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
        searchable
        searchPlaceholder="Search participant..."
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

      <div className="space-y-2">
        <TextInputController
          form={form}
          name="amount"
          label="Amount"
          required={isAmountRequired}
          placeholder="Enter amount"
          componentProps={{
            input: {
              type: "text",
              required: isAmountRequired,
              className: amount !== undefined ? "pr-9" : undefined,
              value: formatNumberValue(amount),
              onChange: createNumberInputHandler(form, "amount", true),
            },
          }}
        >
          {amount !== undefined && (
            <button
              type="button"
              aria-label="Clear amount"
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                form.setValue("amount", undefined, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </TextInputController>

        <PresetAmountScrollRow
          amounts={presetAmounts}
          selectedAmount={amount}
          onSelect={(presetAmount) => {
            form.setValue("amount", presetAmount, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      </div>

      <SelectController
        form={form}
        name="payment_type"
        label={<>Payment Type</>}
        placeholder="Select payment type"
        options={[
          { label: "Full", value: "full" },
          { label: "Tenor", value: "tenor" },
          { label: "Scholarship", value: "scholarship" },
        ]}
        componentProps={{
          selectTrigger: { className: "mt-2", id: "payment_type" },
          select: {
            onValueChange: (value) => {
              if (value === "tenor") {
                form.setValue("status", "on_progress", { shouldDirty: true });
                form.setValue("paid_at", "", { shouldDirty: true });
                form.setValue("tenor", "", { shouldDirty: true });
                form.setValue("paid_tenor", "0", { shouldDirty: true });
                form.setValue("tenor_paid_ats", [], { shouldDirty: true });
                return;
              }

              form.setValue("tenor", "", { shouldDirty: true });
              form.setValue("paid_tenor", "", { shouldDirty: true });
              form.setValue("tenor_paid_ats", [], { shouldDirty: true });
            },
          },
        }}
      />

      {paymentType === "tenor" && (
        <div className="space-y-4">
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
                  onValueChange: (value) => {
                    const nextTenor = Number.parseInt(value, 10);
                    if (!Number.isFinite(nextTenor) || nextTenor < 1) {
                      return;
                    }

                    const nextDates = selectedTenor
                      ? resizeTenorPaidAts(tenorPaidAts ?? [], nextTenor)
                      : createEmptyTenorPaidAts(nextTenor);

                    form.setValue("tenor_paid_ats", nextDates, {
                      shouldDirty: true,
                    });
                    syncPaidTenorFromDates(nextDates);
                  },
                },
              }}
            />
            <div className="space-y-2">
              <Typography
                variant="label"
                className="text-sm font-medium leading-none"
              >
                Paid Tenor
              </Typography>
              <div className="mt-2 flex h-10 items-center rounded-md border border-input bg-muted/40 px-3">
                <Typography variant="body3" className="font-medium">
                  {selectedTenorCount > 0
                    ? `${paidTenorCount}/${selectedTenorCount}`
                    : "-"}
                </Typography>
              </div>
            </div>
          </div>

          {selectedTenorCount > 0 && (
            <div className="space-y-3">
              {Array.from({ length: selectedTenorCount }, (_, index) => (
                <div
                  key={`tenor-paid-at-${index}`}
                  className="grid grid-cols-[88px_1fr] items-start gap-3"
                >
                  <Typography
                    variant="body3"
                    className="mt-2 flex h-10 items-center font-medium text-muted-foreground"
                  >
                    Tenor-{index + 1}
                  </Typography>
                  <DateTimePickerController
                    form={form}
                    name={`tenor_paid_ats.${index}`}
                    placeholder="Pick payment date and time"
                  />
                </div>
              ))}
            </div>
          )}
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

      {paymentType !== "tenor" && (
        <DateTimePickerController
          form={form}
          name="paid_at"
          label="Paid At"
          placeholder="Pick payment date and time"
        />
      )}

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
        searchable
        searchPlaceholder="Search referral..."
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
