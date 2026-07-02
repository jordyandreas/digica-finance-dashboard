"use client";

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AlertCircle, CalendarDays, Clock3, Sparkles } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import {
  RegistrationForm,
  type RegistrationPageData,
} from "./_components/registration-form";
import {
  formatProgramDateRange,
  formatProgramTimeRange,
} from "@/utils/program-public";

function RegistrationPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-premium px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-brand-periwinkle/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-1">
            <Image
              src="/logo/logo-digica.webp"
              alt="Digica Academy"
              width={160}
              height={40}
              className="h-9 w-auto"
              priority
            />
            <p className="text-[11px] text-muted-foreground">Est. 2020</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  const { programId } = useParams<{ programId: string }>();
  const [data, setData] = React.useState<RegistrationPageData | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const sanitizedSummaryHtml = React.useMemo(() => {
    return DOMPurify.sanitize(data?.program.summary_html ?? "");
  }, [data?.program.summary_html]);

  React.useEffect(() => {
    if (!programId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/registration/${programId}`);
        const result = (await response.json()) as RegistrationPageData & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || "Failed to load registration page");
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load registration page";
          setErrorMessage(message);
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
  }, [programId]);

  return (
    <RegistrationPageShell>
      {isLoading ? (
        <div className="space-y-5">
          <div className="space-y-3 rounded-2xl border border-brand-periwinkle/50 bg-muted/20 p-5">
            <div className="mx-auto h-6 w-24 animate-pulse rounded-full bg-brand-pale/60" />
            <div className="mx-auto h-8 w-3/4 animate-pulse rounded bg-brand-pale/60" />
            <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-16 animate-pulse rounded-xl bg-muted" />
              <div className="h-16 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border bg-background/70 p-5">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-brand-pale/60" />
          </div>
        </div>
      ) : errorMessage ? (
        <div className="space-y-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-brand-deep">
            Registration unavailable
          </h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this registration page right now.
          </p>
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      ) : data ? (
        <div className="flex flex-col gap-5">
          <div className="space-y-4 rounded-2xl border border-brand-periwinkle/60 bg-brand-pale/20 p-5 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-periwinkle/50 bg-background/80 px-3 py-1 text-xs font-medium text-brand-deep">
              <Sparkles className="h-3.5 w-3.5" />
              Digica Program Registration
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-brand-deep">
                {data.program.name}
              </h1>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-background/80 px-4 py-3 text-left">
              <div className="min-w-0 flex-1">
                <p className="flex items-start gap-2 text-xs font-medium text-brand-deep sm:text-sm">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    {formatProgramDateRange(
                      data.program.start_date,
                      data.program.end_date,
                    )}
                  </span>
                </p>
              </div>
              <div className="w-px self-stretch bg-border" />
              <div className="min-w-0 flex-1">
                <p className="flex items-start gap-2 text-xs font-medium text-brand-deep sm:text-sm">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    {formatProgramTimeRange(
                      data.program.start_time,
                      data.program.end_time,
                    )}
                  </span>
                </p>
              </div>
            </div>

            {sanitizedSummaryHtml ? (
              <div
                className="rounded-xl border bg-background/80 px-4 py-4 text-left text-sm text-foreground [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-2 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: sanitizedSummaryHtml }}
              />
            ) : null}
          </div>

          <RegistrationForm
            programId={programId}
            registrationLink={data.program.registration_link}
          />
        </div>
      ) : null}
    </RegistrationPageShell>
  );
}
