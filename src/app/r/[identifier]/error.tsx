"use client";

interface RegistrationErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RegistrationError({
  error: _error,
  reset,
}: RegistrationErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
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
