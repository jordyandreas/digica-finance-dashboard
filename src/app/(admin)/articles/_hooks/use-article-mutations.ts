"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateArticleInput } from "@/services/articles.service";
import {
  articleQueryKey,
  articlesQueryKey,
  articlesPaginatedQueryKey,
} from "./use-articles";

export function useArticleMutations() {
  const queryClient = useQueryClient();

  const invalidateArticles = async () => {
    await queryClient.invalidateQueries({ queryKey: articlesQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: async (input: CreateArticleInput) => {
      const { createArticle } = await import("@/services/articles.service");
      const { data, error } = await createArticle(input);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: invalidateArticles,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CreateArticleInput>;
    }) => {
      const { updateArticle } = await import("@/services/articles.service");
      const { data, error } = await updateArticle(id, input);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateArticles();
      await queryClient.invalidateQueries({
        queryKey: articleQueryKey(variables.id),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { deleteArticle } = await import("@/services/articles.service");
      const { error } = await deleteArticle(id);
      if (error) {
        throw error;
      }
    },
    onSuccess: invalidateArticles,
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { publishArticle } = await import("@/services/articles.service");
      const { data, error } = await publishArticle(id);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: async (_data, id) => {
      await invalidateArticles();
      await queryClient.invalidateQueries({ queryKey: articleQueryKey(id) });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { unpublishArticle } = await import("@/services/articles.service");
      const { data, error } = await unpublishArticle(id);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: async (_data, id) => {
      await invalidateArticles();
      await queryClient.invalidateQueries({ queryKey: articleQueryKey(id) });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    publishMutation,
    unpublishMutation,
    invalidateArticles,
    articlesPaginatedQueryKey,
  };
}
