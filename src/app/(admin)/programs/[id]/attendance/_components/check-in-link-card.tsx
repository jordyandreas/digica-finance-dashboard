"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Typography } from "@/components/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveRegistrationLink } from "@/utils/program-public";

interface CheckInLinkCardProps {
  programId: string;
  registrationLink?: string | null;
}

interface LinkRowProps {
  label: string;
  url: string;
  fallback: string;
  successMessage: string;
  onCopy: (url: string, successMessage: string) => void;
}

function LinkRow({ label, url, fallback, successMessage, onCopy }: LinkRowProps) {
  return (
    <div className="space-y-1.5">
      <Typography variant="label">{label}</Typography>
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
        <p className="min-w-0 flex-1 break-all text-sm">{url || fallback}</p>
        <button
          type="button"
          onClick={() => onCopy(url, successMessage)}
          disabled={!url}
          aria-label={`Copy ${label.toLowerCase()}`}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function CheckInLinkCard({
  programId,
  registrationLink,
}: CheckInLinkCardProps) {
  const [checkInUrl, setCheckInUrl] = React.useState("");
  const [origin, setOrigin] = React.useState("");

  React.useEffect(() => {
    setOrigin(window.location.origin);
    setCheckInUrl(`${window.location.origin}/check-in/${programId}`);
  }, [programId]);

  const registrationUrl = resolveRegistrationLink(
    programId,
    registrationLink,
    origin,
  );

  const handleCopy = async (url: string, successMessage: string) => {
    if (!url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success(successMessage);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Public Participant Links</CardTitle>
        <Typography variant="caption" className="text-muted-foreground">
          Share the registration link before class starts, and use the check-in
          link on class day after session dates are set.
        </Typography>
      </CardHeader>
      <CardContent className="space-y-4">
        <LinkRow
          label="Registration link"
          url={registrationUrl}
          fallback={`/registration/${programId}`}
          successMessage="Registration link copied to clipboard"
          onCopy={handleCopy}
        />
        <LinkRow
          label="Check-in link"
          url={checkInUrl}
          fallback={`/check-in/${programId}`}
          successMessage="Check-in link copied to clipboard"
          onCopy={handleCopy}
        />
      </CardContent>
    </Card>
  );
}
