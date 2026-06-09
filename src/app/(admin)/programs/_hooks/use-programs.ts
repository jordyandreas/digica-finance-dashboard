"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type Program,
  getPrograms,
  getProgramsPaginated,
} from "@/services/programs.service";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";

export const programsQueryKey = ["programs"] as const;

export const programsPaginatedQueryKey = (
  page: number,
  limit: number,
  year?: number,
) => ["programs", "paginated", page, limit, year ?? "all"] as const;

export function usePrograms() {
  return useQuery<Program[]>({
    queryKey: programsQueryKey,
    queryFn: async () => {
      const { data, error } = await getPrograms();
      if (error) {
        throw error;
      }
      return data ?? [];
    },
  });
}

export function useProgramsPaginated(
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  year?: number,
) {
  return useQuery({
    queryKey: programsPaginatedQueryKey(page, limit, year),
    queryFn: async () => {
      const { data, error } = await getProgramsPaginated({
        page,
        limit,
        year,
      });
      if (error) {
        throw error;
      }
      return data!;
    },
  });
}
