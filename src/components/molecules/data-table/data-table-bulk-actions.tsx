"use client";

import * as React from "react";

interface DataTableBulkActionsProps<T> {
  selectedRows: T[];
  onAction?: (selectedRows: T[], action: string) => void;
}

export function DataTableBulkActions<T extends Record<string, any>>({
  selectedRows,
  onAction,
}: DataTableBulkActionsProps<T>) {
  if (selectedRows.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
      <span className="text-sm font-medium">
        {selectedRows.length} item{selectedRows.length !== 1 ? "s" : ""}{" "}
        selected
      </span>
      {/* Add bulk action buttons here if needed */}
    </div>
  );
}
