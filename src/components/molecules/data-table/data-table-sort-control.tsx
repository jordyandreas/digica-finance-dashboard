"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortConfig, SortDirection, ColumnDef } from "./data-table.types";

interface DataTableSortControlProps<T> {
  columns: ColumnDef<T>[];
  sortConfig: SortConfig<T>;
  onSortChange: (config: SortConfig<T>) => void;
}

export function DataTableSortControl<T extends Record<string, any>>({
  columns,
  sortConfig,
  onSortChange,
}: DataTableSortControlProps<T>) {
  const handleSort = (key: keyof T) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        onSortChange({ key, direction: "desc" });
      } else if (sortConfig.direction === "desc") {
        onSortChange({ key: null, direction: null });
      }
    } else {
      onSortChange({ key, direction: "asc" });
    }
  };

  const getSortIcon = (columnKey: keyof T) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  const sortableColumns = columns.filter(
    (col) => col.enableSorting !== false && col.accessorKey
  );

  if (sortableColumns.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      {sortableColumns.map((column, index) => {
        const columnKey = column.accessorKey!;
        const isActive = sortConfig.key === columnKey;
        return (
          <button
            key={index}
            onClick={() => handleSort(columnKey)}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent hover:text-accent-foreground border-border"
            )}
          >
            {column.header}
            {getSortIcon(columnKey)}
          </button>
        );
      })}
    </div>
  );
}
