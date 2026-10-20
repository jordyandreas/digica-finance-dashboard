-- Store per-installment paid-at datetimes for tenor payments.
-- paid_tenor is derived from how many slots are filled (can be 0).

ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS tenor_paid_ats jsonb;

COMMENT ON COLUMN public.payments.tenor_paid_ats IS
  'Array of paid-at datetimes per tenor installment (index 0 = tenor-1). Null/empty string entries mean unpaid.';

ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_paid_tenor_range_check;

ALTER TABLE public.payments
ADD CONSTRAINT payments_paid_tenor_range_check
CHECK (paid_tenor IS NULL OR (paid_tenor >= 0 AND paid_tenor <= 3));

ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_tenor_logic_check;

ALTER TABLE public.payments
ADD CONSTRAINT payments_tenor_logic_check
CHECK (
  payment_type IS NULL
  OR (
    payment_type = 'tenor'
    AND tenor IS NOT NULL
    AND paid_tenor IS NOT NULL
    AND tenor IN (2, 3)
    AND paid_tenor >= 0
    AND paid_tenor <= tenor
  )
  OR (
    payment_type IN ('full', 'scholarship')
    AND tenor IS NULL
    AND paid_tenor IS NULL
  )
);
