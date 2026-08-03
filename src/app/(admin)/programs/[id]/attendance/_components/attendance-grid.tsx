"use client";

import * as React from "react";
import { Check, FileCheck, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Participant } from "@/services/participants.service";
import type { ProgramSession } from "@/services/program-sessions.service";
import type { AttendanceStatus } from "@/constants/attendance-status";
import type { AttendanceGrid } from "@/services/attendance.service";
import { deleteAttendance, upsertAttendance } from "@/services/attendance.service";
import { Typography } from "@/components/atoms/typography";
import { formatDate } from "@/utils/date";
import { participantMatchesSearch } from "@/utils/search";
import { AttendanceCell } from "./attendance-cell";
import { attendanceQueryKey } from "../_hooks/use-attendance";

interface AttendanceGridProps {
  programId: string;
  participants: Participant[];
  sessions: ProgramSession[];
  attendance: AttendanceGrid;
  search?: string;
}

function countSessionsByStatus(
  participantId: string,
  sessions: ProgramSession[],
  attendance: AttendanceGrid,
  status: AttendanceStatus,
): number {
  const participantAttendance = attendance[participantId] ?? {};

  return sessions.reduce(
    (count, session) =>
      participantAttendance[session.id] === status ? count + 1 : count,
    0,
  );
}

function countParticipantsByStatus(
  sessionId: string,
  participants: Participant[],
  attendance: AttendanceGrid,
  status: AttendanceStatus,
): number {
  return participants.reduce(
    (count, participant) =>
      attendance[participant.id]?.[sessionId] === status ? count + 1 : count,
    0,
  );
}

export function AttendanceGridTable({
  programId,
  participants,
  sessions,
  attendance,
  search = "",
}: AttendanceGridProps) {
  const visibleParticipants = React.useMemo(
    () =>
      [...participants]
        .filter((participant) => participantMatchesSearch(participant, search))
        .sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", undefined, {
            sensitivity: "base",
          }),
        ),
    [participants, search],
  );

  const queryClient = useQueryClient();
  const [localAttendance, setLocalAttendance] =
    React.useState<AttendanceGrid>(attendance);
  const [savingKey, setSavingKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocalAttendance(attendance);
  }, [attendance]);

  const handleStatusChange = async (
    participantId: string,
    sessionId: string,
    status: AttendanceStatus | null,
  ) => {
    const cellKey = `${participantId}:${sessionId}`;
    setSavingKey(cellKey);

    setLocalAttendance((prev) => {
      const participantRow = { ...(prev[participantId] ?? {}) };

      if (status === null) {
        delete participantRow[sessionId];
      } else {
        participantRow[sessionId] = status;
      }

      return {
        ...prev,
        [participantId]: participantRow,
      };
    });

    try {
      const { error } =
        status === null
          ? await deleteAttendance(participantId, sessionId)
          : await upsertAttendance([
              {
                participant_id: participantId,
                session_id: sessionId,
                status,
              },
            ]);

      if (error) {
        throw error;
      }

      await queryClient.invalidateQueries({
        queryKey: attendanceQueryKey(programId),
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      setLocalAttendance(attendance);
      const message =
        error instanceof Error ? error.message : "Failed to save attendance";
      toast.error("Error saving attendance", { description: message });
    } finally {
      setSavingKey(null);
    }
  };

  if (participants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Typography variant="body2" className="text-muted-foreground">
          No participants yet. Add participants first to record attendance.
        </Typography>
      </div>
    );
  }

  if (visibleParticipants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Typography variant="body2" className="text-muted-foreground">
          No participants match your search.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-green-600 text-white">
            <Check className="h-3 w-3" />
          </span>
          Present
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-destructive text-white">
            <X className="h-3 w-3" />
          </span>
          Absent
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-amber-600 text-white">
            <FileCheck className="h-3 w-3" />
          </span>
          Leave Permit
        </span>
        <span className="text-muted-foreground/80">
          Click a cell to mark attendance
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 z-20 min-w-[180px] border-r bg-muted px-4 py-3 text-left font-medium">
                Participant
              </th>
              {sessions.map((session) => {
                const sessionPresentCount = countParticipantsByStatus(
                  session.id,
                  visibleParticipants,
                  localAttendance,
                  "present",
                );
                const sessionLeaveCount = countParticipantsByStatus(
                  session.id,
                  visibleParticipants,
                  localAttendance,
                  "leave",
                );

                return (
                  <th
                    key={session.id}
                    className="min-w-[88px] px-2 py-3 text-center font-medium"
                  >
                    <div>Session {session.session_number}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {session.session_date
                        ? formatDate(session.session_date)
                        : "No date set"}
                    </div>
                    <div className="mt-1 text-xs font-medium">
                      <span className="text-green-700">
                        {sessionPresentCount} present
                      </span>
                      <span className="text-muted-foreground"> · </span>
                      <span className="text-amber-700">
                        {sessionLeaveCount} leave
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleParticipants.map((participant) => {
              const presentCount = countSessionsByStatus(
                participant.id,
                sessions,
                localAttendance,
                "present",
              );
              const leaveCount = countSessionsByStatus(
                participant.id,
                sessions,
                localAttendance,
                "leave",
              );

              return (
                <tr key={participant.id} className="border-b last:border-b-0">
                  <td className="sticky left-0 z-10 border-r bg-background px-4 py-3">
                    <div className="font-medium capitalize">
                      {participant.name || "Unnamed participant"}
                    </div>
                    {participant.email ? (
                      <div className="text-xs text-muted-foreground">
                        {participant.email}
                      </div>
                    ) : null}
                    <div className="mt-1 text-xs font-medium">
                      <span className="text-green-700">
                        {presentCount}/{sessions.length} present
                      </span>
                      <span className="text-muted-foreground"> · </span>
                      <span className="text-amber-700">
                        {leaveCount} leave
                      </span>
                    </div>
                  </td>
                  {sessions.map((session) => {
                    const cellKey = `${participant.id}:${session.id}`;
                    const status =
                      localAttendance[participant.id]?.[session.id] ?? null;

                    return (
                      <td key={session.id} className="px-2 py-2 text-center">
                        <AttendanceCell
                          status={status}
                          disabled={savingKey === cellKey}
                          onChange={(nextStatus) =>
                            handleStatusChange(
                              participant.id,
                              session.id,
                              nextStatus,
                            )
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
