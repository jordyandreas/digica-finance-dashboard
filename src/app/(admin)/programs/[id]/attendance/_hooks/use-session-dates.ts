"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ProgramSession } from "@/services/program-sessions.service";
import { updateProgramSessionDates } from "@/services/program-sessions.service";
import {
  attendanceQueryKey,
  programSessionsQueryKey,
} from "./use-attendance";

export type SessionDateFormState = Record<number, string>;

function buildSessionDateFormState(
  sessions: ProgramSession[],
): SessionDateFormState {
  return sessions.reduce<SessionDateFormState>((acc, session) => {
    acc[session.session_number] = session.session_date
      ? session.session_date.split("T")[0]
      : "";
    return acc;
  }, {});
}

export function useSessionDates(programId: string, sessions: ProgramSession[]) {
  const queryClient = useQueryClient();
  const [dates, setDates] = React.useState<SessionDateFormState>({});
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setDates(buildSessionDateFormState(sessions));
  }, [sessions]);

  const handleDateChange = (sessionNumber: number, value: string) => {
    setDates((prev) => ({
      ...prev,
      [sessionNumber]: value,
    }));
  };

  const handleSaveDates = async () => {
    if (!programId) {
      return;
    }

    setIsSaving(true);
    try {
      const updates = sessions.map((session) => ({
        session_number: session.session_number,
        session_date: dates[session.session_number]?.trim()
          ? dates[session.session_number]
          : null,
      }));

      const { error } = await updateProgramSessionDates(programId, updates);

      if (error) {
        throw error;
      }

      await queryClient.invalidateQueries({
        queryKey: programSessionsQueryKey(programId),
      });

      toast.success("Session dates saved");
    } catch (error) {
      console.error("Error saving session dates:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save session dates";
      toast.error("Error saving session dates", { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = sessions.some((session) => {
    const current = dates[session.session_number] ?? "";
    const original = session.session_date
      ? session.session_date.split("T")[0]
      : "";
    return current !== original;
  });

  return {
    dates,
    isSaving,
    hasChanges,
    handleDateChange,
    handleSaveDates,
  };
}
