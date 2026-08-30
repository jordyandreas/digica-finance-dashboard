"use client";

import { formatPaymentStatusLabel } from "@/constants/payment-status";
import { occupationOptions } from "@/schemas/participant-schema";
import type { Participant } from "@/services/participants.service";
import {
  buildParticipantsCsv,
  downloadCsv,
  sanitizeCsvFilename,
} from "@/utils/export-csv";
import { appendRegistrationSource } from "@/utils/registration-source-url";
import { toTitleCase } from "@/utils/string";
import { toast } from "sonner";
import { useParticipants } from "./use-participants";

interface UseParticipantsActionsOptions {
  programId: string;
  programSlug?: string | null;
  programName?: string | null;
  bootcampRegistrationLink?: string | null;
}

function getOccupationLabel(occupation: string | null): string {
  if (!occupation) {
    return "";
  }
  return (
    occupationOptions.find((option) => option.value === occupation)?.label ??
    occupation
  );
}

export function useParticipantsActions({
  programId,
  programSlug,
  programName,
  bootcampRegistrationLink,
}: UseParticipantsActionsOptions) {
  const { data: allParticipants } = useParticipants(programId);
  const exportParticipants = allParticipants ?? [];

  const bootcampRegistrationUrl = (() => {
    const raw = bootcampRegistrationLink?.trim() ?? "";
    if (!raw) {
      return "";
    }
    return appendRegistrationSource(raw, "workshop_promo");
  })();

  const handleCopyBootcampRegistrationLink = async () => {
    if (!bootcampRegistrationUrl) {
      toast.error("Bootcamp registration link is not configured");
      return;
    }

    try {
      await navigator.clipboard.writeText(bootcampRegistrationUrl);
      toast.success("Bootcamp registration link copied");
    } catch {
      toast.error("Failed to copy registration link");
    }
  };

  const handleExportCsv = () => {
    if (exportParticipants.length === 0) {
      toast.error("No participants to export");
      return;
    }

    const rows = exportParticipants
      .map((participant: Participant) => ({
        name: toTitleCase(participant.name),
        phone: participant.phone ?? "",
        email: participant.email ?? "",
        occupation: getOccupationLabel(participant.occupation),
        organization: participant.organization ?? "",
        paymentStatus: formatPaymentStatusLabel(participant.payment_status),
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );

    const baseName = sanitizeCsvFilename(
      programSlug || programName || "participants",
    );
    downloadCsv(`${baseName}-participants.csv`, buildParticipantsCsv(rows));
  };

  return {
    exportParticipants,
    bootcampRegistrationUrl,
    handleCopyBootcampRegistrationLink,
    handleExportCsv,
  };
}
