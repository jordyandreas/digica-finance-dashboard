-- Program attendance: session count on programs, per-session dates, attendance records.

ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS session_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.programs
DROP CONSTRAINT IF EXISTS programs_session_count_check;

ALTER TABLE public.programs
ADD CONSTRAINT programs_session_count_check
CHECK (session_count >= 0 AND session_count <= 52);

CREATE TABLE IF NOT EXISTS public.program_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs (id) ON DELETE CASCADE,
  session_number integer NOT NULL CHECK (session_number >= 1),
  session_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, session_number)
);

CREATE INDEX IF NOT EXISTS idx_program_sessions_program_id
  ON public.program_sessions (program_id);

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.participants (id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.program_sessions (id) ON DELETE CASCADE,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_id, session_id),
  CONSTRAINT attendance_status_check CHECK (status IN ('present', 'absent'))
);

CREATE INDEX IF NOT EXISTS idx_attendance_participant_id
  ON public.attendance (participant_id);

CREATE INDEX IF NOT EXISTS idx_attendance_session_id
  ON public.attendance (session_id);

CREATE OR REPLACE FUNCTION public.set_attendance_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS attendance_set_updated_at ON public.attendance;

CREATE TRIGGER attendance_set_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.set_attendance_updated_at();
