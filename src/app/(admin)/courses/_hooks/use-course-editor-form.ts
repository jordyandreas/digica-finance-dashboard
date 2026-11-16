"use client";

import * as React from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import {
  buildDefaultCourseFormValues,
  courseFormSchema,
  outcomesToInput,
  parseOptionalInt,
  parseOutcomesInput,
  type CourseFormValues,
} from "@/schemas/course-schema";
import type {
  CreateCourseInput,
  LmsCourse,
} from "@/services/courses.service";
import { slugifyFromTitle } from "@/utils/slugify";

export function mapCourseToFormValues(course: LmsCourse): CourseFormValues {
  return {
    title: course.title,
    slug: course.slug,
    description: course.description ?? "",
    level: course.level,
    price_label: course.price_label ?? "",
    compare_at_price_label: course.compare_at_price_label ?? "",
    price_idr: course.price_idr != null ? String(course.price_idr) : "",
    is_purchasable: course.is_purchasable,
    whatsapp_offer_message: course.whatsapp_offer_message ?? "",
    sessions: course.sessions != null ? String(course.sessions) : "",
    instructor_name: course.instructor_name ?? "",
    instructor_credentials: course.instructor_credentials ?? "",
    instructor_avatar_url: course.instructor_avatar_url ?? "",
    outcomes: outcomesToInput(course.outcomes),
  };
}

export function mapFormValuesToInput(
  values: CourseFormValues,
): Omit<CreateCourseInput, "status"> {
  const nullable = (value: string) => value.trim() || null;
  return {
    slug: values.slug,
    title: values.title,
    description: values.description,
    level: values.level,
    price_label: nullable(values.price_label),
    compare_at_price_label: nullable(values.compare_at_price_label),
    price_idr: parseOptionalInt(values.price_idr),
    is_purchasable: values.is_purchasable,
    whatsapp_offer_message: nullable(values.whatsapp_offer_message),
    sessions: parseOptionalInt(values.sessions),
    instructor_name: nullable(values.instructor_name),
    instructor_credentials: nullable(values.instructor_credentials),
    instructor_avatar_url: nullable(values.instructor_avatar_url),
    outcomes: parseOutcomesInput(values.outcomes),
  };
}

interface UseCourseEditorFormOptions {
  course?: LmsCourse | null;
  isCreate?: boolean;
}

export function useCourseEditorForm({
  course,
  isCreate = false,
}: UseCourseEditorFormOptions) {
  const [slugTouched, setSlugTouched] = React.useState(!isCreate);

  const form = useForm<CourseFormValues>({
    defaultValues: course
      ? mapCourseToFormValues(course)
      : buildDefaultCourseFormValues(),
  });

  const title = form.watch("title");

  React.useEffect(() => {
    if (!isCreate || slugTouched || !title.trim()) {
      return;
    }
    form.setValue("slug", slugifyFromTitle(title), { shouldDirty: true });
  }, [form, isCreate, slugTouched, title]);

  const validateForm = () => {
    form.clearErrors();
    const parsed = courseFormSchema.safeParse(form.getValues());

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          form.setError(field as keyof CourseFormValues, {
            message: issue.message,
          });
        }
      }
      return null;
    }

    return parsed.data;
  };

  return { form, setSlugTouched, validateForm };
}

export type CourseEditorForm = UseFormReturn<CourseFormValues>;
