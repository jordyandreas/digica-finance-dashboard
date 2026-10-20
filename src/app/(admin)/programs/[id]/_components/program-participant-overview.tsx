"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Copy, Info, Phone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROGRAM_PRICE_TONE_CLASSES } from "@/constants/registration-offers";
import { cn } from "@/lib/utils";
import type { Participant } from "@/services/participants.service";
import { isBootcampProgram } from "@/utils/programs";
import { toTitleCase } from "@/utils/string";
import { useProgram } from "../_hooks/useProgram";
import { useProgramParticipantCounts } from "../_hooks/use-program-participant-counts";
import { useParticipants } from "../participants/_hooks/use-participants";

type ProgramParticipantOverviewProps = {
  programId: string;
};

type OverviewStat = {
  title: string;
  value: number;
  valueClassName: string;
  titleAccessory?: ReactNode;
};

async function copyPhone(phone: string) {
  try {
    await navigator.clipboard.writeText(phone);
    toast.success("Phone copied to clipboard");
  } catch (error) {
    console.error("Failed to copy phone:", error);
    toast.error("Failed to copy phone");
  }
}

function OverviewStatCell({
  title,
  value,
  valueClassName,
  titleAccessory,
}: OverviewStat) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {titleAccessory}
      </div>
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

function PendingParticipantsDialog({
  open,
  onOpenChange,
  participants,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,100dvh)] w-[calc(100%-2rem)] flex-col gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pending Participants</DialogTitle>
          <DialogDescription>
            Participants who still have pending payment status.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`pending-skeleton-${index}`}
                  className="h-14 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          ) : participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending participants.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {participants.map((participant) => {
                const name =
                  toTitleCase(participant.name) || "Unnamed participant";
                const phone = participant.phone?.trim() || null;

                return (
                  <li
                    key={participant.id}
                    className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-sm font-medium">{name}</p>
                    {phone ? (
                      <button
                        type="button"
                        onClick={() => copyPhone(phone)}
                        className="group inline-flex max-w-full items-center gap-1.5 text-left text-sm text-foreground transition-colors hover:text-brand-royal"
                        title="Copy phone"
                      >
                        <Phone
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <span className="tabular-nums">{phone}</span>
                        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100" />
                        <span className="sr-only">Copy phone number</span>
                      </button>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No phone number
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProgramParticipantOverview({
  programId,
}: ProgramParticipantOverviewProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isPendingDialogOpen, setIsPendingDialogOpen] = useState(false);
  const { data: program, isLoading: isProgramLoading } = useProgram(programId);
  const {
    data: counts,
    error,
    isLoading: isCountsLoading,
  } = useProgramParticipantCounts(programId);
  const {
    data: participants = [],
    isLoading: isParticipantsLoading,
  } = useParticipants(programId);

  const pendingParticipants = participants
    .filter((participant) => participant.payment_status === "pending")
    .slice()
    .sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base",
      }),
    );

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
      titleAccessory: (
        <button
          type="button"
          aria-label="Show pending participants"
          onClick={() => setIsPendingDialogOpen(true)}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      ),
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

      {!showWorkshopLayout && (
        <PendingParticipantsDialog
          open={isPendingDialogOpen}
          onOpenChange={setIsPendingDialogOpen}
          participants={pendingParticipants}
          isLoading={isParticipantsLoading}
        />
      )}
    </div>
  );
}
