"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import type { LmsCourse } from "@/services/courses.service";
import { useCourseMutations } from "./use-course-mutations";

export function getMutationErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}

export function useCoursesActions() {
  const router = useRouter();
  const [publishingCourseId, setPublishingCourseId] = useState<string | null>(
    null,
  );
  const { deleteMutation, publishMutation } = useCourseMutations();
  const deleteConfirmation = useDeleteConfirmation<LmsCourse>({
    title: "Delete this course?",
    description: "This cannot be undone.",
  });

  const handleEdit = (course: LmsCourse) => {
    router.push(`/courses/${course.id}/edit`);
  };

  const handlePublish = async (course: LmsCourse) => {
    setPublishingCourseId(course.id);
    try {
      await publishMutation.mutateAsync(course.id);
      toast.success(`"${course.title}" published`);
    } catch (publishError) {
      console.error("Error publishing course:", publishError);
      toast.error(
        getMutationErrorMessage(
          publishError,
          "Failed to publish course. Please try again.",
        ),
      );
    } finally {
      setPublishingCourseId(null);
    }
  };

  const handleDelete = (course: LmsCourse) => {
    if (course.status === "published") {
      toast.error("Unpublish the course before deleting it");
      return;
    }

    deleteConfirmation.openConfirmation(
      course,
      `Delete "${course.title}"?`,
      "This removes the course, its modules, and lessons. Courses with entitlements cannot be deleted.",
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.item) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteConfirmation.item.id);
      toast.success("Course deleted");
      deleteConfirmation.closeConfirmation();
    } catch (deleteError) {
      console.error("Error deleting course:", deleteError);
      toast.error(
        getMutationErrorMessage(
          deleteError,
          "Failed to delete course. Please try again.",
        ),
      );
    }
  };

  return {
    handleEdit,
    handlePublish,
    handleDelete,
    handleConfirmDelete,
    publishingCourseId,
    deleteConfirmation,
    isDeletePending: deleteMutation.isPending,
  };
}
