"use client";

import { Search, X } from "lucide-react";

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
  tertiaryFilter?: string;
  onTertiaryFilterChange?: (value: string) => void;
  tertiaryFilterOptions?: DataTableFilterOption[];
  tertiaryFilterPlaceholder?: string;
  tertiaryFilterAllValue?: string;
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
  tertiaryFilter,
  onTertiaryFilterChange,
  tertiaryFilterOptions,
  tertiaryFilterPlaceholder = "Filter",
  tertiaryFilterAllValue = "all",
  className,
}: DataTableFiltersProps) {
  const selectedStatusLabel = statusOptions?.find(
    (option) => option.value === status,
  )?.label;
  const selectedSecondaryLabel = secondaryFilterOptions?.find(
    (option) => option.value === secondaryFilter,
  )?.label;
  const selectedTertiaryLabel = tertiaryFilterOptions?.find(
    (option) => option.value === tertiaryFilter,
  )?.label;

  const showStatusFilter = Boolean(statusOptions && onStatusChange);
  const showSecondaryFilter = Boolean(
    secondaryFilterOptions && onSecondaryFilterChange,
  );
  const showTertiaryFilter = Boolean(
    tertiaryFilterOptions && onTertiaryFilterChange,
  );

  const filterSelectClassName = "w-full shrink-0 sm:w-44";

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
          className={cn(
            inputClassName,
            "pl-9 [&::-moz-search-clear-button]:hidden [&::-webkit-search-cancel-button]:hidden",
            search ? "pr-9" : undefined,
          )}
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-royal transition-colors hover:text-brand-deep"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {showStatusFilter || showSecondaryFilter || showTertiaryFilter ? (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {showStatusFilter ? (
            <div className={filterSelectClassName}>
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
            <div className={filterSelectClassName}>
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

          {showTertiaryFilter ? (
            <div className={filterSelectClassName}>
              <Select
                value={tertiaryFilter}
                onValueChange={onTertiaryFilterChange}
              >
                <SelectTrigger>
                  {tertiaryFilter === tertiaryFilterAllValue ? (
                    <span className="text-muted-foreground">
                      {tertiaryFilterPlaceholder}
                    </span>
                  ) : (
                    <SelectValue>{selectedTertiaryLabel}</SelectValue>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {tertiaryFilterOptions?.map((option) => (
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
