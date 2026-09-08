-- Optional target seat / capacity for a program cohort
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS seat_target integer;

ALTER TABLE public.programs
DROP CONSTRAINT IF EXISTS programs_seat_target_range_check;

ALTER TABLE public.programs
ADD CONSTRAINT programs_seat_target_range_check
CHECK (seat_target IS NULL OR seat_target >= 1);

COMMENT ON COLUMN public.programs.seat_target IS
  'Optional target number of seats/participants for this program.';
