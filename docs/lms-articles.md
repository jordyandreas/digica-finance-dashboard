# LMS Articles — Supabase Integration Note

For **digica-academy-lms** (Part 2): read published Academy Journal articles from the shared Supabase project.

## Table

`public.lms_articles`

## Columns

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `slug` | `text` | Unique. Public URL: `/articles/{slug}` |
| `category` | `text` | One of: `SQL`, `Analytics`, `Data Science`, `Career` |
| `title` | `text` | |
| `excerpt` | `text` | Card / list summary |
| `body_html` | `text` | Sanitized HTML (`p`, `h2`, `h3`, `strong`, `em`, `ul`, `ol`, `li`, `a`, `blockquote`, `br`) |
| `status` | `text` | `draft` or `published` |
| `published_at` | `timestamptz` | Set on first publish; **kept when unpublished** (audit only) |
| `display_date` | `text` | Optional display override, e.g. `"August 26, 2026"` |
| `read_time_minutes` | `int` | Auto ~200 wpm from body |
| `read_time_display` | `text` | Optional override, e.g. `"5 min read"` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

## RLS

- **Public read** (`anon`, `authenticated`): `SELECT` where `status = 'published'`
- **Admin write** (`authenticated`): `INSERT` / `UPDATE` / `DELETE` when `public.is_admin()` is true (i.e. `profiles.role = 'admin'`)

Use the **anon key** in the LMS browser client. Do **not** use the service role key in the LMS frontend.

## Listing query (public)

```sql
SELECT *
FROM public.lms_articles
WHERE status = 'published'
ORDER BY published_at DESC NULLS LAST;
```

## Single article (public)

```sql
SELECT *
FROM public.lms_articles
WHERE status = 'published'
  AND slug = $1
LIMIT 1;
```

## Images

No per-article image column in v1. Continue using category placeholder covers in LMS (`ARTICLE_COVER_BY_CATEGORY`).

## Display fallbacks

- **Date:** use `display_date` if set, else format `published_at` (e.g. `"August 26, 2026"`)
- **Read time:** use `read_time_display` if set, else `"{read_time_minutes} min read"`

## Admin

Articles are managed in **digica-finance-dashboard** at `/articles`.
