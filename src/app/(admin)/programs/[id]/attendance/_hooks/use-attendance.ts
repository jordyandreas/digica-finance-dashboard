"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAttendanceByProgram,
  type AttendanceGrid,
} from "@/services/attendance.service";
import {
  getProgramSessions,
  syncProgramSessions,
} from "@/services/program-sessions.service";

export const programSessionsQueryKey = (programId: string) =>
  ["program-sessions", programId] as const;

export const attendanceQueryKey = (programId: string) =>
  ["attendance", programId] as const;

export function useProgramSessions(
  programId: string,
  sessionCount = 0,
) {
  const queryClient = useQueryClient();
  const syncAttemptedRef = useRef(false);

  const query = useQuery({
    queryKey: programSessionsQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getProgramSessions(programId);
      if (error) {
        throw error;
      }
      return data ?? [];
    },
    enabled: Boolean(programId),
  });

  useEffect(() => {
    if (
      !programId ||
      sessionCount <= 0 ||
      syncAttemptedRef.current ||
      query.isPending
    ) {
      return;
    }

    const sessionTotal = query.data?.length ?? 0;
    if (sessionTotal === sessionCount) {
      return;
    }

    syncAttemptedRef.current = true;

    void (async () => {
      const { error } = await syncProgramSessions(programId, sessionCount);
      if (!error) {
        await queryClient.invalidateQueries({
          queryKey: programSessionsQueryKey(programId),
        });
      }
    })();
  }, [
    programId,
    query.data,
    query.isPending,
    queryClient,
    sessionCount,
  ]);

  return query;
}

export function useAttendance(programId: string) {
  return useQuery({
    queryKey: attendanceQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getAttendanceByProgram(programId);
      if (error) {
        throw error;
      }
      return data ?? ({} as AttendanceGrid);
    },
    enabled: Boolean(programId),
  });
}
