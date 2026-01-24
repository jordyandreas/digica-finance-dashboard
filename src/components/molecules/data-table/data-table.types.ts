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
  cell?: (value: T) => React.ReactNode;
  enableSorting?: boolean;
  className?: string;
}
