-- Profiles, admin role helper, and RLS so the anon key is safe for a shared public LMS.
-- Apply this migration BEFORE deploying the Next.js admin-role guard.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

-- New Auth users get a student profile. Existing dashboard users are backfilled as admin below.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, role)
SELECT id, 'admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET role = 'admin', updated_at = now();

-- ---------------------------------------------------------------------------
-- is_admin() — used by RLS; SECURITY DEFINER avoids profiles RLS recursion
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Dashboard view: evaluate as the caller so underlying table RLS applies
-- ---------------------------------------------------------------------------

ALTER VIEW public.dashboard_program_summary SET (security_invoker = true);

REVOKE ALL ON public.dashboard_program_summary FROM PUBLIC, anon;
GRANT SELECT ON public.dashboard_program_summary TO authenticated;

-- ---------------------------------------------------------------------------
-- Table RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs FORCE ROW LEVEL SECURITY;

ALTER TABLE public.program_public_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_public_contents FORCE ROW LEVEL SECURITY;

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants FORCE ROW LEVEL SECURITY;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments FORCE ROW LEVEL SECURITY;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses FORCE ROW LEVEL SECURITY;

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance FORCE ROW LEVEL SECURITY;

ALTER TABLE public.program_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_sessions FORCE ROW LEVEL SECURITY;

-- profiles: users can read their own row; admins can read all. Role changes are SQL-only.
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
CREATE POLICY "Users can select own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

-- programs: public catalog is active-only; admins see and manage every row
DROP POLICY IF EXISTS "Public can select active programs" ON public.programs;
CREATE POLICY "Public can select active programs"
ON public.programs
FOR SELECT
TO anon, authenticated
USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
CREATE POLICY "Admins can manage programs"
ON public.programs
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- program_public_contents: readable when the parent program is public
DROP POLICY IF EXISTS "Public can select active program contents" ON public.program_public_contents;
CREATE POLICY "Public can select active program contents"
ON public.program_public_contents
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.programs
    WHERE programs.id = program_public_contents.program_id
      AND programs.status = 'active'
  )
);

DROP POLICY IF EXISTS "Admins can manage program public contents" ON public.program_public_contents;
CREATE POLICY "Admins can manage program public contents"
ON public.program_public_contents
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Sensitive tables: admin-only. Public registration/check-in use the service role (bypasses RLS).
DROP POLICY IF EXISTS "Admins can manage participants" ON public.participants;
CREATE POLICY "Admins can manage participants"
ON public.participants
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments"
ON public.payments
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;
CREATE POLICY "Admins can manage expenses"
ON public.expenses
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
CREATE POLICY "Admins can manage attendance"
ON public.attendance
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage program sessions" ON public.program_sessions;
CREATE POLICY "Admins can manage program sessions"
ON public.program_sessions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Privileges: anon must not write; keep public SELECT only on catalog tables
-- ---------------------------------------------------------------------------

REVOKE INSERT, UPDATE, DELETE ON public.programs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.program_public_contents FROM anon;

REVOKE ALL ON public.participants FROM anon;
REVOKE ALL ON public.payments FROM anon;
REVOKE ALL ON public.expenses FROM anon;
REVOKE ALL ON public.attendance FROM anon;
REVOKE ALL ON public.program_sessions FROM anon;
REVOKE ALL ON public.profiles FROM anon;

GRANT SELECT ON public.programs TO anon, authenticated;
GRANT SELECT ON public.program_public_contents TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: banner writes are admin-only; public read stays for registration pages
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated upload program banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update program banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete program banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload program banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins update program banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete program banners" ON storage.objects;

CREATE POLICY "Admins upload program banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'program-banners' AND public.is_admin());

CREATE POLICY "Admins update program banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'program-banners' AND public.is_admin())
WITH CHECK (bucket_id = 'program-banners' AND public.is_admin());

CREATE POLICY "Admins delete program banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'program-banners' AND public.is_admin());
