-- Ensure participants.payment_status allows the same statuses as payments.status,
-- including on_progress (partial tenor payments). Some environments still have an
-- older check that rejects on_progress when the sync trigger updates participants.

ALTER TABLE public.participants
DROP CONSTRAINT IF EXISTS participants_payment_status_check;

ALTER TABLE public.participants
ADD CONSTRAINT participants_payment_status_check
CHECK (
  payment_status IS NULL
  OR payment_status IN ('pending', 'paid', 'on_progress', 'failed', 'refunded')
);
