"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTableSkeleton } from "@/components/molecules/data-table";
import { cn } from "@/lib/utils";
import type { Participant } from "@/services/participants.service";
import type { ProgramSession } from "@/services/program-sessions.service";
import type { AttendanceGrid } from "@/services/attendance.service";
import type { Program } from "@/services/programs.service";
import { AttendanceGridTable } from "./attendance-grid";
import { CheckInLinkCard } from "./check-in-link-card";
import { useSessionDates } from "../_hooks/use-session-dates";

interface AttendanceContentProps {
  programId: string;
  program: Program | null | undefined;
  sessions: ProgramSession[];
  participants: Participant[];
  attendance: AttendanceGrid;
  isLoading: boolean;
  isFetching: boolean;
}

export function AttendanceContent({
  programId,
  program,
  sessions,
  participants,
  attendance,
  isLoading,
  isFetching,
}: AttendanceContentProps) {
  const {
    dates,
    isSaving,
    hasChanges,
    handleDateChange,
    handleSaveDates,
  } = useSessionDates(programId, sessions);

  const sessionCount = program?.session_count ?? 0;
  const showSkeleton = isLoading && sessions.length === 0;
  const [isSessionDatesOpen, setIsSessionDatesOpen] = useState(false);

  if (sessionCount === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Track participant attendance per session
          </p>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <Typography variant="body2" className="text-muted-foreground">
              This program has no sessions configured yet. Edit the program and
              set the number of sessions first.
            </Typography>
            <Button asChild className="mt-4">
              <Link href="/programs">Go to Programs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Set session dates and mark each participant as present or absent
        </p>
      </div>

      <CheckInLinkCard
        programId={programId}
        registrationLink={program?.registration_link}
      />

      <Card>
        <CardHeader className={cn("space-y-0", !isSessionDatesOpen && "pb-6")}>
          <button
            type="button"
            onClick={() => setIsSessionDatesOpen((prev) => !prev)}
            aria-expanded={isSessionDatesOpen}
            className="flex w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <div>
              <CardTitle>Session Dates</CardTitle>
              <Typography variant="caption" className="text-muted-foreground">
                {sessionCount} session{sessionCount !== 1 ? "s" : ""} configured
              </Typography>
            </div>
            {isSessionDatesOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        {isSessionDatesOpen && (
          <CardContent className="space-y-6">
            {showSkeleton ? (
              <DataTableSkeleton rows={1} columns={3} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                  <div key={session.id} className="space-y-2">
                    <Typography variant="label">
                      Session {session.session_number}
                    </Typography>
                    <DatePicker
                      value={dates[session.session_number] ?? ""}
                      onChange={(value) =>
                        handleDateChange(session.session_number, value)
                      }
                      placeholder="Pick session date"
                      clearable
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveDates}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? "Saving..." : "Save Dates"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <div
        className={
          isFetching && !showSkeleton
            ? "opacity-60 transition-opacity"
            : undefined
        }
      >
        {showSkeleton ? (
          <DataTableSkeleton rows={5} columns={4} />
        ) : (
          <AttendanceGridTable
            programId={programId}
            participants={participants}
            sessions={sessions}
            attendance={attendance}
          />
        )}
      </div>
    </div>
  );
}
