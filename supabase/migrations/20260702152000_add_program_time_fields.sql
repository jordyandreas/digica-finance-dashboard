ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS start_time time;

ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS end_time time;
