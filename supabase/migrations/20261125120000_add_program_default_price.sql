-- Normal (pre-discount) program price, shown struck through on the LMS
-- programs.price stays the charged price (early bird) used by registration/payment
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS default_price integer;

ALTER TABLE public.programs
DROP CONSTRAINT IF EXISTS programs_default_price_check;

ALTER TABLE public.programs
ADD CONSTRAINT programs_default_price_check
CHECK (default_price IS NULL OR default_price > 0);

COMMENT ON COLUMN public.programs.default_price IS
  'Normal price shown struck through on the LMS when higher than price (early bird).';
