"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ParticipantProgramCounts,
  getParticipantCountsByProgramId,
} from "@/services/participants.service";

export const programParticipantCountsQueryKey = (programId: string) =>
  ["programs", programId, "participant-counts"] as const;

export function useProgramParticipantCounts(programId: string) {
  return useQuery<ParticipantProgramCounts>({
    queryKey: programParticipantCountsQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await getParticipantCountsByProgramId(programId);
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: Boolean(programId),
  });
}
