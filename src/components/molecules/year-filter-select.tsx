"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROGRAM_YEAR_OPTIONS,
  YEAR_FILTER_ALL,
  type YearFilterValue,
} from "@/constants/dashboard-year";
import { cn } from "@/lib/utils";

interface YearFilterSelectProps {
  value: YearFilterValue;
  onChange: (value: YearFilterValue) => void;
  className?: string;
}

export function YearFilterSelect({
  value,
  onChange,
  className,
}: YearFilterSelectProps) {
  return (
    <div className={cn("w-full sm:w-40", className)}>
      <Select
        value={value === YEAR_FILTER_ALL ? YEAR_FILTER_ALL : String(value)}
        onValueChange={(nextValue) =>
          onChange(
            nextValue === YEAR_FILTER_ALL
              ? YEAR_FILTER_ALL
              : Number(nextValue),
          )
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={YEAR_FILTER_ALL}>All</SelectItem>
          {PROGRAM_YEAR_OPTIONS.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
