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
  formatScheduleDays,
} from "@/utils/programs";
import { Program, type ProgramType } from "@/services/programs.service";
import {
  Calendar,
  CalendarDays,
  Clock3,
  Eye,
  GraduationCap,
  Layers,
  Pencil,
  Presentation,
  Tag,
  Trash2,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function IconMetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <p className="flex items-start gap-2 text-sm">
      <Icon
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <span className="sr-only">{label}: </span>
      <span className="min-w-0 leading-snug">{value}</span>
    </p>
  );
}

const PROGRAM_TYPE_ICONS: Record<ProgramType, LucideIcon> = {
  bootcamp: GraduationCap,
  mini_bootcamp: Layers,
  workshop: Presentation,
};

const BOOTCAMP_TYPES = new Set<ProgramType>(["bootcamp", "mini_bootcamp"]);

function formatOptionalCurrency(amount: number | null | undefined): string {
  return amount != null ? formatCurrency(amount) : "—";
}

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
      cell: (program) => {
        const TypeIcon = PROGRAM_TYPE_ICONS[program.type];
        return (
          <span className="inline-flex items-center gap-2 capitalize">
            {TypeIcon ? (
              <TypeIcon
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            ) : null}
            <span className="truncate">{formatProgramType(program.type)}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "year",
      header: "Year",
      enableSorting: true,
      cell: (program) => program.year ?? "—",
    },
    {
      accessorKey: "start_date",
      header: "Schedule",
      enableSorting: true,
      cell: (program) => {
        const dayLabel = formatScheduleDays(program.schedule_days) ?? "—";
        const dateLabel = formatProgramShortDateRange(
          program.start_date,
          program.end_date,
        );
        const timeRange = formatProgramShortTimeRange(
          program.start_time,
          program.end_time,
        );
        const timeLabel =
          timeRange === "—" ? timeRange : `${timeRange} WIB`;

        return (
          <div className="flex min-w-[11rem] flex-col gap-1 py-0.5">
            <IconMetaRow icon={CalendarDays} label="Day" value={dayLabel} />
            <IconMetaRow icon={Calendar} label="Date" value={dateLabel} />
            <IconMetaRow icon={Clock3} label="Time" value={timeLabel} />
          </div>
        );
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
      cell: (program) => {
        if (!BOOTCAMP_TYPES.has(program.type)) {
          return formatCurrency(0);
        }

        return (
          <div className="flex min-w-[9rem] flex-col gap-1 py-0.5">
            <IconMetaRow
              icon={Tag}
              label="Default"
              value={formatCurrency(program.price)}
            />
            <IconMetaRow
              icon={User}
              label="Individual"
              value={formatOptionalCurrency(program.promo_individual_price)}
            />
            <IconMetaRow
              icon={Users}
              label="Bareng Teman"
              value={formatOptionalCurrency(program.promo_bareng_teman_price)}
            />
          </div>
        );
      },
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
      // 3 icon buttons (view + edit + delete) + cell padding; default sticky width is 88px
      size: 136,
      minSize: 136,
      maxSize: 136,
      cell: (program) => (
        <div className="flex items-center gap-1">
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
                <Button variant="ghost" size="icon" disabled className="h-8 w-8 shrink-0">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View program details</span>
                </Button>
              );
            }

            return (
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
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
              className="h-8 w-8 shrink-0"
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
              className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
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
