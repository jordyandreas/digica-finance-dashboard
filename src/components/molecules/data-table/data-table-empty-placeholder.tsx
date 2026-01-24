"use client";

import * as React from "react";

interface DataTableEmptyPlaceholderProps {
  children?: React.ReactNode;
}

export function DataTableEmptyPlaceholder({
  children,
}: DataTableEmptyPlaceholderProps) {
  const defaultPlaceholder = (
    <div className="py-12 text-center">
      <p className="text-muted-foreground">No Data Found</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Add data to get started.
      </p>
    </div>
  );

  return <>{children || defaultPlaceholder}</>;
}
