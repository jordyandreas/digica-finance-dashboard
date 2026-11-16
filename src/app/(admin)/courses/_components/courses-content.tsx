"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import {
  DataTableFilters,
  DataTablePaginationControl,
  DataTableSkeleton,
} from "@/components/molecules/data-table";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import {
  COURSE_LEVEL_ALL,
  COURSE_LEVEL_FILTER_OPTIONS,
  COURSE_STATUS_FILTER_OPTIONS,
} from "@/constants/course-levels";
import type { LmsCourseListItem } from "@/services/courses.service";
import { type PaginationMeta } from "@/types/pagination";
import { CoursesTable } from "../_table";
import { useCoursesActions } from "../_hooks/use-courses-actions";

interface CoursesContentProps {
  courses: LmsCourseListItem[];
  pagination?: PaginationMeta;
  page: number;
  limit: number;
  search: string;
  statusFilter: string;
  levelFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  error?: Error | null;
  isPending?: boolean;
  isFetching?: boolean;
}

export function CoursesContent({
  courses,
  pagination,
  page,
  limit,
  search,
  statusFilter,
  levelFilter,
  onSearchChange,
  onStatusFilterChange,
  onLevelFilterChange,
  onPageChange,
  onLimitChange,
  error,
  isPending = false,
  isFetching = false,
}: CoursesContentProps) {
  const {
    handleEdit,
    handlePublish,
    handleDelete,
    handleConfirmDelete,
    publishingCourseId,
    deleteConfirmation,
    isDeletePending,
  } = useCoursesActions();
  const showSkeleton = isPending && courses.length === 0;
  const total = pagination?.total ?? courses.length;

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground">
              Total {total} course{total === 1 ? "" : "s"}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/courses/new">
              <Plus className="h-4 w-4" />
              New course
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          <DataTableFilters
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search title, slug, or instructor"
            status={statusFilter}
            onStatusChange={onStatusFilterChange}
            statusOptions={[...COURSE_STATUS_FILTER_OPTIONS]}
            statusPlaceholder="Status"
            secondaryFilter={levelFilter}
            onSecondaryFilterChange={onLevelFilterChange}
            secondaryFilterOptions={[...COURSE_LEVEL_FILTER_OPTIONS]}
            secondaryFilterPlaceholder="Level"
            secondaryFilterAllValue={COURSE_LEVEL_ALL}
          />

          <Card
            className={
              isFetching && !showSkeleton
                ? "opacity-60 transition-opacity"
                : undefined
            }
          >
            {error ? (
              <div className="border-destructive/50 bg-destructive/10 px-4 py-6 text-sm">
                <p className="font-medium text-destructive">
                  Error loading courses
                </p>
                <p className="mt-1 text-muted-foreground">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </div>
            ) : showSkeleton ? (
              <DataTableSkeleton rows={limit} columns={7} />
            ) : (
              <>
                <CoursesTable
                  data={courses}
                  onEdit={handleEdit}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                  publishingCourseId={publishingCourseId}
                />
                <DataTablePaginationControl
                  currentPage={pagination?.page ?? page}
                  totalPages={pagination?.total_page ?? 1}
                  onPageChange={onPageChange}
                  pageSize={limit}
                  onPageSizeChange={onLimitChange}
                />
              </>
            )}
          </Card>
        </div>
      </div>

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setOpen}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletePending}
      />
    </>
  );
}
