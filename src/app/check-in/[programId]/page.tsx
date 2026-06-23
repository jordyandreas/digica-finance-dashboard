"use client";

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  CheckInForm,
  type CheckInData,
} from "./_components/check-in-form";

function CheckInPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-premium px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-brand-periwinkle/70 bg-card p-6 shadow-sm">
        <div className="flex justify-center">
          <Image
            src="/logo/logo-digica.webp"
            alt="Digica Academy"
            width={160}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const { programId } = useParams<{ programId: string }>();
  const [data, setData] = React.useState<CheckInData | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!programId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/check-in/${programId}`);
        const result = (await response.json()) as CheckInData & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || "Failed to load check-in page");
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load check-in page";
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

  const canCheckIn =
    (data?.participants.length ?? 0) > 0 && (data?.sessions.length ?? 0) > 0;

  return (
    <CheckInPageShell>
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-7 w-3/4 animate-pulse rounded bg-brand-pale/60" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
      ) : errorMessage ? (
        <div className="space-y-3 text-center">
          <h1 className="text-xl font-semibold text-brand-deep">
            Check-in unavailable
          </h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      ) : data ? (
        <div className="flex flex-col gap-4">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold text-brand-deep">
              {data.program.name}
            </h1>
            {canCheckIn ? (
              <p className="text-sm text-muted-foreground">
                Select your name and session to mark your attendance.
              </p>
            ) : null}
          </div>
          <CheckInForm programId={programId} data={data} />
        </div>
      ) : null}
    </CheckInPageShell>
  );
}
