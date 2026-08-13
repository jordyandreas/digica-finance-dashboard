"use client";

import { useState } from "react";
import { subDays } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getTodayDateString, parseDateString } from "@/lib/date-utils";
import { groupIncompleteTenorCounts } from "@/utils/incomplete-tenor";
import { toTitleCase } from "@/utils/string";
import { useProgram } from "../../_hooks/useProgram";
import { usePayments } from "../_hooks/use-payments";

type TenorFollowUpAlertProps = {
  programId: string;
};

function isBootcampLike(type: string | null | undefined): boolean {
  return type === "bootcamp" || type === "mini_bootcamp";
}

function isWithinFollowUpWindow(startDate: string | null | undefined): boolean {
  const start = parseDateString(startDate);
  if (!start) {
    return false;
  }

  const windowStart = subDays(start, 7);
  const today = parseDateString(getTodayDateString());
  if (!today) {
    return false;
  }

  return today >= windowStart;
}

export function TenorFollowUpAlert({ programId }: TenorFollowUpAlertProps) {
  const { data: program } = useProgram(programId);
  const { data: payments = [] } = usePayments(programId);
  const [isOpen, setIsOpen] = useState(true);

  const incompleteGroups = groupIncompleteTenorCounts(payments);

  const shouldShow =
    isBootcampLike(program?.type) &&
    isWithinFollowUpWindow(program?.start_date) &&
    incompleteGroups.length > 0;

  if (!shouldShow) {
    return null;
  }

  const totalIncomplete = incompleteGroups.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <Card className="border-brand-periwinkle/60 bg-brand-pale/25">
      <CardHeader className={cn("space-y-0", !isOpen && "pb-6")}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          <CardTitle className="text-base font-semibold leading-none tracking-tight text-brand-deep">
            Tenor follow-up
            <span className="ml-2 font-normal text-muted-foreground">
              ({totalIncomplete})
            </span>
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      {isOpen ? (
        <CardContent className="space-y-4">
          <p className="text-sm text-brand-deep">
            Follow up with these participants for their next installment.
          </p>
          <div className="space-y-3">
            {incompleteGroups.map(({ paidTenor, count, participants }) => (
              <div key={paidTenor} className="space-y-1.5">
                <p className="text-sm font-medium text-brand-deep">
                  {count} participant{count !== 1 ? "s" : ""} still on tenor-
                  {paidTenor}
                </p>
                <ul className="list-disc space-y-0.5 pl-5 text-sm text-brand-deep">
                  {participants.map((participant) => (
                    <li key={participant.participantId}>
                      {toTitleCase(participant.name)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
