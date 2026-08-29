"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type Program,
  type ProgramListItem,
  getActivePrograms,
  getPrograms,
  getProgramsPaginated,
} from "@/services/programs.service";
import { getParticipantCountsByProgramIds } from "@/services/participants.service";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";

export const programsQueryKey = ["programs"] as const;

export const programsPaginatedQueryKey = (
  page: number,
  limit: number,
  year?: number,
) => ["programs", "paginated", page, limit, year ?? "all"] as const;

export const activeProgramsQueryKey = (limit: number) =>
  ["programs", "active", limit] as const;

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

      const programs = data!.data;
      const { data: counts, error: countsError } =
        await getParticipantCountsByProgramIds(
          programs.map((program) => program.id),
        );
      if (countsError) {
        throw countsError;
      }

      const programsWithCounts: ProgramListItem[] = programs.map(
        (program) => ({
          ...program,
          total_student_count: counts[program.id]?.total ?? 0,
          paid_student_count: counts[program.id]?.paid ?? 0,
          on_progress_student_count: counts[program.id]?.on_progress ?? 0,
          pending_student_count: counts[program.id]?.pending ?? 0,
          secure_seat_yes_count: counts[program.id]?.secure_seat_yes ?? 0,
          secure_seat_undecided_count:
            counts[program.id]?.secure_seat_undecided ?? 0,
          secure_seat_no_count: counts[program.id]?.secure_seat_no ?? 0,
        }),
      );

      return {
        ...data!,
        data: programsWithCounts,
      };
    },
  });
}

export function useActivePrograms(limit = 5) {
  return useQuery<Program[]>({
    queryKey: activeProgramsQueryKey(limit),
    queryFn: async () => {
      const { data, error } = await getActivePrograms(limit);
      if (error) {
        throw error;
      }
      return data ?? [];
    },
    staleTime: 60_000,
  });
}
