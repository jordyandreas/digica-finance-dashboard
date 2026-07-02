"use client";

import Link from "next/link";
import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { Button } from "@/components/atoms/button";
import { StatusBadge } from "@/components/atoms/status-badge";
import { formatCurrency } from "@/utils/currency";
import {
  formatProgramShortDateRange,
  formatProgramShortTimeRange,
  formatProgramType,
} from "@/utils/programs";
import { Program } from "@/services/programs.service";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface ProgramsColumnsProps {
  onEdit?: (program: Program) => void;
  onDelete?: (program: Program) => void;
}

export function programsColumns({
  onEdit,
  onDelete,
}: ProgramsColumnsProps): ColumnDef<Program>[] {
  return [
    {
      accessorKey: "name",
      header: "Program Name",
      enableSorting: true,
      cell: (program) => (
        <span className="font-medium">
          {program.name || "Untitled Program"}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      enableSorting: true,
      cell: (program) => (
        <span className="truncate capitalize">
          {formatProgramType(program.type)}
        </span>
      ),
    },
    {
      accessorKey: "year",
      header: "Year",
      enableSorting: true,
      cell: (program) => program.year ?? "—",
    },
    {
      accessorKey: "start_date",
      header: "Dates",
      enableSorting: true,
      cell: (program) =>
        formatProgramShortDateRange(program.start_date, program.end_date),
    },
    {
      accessorKey: "start_time",
      header: "Time",
      enableSorting: false,
      cell: (program) => {
        const timeRange = formatProgramShortTimeRange(
          program.start_time,
          program.end_time,
        );
        return timeRange === "—" ? timeRange : `${timeRange} WIB`;
      },
    },
    {
      accessorKey: "session_count",
      header: "Sessions",
      enableSorting: true,
      cell: (program) =>
        program.session_count > 0 ? program.session_count : "—",
    },
    {
      accessorKey: "price",
      header: "Price",
      enableSorting: true,
      className: "text-left",
      cell: (program) => formatCurrency(program.price),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: (program) => <StatusBadge status={program.status || "draft"} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: (program) => (
        <div className="flex items-center gap-2">
          {(() => {
            const programId =
              program.id ??
              (program as { program_id?: string }).program_id ??
              (program as { uuid?: string }).uuid;
            const normalizedProgramId =
              programId != null ? String(programId).trim() : "";
            const isValidProgramId =
              Boolean(normalizedProgramId) &&
              normalizedProgramId !== "undefined" &&
              normalizedProgramId !== "null";

            if (!isValidProgramId) {
              return (
                <Button variant="ghost" size="icon" disabled className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View program details</span>
                </Button>
              );
            }

            return (
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href={`/programs/${normalizedProgramId}/participants`}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View program details</span>
                </Link>
              </Button>
            );
          })()}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(program)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit program</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(program)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete program</span>
            </Button>
          )}
        </div>
      ),
    },
  ];
}
