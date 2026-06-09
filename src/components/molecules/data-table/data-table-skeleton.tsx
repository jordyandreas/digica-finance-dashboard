"use client";

import { cn } from "@/lib/utils";

interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function DataTableSkeleton({
  rows = 5,
  columns = 5,
  className,
}: DataTableSkeletonProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="w-full min-w-[640px]">
        <div className="flex gap-4 border-b bg-muted/30 px-4 py-3">
          {Array.from({ length: columns }).map((_, index) => (
            <div
              key={`header-${index}`}
              className="h-4 flex-1 animate-pulse rounded bg-muted"
            />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-4 px-4 py-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="h-4 flex-1 animate-pulse rounded bg-muted/80"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
