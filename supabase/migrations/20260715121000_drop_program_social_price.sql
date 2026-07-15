-- Social / standard registration uses programs.price; drop unused social_price.
ALTER TABLE public.programs
DROP CONSTRAINT IF EXISTS programs_social_price_check;

ALTER TABLE public.programs
DROP COLUMN IF EXISTS social_price;
