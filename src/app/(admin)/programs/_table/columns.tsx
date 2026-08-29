"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { Button } from "@/components/atoms/button";
import { StatusBadge } from "@/components/atoms/status-badge";
import { formatCurrency } from "@/utils/currency";
import { formatPaymentStatusLabel } from "@/constants/payment-status";
import { PROGRAM_PRICE_TONE_CLASSES } from "@/constants/registration-offers";
import {
  formatProgramShortDateRange,
  formatProgramShortTimeRange,
  formatProgramType,
  formatScheduleDays,
} from "@/utils/programs";
import {
  ProgramListItem,
  type ProgramType,
} from "@/services/programs.service";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  CalendarDays,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock,
  Clock3,
  Eye,
  GraduationCap,
  Layers,
  LoaderCircle,
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
  valueClassName,
  toneClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  valueClassName?: string;
  toneClassName?: string;
}) {
  return (
    <p className={cn("flex items-start gap-2 text-sm", toneClassName)}>
      <Icon
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          toneClassName ?? "text-muted-foreground",
        )}
        aria-hidden
      />
      <span className="sr-only">{label}: </span>
      <span className={cn("min-w-0 leading-snug", valueClassName)}>{value}</span>
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

function CountValue({ count, label }: { count: number; label: string }) {
  return (
    <>
      <span className="font-semibold">{count}</span> {label}
    </>
  );
}

function StudentsCell({ program }: { program: ProgramListItem }) {
  const totalRow = (
    <IconMetaRow
      icon={Users}
      label="Total students"
      value={
        <CountValue
          count={program.total_student_count}
          label={program.total_student_count === 1 ? "Total student" : "Total students"}
        />
      }
    />
  );

  if (program.type === "workshop") {
    return (
      <div className="flex min-w-[12rem] flex-col gap-1 py-0.5">
        {totalRow}
        <IconMetaRow
          icon={CircleCheck}
          label="Yes"
          toneClassName="text-emerald-700"
          value={
            <CountValue count={program.secure_seat_yes_count} label="Yes" />
          }
        />
        <IconMetaRow
          icon={CircleHelp}
          label="Undecided"
          toneClassName="text-amber-700"
          value={
            <CountValue
              count={program.secure_seat_undecided_count}
              label="Undecided"
            />
          }
        />
        <IconMetaRow
          icon={CircleX}
          label="No"
          toneClassName="text-rose-700"
          value={
            <CountValue count={program.secure_seat_no_count} label="No" />
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-[12rem] flex-col gap-1 py-0.5">
      {totalRow}
      <IconMetaRow
        icon={CircleCheck}
        label="Paid"
        toneClassName="text-emerald-700"
        value={
          <CountValue
            count={program.paid_student_count}
            label={formatPaymentStatusLabel("paid")}
          />
        }
      />
      <IconMetaRow
        icon={LoaderCircle}
        label="On Progress"
        toneClassName="text-sky-700"
        value={
          <CountValue
            count={program.on_progress_student_count}
            label={formatPaymentStatusLabel("on_progress")}
          />
        }
      />
      <IconMetaRow
        icon={Clock}
        label="Pending"
        toneClassName="text-amber-700"
        value={
          <CountValue
            count={program.pending_student_count}
            label={formatPaymentStatusLabel("pending")}
          />
        }
      />
    </div>
  );
}

interface ProgramsColumnsProps {
  onEdit?: (program: ProgramListItem) => void;
  onDelete?: (program: ProgramListItem) => void;
}

export function programsColumns({
  onEdit,
  onDelete,
}: ProgramsColumnsProps): ColumnDef<ProgramListItem>[] {
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
        const TypeIcon = PROGRAM_TYPE_ICONS[program.type] ?? GraduationCap;
        const sessionLabel =
          program.session_count > 0
            ? `${program.session_count} ${program.session_count === 1 ? "session" : "sessions"}`
            : "—";

        return (
          <div className="flex min-w-[8rem] flex-col gap-1 py-0.5">
            <IconMetaRow
              icon={TypeIcon}
              label="Type"
              value={formatProgramType(program.type)}
              valueClassName="capitalize"
            />
            <IconMetaRow
              icon={BookOpen}
              label="Sessions"
              value={sessionLabel}
            />
          </div>
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
      accessorKey: "total_student_count",
      header: "Students",
      enableSorting: true,
      size: 200,
      minSize: 200,
      cell: (program) => <StudentsCell program={program} />,
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
              toneClassName={PROGRAM_PRICE_TONE_CLASSES.default}
              value={formatCurrency(program.price)}
            />
            <IconMetaRow
              icon={User}
              label="Individual"
              toneClassName={PROGRAM_PRICE_TONE_CLASSES.individual}
              value={formatOptionalCurrency(program.promo_individual_price)}
            />
            <IconMetaRow
              icon={Users}
              label="Bareng Teman"
              toneClassName={PROGRAM_PRICE_TONE_CLASSES.bareng_teman}
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
