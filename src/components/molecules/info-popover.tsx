"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type InfoPopoverProps = {
  children: ReactNode;
  title?: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  contentClassName?: string;
  triggerClassName?: string;
  triggerLabel?: string;
};

export function InfoPopover({
  children,
  title,
  align = "start",
  side = "bottom",
  sideOffset = 6,
  contentClassName,
  triggerClassName,
  triggerLabel = "Show details",
}: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={triggerLabel}
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            triggerClassName,
          )}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn("w-80 gap-0 p-0", contentClassName)}
      >
        {title ? (
          <div className="border-b px-3 py-2 text-sm font-medium">{title}</div>
        ) : null}
        <div className="max-h-56 overflow-y-auto p-2">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
