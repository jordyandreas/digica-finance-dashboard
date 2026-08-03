"use client";

import * as React from "react";
import Link from "next/link";
import type { CheckInTodayProgram } from "@/types/check-in-today";
import { formatProgramType } from "@/utils/programs";
import { resolvePublicIdentifier } from "@/utils/program-public-link";

function formatProgramMeta(program: CheckInTodayProgram): string {
  const parts = [formatProgramType(program.type)];
  if (program.batch != null) {
    parts.push(`Batch ${program.batch}`);
  }
  parts.push(`Session ${program.session_number}`);
  return parts.join(" · ");
}

export function CheckInTodayProgramPicker() {
  const [programs, setPrograms] = React.useState<CheckInTodayProgram[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(false);

      try {
        const response = await fetch("/api/check-in");
        const result = (await response.json()) as {
          programs?: CheckInTodayProgram[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || "Failed to load today's programs");
        }

        if (!cancelled) {
          setPrograms(result.programs ?? []);
        }
      } catch {
        if (!cancelled) {
          setPrograms([]);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2 pt-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-1 border-t border-brand-periwinkle/40 pt-4 text-left">
        <p className="text-sm font-medium text-brand-deep">
          Checking in today?
        </p>
        <p className="text-xs text-muted-foreground">
          Couldn&apos;t load today&apos;s programs. Ask your admin for the
          correct attendance link.
        </p>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="space-y-1 border-t border-brand-periwinkle/40 pt-4 text-left">
        <p className="text-sm font-medium text-brand-deep">
          Checking in today?
        </p>
        <p className="text-xs text-muted-foreground">
          No programs have a session scheduled for today. Double-check the link
          or contact your admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-brand-periwinkle/40 pt-4 text-left">
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-deep">
          Checking in today?
        </p>
        <p className="text-xs text-muted-foreground">
          Choose your program below to open the correct attendance link.
        </p>
      </div>
      <ul className="space-y-2">
        {programs.map((program) => {
          const identifier = resolvePublicIdentifier(program);

          return (
            <li key={program.id}>
              <Link
                href={`/c/${encodeURIComponent(identifier)}`}
                className="flex w-full flex-col gap-0.5 rounded-lg border border-brand-periwinkle/50 bg-brand-pale/20 px-3 py-2.5 text-left transition-colors hover:border-brand-royal/50 hover:bg-brand-pale/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-medium text-brand-deep">
                  {program.name}
                </span>
                <span className="text-xs capitalize text-muted-foreground">
                  {formatProgramMeta(program)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
