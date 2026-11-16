"use client";

import { Pencil, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { StatusBadge } from "@/components/atoms/status-badge";
import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { COURSE_LEVEL_LABELS } from "@/constants/course-levels";
import type { LmsCourseListItem } from "@/services/courses.service";
import { formatDateTime } from "@/utils/date";

interface CoursesColumnsProps {
  onEdit: (course: LmsCourseListItem) => void;
  onPublish: (course: LmsCourseListItem) => void;
  onDelete: (course: LmsCourseListItem) => void;
  publishingCourseId?: string | null;
}

export function coursesColumns({
  onEdit,
  onPublish,
  onDelete,
  publishingCourseId,
}: CoursesColumnsProps): ColumnDef<LmsCourseListItem>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
      cell: (course) => (
        <span className="font-medium">{course.title || "Untitled"}</span>
      ),
    },
    {
      accessorKey: "level",
      header: "Level",
      enableSorting: true,
      cell: (course) => (
        <span className="text-muted-foreground">
          {COURSE_LEVEL_LABELS[course.level] ?? course.level}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: (course) => <StatusBadge status={course.status} />,
    },
    {
      accessorKey: "price_label",
      header: "Price",
      enableSorting: true,
      cell: (course) => (
        <span className="text-muted-foreground">
          {course.price_label || "—"}
        </span>
      ),
    },
    {
      accessorKey: "lesson_count",
      header: "Curriculum",
      enableSorting: true,
      cell: (course) => (
        <span className="tabular-nums text-muted-foreground">
          {course.module_count} modules · {course.lesson_count} lessons
        </span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      enableSorting: true,
      cell: (course) => (
        <span className="font-mono text-xs text-muted-foreground">
          {course.slug}
        </span>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      enableSorting: true,
      cell: (course) => formatDateTime(course.updated_at),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (course) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(course);
            }}
            aria-label={`Edit ${course.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {course.status === "draft" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={publishingCourseId === course.id}
              title={`Publish ${course.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onPublish(course);
              }}
              aria-label={`Publish ${course.title}`}
            >
              <Send className="h-4 w-4 text-emerald-600" />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={course.status === "published"}
            title={
              course.status === "published"
                ? "Unpublish the course before deleting it"
                : `Delete ${course.title}`
            }
            onClick={(event) => {
              event.stopPropagation();
              onDelete(course);
            }}
            aria-label={`Delete ${course.title}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}
