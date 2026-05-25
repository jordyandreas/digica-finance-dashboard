"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDateTimeDisplay,
  formatDateTimeLocalString,
  parseDateTimeString,
} from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export interface DateTimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  clearable?: boolean;
  clearAriaLabel?: string;
}

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "Select date and time",
  disabled,
  className,
  fromDate,
  toDate,
  clearable = false,
  clearAriaLabel = "Clear date and time",
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateTimeString(value);
  const timeValue = selected
    ? format(selected, "HH:mm")
    : value.includes("T")
      ? (value.split("T")[1]?.slice(0, 5) ?? "")
      : "";
  const showClear = clearable && Boolean(value) && !disabled;

  const updateValue = (date: Date | undefined, time: string) => {
    if (!date) {
      onChange("");
      return;
    }

    const [hours = "0", minutes = "0"] = time.split(":");
    const next = new Date(date);
    next.setHours(Number(hours), Number(minutes), 0, 0);
    onChange(formatDateTimeLocalString(next));
  };

  const handleClear = (
    event: React.MouseEvent | React.PointerEvent | React.KeyboardEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onChange("");
    setOpen(false);
  };

  return (
    <Popover
      modal={false}
      open={disabled ? false : open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!value}
          className={cn(
            "h-9 w-full justify-between rounded-md px-3 font-normal shadow-sm",
            "data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {selected ? formatDateTimeDisplay(selected) : placeholder}
          </span>
          {showClear ? (
            <span
              role="button"
              tabIndex={0}
              aria-label={clearAriaLabel}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleClear}
              onPointerDown={handleClear}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  handleClear(event);
                }
              }}
            >
              <XIcon className="size-4" aria-hidden />
            </span>
          ) : (
            <CalendarIcon
              className="size-4 shrink-0 opacity-60"
              aria-hidden
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="z-[200] block w-fit p-0 shadow-md"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex w-fit flex-col gap-3 p-3">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            captionLayout="dropdown"
            hideNavigation
            autoFocus={false}
            startMonth={fromDate}
            endMonth={toDate}
            disabled={[
              ...(fromDate ? [{ before: fromDate }] : []),
              ...(toDate ? [{ after: toDate }] : []),
            ]}
            onSelect={(date) =>
              updateValue(date, timeValue || format(new Date(), "HH:mm"))
            }
          />
          <div className="border-t pt-3">
            <label
              htmlFor={id ? `${id}-time` : undefined}
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Time
            </label>
            <input
              id={id ? `${id}-time` : undefined}
              type="time"
              value={timeValue}
              disabled={disabled || !selected}
              onChange={(event) =>
                updateValue(selected, event.target.value)
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
