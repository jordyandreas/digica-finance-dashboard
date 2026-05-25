"use client";

import * as React from "react";
import { CalendarIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateLabel, parseDateString, toDateString } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  /** Show clear control when a date is set. Default false. */
  clearable?: boolean;
  clearAriaLabel?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  className,
  fromDate,
  toDate,
  clearable = false,
  clearAriaLabel = "Clear date",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateString(value);
  const showClear = clearable && Boolean(value) && !disabled;

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
            {value ? formatDateLabel(value) : placeholder}
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
          onSelect={(date) => {
            onChange(toDateString(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
