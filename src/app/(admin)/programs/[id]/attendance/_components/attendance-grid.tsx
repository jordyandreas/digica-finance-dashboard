"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Participant } from "@/services/participants.service";
import type { ProgramSession } from "@/services/program-sessions.service";
import type { AttendanceStatus } from "@/constants/attendance-status";
import type { AttendanceGrid } from "@/services/attendance.service";
import { deleteAttendance, upsertAttendance } from "@/services/attendance.service";
import { Typography } from "@/components/atoms/typography";
import { formatDate } from "@/utils/date";
import { AttendanceCell } from "./attendance-cell";
import { attendanceQueryKey } from "../_hooks/use-attendance";

interface AttendanceGridProps {
  programId: string;
  participants: Participant[];
  sessions: ProgramSession[];
  attendance: AttendanceGrid;
}

export function AttendanceGridTable({
  programId,
  participants,
  sessions,
  attendance,
}: AttendanceGridProps) {
  const sortedParticipants = React.useMemo(
    () =>
      [...participants].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", undefined, {
          sensitivity: "base",
        }),
      ),
    [participants],
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

  if (sortedParticipants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Typography variant="body2" className="text-muted-foreground">
          No participants yet. Add participants first to record attendance.
        </Typography>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="sticky left-0 z-10 min-w-[180px] border-r bg-muted/50 px-4 py-3 text-left font-medium">
              Participant
            </th>
            {sessions.map((session) => (
              <th
                key={session.id}
                className="px-3 py-3 text-left font-medium"
              >
                <div>Session {session.session_number}</div>
                <div className="text-xs font-normal text-muted-foreground">
                  {session.session_date
                    ? formatDate(session.session_date)
                    : "No date set"}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedParticipants.map((participant) => (
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
              </td>
              {sessions.map((session) => {
                const cellKey = `${participant.id}:${session.id}`;
                const status =
                  localAttendance[participant.id]?.[session.id] ?? null;

                return (
                  <td key={session.id} className="px-3 py-3">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
