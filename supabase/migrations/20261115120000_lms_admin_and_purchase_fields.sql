-- LMS admin write access + purchase/ops fields for recorded courses.
-- Shared Supabase project with digica-academy-lms.

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

alter table public.lms_courses
  add column if not exists price_idr integer,
  add column if not exists whatsapp_offer_message text,
  add column if not exists is_purchasable boolean not null default true;

alter table public.lms_entitlements
  add column if not exists granted_by uuid references auth.users (id) on delete set null,
  add column if not exists notes text;

comment on column public.lms_courses.price_idr is
  'Optional numeric IDR price for ops/WhatsApp; display still uses price_label.';
comment on column public.lms_courses.whatsapp_offer_message is
  'Optional custom WhatsApp body snippet when a learner requests this course.';
comment on column public.lms_courses.is_purchasable is
  'When false, hide buy CTA (catalog may still show published course).';
comment on column public.lms_entitlements.granted_by is
  'Admin auth.users id who last granted/updated this entitlement, if known.';
comment on column public.lms_entitlements.notes is
  'Ops notes (e.g. WhatsApp payment reference).';

-- ---------------------------------------------------------------------------
-- Admin RLS (profiles.role = admin via public.is_admin())
-- Learner policies stay as-is: published select + own entitlements select.
-- ---------------------------------------------------------------------------

drop policy if exists "Admins can manage lms_courses" on public.lms_courses;
create policy "Admins can manage lms_courses"
  on public.lms_courses
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can manage lms_modules" on public.lms_modules;
create policy "Admins can manage lms_modules"
  on public.lms_modules
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can manage lms_lessons" on public.lms_lessons;
create policy "Admins can manage lms_lessons"
  on public.lms_lessons
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can manage lms_lesson_media" on public.lms_lesson_media;
create policy "Admins can manage lms_lesson_media"
  on public.lms_lesson_media
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can manage lms_entitlements" on public.lms_entitlements;
create policy "Admins can manage lms_entitlements"
  on public.lms_entitlements
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant insert, update, delete on public.lms_courses to authenticated;
grant insert, update, delete on public.lms_modules to authenticated;
grant insert, update, delete on public.lms_lessons to authenticated;
grant select, insert, update, delete on public.lms_lesson_media to authenticated;
grant insert, update, delete on public.lms_entitlements to authenticated;

revoke insert, update, delete on public.lms_courses from anon;
revoke insert, update, delete on public.lms_modules from anon;
revoke insert, update, delete on public.lms_lessons from anon;
revoke insert, update, delete on public.lms_lesson_media from anon;
revoke insert, update, delete on public.lms_entitlements from anon;
