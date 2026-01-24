"use client";

import { useQuery } from "@tanstack/react-query";
import { getParticipants } from "@/services/participants.service";

export const participantsQueryKey = (programId: string) =>
  ["participants", programId] as const;

export function useParticipants(programId: string) {
  return useQuery({
    queryKey: participantsQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getParticipants(programId);
      console.log(data);
      if (error) {
        throw error;
      }
      return data ?? [];
    },
    enabled: Boolean(programId),
  });
}
