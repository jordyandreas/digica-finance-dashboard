"use client";

import { useQuery } from "@tanstack/react-query";
import { getProgramById } from "@/services/programs.service";

export const programQueryKey = (id: string) => ["programs", id] as const;

export function useProgram(id: string) {
  return useQuery({
    queryKey: programQueryKey(id),
    queryFn: async () => {
      const { data, error } = await getProgramById(id);
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: Boolean(id),
  });
}
