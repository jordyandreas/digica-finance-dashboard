"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCourseInput,
  CurriculumModuleInput,
  UpdateCourseInput,
} from "@/services/courses.service";
import { courseQueryKey, coursesQueryKey } from "./use-courses";

export function useCourseMutations() {
  const queryClient = useQueryClient();

  const invalidateCourses = async () => {
    await queryClient.invalidateQueries({ queryKey: coursesQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: async (input: CreateCourseInput) => {
      const { createCourse } = await import("@/services/courses.service");
      const { data, error } = await createCourse(input);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: invalidateCourses,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCourseInput;
    }) => {
      const { updateCourse } = await import("@/services/courses.service");
      const { data, error } = await updateCourse(id, input);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateCourses();
      await queryClient.invalidateQueries({
        queryKey: courseQueryKey(variables.id),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { deleteCourse } = await import("@/services/courses.service");
      const { error } = await deleteCourse(id);
      if (error) {
        throw error;
      }
    },
    onSuccess: invalidateCourses,
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { publishCourse } = await import("@/services/courses.service");
      const { data, error } = await publishCourse(id);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: async (_data, id) => {
      await invalidateCourses();
      await queryClient.invalidateQueries({ queryKey: courseQueryKey(id) });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { unpublishCourse } = await import("@/services/courses.service");
      const { data, error } = await unpublishCourse(id);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: async (_data, id) => {
      await invalidateCourses();
      await queryClient.invalidateQueries({ queryKey: courseQueryKey(id) });
    },
  });

  const replaceCurriculumMutation = useMutation({
    mutationFn: async ({
      courseId,
      modules,
    }: {
      courseId: string;
      modules: CurriculumModuleInput[];
    }) => {
      const { replaceCurriculum } = await import("@/services/courses.service");
      const { error } = await replaceCurriculum(courseId, modules);
      if (error) {
        throw error;
      }
    },
    onSuccess: async (_data, variables) => {
      await invalidateCourses();
      await queryClient.invalidateQueries({
        queryKey: courseQueryKey(variables.courseId),
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    publishMutation,
    unpublishMutation,
    replaceCurriculumMutation,
  };
}
