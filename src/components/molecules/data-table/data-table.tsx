"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import {
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SortConfig, ColumnDef } from "./data-table.types";
import { DataTableEmptyPlaceholder } from "./data-table-empty-placeholder";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string | number;
  emptyPlaceholder?: React.ReactNode;
}

export function DataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  emptyPlaceholder,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig<T>>({
    key: null,
    direction: null,
  });

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { key: null, direction: null };
        }
      }
      return { key, direction: "asc" };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (sortConfig.direction === "asc") {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [data, sortConfig]);

  const getSortIcon = (columnKey: keyof T) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === "asc") {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === "desc") {
      return <ChevronDown className="ml-2 h-4 w-4" />;
    }
    return <ChevronsUpDown className="ml-2 h-4 w-4" />;
  };

  const isActionsColumn = (column: ColumnDef<T>) =>
    column.id === "actions" || column.accessorKey === "actions";

  return (
    <div className="overflow-x-auto">
      <Table className="w-full table-auto">
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => {
              const isSortable =
                column.enableSorting !== false && column.accessorKey;
              const isActions = isActionsColumn(column);
              return (
                <TableHead
                  key={index}
                  className={cn(
                    column.className,
                    isSortable &&
                      "cursor-pointer select-none hover:bg-muted/50 transition-colors",
                    isActions &&
                      "sticky right-0 z-20 bg-background whitespace-nowrap shadow-[-12px_0_12px_-12px_rgba(0,0,0,0.12)]"
                  )}
                  onClick={() =>
                    isSortable && column.accessorKey
                      ? handleSort(column.accessorKey)
                      : undefined
                  }
                >
                  <div className="flex items-center">
                    {column.header}
                    {isSortable && getSortIcon(column.accessorKey!)}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                <DataTableEmptyPlaceholder>
                  {emptyPlaceholder}
                </DataTableEmptyPlaceholder>
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row) => (
              <TableRow key={keyExtractor(row)}>
                {columns.map((column, index) => {
                  const value = column.accessorKey
                    ? row[column.accessorKey]
                    : null;
                  const isActions = isActionsColumn(column);
                  return (
                    <TableCell
                      key={index}
                      className={cn(
                        column.className,
                        isActions &&
                          "sticky right-0 z-10 bg-background whitespace-nowrap w-[1%] shadow-[-12px_0_12px_-12px_rgba(0,0,0,0.12)]"
                      )}
                    >
                      {column.cell ? column.cell(row) : String(value ?? "-")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
