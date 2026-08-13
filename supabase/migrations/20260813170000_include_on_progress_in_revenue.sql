-- Count on_progress installment amounts toward revenue, not only fully paid.

DROP VIEW IF EXISTS public.dashboard_program_summary;

CREATE VIEW public.dashboard_program_summary AS
SELECT
  p.id AS program_id,
  p.name AS program_name,
  p.year AS program_year,
  p.status AS status,
  p.start_date AS start_date,
  p.created_at AS created_at,
  COALESCE(revenue.total_revenue, 0) AS total_revenue,
  COALESCE(expense.total_expense, 0) AS total_expense,
  COALESCE(revenue.total_revenue, 0) - COALESCE(expense.total_expense, 0) AS net_profit
FROM public.programs p
LEFT JOIN (
  SELECT program_id, SUM(amount) AS total_revenue
  FROM public.payments
  WHERE status IN ('paid', 'on_progress')
  GROUP BY program_id
) revenue ON revenue.program_id = p.id
LEFT JOIN (
  SELECT program_id, SUM(amount) AS total_expense
  FROM public.expenses
  GROUP BY program_id
) expense ON expense.program_id = p.id;
