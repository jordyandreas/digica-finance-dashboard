"use client";

import { useParams } from "next/navigation";
import { useProgram } from "../_hooks/useProgram";
import { useParticipants } from "../participants/_hooks/use-participants";
import { useAttendance, useProgramSessions } from "./_hooks/use-attendance";
import { AttendanceContent } from "./_components/attendance-content";

export default function AttendancePage() {
  const { id } = useParams<{ id?: string }>();
  const programId = Array.isArray(id) ? id[0] : id ?? "";

  const { data: program, isPending: isProgramPending } = useProgram(programId);
  const {
    data: sessions = [],
    isPending: isSessionsPending,
    isFetching: isSessionsFetching,
  } = useProgramSessions(programId, program?.session_count ?? 0);
  const { data: participants = [], isPending: isParticipantsPending } =
    useParticipants(programId);
  const {
    data: attendance = {},
    isPending: isAttendancePending,
    isFetching: isAttendanceFetching,
  } = useAttendance(programId);

  const isLoading =
    isProgramPending ||
    isSessionsPending ||
    isParticipantsPending ||
    isAttendancePending;
  const isFetching = isSessionsFetching || isAttendanceFetching;

  return (
    <AttendanceContent
      programId={programId}
      program={program}
      sessions={sessions}
      participants={participants}
      attendance={attendance}
      isLoading={isLoading}
      isFetching={isFetching}
    />
  );
}
