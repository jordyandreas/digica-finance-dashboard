-- Add marketing view_count to Academy Journal articles.
-- Base range 50–60 so new/existing articles never start at 0.
-- Public visitors increment via SECURITY DEFINER RPC (anon cannot UPDATE under RLS).

ALTER TABLE public.lms_articles
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

UPDATE public.lms_articles
SET view_count = 50 + floor(random() * 11)::int
WHERE view_count = 0;

ALTER TABLE public.lms_articles
  ALTER COLUMN view_count SET DEFAULT (50 + floor(random() * 11)::int);

-- Keep updated_at stable when only view_count changes (page-view increments).
CREATE OR REPLACE FUNCTION public.set_lms_articles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
    NEW.view_count IS DISTINCT FROM OLD.view_count
    AND (to_jsonb(NEW) - 'view_count' - 'updated_at')
      = (to_jsonb(OLD) - 'view_count' - 'updated_at')
  ) THEN
    NEW.updated_at = OLD.updated_at;
    RETURN NEW;
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_lms_article_view_count(p_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_slug IS NULL OR btrim(p_slug) = '' THEN
    RETURN;
  END IF;

  UPDATE public.lms_articles
  SET view_count = view_count + 1
  WHERE slug = btrim(p_slug)
    AND status = 'published';
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_lms_article_view_count(text)
  TO anon, authenticated;
