# Security

This admin app (`digica-dashboard`) shares a Supabase project with the public LMS. Authorization is enforced in two places: **Postgres RLS** (anon key) and **Next.js route guards** (`role = 'admin'`).

## Roles

| Role | Who | Access |
|---|---|---|
| `admin` | Dashboard operators | Full CRUD in this app (session + anon key, allowed by RLS) |
| `student` | Default for every new Auth user | Cannot use admin routes. May `SELECT` active programs (and their public contents) with the anon key. Cannot read participants, payments, expenses, attendance, sessions, or the dashboard view. |

Roles live in `public.profiles`, keyed by `auth.users.id`. A trigger on `auth.users` INSERT creates a profile with `role = 'student'`. Existing Auth users were backfilled as `admin` when the migration first ran.

Do not change `role` from the client. There is no authenticated UPDATE policy on `profiles`.

## Clients and keys

- **Browser / middleware:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. RLS applies.
- **Public registration and check-in APIs:** `SUPABASE_SERVICE_ROLE_KEY` on the server only (`src/lib/supabase-admin.ts`). Service role bypasses RLS. Never expose this key to the client or to the LMS browser bundle.

Public pages (`/r/`, `/c/`, `/registration/`, `/check-in/`) stay unauthenticated and keep calling `/api/registration` and `/api/check-in`.

## Promote a user to admin

In the Supabase SQL Editor (same project), using the email they type in the admin login Username field:

```sql
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
```

Confirm:

```sql
SELECT u.email, p.role
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
ORDER BY u.email;
```

## Demote an admin

```sql
UPDATE public.profiles
SET role = 'student', updated_at = now()
WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
```

They will be signed out of the dashboard on the next request.

## Apply the migration (required before deploying the app)

Run this **before** shipping the Next.js role guard, or admins can be locked out if `profiles` is missing.

1. Open the **same** Supabase project the LMS will use.
2. Apply [supabase/migrations/20260814120000_profiles_rls_and_admin_role.sql](supabase/migrations/20260814120000_profiles_rls_and_admin_role.sql):
   - **SQL Editor:** paste and run the file, or
   - **CLI** (if this repo is linked): `supabase db push`
3. Check your row is `admin` with the confirm query above. If not, run the promote SQL.
4. Then deploy this Next.js app.

Optional checks with the anon key (API docs or a logged-out client):

- `programs` with `status = 'draft'` must not be returned
- `participants` / `payments` select must fail or return empty
