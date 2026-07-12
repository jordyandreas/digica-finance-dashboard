"use client";

import { Search } from "lucide-react";

import { PAYMENT_STATUS_ALL } from "@/constants/payment-status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: DataTableFilterOption[];
  statusPlaceholder?: string;
  secondaryFilter?: string;
  onSecondaryFilterChange?: (value: string) => void;
  secondaryFilterOptions?: DataTableFilterOption[];
  secondaryFilterPlaceholder?: string;
  secondaryFilterAllValue?: string;
  className?: string;
}

const inputClassName =
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function DataTableFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  status,
  onStatusChange,
  statusOptions,
  statusPlaceholder = "Payment status",
  secondaryFilter,
  onSecondaryFilterChange,
  secondaryFilterOptions,
  secondaryFilterPlaceholder = "Filter",
  secondaryFilterAllValue = "all",
  className,
}: DataTableFiltersProps) {
  const selectedStatusLabel = statusOptions?.find(
    (option) => option.value === status,
  )?.label;
  const selectedSecondaryLabel = secondaryFilterOptions?.find(
    (option) => option.value === secondaryFilter,
  )?.label;

  const showStatusFilter = Boolean(statusOptions && onStatusChange);
  const showSecondaryFilter = Boolean(
    secondaryFilterOptions && onSecondaryFilterChange,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="relative w-full sm:w-1/3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className={cn(inputClassName, "pl-9")}
        />
      </div>

      {showStatusFilter || showSecondaryFilter ? (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {showStatusFilter ? (
            <div className="w-full shrink-0 sm:w-56">
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger>
                  {status === PAYMENT_STATUS_ALL ? (
                    <span className="text-muted-foreground">
                      {statusPlaceholder}
                    </span>
                  ) : (
                    <SelectValue>{selectedStatusLabel}</SelectValue>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {statusOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {showSecondaryFilter ? (
            <div className="w-full shrink-0 sm:w-56">
              <Select
                value={secondaryFilter}
                onValueChange={onSecondaryFilterChange}
              >
                <SelectTrigger>
                  {secondaryFilter === secondaryFilterAllValue ? (
                    <span className="text-muted-foreground">
                      {secondaryFilterPlaceholder}
                    </span>
                  ) : (
                    <SelectValue>{selectedSecondaryLabel}</SelectValue>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {secondaryFilterOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
