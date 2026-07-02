CREATE TABLE IF NOT EXISTS public.program_public_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL UNIQUE REFERENCES public.programs (id) ON DELETE CASCADE,
  summary_html text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_public_contents_program_id
  ON public.program_public_contents (program_id);

CREATE OR REPLACE FUNCTION public.set_program_public_contents_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS program_public_contents_set_updated_at ON public.program_public_contents;

CREATE TRIGGER program_public_contents_set_updated_at
BEFORE UPDATE ON public.program_public_contents
FOR EACH ROW
EXECUTE FUNCTION public.set_program_public_contents_updated_at();
