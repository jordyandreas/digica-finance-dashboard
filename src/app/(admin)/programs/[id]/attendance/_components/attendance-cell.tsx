"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import type { AttendanceStatus } from "@/constants/attendance-status";
import { cn } from "@/lib/utils";

interface AttendanceCellProps {
  status: AttendanceStatus | null;
  disabled?: boolean;
  onChange: (status: AttendanceStatus | null) => void;
}

export function AttendanceCell({
  status,
  disabled,
  onChange,
}: AttendanceCellProps) {
  return (
    <div className="flex gap-1">
      <Button
        type="button"
        size="icon"
        variant={status === "present" ? "default" : "outline"}
        disabled={disabled}
        className={cn(
          "h-8 w-8 shrink-0",
          status === "present" && "bg-green-600 hover:bg-green-600/90",
        )}
        onClick={() => onChange(status === "present" ? null : "present")}
        aria-label="Present"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant={status === "absent" ? "default" : "outline"}
        disabled={disabled}
        className={cn(
          "h-8 w-8 shrink-0",
          status === "absent" && "bg-destructive hover:bg-destructive/90",
        )}
        onClick={() => onChange(status === "absent" ? null : "absent")}
        aria-label="Absent"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
