-- Track which tenor installment this payment represents (e.g. 1 of 3).
-- Run in Supabase SQL Editor or via: supabase db push

ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS paid_tenor integer;

COMMENT ON COLUMN public.payments.paid_tenor IS
  'Installment number paid for tenor payments (1-based). Null for full payments.';

ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_paid_tenor_range_check;

ALTER TABLE public.payments
ADD CONSTRAINT payments_paid_tenor_range_check
CHECK (paid_tenor IS NULL OR (paid_tenor >= 1 AND paid_tenor <= 3));

ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_paid_tenor_lte_tenor_check;

ALTER TABLE public.payments
ADD CONSTRAINT payments_paid_tenor_lte_tenor_check
CHECK (
  paid_tenor IS NULL
  OR tenor IS NULL
  OR paid_tenor <= tenor
);
