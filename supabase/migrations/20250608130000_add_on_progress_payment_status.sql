-- Allow "on_progress" as a valid payment status (used for partial tenor payments).

ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE public.payments
ADD CONSTRAINT payments_status_check
CHECK (
  status IS NULL
  OR status IN ('pending', 'paid', 'on_progress', 'failed', 'refunded')
);
