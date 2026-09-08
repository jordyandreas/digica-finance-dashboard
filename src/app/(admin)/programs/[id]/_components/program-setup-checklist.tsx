"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  ExternalLink,
} from "lucide-react";
import type { ProgramModalProps } from "@/app/(admin)/programs/_modals/add-program";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";
import { buildProgramSetupChecklist } from "@/utils/program-setup-checklist";
import { useProgramSessions } from "../attendance/_hooks/use-attendance";
import { useProgramPublicContent } from "../_hooks/use-program-public-content";
import { useProgram } from "../_hooks/useProgram";

type ProgramSetupChecklistProps = {
  programId: string;
};

export function ProgramSetupChecklist({
  programId,
}: ProgramSetupChecklistProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { data: program, isLoading: isProgramLoading } = useProgram(programId);
  const { data: sessions = [], isLoading: isSessionsLoading } =
    useProgramSessions(programId, program?.session_count ?? 0);
  const { data: publicContent, isLoading: isPublicContentLoading } =
    useProgramPublicContent(programId);
  const programModal = useModal<ProgramModalProps>("programModal");

  const isLoading =
    isProgramLoading || isSessionsLoading || isPublicContentLoading;
  const items = buildProgramSetupChecklist({
    program,
    sessions,
    publicContent,
  });
  const missingCount = items.filter((item) => !item.ok).length;

  return (
    <Card>
      <CardHeader className={cn("space-y-0", !isOpen && "pb-6")}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CardTitle className="text-xl font-semibold leading-none tracking-tight">
            Setup checklist
            {!isLoading && missingCount > 0 ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({missingCount} remaining)
              </span>
            ) : null}
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      {isOpen ? (
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`checklist-skeleton-${index}`}
                  className="h-10 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Program details are still loading.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    {item.ok ? (
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                        aria-hidden
                      />
                    ) : (
                      <Circle
                        className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                        aria-hidden
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                  {item.action === "edit_program" && program ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() =>
                        programModal.open({
                          program,
                          duplicateFrom: null,
                        })
                      }
                    >
                      Edit Program
                    </Button>
                  ) : null}
                  {item.action === "attendance" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      asChild
                    >
                      <Link href={`/programs/${programId}/attendance`}>
                        Set dates
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}
