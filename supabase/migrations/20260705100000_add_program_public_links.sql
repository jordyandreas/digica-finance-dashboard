ALTER TABLE programs
ADD COLUMN IF NOT EXISTS public_code text,
ADD COLUMN IF NOT EXISTS public_slug text;

-- Backfill existing programs with unique 6-char codes
DO $$
DECLARE
  rec RECORD;
  new_code text;
  attempts int;
  code_exists boolean;
BEGIN
  FOR rec IN SELECT id FROM programs WHERE public_code IS NULL LOOP
    attempts := 0;
    LOOP
      new_code := lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      SELECT EXISTS(SELECT 1 FROM programs WHERE public_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
      attempts := attempts + 1;
      IF attempts > 20 THEN
        RAISE EXCEPTION 'Failed to generate unique public_code for program %', rec.id;
      END IF;
    END LOOP;
    UPDATE programs SET public_code = new_code WHERE id = rec.id;
  END LOOP;
END $$;

ALTER TABLE programs
ALTER COLUMN public_code SET NOT NULL;

ALTER TABLE programs
ADD CONSTRAINT programs_public_code_unique UNIQUE (public_code);

ALTER TABLE programs
ADD CONSTRAINT programs_public_slug_unique UNIQUE (public_slug);

ALTER TABLE programs
ADD CONSTRAINT programs_public_slug_format CHECK (
  public_slug IS NULL
  OR (
    char_length(public_slug) BETWEEN 3 AND 50
    AND public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);
