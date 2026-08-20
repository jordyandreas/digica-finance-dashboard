# Digica Academy Dashboard

Internal admin dashboard and public program flow for Digica Academy.

This app is used to manage programs, participants, payments, expenses, attendance, and public registration/check-in links from one codebase. It includes a protected admin area plus public pages that can be shared directly with participants.

## What Is Implemented

### Admin dashboard

- Admin-only access with Supabase Auth session checks and role-based route protection.
- Dashboard summary with yearly filtering.
- Revenue, expense, and net profit cards.
- Program summary table with pagination.
- Optional financial value masking in the UI.

### Program management

- Create, edit, and delete programs.
- Supported program types:
  - `mini_bootcamp`
  - `bootcamp`
  - `workshop`
- Program fields already supported in the app include:
  - name, type, year, batch, status
  - start/end date and time
  - schedule days
  - price and workshop promo pricing
  - session count
  - public slug / public code
  - external registration link
  - bootcamp/mini-bootcamp registration link from workshops
  - WhatsApp group link
  - public summary / benefits content
  - registration banner and workshop promo banner
  - Open Graph image path

### Participant management

- Participant list per program with pagination.
- Search by participant name.
- Filter by payment status.
- Workshop-only filter for `secure_seat_interest`.
- Add, edit, and delete participants.

### Payments

- Record and manage participant payments per program.
- Payment filtering by status and payment type.
- Supported payment types in the codebase:
  - `full`
  - `tenor`
  - `scholarship`
- Revenue summary card per program.
- Tenor tracking, including paid tenor progress.
- Tenor follow-up alert in the payments module.

### Expenses

- Record, edit, and delete program expenses.
- Expense summary card per program.
- Paginated expense table.

### Attendance

- Session-based attendance management per program.
- Public check-in only allows valid sessions for the current day.
- Attendance export to CSV.
- Workshop attendance flow can capture `secure_seat_interest`.

### Public registration flow

- Public registration pages at `/registration/[programId]` and short links at `/r/[identifier]`.
- Public pages can resolve either `public_slug` or `public_code`.
- Program registration banner support.
- Program summary / benefits rendered from rich text HTML.
- Workshop promo-aware registration flow via `source=workshop_promo`.
- Paid registration package handling for mini bootcamp / bootcamp flows.
- WhatsApp CTA for inquiries and other active programs.
- Closed/completed program handling on public registration pages.
- Share metadata / Open Graph metadata for registration pages.

### Public check-in flow

- Public check-in pages at `/check-in/[programId]` and short links at `/c/[identifier]`.
- Participant lookup and session selection for valid check-in sessions.
- Workshop secure-seat follow-up flow after check-in.
- Promo banner support on workshop check-in.
- WhatsApp help CTA for invalid or unavailable check-in flows.
- Share metadata / Open Graph metadata for check-in pages.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Database
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Zustand
- TipTap editor
- Radix UI
- Sonner

## Main Routes

### Protected admin routes

- `/dashboard`
- `/programs`
- `/programs/[id]/participants`
- `/programs/[id]/payments`
- `/programs/[id]/expenses`
- `/programs/[id]/attendance`

### Public routes

- `/login`
- `/logout`
- `/registration/[programId]`
- `/check-in/[programId]`
- `/r/[identifier]`
- `/c/[identifier]`

## Authentication and Roles

Admin routes require `public.profiles.role = 'admin'`.

- New Auth users default to `student`.
- Non-admin users are blocked from admin routes.
- Public registration and check-in pages remain accessible without login.

Read [SECURITY.md](SECURITY.md) before deploying or promoting users.

## Required Environment Variables

Create local environment values for:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PUBLIC_APP_URL=
NEXT_PUBLIC_ADMIN_WHATSAPP=
```

### Variable usage

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: browser and middleware access with RLS applied.
- `SUPABASE_SERVICE_ROLE_KEY`: server-side access for public registration and check-in APIs.
- `NEXT_PUBLIC_PUBLIC_APP_URL`: base public URL used for canonical/share links.
- `NEXT_PUBLIC_ADMIN_WHATSAPP`: admin WhatsApp number used in inquiry/help/payment CTAs.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The app redirects `/` to `/dashboard`.

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm type-check
pnpm normalize-participant-phones
```

### Script notes

- `pnpm normalize-participant-phones`: runs `scripts/normalize-participant-phones.ts` using `.env.local`.

## Supabase Notes

The codebase currently depends on these main tables/views:

- `profiles`
- `programs`
- `program_public_contents`
- `participants`
- `payments`
- `expenses`
- `program_sessions`
- `attendance`
- `dashboard_program_summary`

Apply the required Supabase migration for roles/RLS before shipping admin access changes. See [SECURITY.md](SECURITY.md).

## UI and Content Notes

- Program public content supports rich text summaries via TipTap.
- Financial values can be hidden in the dashboard UI.
- CSV export is implemented for attendance-related participant lists.
- Short public links support both generated codes and custom slugs.

## Deployment

Before deployment:

1. Configure all required environment variables.
2. Apply the Supabase role/RLS migration.
3. Confirm at least one user has `admin` role in `public.profiles`.
4. Verify the public app URL matches your production domain.

This project can be deployed to any platform that supports Next.js and the required environment variables.
