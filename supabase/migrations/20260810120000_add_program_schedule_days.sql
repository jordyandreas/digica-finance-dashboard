ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS schedule_days text[] DEFAULT '{}';
