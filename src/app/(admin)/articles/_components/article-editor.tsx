"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/atoms/back-button";
import { ArticleCategoryBadge } from "@/components/atoms/article-category-badge";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import { computeReadTimeMinutes } from "@/utils/article-read-time";
import {
  formDisplayDateToStorage,
  formatArticleMetaDate,
} from "@/utils/article-display-date";
import { getArticleBySlug } from "@/services/articles.service";
import type { LmsArticle } from "@/services/articles.service";
import {
  parseReadTimeMinutesInput,
  type ArticleFormValues,
} from "@/schemas/article-schema";
import { ArticleForm } from "./article-form";
import { useArticleEditorForm } from "../_hooks/use-article-editor-form";
import { useArticleMutations } from "../_hooks/use-article-mutations";

type SaveMode = "draft" | "publish" | "update";

interface ArticleEditorProps {
  article?: LmsArticle | null;
  isCreate?: boolean;
}

export function ArticleEditor({ article, isCreate = false }: ArticleEditorProps) {
  const router = useRouter();
  const {
    createMutation,
    updateMutation,
    deleteMutation,
  } = useArticleMutations();
  const deleteConfirmation = useDeleteConfirmation({
    title: "Delete this article?",
    description: "This cannot be undone.",
  });

  const {
    form,
    setSlugTouched,
    autoReadTimeMinutes,
    autoDisplayDate,
    validateForm,
  } = useArticleEditorForm({ article, isCreate });

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const ensureUniqueSlug = async (slug: string, excludeId?: string) => {
    const { data: existing, error } = await getArticleBySlug(slug, excludeId);
    if (error) {
      throw error;
    }
    if (existing) {
      form.setError("slug", { message: "This slug is already in use" });
      return false;
    }
    return true;
  };

  const isPublished = !isCreate && article?.status === "published";

  const buildPayload = (values: ArticleFormValues, mode: SaveMode) => {
    const readTimeMinutes =
      parseReadTimeMinutesInput(values.read_time_minutes) ??
      autoReadTimeMinutes;

    const base = {
      slug: values.slug,
      category: values.category,
      title: values.title,
      excerpt: values.excerpt,
      body_html: values.body_html,
      read_time_minutes: readTimeMinutes,
      read_time_display: null,
    };

    const displayDate =
      formDisplayDateToStorage(values.display_date) ||
      article?.display_date?.trim() ||
      null;

    if (mode === "update") {
      return {
        ...base,
        status: "published" as const,
        published_at: article?.published_at ?? null,
        display_date: displayDate,
      };
    }

    if (mode === "publish") {
      const publishedAt = article?.published_at ?? new Date().toISOString();
      return {
        ...base,
        status: "published" as const,
        published_at: publishedAt,
        display_date:
          displayDate ||
          formDisplayDateToStorage(autoDisplayDate) ||
          null,
      };
    }

    return {
      ...base,
      status: "draft" as const,
      display_date: formDisplayDateToStorage(values.display_date),
    };
  };

  const saveSuccessMessage = (mode: SaveMode) => {
    if (mode === "update") {
      return "Changes saved";
    }
    if (mode === "publish") {
      return isCreate || article?.status === "draft"
        ? "Article published"
        : "Changes saved";
    }
    if (isPublished) {
      return "Article unpublished";
    }
    return "Draft saved";
  };

  const handleSave = async (mode: SaveMode) => {
    const values = validateForm();
    if (!values) {
      toast.error("Please fix the form errors");
      return;
    }

    const slugOk = await ensureUniqueSlug(values.slug, article?.id);
    if (!slugOk) {
      return;
    }

    const payload = buildPayload(values, mode);

    try {
      if (isCreate) {
        await createMutation.mutateAsync(payload);
        toast.success(saveSuccessMessage(mode));
        router.push("/articles");
        return;
      }

      if (!article) {
        return;
      }

      await updateMutation.mutateAsync({ id: article.id, input: payload });
      toast.success(saveSuccessMessage(mode));
      if (mode === "publish") {
        router.push("/articles");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save article. Please try again.");
    }
  };

  const handleUnpublish = async () => {
    await handleSave("draft");
  };

  const handleDelete = async () => {
    if (!article) {
      return;
    }

    if (article.status === "published") {
      toast.error("Unpublish the article before deleting it");
      return;
    }

    try {
      await deleteMutation.mutateAsync(article.id);
      toast.success("Article deleted");
      router.push("/articles");
    } catch (error) {
      console.error("Error deleting article:", error);
      const message =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Failed to delete article.";
      toast.error(message);
    }
  };

  const metaDate = article
    ? formatArticleMetaDate(article.display_date, article.published_at)
    : "";
  const metaReadMinutes =
    article?.read_time_minutes ?? computeReadTimeMinutes(article?.body_html ?? "");

  return (
    <>
      <div className="space-y-8">
        <div className="flex w-full flex-col items-start gap-4">
          <BackButton href="/articles" />
          <div className="w-full space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {isCreate ? "New article" : "Edit article"}
            </h1>
            {!isCreate && article ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-periwinkle/50 bg-brand-pale/20 px-3 py-2">
                <StatusBadge status={article.status} />
                <ArticleCategoryBadge category={article.category} />
                {metaDate ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {metaDate}
                  </span>
                ) : null}
                {metaReadMinutes > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {metaReadMinutes} min
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <Card className="p-6">
          <ArticleForm
            form={form}
            onSlugManualEdit={() => setSlugTouched(true)}
            autoDisplayDate={autoDisplayDate}
            autoReadTimeMinutes={autoReadTimeMinutes}
          />
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            {isPublished ? (
              <>
                <Button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleSave("update")}
                >
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={handleUnpublish}
                >
                  Unpublish
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => handleSave("draft")}
                >
                  Save draft
                </Button>
                <Button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleSave("publish")}
                >
                  Publish
                </Button>
              </>
            )}
          </div>

          {!isCreate && article ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isBusy || article.status === "published"}
              title={
                article.status === "published"
                  ? "Unpublish the article before deleting it"
                  : undefined
              }
              onClick={() =>
                deleteConfirmation.openConfirmation(
                  article,
                  `Delete "${article.title}"?`,
                )
              }
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setOpen}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
