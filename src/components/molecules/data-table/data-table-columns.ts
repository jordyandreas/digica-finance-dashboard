import {
  type ColumnDef as TanStackColumnDef,
  type Row,
} from "@tanstack/react-table";
import { type ColumnDef, type DataTableColumnMeta } from "./data-table.types";

const ACTIONS_COLUMN_SIZE = 88;

function isActionsColumn<T>(column: ColumnDef<T>) {
  return column.id === "actions" || column.accessorKey === "actions";
}

export function toTanStackColumns<T extends object>(
  columns: ColumnDef<T>[],
): TanStackColumnDef<T, unknown>[] {
  return columns.map((column) => {
    const id = column.id ?? String(column.accessorKey);
    const isActions = isActionsColumn(column);

    return {
      id,
      accessorKey: column.accessorKey as string | undefined,
      header: column.header,
      enableSorting: column.enableSorting !== false && Boolean(column.accessorKey),
      size: column.size ?? (isActions ? ACTIONS_COLUMN_SIZE : 0),
      minSize: column.minSize ?? (isActions ? ACTIONS_COLUMN_SIZE : 60),
      maxSize: column.maxSize ?? (isActions ? ACTIONS_COLUMN_SIZE : 480),
      cell: ({ row }: { row: Row<T> }) => {
        if (column.cell) {
          return column.cell(row.original);
        }

        if (!column.accessorKey) {
          return "-";
        }

        const value = row.original[column.accessorKey];
        return value == null ? "-" : String(value);
      },
      meta: {
        className: column.className,
        isActions,
      } satisfies DataTableColumnMeta,
    };
  });
}
