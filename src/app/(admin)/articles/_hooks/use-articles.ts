"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  getArticleById,
  getArticlesPaginated,
  type ArticlesPaginatedParams,
  type LmsArticle,
} from "@/services/articles.service";

export const articlesQueryKey = ["articles"] as const;

export const articlesPaginatedQueryKey = (
  page: number,
  limit: number,
  status: ArticlesPaginatedParams["status"],
  category: ArticlesPaginatedParams["category"],
  search: string,
) =>
  [
    "articles",
    "paginated",
    page,
    limit,
    status ?? "all",
    category ?? "all",
    search,
  ] as const;

export const articleQueryKey = (id: string) => ["articles", id] as const;

export function useArticlesPaginated(
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  status: ArticlesPaginatedParams["status"] = "all",
  category: ArticlesPaginatedParams["category"] = "all",
  search = "",
) {
  return useQuery({
    queryKey: articlesPaginatedQueryKey(page, limit, status, category, search),
    queryFn: async () => {
      const { data, error } = await getArticlesPaginated({
        page,
        limit,
        status,
        category,
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

export function useArticle(id: string) {
  return useQuery<LmsArticle | null>({
    queryKey: articleQueryKey(id),
    queryFn: async () => {
      const { data, error } = await getArticleById(id);
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: Boolean(id),
  });
}
