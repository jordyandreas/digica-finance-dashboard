"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { cn } from "@/lib/utils";

interface ProgramsTableSkeletonProps {
  rows?: number;
  className?: string;
}

function Pulse({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-muted", className)} />
  );
}

function MetaRowSkeleton({ widthClassName }: { widthClassName: string }) {
  return (
    <div className="flex items-start gap-2">
      <Pulse className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <Pulse className={cn("h-3.5", widthClassName)} />
    </div>
  );
}

function MetaStackSkeleton({
  widths,
}: {
  widths: string[];
}) {
  return (
    <div className="flex flex-col gap-1 py-0.5">
      {widths.map((widthClassName, index) => (
        <MetaRowSkeleton key={index} widthClassName={widthClassName} />
      ))}
    </div>
  );
}

const HEADER_LABELS = [
  "Program Name",
  "Type",
  "Year",
  "Schedule",
  "Students",
  "Price",
  "Status",
  "Actions",
] as const;

export function ProgramsTableSkeleton({
  rows = 5,
  className,
}: ProgramsTableSkeletonProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <Table containerClassName="overflow-visible" className="w-full table-auto">
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            {HEADER_LABELS.map((label) => (
              <TableHead
                key={label}
                className={cn(
                  "w-0 whitespace-nowrap",
                  label === "Actions" &&
                    "sticky right-0 z-20 bg-muted shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)]",
                )}
                style={
                  label === "Students"
                    ? { minWidth: 200 }
                    : label === "Actions"
                      ? { width: 136, minWidth: 136, maxWidth: 136 }
                      : undefined
                }
              >
                <Pulse className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={`programs-skeleton-row-${rowIndex}`}>
              <TableCell className="w-0">
                <Pulse className="h-4 w-40" />
              </TableCell>
              <TableCell className="w-0">
                <MetaStackSkeleton widths={["w-24", "w-20"]} />
              </TableCell>
              <TableCell className="w-0">
                <Pulse className="h-4 w-10" />
              </TableCell>
              <TableCell className="w-0">
                <MetaStackSkeleton widths={["w-28", "w-24", "w-20"]} />
              </TableCell>
              <TableCell className="w-0" style={{ minWidth: 200 }}>
                <MetaStackSkeleton
                  widths={["w-28", "w-16", "w-24", "w-16"]}
                />
              </TableCell>
              <TableCell className="w-0">
                <MetaStackSkeleton widths={["w-24", "w-24", "w-28"]} />
              </TableCell>
              <TableCell className="w-0">
                <Pulse className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell
                className="sticky right-0 z-10 w-0 whitespace-nowrap bg-background shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)]"
                style={{ width: 136, minWidth: 136, maxWidth: 136 }}
              >
                <div className="flex items-center gap-1">
                  <Pulse className="h-8 w-8 shrink-0 rounded-md" />
                  <Pulse className="h-8 w-8 shrink-0 rounded-md" />
                  <Pulse className="h-8 w-8 shrink-0 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
