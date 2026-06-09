-- Search, filter, and payment_status sync for participants.
-- Run in Supabase Dashboard → SQL Editor (in order with earlier migrations if not applied yet).

-- Ensure participants.payment_status has a default
ALTER TABLE public.participants
ALTER COLUMN payment_status SET DEFAULT 'pending';

UPDATE public.participants
SET payment_status = 'pending'
WHERE payment_status IS NULL;

-- Align participant payment_status values with payment statuses
ALTER TABLE public.participants
DROP CONSTRAINT IF EXISTS participants_payment_status_check;

ALTER TABLE public.participants
ADD CONSTRAINT participants_payment_status_check
CHECK (
  payment_status IS NULL
  OR payment_status IN ('pending', 'paid', 'on_progress', 'failed', 'refunded')
);

-- Indexes for search and filter performance
CREATE INDEX IF NOT EXISTS idx_participants_program_id
  ON public.participants (program_id);

CREATE INDEX IF NOT EXISTS idx_participants_payment_status
  ON public.participants (payment_status);

CREATE INDEX IF NOT EXISTS idx_participants_name
  ON public.participants (name);

CREATE INDEX IF NOT EXISTS idx_participants_email
  ON public.participants (email);

CREATE INDEX IF NOT EXISTS idx_participants_phone
  ON public.participants (phone);

CREATE INDEX IF NOT EXISTS idx_payments_program_id
  ON public.payments (program_id);

CREATE INDEX IF NOT EXISTS idx_payments_status
  ON public.payments (status);

CREATE INDEX IF NOT EXISTS idx_payments_participant_id
  ON public.payments (participant_id);

-- Fuzzy search support
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_participants_name_trgm
  ON public.participants USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_participants_email_trgm
  ON public.participants USING gin (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_participants_phone_trgm
  ON public.participants USING gin (phone gin_trgm_ops);

-- Keep participants.payment_status in sync with payments.status
CREATE OR REPLACE FUNCTION public.sync_participant_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  latest_status text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.participant_id IS NOT NULL THEN
      SELECT pay.status
      INTO latest_status
      FROM public.payments pay
      WHERE pay.participant_id = OLD.participant_id
      ORDER BY pay.created_at DESC
      LIMIT 1;

      UPDATE public.participants
      SET payment_status = COALESCE(latest_status, 'pending')
      WHERE id = OLD.participant_id;
    END IF;

    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.participant_id IS DISTINCT FROM OLD.participant_id THEN
    IF OLD.participant_id IS NOT NULL THEN
      SELECT pay.status
      INTO latest_status
      FROM public.payments pay
      WHERE pay.participant_id = OLD.participant_id
      ORDER BY pay.created_at DESC
      LIMIT 1;

      UPDATE public.participants
      SET payment_status = COALESCE(latest_status, 'pending')
      WHERE id = OLD.participant_id;
    END IF;
  END IF;

  IF NEW.participant_id IS NOT NULL THEN
    UPDATE public.participants
    SET payment_status = COALESCE(NEW.status, 'pending')
    WHERE id = NEW.participant_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_participant_payment_status ON public.payments;

CREATE TRIGGER trg_sync_participant_payment_status
AFTER INSERT OR UPDATE OF status, participant_id OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.sync_participant_payment_status();

-- Backfill existing participant payment statuses from latest payment
UPDATE public.participants p
SET payment_status = latest.status
FROM (
  SELECT DISTINCT ON (participant_id)
    participant_id,
    status
  FROM public.payments
  WHERE participant_id IS NOT NULL
  ORDER BY participant_id, created_at DESC
) AS latest
WHERE p.id = latest.participant_id;

-- Participants without payments stay as pending
UPDATE public.participants
SET payment_status = 'pending'
WHERE payment_status IS NULL;
