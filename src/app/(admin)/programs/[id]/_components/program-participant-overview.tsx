"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROGRAM_PRICE_TONE_CLASSES } from "@/constants/registration-offers";
import { cn } from "@/lib/utils";
import { isBootcampProgram } from "@/utils/programs";
import { useProgram } from "../_hooks/useProgram";
import { useProgramParticipantCounts } from "../_hooks/use-program-participant-counts";

type ProgramParticipantOverviewProps = {
  programId: string;
};

type OverviewStat = {
  title: string;
  value: number;
  valueClassName: string;
};

function OverviewStatCell({ title, value, valueClassName }: OverviewStat) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function OverviewStatsGrid({
  stats,
  skeletonCount = 3,
  isLoading,
}: {
  stats: OverviewStat[];
  skeletonCount?: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={`overview-skeleton-${index}`} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <OverviewStatCell key={stat.title} {...stat} />
      ))}
    </div>
  );
}

export function ProgramParticipantOverview({
  programId,
}: ProgramParticipantOverviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: program, isLoading: isProgramLoading } = useProgram(programId);
  const {
    data: counts,
    error,
    isLoading: isCountsLoading,
  } = useProgramParticipantCounts(programId);

  const isLoading = isProgramLoading || isCountsLoading;
  const isBootcamp = isBootcampProgram(program?.type);
  const isWorkshop = program?.type === "workshop";

  if (!isLoading && !isBootcamp && !isWorkshop) {
    return null;
  }

  const paymentStats: OverviewStat[] = [
    {
      title: "Total Paid",
      value: counts?.paid ?? 0,
      valueClassName: "text-emerald-700",
    },
    {
      title: "Total On Progress",
      value: counts?.on_progress ?? 0,
      valueClassName: "text-sky-700",
    },
    {
      title: "Total Pending",
      value: counts?.pending ?? 0,
      valueClassName: "text-amber-700",
    },
  ];

  const packageStats: OverviewStat[] = [
    {
      title: "Total Social",
      value: counts?.social ?? 0,
      valueClassName: PROGRAM_PRICE_TONE_CLASSES.default,
    },
    {
      title: "Workshop (Individual)",
      value: counts?.workshop_individual ?? 0,
      valueClassName: PROGRAM_PRICE_TONE_CLASSES.individual,
    },
    {
      title: "Workshop (Bareng Teman)",
      value: counts?.workshop_bareng_teman ?? 0,
      valueClassName: PROGRAM_PRICE_TONE_CLASSES.bareng_teman,
    },
  ];

  const secureSeatStats: OverviewStat[] = [
    {
      title: "Total Yes",
      value: counts?.secure_seat_yes ?? 0,
      valueClassName: "text-emerald-700",
    },
    {
      title: "Total Undecided",
      value: counts?.secure_seat_undecided ?? 0,
      valueClassName: "text-amber-700",
    },
    {
      title: "Total No",
      value: counts?.secure_seat_no ?? 0,
      valueClassName: "text-rose-700",
    },
  ];

  const showWorkshopLayout = Boolean(isWorkshop);
  const cardTitle = isWorkshop ? "Secure Seat Overview" : "Students Overview";

  return (
    <div className="w-full space-y-3">
      {error && isOpen && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Error loading student overview</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      )}

      <Card>
        <CardHeader className={cn("space-y-0", !isOpen && "pb-6")}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="flex w-full items-center justify-between rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">
              {cardTitle}
            </CardTitle>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        {isOpen && (
          <CardContent className="space-y-4">
            {showWorkshopLayout ? (
              <OverviewStatsGrid
                stats={secureSeatStats}
                isLoading={isLoading}
              />
            ) : (
              <>
                <OverviewStatsGrid stats={paymentStats} isLoading={isLoading} />
                <div className="border-t" />
                <OverviewStatsGrid stats={packageStats} isLoading={isLoading} />
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
