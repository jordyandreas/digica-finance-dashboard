"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import type { LmsArticle } from "@/services/articles.service";
import { canDeleteArticle, canPublishArticle } from "@/utils/article-rules";
import { useArticleMutations } from "./use-article-mutations";

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}

export function useArticlesActions() {
  const router = useRouter();
  const [publishingArticleId, setPublishingArticleId] = useState<string | null>(
    null,
  );
  const { deleteMutation, publishMutation } = useArticleMutations();
  const deleteConfirmation = useDeleteConfirmation<LmsArticle>({
    title: "Delete this article?",
    description: "This cannot be undone.",
  });

  const handleEdit = (article: LmsArticle) => {
    router.push(`/articles/${article.id}/edit`);
  };

  const handlePublish = async (article: LmsArticle) => {
    if (!canPublishArticle(article)) {
      return;
    }

    setPublishingArticleId(article.id);
    try {
      await publishMutation.mutateAsync(article.id);
      toast.success(`"${article.title}" published`);
    } catch (publishError) {
      console.error("Error publishing article:", publishError);
      toast.error(
        getMutationErrorMessage(
          publishError,
          "Failed to publish article. Please try again.",
        ),
      );
    } finally {
      setPublishingArticleId(null);
    }
  };

  const handleDelete = (article: LmsArticle) => {
    if (!canDeleteArticle(article)) {
      toast.error("Unpublish the article before deleting it");
      return;
    }

    deleteConfirmation.openConfirmation(
      article,
      `Delete "${article.title}"?`,
      "This cannot be undone.",
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.item) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteConfirmation.item.id);
      toast.success("Article deleted");
      deleteConfirmation.closeConfirmation();
    } catch (deleteError) {
      console.error("Error deleting article:", deleteError);
      toast.error(
        getMutationErrorMessage(
          deleteError,
          "Failed to delete article. Please try again.",
        ),
      );
    }
  };

  return {
    handleEdit,
    handlePublish,
    handleDelete,
    handleConfirmDelete,
    publishingArticleId,
    deleteConfirmation,
    isDeletePending: deleteMutation.isPending,
  };
}
