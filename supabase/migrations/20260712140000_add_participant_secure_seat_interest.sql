-- Workshop check-in: secure seat promo interest on participants
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS secure_seat_interest text;

ALTER TABLE public.participants
DROP CONSTRAINT IF EXISTS participants_secure_seat_interest_check;

ALTER TABLE public.participants
ADD CONSTRAINT participants_secure_seat_interest_check
CHECK (
  secure_seat_interest IS NULL
  OR secure_seat_interest IN ('yes', 'undecided', 'no')
);
