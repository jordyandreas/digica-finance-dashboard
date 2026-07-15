-- Per-program workshop-promo registration offer prices (mini bootcamp / bootcamp)
-- Social / standard registration uses existing programs.price
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS promo_individual_price integer;

ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS promo_bareng_teman_price integer;

ALTER TABLE public.programs
DROP CONSTRAINT IF EXISTS programs_promo_individual_price_check;

ALTER TABLE public.programs
ADD CONSTRAINT programs_promo_individual_price_check
CHECK (promo_individual_price IS NULL OR promo_individual_price > 0);

ALTER TABLE public.programs
DROP CONSTRAINT IF EXISTS programs_promo_bareng_teman_price_check;

ALTER TABLE public.programs
ADD CONSTRAINT programs_promo_bareng_teman_price_check
CHECK (promo_bareng_teman_price IS NULL OR promo_bareng_teman_price > 0);

COMMENT ON COLUMN public.programs.promo_individual_price IS
  'Workshop promo Individual package price (e.g. 249000).';

COMMENT ON COLUMN public.programs.promo_bareng_teman_price IS
  'Workshop promo Bareng teman package price per person (e.g. 199000).';
