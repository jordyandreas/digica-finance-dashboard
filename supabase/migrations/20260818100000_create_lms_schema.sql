-- LMS catalog + entitlements on the shared Digica Supabase project.
-- Separate from live `programs` / `participants` (do not merge those rows).
--
-- Apply in the Supabase SQL editor, or copy this file to
-- digica-finance-dashboard/supabase/migrations/ (that repo owns project migrations).
--
-- Deferred: admin CMS UI, payments/self-serve checkout, lesson progress in DB,
-- hosting video files (store video_url only — not Supabase Storage).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.lms_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  price_label text,
  compare_at_price_label text,
  level text not null default 'beginner'
    check (level in ('beginner', 'intermediate', 'advanced')),
  sessions integer,
  rating numeric(2, 1),
  review_count integer,
  student_count integer,
  instructor_name text,
  instructor_credentials text,
  instructor_avatar_url text,
  outcomes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lms_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses (id) on delete cascade,
  title text not null,
  sort_order integer not null default 0
);

create index if not exists lms_modules_course_id_idx
  on public.lms_modules (course_id, sort_order);

-- Public catalog fields only (no video_url / full body).
create table if not exists public.lms_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.lms_modules (id) on delete cascade,
  slug text not null,
  title text not null,
  excerpt text not null default '',
  duration_minutes integer not null default 0,
  cover_image_url text,
  sort_order integer not null default 0,
  unique (module_id, slug)
);

create index if not exists lms_lessons_module_id_idx
  on public.lms_lessons (module_id, sort_order);

-- Playback payload: entitled users only.
create table if not exists public.lms_lesson_media (
  lesson_id uuid primary key references public.lms_lessons (id) on delete cascade,
  video_url text not null default '',
  content text not null default ''
);

create table if not exists public.lms_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.lms_courses (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'expired', 'revoked')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists lms_entitlements_user_id_idx
  on public.lms_entitlements (user_id);
create index if not exists lms_entitlements_course_id_idx
  on public.lms_entitlements (course_id);

-- ---------------------------------------------------------------------------
-- Helper: active entitlement for the current auth user
-- ---------------------------------------------------------------------------

create or replace function public.lms_user_has_course_access(p_course_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.lms_entitlements e
    where e.course_id = p_course_id
      and e.user_id = auth.uid()
      and e.status = 'active'
      and (e.ends_at is null or e.ends_at > now())
      and e.starts_at <= now()
  );
$$;

create or replace function public.lms_lesson_course_id(p_lesson_id uuid)
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select m.course_id
  from public.lms_lessons l
  join public.lms_modules m on m.id = l.module_id
  where l.id = p_lesson_id
$$;

-- Catalog view (same columns as lms_lessons; RLS on the table applies).
create or replace view public.lms_lesson_catalog
with (security_invoker = true) as
select
  id,
  module_id,
  slug,
  title,
  excerpt,
  duration_minutes,
  cover_image_url,
  sort_order
from public.lms_lessons;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.lms_courses enable row level security;
alter table public.lms_modules enable row level security;
alter table public.lms_lessons enable row level security;
alter table public.lms_lesson_media enable row level security;
alter table public.lms_entitlements enable row level security;

drop policy if exists lms_courses_select_published on public.lms_courses;
create policy lms_courses_select_published
  on public.lms_courses
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists lms_modules_select_published on public.lms_modules;
create policy lms_modules_select_published
  on public.lms_modules
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.lms_courses c
      where c.id = course_id
        and c.status = 'published'
    )
  );

drop policy if exists lms_lessons_select_published on public.lms_lessons;
create policy lms_lessons_select_published
  on public.lms_lessons
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.lms_modules m
      join public.lms_courses c on c.id = m.course_id
      where m.id = module_id
        and c.status = 'published'
    )
  );

drop policy if exists lms_lesson_media_select_entitled on public.lms_lesson_media;
create policy lms_lesson_media_select_entitled
  on public.lms_lesson_media
  for select
  to authenticated
  using (public.lms_user_has_course_access(public.lms_lesson_course_id(lesson_id)));

drop policy if exists lms_entitlements_select_own on public.lms_entitlements;
create policy lms_entitlements_select_own
  on public.lms_entitlements
  for select
  to authenticated
  using (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE for anon or authenticated.
-- Grants stay in the SQL editor / later admin (service role).

grant select on public.lms_courses to anon, authenticated;
grant select on public.lms_modules to anon, authenticated;
grant select on public.lms_lessons to anon, authenticated;
grant select on public.lms_lesson_catalog to anon, authenticated;
grant select on public.lms_lesson_media to authenticated;
grant select on public.lms_entitlements to authenticated;

grant execute on function public.lms_user_has_course_access(uuid) to anon, authenticated;
grant execute on function public.lms_lesson_course_id(uuid) to authenticated;
