# ARTIVERGES NEXT — Web App

Next.js (App Router) + TypeScript + Tailwind + **Supabase Authentication**.

> Scope of this app right now: **Authentication only** — Login, Logout, Forgot
> Password, and Session Management, with role-based access for Owner, Admin, AE,
> Site Engineer, Worker, and Client. No other modules are implemented yet.
> See `../../docs/` for the full blueprint; this README covers setup.

---

## 1. Prerequisites

- Node.js ≥ 20 (tested on 24)
- A Supabase project (free tier is fine)
- `npm` (or `pnpm` — the repo is a pnpm workspace; npm works standalone here)

## 2. Install

```bash
cd apps/web
npm install
```

## 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in from your Supabase project (**Settings → API**):

| Variable | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` public key |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in dev |

## 4. Apply the database schema

Run `../../supabase/migrations/0001_auth_profiles.sql` against your Supabase
database — via the **SQL Editor** (paste & run) or the Supabase CLI:

```bash
supabase db push        # or: psql "$DATABASE_URL" -f ../../supabase/migrations/0001_auth_profiles.sql
```

This creates the `user_role` enum, the `profiles` table, RLS policies, the
signup trigger (auto-creates a profile per user), and a guard preventing users
from changing their own role.

## 5. Supabase Auth settings

In the Supabase dashboard:

1. **Authentication → Providers → Email:** enabled. For quick local testing you
   may turn **Confirm email** off (turn it back on for production).
2. **Authentication → URL Configuration → Redirect URLs:** add
   `http://localhost:3000/auth/callback` (and your production equivalent). This
   is required for the password-reset link to work.

## 6. Create your first user

Supabase does not expose public sign-up in this app (auth is invite/admin-driven
per the PRD). Create a user, then set their role:

1. **Authentication → Users → Add user** (set a password). The trigger creates a
   matching `profiles` row with role `client`.
2. Promote them in the **SQL Editor**:
   ```sql
   update public.profiles set role = 'owner'
   where email = 'you@artiverges.app';
   ```

## 7. Run

```bash
npm run dev        # http://localhost:3000
```

- Visiting `/` redirects to `/dashboard`; unauthenticated users are sent to
  `/login` by the middleware.
- Sign in → placeholder dashboard showing your email + role, with **Sign out**.
- **Forgot password?** → enter email → reset link → `/reset-password`.

## 8. Quality gates

```bash
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # next lint
npm run build        # production build
```

---

## Structure (Auth module)

```
apps/web/
├── middleware.ts                      # session refresh + route protection
└── src/
    ├── app/
    │   ├── (auth)/                     # login · forgot-password · reset-password
    │   ├── auth/callback/route.ts      # PKCE code exchange (reset flow)
    │   ├── dashboard/page.tsx          # placeholder protected route
    │   ├── layout.tsx · globals.css · page.tsx
    ├── components/
    │   ├── auth/                       # LoginForm · ForgotPasswordForm · ResetPasswordForm
    │   └── ui/                         # Button · Input · Label · Alert (design tokens)
    └── lib/
        ├── auth/                       # actions · session (RBAC) · roles
        ├── supabase/                   # browser · server · middleware clients
        ├── validation/auth.ts          # zod schemas
        └── utils/cn.ts
```

Design tokens, component styles, and status colors follow
`../../docs/04_UI_DESIGN_SYSTEM.md`. Roles and access rules follow
`../../docs/06_PERMISSION_MATRIX.md`.
