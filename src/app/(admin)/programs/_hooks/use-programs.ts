"use client";

import { useQuery } from "@tanstack/react-query";
import { type Program, getPrograms } from "@/services/programs.service";

export const programsQueryKey = ["programs"] as const;

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
