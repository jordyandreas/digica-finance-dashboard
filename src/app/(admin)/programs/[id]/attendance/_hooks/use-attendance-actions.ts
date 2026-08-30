"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import type { AttendanceGrid } from "@/services/attendance.service";
import type { Participant } from "@/services/participants.service";
import type { ProgramSession } from "@/services/program-sessions.service";
import type { Program } from "@/services/programs.service";
import {
  buildAttendanceNamesCsv,
  downloadCsv,
  sanitizeCsvFilename,
} from "@/utils/export-csv";
import { toTitleCase } from "@/utils/string";

interface UseAttendanceActionsOptions {
  program?: Program | null;
  participants: Participant[];
  sessions: ProgramSession[];
  attendance: AttendanceGrid;
}

export function useAttendanceActions({
  program,
  participants,
  sessions,
  attendance,
}: UseAttendanceActionsOptions) {
  const isWorkshop = program?.type === "workshop";

  const presentAttendeeNames = useMemo(() => {
    return participants
      .filter((participant) =>
        sessions.some(
          (session) =>
            attendance[participant.id]?.[session.id] === "present",
        ),
      )
      .map((participant) => toTitleCase(participant.name))
      .filter((name) => name.length > 0)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [participants, sessions, attendance]);

  const allParticipantNames = useMemo(() => {
    return participants
      .map((participant) => toTitleCase(participant.name))
      .filter((name) => name.length > 0)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [participants]);

  const exportNames = isWorkshop ? presentAttendeeNames : allParticipantNames;

  const handleExportCsv = () => {
    if (exportNames.length === 0) {
      toast.error(
        isWorkshop ? "No attendees to export" : "No participants to export",
      );
      return;
    }

    const baseName = sanitizeCsvFilename(
      program?.public_slug || program?.name || "attendees",
    );
    downloadCsv(
      `${baseName}-attendees.csv`,
      buildAttendanceNamesCsv(exportNames),
    );
  };

  return {
    exportNames,
    handleExportCsv,
  };
}
