"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  getEntitlementsPaginated,
  type EntitlementsPaginatedParams,
} from "@/services/entitlements.service";

export const entitlementsQueryKey = ["entitlements"] as const;

export const entitlementsPaginatedQueryKey = (
  page: number,
  limit: number,
  courseId: string,
  status: EntitlementsPaginatedParams["status"],
  search: string,
) =>
  [
    "entitlements",
    "paginated",
    page,
    limit,
    courseId,
    status ?? "all",
    search,
  ] as const;

export function useEntitlementsPaginated(
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  courseId = "all",
  status: EntitlementsPaginatedParams["status"] = "all",
  search = "",
) {
  return useQuery({
    queryKey: entitlementsPaginatedQueryKey(
      page,
      limit,
      courseId,
      status,
      search,
    ),
    queryFn: async () => {
      const { data, error } = await getEntitlementsPaginated({
        page,
        limit,
        courseId,
        status,
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
