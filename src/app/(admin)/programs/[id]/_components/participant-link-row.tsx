"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Typography } from "@/components/atoms/typography";

interface ParticipantLinkRowProps {
  label: string;
  url: string;
  fallback?: string;
  emptyLabel?: string;
  successMessage: string;
}

export function ParticipantLinkRow({
  label,
  url,
  fallback,
  emptyLabel,
  successMessage,
}: ParticipantLinkRowProps) {
  const displayValue = url || fallback || emptyLabel || "";
  const canCopy = Boolean(url);

  const handleCopy = async () => {
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
    <div className="space-y-1.5">
      <Typography variant="label">{label}</Typography>
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
        <p
          className={`min-w-0 flex-1 break-all text-sm ${
            canCopy ? "" : "text-muted-foreground"
          }`}
        >
          {displayValue}
        </p>
        {canCopy ? (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${label.toLowerCase()}`}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <Copy className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
