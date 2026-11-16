"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GrantEntitlementInput,
  UpdateEntitlementInput,
} from "@/services/entitlements.service";
import { entitlementsQueryKey } from "./use-entitlements";

export function useEntitlementMutations() {
  const queryClient = useQueryClient();

  const invalidateEntitlements = async () => {
    await queryClient.invalidateQueries({ queryKey: entitlementsQueryKey });
  };

  const grantMutation = useMutation({
    mutationFn: async (input: GrantEntitlementInput) => {
      const { grantEntitlement } = await import(
        "@/services/entitlements.service"
      );
      const { data, error } = await grantEntitlement(input);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: invalidateEntitlements,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateEntitlementInput;
    }) => {
      const { updateEntitlement } = await import(
        "@/services/entitlements.service"
      );
      const { data, error } = await updateEntitlement(id, input);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: invalidateEntitlements,
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { revokeEntitlement } = await import(
        "@/services/entitlements.service"
      );
      const { data, error } = await revokeEntitlement(id);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: invalidateEntitlements,
  });

  return { grantMutation, updateMutation, revokeMutation };
}
