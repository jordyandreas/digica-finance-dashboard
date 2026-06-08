"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnDef, type DataTableColumnMeta } from "./data-table.types";
import { DataTableEmptyPlaceholder } from "./data-table-empty-placeholder";
import { toTanStackColumns } from "./data-table-columns";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string | number;
  emptyPlaceholder?: React.ReactNode;
}

function getColumnMeta(meta: unknown): DataTableColumnMeta {
  if (meta && typeof meta === "object") {
    return meta as DataTableColumnMeta;
  }
  return {};
}

function getColumnSizingStyle<TData>(column: Column<TData, unknown>) {
  const meta = getColumnMeta(column.columnDef.meta);
  const { minSize, maxSize, size } = column.columnDef;

  if (meta.isActions) {
    return {
      width: size,
      minWidth: minSize,
      maxWidth: maxSize,
    };
  }

  return {
    minWidth: minSize,
    maxWidth: maxSize,
  };
}

export function DataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  emptyPlaceholder,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const tanstackColumns = React.useMemo(
    () => toTanStackColumns(columns),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(keyExtractor(row)),
    defaultColumn: {
      size: 0,
      minSize: 60,
      maxSize: 480,
    },
  });

  const getSortIcon = (isSorted: false | "asc" | "desc") => {
    if (!isSorted) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />;
    }
    if (isSorted === "asc") {
      return <ChevronUp className="ml-2 h-4 w-4 shrink-0" />;
    }
    return <ChevronDown className="ml-2 h-4 w-4 shrink-0" />;
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table containerClassName="overflow-visible" className="w-full table-auto">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-muted/30 hover:bg-muted/30"
            >
              {headerGroup.headers.map((header) => {
                const meta = getColumnMeta(header.column.columnDef.meta);
                const canSort = header.column.getCanSort();

                return (
                  <TableHead
                    key={header.id}
                    style={getColumnSizingStyle(header.column)}
                    className={cn(
                      meta.isActions
                        ? "sticky right-0 z-20 whitespace-nowrap bg-muted shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)]"
                        : "w-0 whitespace-nowrap",
                      meta.className,
                      canSort &&
                        "cursor-pointer select-none hover:bg-muted/50 transition-colors",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {canSort
                        ? getSortIcon(header.column.getIsSorted())
                        : null}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
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
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="group">
                {row.getVisibleCells().map((cell) => {
                  const meta = getColumnMeta(cell.column.columnDef.meta);

                  return (
                    <TableCell
                      key={cell.id}
                      style={getColumnSizingStyle(cell.column)}
                      className={cn(
                        meta.isActions
                          ? "sticky right-0 z-10 whitespace-nowrap bg-background shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)] group-hover:bg-muted"
                          : "w-0",
                        meta.className,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
