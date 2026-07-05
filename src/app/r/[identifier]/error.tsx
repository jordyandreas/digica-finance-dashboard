"use client";

import { useEffect } from "react";

interface RegistrationErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RegistrationError({
  error,
  reset,
}: RegistrationErrorProps) {
  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7435/ingest/5fd01bb4-894f-413f-b437-bb736c271def", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "7b4354",
      },
      body: JSON.stringify({
        sessionId: "7b4354",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "r/[identifier]/error.tsx:useEffect",
        message: "Registration page render error caught",
        data: {
          errorMessage: error.message,
          digest: error.digest ?? null,
          errorName: error.name,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.error("[debug-7b4354] registration page error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6 text-center"
      data-debug-error={error.message}
      data-debug-digest={error.digest ?? ""}
    >
      <div className="space-y-3">
        <h1 className="text-lg font-semibold">Registration unavailable</h1>
        <p className="text-sm text-muted-foreground">
          Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
