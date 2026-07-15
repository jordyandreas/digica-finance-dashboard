"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DataTableFilters,
  DataTableSkeleton,
} from "@/components/molecules/data-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import type { Participant } from "@/services/participants.service";
import type { ProgramSession } from "@/services/program-sessions.service";
import type { AttendanceGrid } from "@/services/attendance.service";
import type { Program } from "@/services/programs.service";
import {
  buildAttendanceNamesCsv,
  downloadCsv,
  sanitizeCsvFilename,
} from "@/utils/export-csv";
import { toTitleCase } from "@/utils/string";
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
  const isWorkshop = program?.type === "workshop";
  const [isSessionDatesOpen, setIsSessionDatesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

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
        program={
          program?.public_code
            ? {
                public_code: program.public_code,
                public_slug: program.public_slug,
              }
            : null
        }
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

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <DataTableFilters
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search name, email, or phone"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 self-end sm:self-start"
            onClick={handleExportCsv}
            disabled={showSkeleton || exportNames.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

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
              search={debouncedSearch}
            />
          )}
        </div>
      </div>
    </div>
  );
}
