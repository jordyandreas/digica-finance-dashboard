-- Allow "scholarship" as a payment type and amount 0 for scholarship payments.

ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_payment_type_check;

ALTER TABLE public.payments
ADD CONSTRAINT payments_payment_type_check
CHECK (
  payment_type IS NULL
  OR payment_type IN ('full', 'tenor', 'scholarship')
);

ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_amount_check;

ALTER TABLE public.payments
ADD CONSTRAINT payments_amount_check
CHECK (
  amount IS NULL
  OR amount > 0
  OR payment_type = 'scholarship'
);

-- Tenor fields apply only to tenor payments; full and scholarship have no tenor.
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
    AND paid_tenor >= 1
    AND paid_tenor <= tenor
  )
  OR (
    payment_type IN ('full', 'scholarship')
    AND tenor IS NULL
    AND paid_tenor IS NULL
  )
);
