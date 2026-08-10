"use client";

import { useState } from "react";
import { Typography } from "@/components/atoms";
import { Button } from "@/components/atoms/button";
import { emptyFallback } from "@/utils/string";
import { cn } from "@/lib/utils";

const SEE_MORE_CHAR_LIMIT = 30;

interface SeeMoreTextProps {
  text?: string | null;
}

export function SeeMoreText({ text }: SeeMoreTextProps) {
  const [expanded, setExpanded] = useState(false);
  const normalized = `${text ?? ""}`.trim();
  const display = emptyFallback(normalized);

  if (display === "-") {
    return (
      <Typography variant="body3" className="truncate normal-case">
        {display}
      </Typography>
    );
  }

  const needsToggle = normalized.length > SEE_MORE_CHAR_LIMIT;
  const visibleText =
    needsToggle && !expanded
      ? `${normalized.slice(0, SEE_MORE_CHAR_LIMIT)}…`
      : display;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Typography
        variant="body3"
        className={cn(
          "normal-case",
          expanded ? "whitespace-pre-wrap wrap-break-word" : "truncate",
        )}
      >
        {visibleText}
      </Typography>
      {needsToggle ? (
        <Button
          type="button"
          variant="link"
          className="h-auto justify-start p-0 text-xs font-medium normal-case"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "See Less" : "See More"}
        </Button>
      ) : null}
    </div>
  );
}
