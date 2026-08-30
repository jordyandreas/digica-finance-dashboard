"use client";

import * as React from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import {
  articleFormSchema,
  buildDefaultArticleFormValues,
  type ArticleFormValues,
} from "@/schemas/article-schema";
import { slugifyFromTitle } from "@/utils/slugify";
import { computeReadTimeMinutes } from "@/utils/article-read-time";
import {
  articleDisplayDateToFormValue,
  formatArticleDisplayDate,
} from "@/utils/article-display-date";
import type { LmsArticle } from "@/services/articles.service";

export function mapArticleToFormValues(article: LmsArticle): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    category: article.category,
    excerpt: article.excerpt,
    body_html: article.body_html,
    display_date: articleDisplayDateToFormValue(
      article.display_date,
      article.published_at,
    ),
    read_time_minutes:
      article.read_time_minutes != null
        ? String(article.read_time_minutes)
        : "",
  };
}

interface UseArticleEditorFormOptions {
  article?: LmsArticle | null;
  isCreate?: boolean;
}

export function useArticleEditorForm({
  article,
  isCreate = false,
}: UseArticleEditorFormOptions) {
  const [slugTouched, setSlugTouched] = React.useState(!isCreate);

  const form = useForm<ArticleFormValues>({
    defaultValues: article
      ? mapArticleToFormValues(article)
      : buildDefaultArticleFormValues(),
  });

  React.useEffect(() => {
    if (article) {
      form.reset(mapArticleToFormValues(article));
      setSlugTouched(true);
    }
  }, [article, form]);

  const title = form.watch("title");
  const bodyHtml = form.watch("body_html");

  React.useEffect(() => {
    if (!isCreate || slugTouched || !title.trim()) {
      return;
    }
    form.setValue("slug", slugifyFromTitle(title), { shouldDirty: true });
  }, [form, isCreate, slugTouched, title]);

  const autoReadTimeMinutes = computeReadTimeMinutes(bodyHtml);
  const autoDisplayDate = articleDisplayDateToFormValue(
    null,
    article?.published_at ?? new Date().toISOString(),
  );

  const validateForm = () => {
    const values = form.getValues();
    const parsed = articleFormSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          form.setError(field as keyof ArticleFormValues, {
            message: issue.message,
          });
        }
      }
      return null;
    }

    return parsed.data;
  };

  return {
    form,
    slugTouched,
    setSlugTouched,
    autoReadTimeMinutes,
    autoDisplayDate,
    validateForm,
  };
}

export type ArticleEditorForm = UseFormReturn<ArticleFormValues>;
