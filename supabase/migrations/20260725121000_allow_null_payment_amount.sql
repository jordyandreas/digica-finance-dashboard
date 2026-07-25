-- Allow null payment amounts (e.g. pending / on_progress / failed / refunded).
-- The existing payments_amount_check already permits NULL; the column was still NOT NULL.

ALTER TABLE public.payments
ALTER COLUMN amount DROP NOT NULL;
