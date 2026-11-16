"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/molecules/data-table";
import type { LmsCourseListItem } from "@/services/courses.service";
import { coursesColumns } from "./columns";

interface CoursesTableProps {
  data: LmsCourseListItem[];
  onEdit: (course: LmsCourseListItem) => void;
  onPublish: (course: LmsCourseListItem) => void;
  onDelete: (course: LmsCourseListItem) => void;
  publishingCourseId?: string | null;
}

export function CoursesTable({
  data,
  onEdit,
  onPublish,
  onDelete,
  publishingCourseId,
}: CoursesTableProps) {
  const router = useRouter();
  const columns = coursesColumns({
    onEdit,
    onPublish,
    onDelete,
    publishingCourseId,
  });

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(course) => course.id}
      onRowClick={(course) => router.push(`/courses/${course.id}/edit`)}
    />
  );
}
