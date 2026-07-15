-- Program batch number (e.g. 3 → displayed as "Batch 3" in success CTA)
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS batch integer;

ALTER TABLE public.programs
DROP CONSTRAINT IF EXISTS programs_batch_range_check;

ALTER TABLE public.programs
ADD CONSTRAINT programs_batch_range_check
CHECK (batch IS NULL OR batch >= 1);

COMMENT ON COLUMN public.programs.batch IS
  'Cohort batch number for this program (e.g. 3).';
