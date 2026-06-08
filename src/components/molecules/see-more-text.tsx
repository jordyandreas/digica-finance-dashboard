"use client";

import { useEffect, useRef, useState } from "react";
import { Typography } from "@/components/atoms";
import { Button } from "@/components/atoms/button";
import { emptyFallback } from "@/utils/string";
import { cn } from "@/lib/utils";

interface SeeMoreTextProps {
  text?: string | null;
}

export function SeeMoreText({ text }: SeeMoreTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const normalized = `${text ?? ""}`.trim();
  const display = emptyFallback(normalized);

  useEffect(() => {
    const el = textRef.current;
    if (!el || display === "-" || expanded) {
      return;
    }

    const checkOverflow = () => {
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);

    return () => observer.disconnect();
  }, [display, expanded]);

  if (display === "-") {
    return (
      <Typography variant="body3" className="truncate normal-case">
        {display}
      </Typography>
    );
  }

  const showToggle = expanded || isOverflowing;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Typography
        ref={textRef}
        variant="body3"
        className={cn(
          "normal-case",
          expanded ? "whitespace-pre-wrap wrap-break-word" : "truncate",
        )}
      >
        {display}
      </Typography>
      {showToggle ? (
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
