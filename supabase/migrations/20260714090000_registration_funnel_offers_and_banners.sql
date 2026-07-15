-- Participant offer fields (mini/bootcamp public registration)
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS registration_source text;

ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS selected_package text;

ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS package_price integer;

ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS friend_name text;

ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS friend_phone text;

ALTER TABLE public.participants
DROP CONSTRAINT IF EXISTS participants_registration_source_check;

ALTER TABLE public.participants
ADD CONSTRAINT participants_registration_source_check
CHECK (
  registration_source IS NULL
  OR registration_source IN ('workshop_promo', 'social')
);

ALTER TABLE public.participants
DROP CONSTRAINT IF EXISTS participants_selected_package_check;

ALTER TABLE public.participants
ADD CONSTRAINT participants_selected_package_check
CHECK (
  selected_package IS NULL
  OR selected_package IN ('individual', 'bareng_teman', 'social_standard')
);

COMMENT ON COLUMN public.participants.registration_source IS
  'Public registration channel: workshop_promo or social.';

COMMENT ON COLUMN public.participants.selected_package IS
  'Package chosen at registration; price snapshotted in package_price.';

-- Workshop upsell link to mini/bootcamp registration (not registration_link)
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS bootcamp_registration_link text;

COMMENT ON COLUMN public.programs.bootcamp_registration_link IS
  'Workshop-only: mini bootcamp / bootcamp registration URL for secure-seat CTA.';

-- Program banners (Supabase public URLs)
ALTER TABLE public.program_public_contents
ADD COLUMN IF NOT EXISTS registration_banner_url text;

ALTER TABLE public.program_public_contents
ADD COLUMN IF NOT EXISTS promo_banner_url text;

COMMENT ON COLUMN public.program_public_contents.registration_banner_url IS
  'Banner on this program public registration page.';

COMMENT ON COLUMN public.program_public_contents.promo_banner_url IS
  'Workshop check-in promo banner URL.';

-- Public storage bucket for program banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'program-banners',
  'program-banners',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read program banners" ON storage.objects;
CREATE POLICY "Public read program banners"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'program-banners');

DROP POLICY IF EXISTS "Authenticated upload program banners" ON storage.objects;
CREATE POLICY "Authenticated upload program banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'program-banners');

DROP POLICY IF EXISTS "Authenticated update program banners" ON storage.objects;
CREATE POLICY "Authenticated update program banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'program-banners')
WITH CHECK (bucket_id = 'program-banners');

DROP POLICY IF EXISTS "Authenticated delete program banners" ON storage.objects;
CREATE POLICY "Authenticated delete program banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'program-banners');
