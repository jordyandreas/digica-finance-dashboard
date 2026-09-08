"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type Program,
  type ProgramListItem,
  type ProgramStatus,
  type ProgramType,
  getActivePrograms,
  getPrograms,
  getProgramsPaginated,
} from "@/services/programs.service";
import { getParticipantCountsByProgramIds } from "@/services/participants.service";
import { getPaymentDerivedTotalsByProgramIds } from "@/services/dashboard.service";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";

export const programsQueryKey = ["programs"] as const;

export type ProgramsListFilters = {
  year?: number;
  search?: string;
  type?: ProgramType;
  status?: ProgramStatus;
};

export const programsPaginatedQueryKey = (
  page: number,
  limit: number,
  filters: ProgramsListFilters = {},
) =>
  [
    "programs",
    "paginated",
    page,
    limit,
    filters.year ?? "all",
    filters.search?.trim() || "",
    filters.type ?? "all",
    filters.status ?? "all",
  ] as const;

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
  filters: ProgramsListFilters = {},
) {
  return useQuery({
    queryKey: programsPaginatedQueryKey(page, limit, filters),
    queryFn: async () => {
      const { data, error } = await getProgramsPaginated({
        page,
        limit,
        year: filters.year,
        search: filters.search,
        type: filters.type,
        status: filters.status,
      });
      if (error) {
        throw error;
      }

      const programs = data!.data;
      const programIds = programs.map((program) => program.id);
      const [{ data: counts, error: countsError }, { data: totals, error: totalsError }] =
        await Promise.all([
          getParticipantCountsByProgramIds(programIds),
          getPaymentDerivedTotalsByProgramIds(programIds),
        ]);
      if (countsError) {
        throw countsError;
      }
      if (totalsError) {
        throw totalsError;
      }

      const programsWithCounts: ProgramListItem[] = programs.map(
        (program) => {
          const revenue = totals[program.id]?.revenue ?? 0;
          const expense = totals[program.id]?.expense ?? 0;
          return {
            ...program,
            total_student_count: counts[program.id]?.total ?? 0,
            paid_student_count: counts[program.id]?.paid ?? 0,
            on_progress_student_count: counts[program.id]?.on_progress ?? 0,
            pending_student_count: counts[program.id]?.pending ?? 0,
            secure_seat_yes_count: counts[program.id]?.secure_seat_yes ?? 0,
            secure_seat_undecided_count:
              counts[program.id]?.secure_seat_undecided ?? 0,
            secure_seat_no_count: counts[program.id]?.secure_seat_no ?? 0,
            total_revenue: revenue,
            total_expense: expense,
            net_profit: revenue - expense,
          };
        },
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
