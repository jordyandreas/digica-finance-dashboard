"use client";

import * as React from "react";
import { Check, FileCheck, Minus, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUSES,
  type AttendanceStatus,
} from "@/constants/attendance-status";
import { cn } from "@/lib/utils";

interface AttendanceCellProps {
  status: AttendanceStatus | null;
  disabled?: boolean;
  onChange: (status: AttendanceStatus | null) => void;
}

const STATUS_CHIP_STYLES: Record<AttendanceStatus, string> = {
  present: "border-green-600/30 bg-green-600 text-white hover:bg-green-600/90",
  absent:
    "border-destructive/30 bg-destructive text-white hover:bg-destructive/90",
  leave: "border-amber-600/30 bg-amber-600 text-white hover:bg-amber-600/90",
};

const STATUS_OPTION_STYLES: Record<AttendanceStatus, string> = {
  present: "text-green-700 hover:bg-green-50",
  absent: "text-destructive hover:bg-destructive/10",
  leave: "text-amber-700 hover:bg-amber-50",
};

function StatusIcon({
  status,
  className,
}: {
  status: AttendanceStatus | null;
  className?: string;
}) {
  if (status === "present") {
    return <Check className={className} />;
  }
  if (status === "absent") {
    return <X className={className} />;
  }
  if (status === "leave") {
    return <FileCheck className={className} />;
  }
  return <Minus className={className} />;
}

export function AttendanceCell({
  status,
  disabled,
  onChange,
}: AttendanceCellProps) {
  const [open, setOpen] = React.useState(false);

  const selectStatus = (nextStatus: AttendanceStatus | null) => {
    onChange(nextStatus);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) {
          return;
        }
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-8 w-8 shrink-0",
            status
              ? STATUS_CHIP_STYLES[status]
              : "border-dashed text-muted-foreground",
          )}
          aria-label={
            status
              ? ATTENDANCE_STATUS_LABELS[status]
              : "Mark attendance"
          }
        >
          <StatusIcon status={status} className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-44 gap-0.5 p-1">
        {ATTENDANCE_STATUSES.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
              STATUS_OPTION_STYLES[option],
              status === option && "bg-muted font-medium",
            )}
            onClick={() => selectStatus(option)}
          >
            <StatusIcon status={option} className="h-4 w-4 shrink-0" />
            {ATTENDANCE_STATUS_LABELS[option]}
          </button>
        ))}
        {status !== null ? (
          <button
            type="button"
            disabled={disabled}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
            onClick={() => selectStatus(null)}
          >
            <Minus className="h-4 w-4 shrink-0" />
            Clear
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
