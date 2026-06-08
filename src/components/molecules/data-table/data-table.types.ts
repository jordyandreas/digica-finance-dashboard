import * as React from "react";

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export interface ColumnDef<T> {
  id?: string;
  accessorKey?: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  enableSorting?: boolean;
  className?: string;
  /** Default column width in pixels (TanStack Table) */
  size?: number;
  /** Minimum column width in pixels (TanStack Table) */
  minSize?: number;
  /** Maximum column width in pixels (TanStack Table) */
  maxSize?: number;
}

export interface DataTableColumnMeta {
  className?: string;
  isActions?: boolean;
}
