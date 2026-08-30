import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import type {
  ArticleCategory,
  ArticleStatus,
} from "@/constants/article-categories";
import {
  buildPaginationMeta,
  type PaginatedResponse,
  type PaginationParams,
} from "@/types/pagination";
import { formatArticleDisplayDate } from "@/utils/article-display-date";
import {
  computeReadTimeMinutes,
} from "@/utils/article-read-time";
import { sanitizeArticleHtml } from "@/utils/sanitize-article-html";

export type { ArticleCategory, ArticleStatus };

export interface LmsArticle {
  id: string;
  slug: string;
  category: ArticleCategory;
  title: string;
  excerpt: string;
  body_html: string;
  status: ArticleStatus;
  published_at: string | null;
  display_date: string | null;
  read_time_minutes: number | null;
  read_time_display: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleInput {
  slug: string;
  category: ArticleCategory;
  title: string;
  excerpt: string;
  body_html: string;
  status: ArticleStatus;
  published_at?: string | null;
  display_date?: string | null;
  read_time_minutes?: number | null;
  read_time_display?: string | null;
}

export type UpdateArticleInput = Partial<CreateArticleInput>;

export interface ArticlesListParams {
  status?: ArticleStatus | "all";
}

export interface ArticlesPaginatedParams extends PaginationParams {
  status?: ArticleStatus | "all";
  category?: ArticleCategory | "all";
  search?: string;
}

function compareArticles(a: LmsArticle, b: LmsArticle): number {
  const aPublished = a.status === "published";
  const bPublished = b.status === "published";

  if (aPublished !== bPublished) {
    return aPublished ? -1 : 1;
  }

  if (aPublished && bPublished) {
    const aDate = a.published_at ?? "";
    const bDate = b.published_at ?? "";
    return bDate.localeCompare(aDate);
  }

  return b.updated_at.localeCompare(a.updated_at);
}

function sortArticles(articles: LmsArticle[]): LmsArticle[] {
  return [...articles].sort(compareArticles);
}

async function buildArticlePayload(
  input: CreateArticleInput | UpdateArticleInput,
  existing?: LmsArticle | null,
): Promise<Record<string, unknown>> {
  const bodyHtml =
    "body_html" in input && input.body_html !== undefined
      ? await sanitizeArticleHtml(input.body_html)
      : existing?.body_html ?? "";

  const readTimeMinutes =
    input.read_time_minutes !== undefined
      ? input.read_time_minutes
      : computeReadTimeMinutes(bodyHtml);

  const payload: Record<string, unknown> = {};

  if ("slug" in input && input.slug !== undefined) payload.slug = input.slug;
  if ("category" in input && input.category !== undefined) {
    payload.category = input.category;
  }
  if ("title" in input && input.title !== undefined) payload.title = input.title;
  if ("excerpt" in input && input.excerpt !== undefined) {
    payload.excerpt = input.excerpt;
  }
  if ("body_html" in input && input.body_html !== undefined) {
    payload.body_html = bodyHtml;
  }
  if ("status" in input && input.status !== undefined) payload.status = input.status;
  if ("published_at" in input) payload.published_at = input.published_at ?? null;
  if ("display_date" in input) payload.display_date = input.display_date ?? null;
  if ("read_time_minutes" in input && input.read_time_minutes !== undefined) {
    payload.read_time_minutes = input.read_time_minutes;
  } else if ("body_html" in input && input.body_html !== undefined) {
    payload.read_time_minutes = readTimeMinutes;
  }
  if ("read_time_display" in input) {
    payload.read_time_display = input.read_time_display ?? null;
  }

  return payload;
}

export async function getArticles({
  status = "all",
}: ArticlesListParams = {}): Promise<{
  data: LmsArticle[] | null;
  error: PostgrestError | null;
}> {
  let query = supabase.from("lms_articles").select("*");

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  return { data: sortArticles((data ?? []) as LmsArticle[]), error: null };
}

export async function getArticlesPaginated({
  page = 1,
  limit = 10,
  status = "all",
  category = "all",
  search = "",
}: ArticlesPaginatedParams = {}): Promise<{
  data: PaginatedResponse<LmsArticle> | null;
  error: PostgrestError | null;
}> {
  const from = (page - 1) * limit;
  const to = from + limit;

  let query = supabase.from("lms_articles").select("*");

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  let articles = sortArticles((data ?? []) as LmsArticle[]);
  const searchTerm = search.trim().toLowerCase();

  if (searchTerm) {
    articles = articles.filter((article) =>
      [article.title, article.slug, article.excerpt].some((field) =>
        field.toLowerCase().includes(searchTerm),
      ),
    );
  }

  return {
    data: {
      data: articles.slice(from, to),
      pagination: buildPaginationMeta(articles.length, page, limit),
    },
    error: null,
  };
}

export async function getArticleById(id: string): Promise<{
  data: LmsArticle | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("lms_articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return { data: data as LmsArticle | null, error };
}

export async function getArticleBySlug(
  slug: string,
  excludeId?: string,
): Promise<{
  data: LmsArticle | null;
  error: PostgrestError | null;
}> {
  let query = supabase.from("lms_articles").select("*").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  return { data: data as LmsArticle | null, error };
}

export async function createArticle(input: CreateArticleInput): Promise<{
  data: LmsArticle | null;
  error: PostgrestError | null;
}> {
  const payload = await buildArticlePayload(input);
  const { data, error } = await supabase
    .from("lms_articles")
    .insert(payload)
    .select("*")
    .single();

  return { data: data as LmsArticle | null, error };
}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput,
): Promise<{
  data: LmsArticle | null;
  error: PostgrestError | null;
}> {
  const { data: existing } = await getArticleById(id);
  const payload = await buildArticlePayload(input, existing);

  const { data, error } = await supabase
    .from("lms_articles")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  return { data: data as LmsArticle | null, error };
}

export async function deleteArticle(id: string): Promise<{
  error: PostgrestError | null;
}> {
  const { data: existing, error: fetchError } = await getArticleById(id);
  if (fetchError) {
    return { error: fetchError };
  }

  if (!existing) {
    return {
      error: {
        message: "Article not found",
        details: "",
        hint: "",
        code: "PGRST116",
        name: "PostgrestError",
      } as PostgrestError,
    };
  }

  if (existing.status === "published") {
    return {
      error: {
        message: "Unpublish the article before deleting it",
        details: "",
        hint: "",
        code: "PGRST409",
        name: "PostgrestError",
      } as PostgrestError,
    };
  }

  const { error } = await supabase.from("lms_articles").delete().eq("id", id);
  return { error };
}

export async function publishArticle(id: string): Promise<{
  data: LmsArticle | null;
  error: PostgrestError | null;
}> {
  const { data: existing, error: fetchError } = await getArticleById(id);
  if (fetchError) {
    return { data: null, error: fetchError };
  }
  if (!existing) {
    return {
      data: null,
      error: {
        message: "Article not found",
        details: "",
        hint: "",
        code: "PGRST116",
        name: "PostgrestError",
      } as PostgrestError,
    };
  }

  const publishedAt = existing.published_at ?? new Date().toISOString();
  const readTimeMinutes = computeReadTimeMinutes(existing.body_html);

  return updateArticle(id, {
    status: "published",
    published_at: publishedAt,
    display_date:
      existing.display_date?.trim() ||
      formatArticleDisplayDate(publishedAt) ||
      null,
    read_time_minutes: existing.read_time_minutes ?? readTimeMinutes,
    read_time_display: null,
  });
}

export async function unpublishArticle(id: string): Promise<{
  data: LmsArticle | null;
  error: PostgrestError | null;
}> {
  return updateArticle(id, { status: "draft" });
}
