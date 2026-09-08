"use client";

import { useQuery } from "@tanstack/react-query";
import { getProgramPublicContent } from "@/services/program-public-content.service";

export const programPublicContentQueryKey = (programId: string) =>
  ["programs", programId, "public-content"] as const;

export function useProgramPublicContent(programId: string) {
  return useQuery({
    queryKey: programPublicContentQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getProgramPublicContent(programId);
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: Boolean(programId),
  });
}
