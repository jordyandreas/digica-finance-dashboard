"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toTitleCase } from "@/utils/string";
import type { DashboardOutstandingTenorSummary } from "@/services/dashboard.service";

type OutstandingTenorSectionProps = {
  data: DashboardOutstandingTenorSummary | undefined;
  isLoading: boolean;
  errorMessage?: string | null;
};

export function OutstandingTenorSection({
  data,
  isLoading,
  errorMessage,
}: OutstandingTenorSectionProps) {
  const programs = data?.programs ?? [];
  const totalIncomplete = data?.totalIncomplete ?? 0;

  return (
    <div className="flex h-[380px] flex-col space-y-4">
      <div className="flex min-h-[40px] shrink-0 items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Outstanding Tenor
        </h2>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-brand-periwinkle/60 bg-brand-pale/25">
        <CardHeader className="shrink-0 pb-3">
          <CardTitle className="text-base font-semibold text-brand-deep">
            Follow-up needed
            <span className="ml-2 font-normal text-muted-foreground">
              ({totalIncomplete})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto">
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`tenor-skeleton-${index}`} className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : programs.length === 0 ? (
            <p className="text-sm text-brand-deep/80">
              No incomplete tenor installments for this period.
            </p>
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <OutstandingTenorProgramCard
                  key={program.programId}
                  programId={program.programId}
                  programName={program.programName}
                  totalIncomplete={program.totalIncomplete}
                  groups={program.groups}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OutstandingTenorProgramCard({
  programId,
  programName,
  totalIncomplete,
  groups,
}: {
  programId: string;
  programName: string;
  totalIncomplete: number;
  groups: DashboardOutstandingTenorSummary["programs"][number]["groups"];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-md border border-brand-periwinkle/50 bg-background/70">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand-deep">
            {programName}
          </p>
          <p className="text-xs text-muted-foreground">
            {totalIncomplete} participant
            {totalIncomplete !== 1 ? "s" : ""} incomplete
          </p>
        </div>
        {isOpen ? (
          <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isOpen ? (
        <div className="space-y-3 border-t border-brand-periwinkle/40 px-3 py-3">
          {groups.map((group) => (
            <div key={group.paidTenor} className="space-y-1.5">
              <p className="text-sm font-medium text-brand-deep">
                {group.count} on tenor-{group.paidTenor}
              </p>
              <ul className="grid max-h-36 grid-cols-2 gap-x-4 gap-y-0.5 overflow-y-auto pr-1 text-sm text-brand-deep">
                {group.participants.map((participant) => (
                  <li
                    key={participant.participantId}
                    className="min-w-0 truncate list-disc pl-4 marker:text-brand-deep/70"
                  >
                    {toTitleCase(participant.name)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link href={`/programs/${programId}/payments`}>Open payments</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
