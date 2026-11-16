"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackButton } from "@/components/atoms/back-button";
import { Button } from "@/components/atoms/button";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Card } from "@/components/ui/card";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import { COURSE_LEVEL_LABELS } from "@/constants/course-levels";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import { validateCurriculum, type CourseFormValues } from "@/schemas/course-schema";
import {
  getCourseById,
  getCourseBySlug,
  type LmsCourseDetail,
} from "@/services/courses.service";
import {
  CurriculumEditor,
  mapCourseToCurriculumDraft,
  mapCurriculumDraftToInput,
  type ModuleDraftState,
} from "./curriculum-editor";
import { CourseForm } from "./course-form";
import {
  mapFormValuesToInput,
  useCourseEditorForm,
} from "../_hooks/use-course-editor-form";
import { getMutationErrorMessage } from "../_hooks/use-courses-actions";
import { useCourseMutations } from "../_hooks/use-course-mutations";

interface CourseEditorProps {
  course?: LmsCourseDetail | null;
  isCreate?: boolean;
}

export function CourseEditor({ course, isCreate = false }: CourseEditorProps) {
  const router = useRouter();
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    publishMutation,
    unpublishMutation,
    replaceCurriculumMutation,
  } = useCourseMutations();
  const deleteConfirmation = useDeleteConfirmation({
    title: "Delete this course?",
    description: "This cannot be undone.",
  });

  const { form, setSlugTouched, validateForm } = useCourseEditorForm({
    course,
    isCreate,
  });

  const [curriculum, setCurriculum] = useState<ModuleDraftState[]>(() =>
    course ? mapCourseToCurriculumDraft(course) : [],
  );

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    replaceCurriculumMutation.isPending;

  const isPublished = !isCreate && course?.status === "published";

  const ensureUniqueSlug = async (slug: string, excludeId?: string) => {
    const { data: existing, error } = await getCourseBySlug(slug, excludeId);
    if (error) {
      throw error;
    }
    if (existing) {
      form.setError("slug", { message: "This slug is already in use" });
      return false;
    }
    return true;
  };

  const getValidatedValues = async (): Promise<CourseFormValues | null> => {
    const values = validateForm();
    if (!values) {
      toast.error("Please fix the form errors");
      return null;
    }
    const slugOk = await ensureUniqueSlug(values.slug, course?.id);
    return slugOk ? values : null;
  };

  const handleCreate = async (publish: boolean) => {
    try {
      const values = await getValidatedValues();
      if (!values) return;

      const created = await createMutation.mutateAsync({
        ...mapFormValuesToInput(values),
        status: publish ? "published" : "draft",
      });
      toast.success(publish ? "Course published" : "Draft saved");
      router.push(created ? `/courses/${created.id}/edit` : "/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(
        getMutationErrorMessage(error, "Failed to save course. Please try again."),
      );
    }
  };

  const handleSaveDetails = async () => {
    if (!course) return;
    try {
      const values = await getValidatedValues();
      if (!values) return;

      await updateMutation.mutateAsync({
        id: course.id,
        input: mapFormValuesToInput(values),
      });
      toast.success("Changes saved");
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error(
        getMutationErrorMessage(error, "Failed to save course. Please try again."),
      );
    }
  };

  const handlePublishToggle = async () => {
    if (!course) return;
    try {
      if (isPublished) {
        await unpublishMutation.mutateAsync(course.id);
        toast.success("Course unpublished");
      } else {
        await publishMutation.mutateAsync(course.id);
        toast.success("Course published");
      }
    } catch (error) {
      console.error("Error changing course status:", error);
      toast.error(
        getMutationErrorMessage(error, "Failed to update course status."),
      );
    }
  };

  const handleSaveCurriculum = async () => {
    if (!course) return;

    const problem = validateCurriculum(curriculum);
    if (problem) {
      toast.error(problem);
      return;
    }

    try {
      await replaceCurriculumMutation.mutateAsync({
        courseId: course.id,
        modules: mapCurriculumDraftToInput(curriculum),
      });

      // Reload so new rows get their real ids before the next save.
      const { data: fresh } = await getCourseById(course.id);
      if (fresh) {
        setCurriculum(mapCourseToCurriculumDraft(fresh));
      }
      toast.success("Curriculum saved");
    } catch (error) {
      console.error("Error saving curriculum:", error);
      toast.error(
        getMutationErrorMessage(
          error,
          "Failed to save curriculum. Reload the page and try again.",
        ),
      );
    }
  };

  const handleDelete = async () => {
    if (!course) return;

    if (course.status === "published") {
      toast.error("Unpublish the course before deleting it");
      return;
    }

    try {
      await deleteMutation.mutateAsync(course.id);
      toast.success("Course deleted");
      router.push("/courses");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(getMutationErrorMessage(error, "Failed to delete course."));
      deleteConfirmation.closeConfirmation();
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex w-full flex-col items-start gap-4">
          <BackButton href="/courses" />
          <div className="w-full space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {isCreate ? "New course" : "Edit course"}
            </h1>
            {!isCreate && course ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-periwinkle/50 bg-brand-pale/20 px-3 py-2">
                <StatusBadge status={course.status} />
                <span className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
                  {COURSE_LEVEL_LABELS[course.level]}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <Card className="p-6">
          <CourseForm form={form} onSlugManualEdit={() => setSlugTouched(true)} />
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            {isCreate ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => handleCreate(false)}
                >
                  Save draft
                </Button>
                <Button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleCreate(true)}
                >
                  Publish
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  disabled={isBusy}
                  onClick={handleSaveDetails}
                >
                  Save details
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={handlePublishToggle}
                >
                  {isPublished ? "Unpublish" : "Publish"}
                </Button>
              </>
            )}
          </div>

          {!isCreate && course ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isBusy || isPublished}
              title={
                isPublished
                  ? "Unpublish the course before deleting it"
                  : undefined
              }
              onClick={() =>
                deleteConfirmation.openConfirmation(
                  course,
                  `Delete "${course.title}"?`,
                  "This removes the course, its modules, and lessons. Courses with entitlements cannot be deleted.",
                )
              }
            >
              Delete
            </Button>
          ) : null}
        </div>

        {isCreate ? (
          <p className="text-sm text-muted-foreground">
            Save the course first, then add modules and lessons on the edit page.
          </p>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Curriculum
                </h2>
                <p className="text-sm text-muted-foreground">
                  Modules and lessons are saved separately from course details.
                </p>
              </div>
              <Button
                type="button"
                disabled={isBusy}
                onClick={handleSaveCurriculum}
              >
                Save curriculum
              </Button>
            </div>

            <CurriculumEditor
              modules={curriculum}
              onChange={setCurriculum}
              disabled={isBusy}
            />
          </section>
        )}
      </div>

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setOpen}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
