-- Participant referral: stores referrer participant id (same semantics as payments.reference_name)
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS reference_name text NULL;
