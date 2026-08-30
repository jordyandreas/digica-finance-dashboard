import {
  BarChart3,
  Briefcase,
  Database,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

export const ARTICLE_CATEGORIES = [
  "SQL",
  "Analytics",
  "Data Science",
  "Career",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const ARTICLE_CATEGORY_ALL = "all" as const;

export const ARTICLE_STATUS_ALL = "all" as const;
export const ARTICLE_STATUSES = ["draft", "published"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const ARTICLE_STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: ARTICLE_STATUS_ALL },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
] as const;

export const ARTICLE_CATEGORY_FILTER_OPTIONS = [
  { label: "All categories", value: ARTICLE_CATEGORY_ALL },
  ...ARTICLE_CATEGORIES.map((category) => ({
    label: category,
    value: category,
  })),
] as const;

export const ARTICLE_CATEGORY_OPTIONS = ARTICLE_CATEGORIES.map((category) => ({
  label: category,
  value: category,
}));

const pill = (bg: string, text: string) => `${bg} ${text} border-transparent`;

export const ARTICLE_CATEGORY_STYLES: Record<ArticleCategory, string> = {
  SQL: pill("bg-sky-100", "text-sky-800"),
  Analytics: pill("bg-violet-100", "text-violet-800"),
  "Data Science": pill("bg-emerald-100", "text-emerald-800"),
  Career: pill("bg-amber-100", "text-amber-800"),
};

export const ARTICLE_CATEGORY_ICONS: Record<ArticleCategory, LucideIcon> = {
  SQL: Database,
  Analytics: BarChart3,
  "Data Science": FlaskConical,
  Career: Briefcase,
};

export function isArticleCategory(value: string): value is ArticleCategory {
  return (ARTICLE_CATEGORIES as readonly string[]).includes(value);
}
