-- Academy Journal articles table (shared with digica-academy-lms public site).
-- Run in Supabase SQL Editor or via: supabase db push

CREATE TABLE IF NOT EXISTS public.lms_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category text NOT NULL CHECK (
    category IN ('SQL', 'Analytics', 'Data Science', 'Career')
  ),
  title text NOT NULL,
  excerpt text NOT NULL,
  body_html text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  display_date text,
  read_time_minutes integer,
  read_time_display text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_articles_status_published_at
  ON public.lms_articles (status, published_at DESC NULLS LAST);

CREATE OR REPLACE FUNCTION public.set_lms_articles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lms_articles_set_updated_at ON public.lms_articles;

CREATE TRIGGER lms_articles_set_updated_at
BEFORE UPDATE ON public.lms_articles
FOR EACH ROW
EXECUTE FUNCTION public.set_lms_articles_updated_at();

ALTER TABLE public.lms_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_articles FORCE ROW LEVEL SECURITY;

-- Public read: published articles only (anon + authenticated LMS visitors)
DROP POLICY IF EXISTS "Public can select published articles" ON public.lms_articles;
CREATE POLICY "Public can select published articles"
ON public.lms_articles
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Admin CRUD via profiles.role = 'admin' (is_admin())
DROP POLICY IF EXISTS "Admins can manage articles" ON public.lms_articles;
CREATE POLICY "Admins can manage articles"
ON public.lms_articles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

GRANT SELECT ON public.lms_articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lms_articles TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.lms_articles FROM anon;
