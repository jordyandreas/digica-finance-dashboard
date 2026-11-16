"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  getCourseById,
  getCourseOptions,
  getCoursesPaginated,
  type CoursesPaginatedParams,
  type LmsCourseDetail,
} from "@/services/courses.service";

export const coursesQueryKey = ["courses"] as const;

export const coursesPaginatedQueryKey = (
  page: number,
  limit: number,
  status: CoursesPaginatedParams["status"],
  level: CoursesPaginatedParams["level"],
  search: string,
) =>
  [
    "courses",
    "paginated",
    page,
    limit,
    status ?? "all",
    level ?? "all",
    search,
  ] as const;

export const courseQueryKey = (id: string) => ["courses", id] as const;
export const courseOptionsQueryKey = ["courses", "options"] as const;

export function useCoursesPaginated(
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  status: CoursesPaginatedParams["status"] = "all",
  level: CoursesPaginatedParams["level"] = "all",
  search = "",
) {
  return useQuery({
    queryKey: coursesPaginatedQueryKey(page, limit, status, level, search),
    queryFn: async () => {
      const { data, error } = await getCoursesPaginated({
        page,
        limit,
        status,
        level,
        search,
      });
      if (error) {
        throw error;
      }
      return data!;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCourse(id: string) {
  return useQuery<LmsCourseDetail | null>({
    queryKey: courseQueryKey(id),
    queryFn: async () => {
      const { data, error } = await getCourseById(id);
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCourseOptions() {
  return useQuery({
    queryKey: courseOptionsQueryKey,
    queryFn: async () => {
      const { data, error } = await getCourseOptions();
      if (error) {
        throw error;
      }
      return data ?? [];
    },
  });
}
