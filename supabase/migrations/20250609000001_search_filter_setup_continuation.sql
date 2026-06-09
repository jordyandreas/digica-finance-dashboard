-- Run this ONLY if 20250609000000_search_filter_setup.sql failed on participant_name.
-- Earlier steps (defaults, constraints, participant indexes, payments program_id/status) may already exist.

-- Fuzzy search support
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_participants_name_trgm
  ON public.participants USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_participants_email_trgm
  ON public.participants USING gin (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_participants_phone_trgm
  ON public.participants USING gin (phone gin_trgm_ops);

-- Join helper for payment search by participant name
CREATE INDEX IF NOT EXISTS idx_payments_participant_id
  ON public.payments (participant_id);

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

UPDATE public.participants
SET payment_status = 'pending'
WHERE payment_status IS NULL;
