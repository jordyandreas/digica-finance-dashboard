-- Add optional per-program Open Graph banner image path (public URL path or absolute URL)
ALTER TABLE public.program_public_contents
ADD COLUMN IF NOT EXISTS og_image_url text;

-- Seed OG banner for Workshop SQL Batch #3 short link
UPDATE public.program_public_contents AS ppc
SET og_image_url = '/og/fw-sql3.png'
FROM public.programs AS p
WHERE ppc.program_id = p.id
  AND p.public_slug = 'fw-sql3';
