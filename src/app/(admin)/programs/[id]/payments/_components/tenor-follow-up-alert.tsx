"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Phone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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

async function copyPhone(phone: string) {
  try {
    await navigator.clipboard.writeText(phone);
    toast.success("Phone copied to clipboard");
  } catch (error) {
    console.error("Failed to copy phone:", error);
    toast.error("Failed to copy phone");
  }
}

export function TenorFollowUpAlert({ programId }: TenorFollowUpAlertProps) {
  const { data: program } = useProgram(programId);
  const { data: payments = [] } = usePayments(programId);
  const [isOpen, setIsOpen] = useState(true);

  const incompleteGroups = groupIncompleteTenorCounts(payments);

  const shouldShow =
    isBootcampLike(program?.type) && incompleteGroups.length > 0;

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
          className="flex w-full items-center justify-between rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                <ul className="space-y-1.5">
                  {participants.map((participant) => (
                    <li
                      key={participant.participantId}
                      className="flex flex-col gap-0.5 rounded-md border border-brand-periwinkle/40 bg-background/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-sm font-medium text-brand-deep">
                        {toTitleCase(participant.name)}
                      </p>
                      {participant.phone ? (
                        <button
                          type="button"
                          onClick={() => copyPhone(participant.phone!)}
                          className="group inline-flex max-w-full items-center gap-1.5 text-left text-sm text-brand-deep transition-colors hover:text-brand-royal"
                          title="Copy phone"
                        >
                          <Phone
                            className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          <span className="tabular-nums">
                            {participant.phone}
                          </span>
                          <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100" />
                          <span className="sr-only">Copy phone number</span>
                        </button>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No phone number
                        </p>
                      )}
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
