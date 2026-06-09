-- Complete fix: add programs.year (if missing), backfill, then recreate the view.
-- Safe to run even if some steps were already applied.

ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS year integer;

UPDATE public.programs
SET year = COALESCE(
  EXTRACT(YEAR FROM start_date::timestamptz)::integer,
  EXTRACT(YEAR FROM created_at::timestamptz)::integer,
  EXTRACT(YEAR FROM CURRENT_DATE)::integer
)
WHERE year IS NULL;

ALTER TABLE public.programs
DROP CONSTRAINT IF EXISTS programs_year_check;

ALTER TABLE public.programs
ADD CONSTRAINT programs_year_check
CHECK (year IS NULL OR (year >= 2000 AND year <= 2100));

CREATE INDEX IF NOT EXISTS idx_programs_year
  ON public.programs (year);

DROP VIEW IF EXISTS public.dashboard_program_summary;

CREATE VIEW public.dashboard_program_summary AS
SELECT
  p.id AS program_id,
  p.name AS program_name,
  p.year AS program_year,
  COALESCE(revenue.total_revenue, 0) AS total_revenue,
  COALESCE(expense.total_expense, 0) AS total_expense,
  COALESCE(revenue.total_revenue, 0) - COALESCE(expense.total_expense, 0) AS net_profit
FROM public.programs p
LEFT JOIN (
  SELECT program_id, SUM(amount) AS total_revenue
  FROM public.payments
  GROUP BY program_id
) revenue ON revenue.program_id = p.id
LEFT JOIN (
  SELECT program_id, SUM(amount) AS total_expense
  FROM public.expenses
  GROUP BY program_id
) expense ON expense.program_id = p.id;
