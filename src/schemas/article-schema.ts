import { z } from "zod";
import { ARTICLE_CATEGORIES } from "@/constants/article-categories";
import { slugifyFromTitle } from "@/utils/slugify";

export const articleSlugSchema = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters")
  .max(120, "Slug must be at most 120 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only",
  );

export const articleFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: articleSlugSchema,
  category: z.enum(ARTICLE_CATEGORIES, {
    message: "Category is required",
  }),
  excerpt: z.string().trim().min(1, "Excerpt is required"),
  body_html: z.string(),
  display_date: z.string().trim(),
  read_time_minutes: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), {
      message: "Enter read time as a whole number",
    }),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

export function normalizeArticleSlug(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (!trimmed) {
    return slugifyFromTitle("");
  }
  return trimmed;
}

export function buildDefaultArticleFormValues(): ArticleFormValues {
  return {
    title: "",
    slug: "",
    category: "SQL",
    excerpt: "",
    body_html: "",
    display_date: "",
    read_time_minutes: "",
  };
}

export function parseReadTimeMinutesInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
