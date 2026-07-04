# ADR 0001 — Use Supabase for Authentication

| Field | Detail |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-04 |
| **Decision by** | Product owner (explicit instruction) |
| **Affects** | [03_SYSTEM_ARCHITECTURE](../03_SYSTEM_ARCHITECTURE.md) · [05_API_SPEC](../05_API_SPEC.md) · [06_PERMISSION_MATRIX](../06_PERMISSION_MATRIX.md) · [08_CODING_STANDARDS](../08_CODING_STANDARDS.md) |

## Context

The original blueprint (doc 03 §2 and doc 05 §2) specified authentication via a
**NestJS backend issuing JWT access/refresh tokens**, with passwords hashed by
the application. When implementing the Authentication module, the product owner
directed that **Supabase Authentication** be used instead.

## Decision

Authentication, session management, and the user identity store are provided by
**Supabase Auth + Supabase Postgres**, consumed directly from the **Next.js**
app (App Router) using `@supabase/ssr`. There is no separate NestJS auth service
for this module.

- **Login / Logout / Forgot Password / Reset** use Supabase Auth
  (`signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser`).
- **Session management** uses Supabase cookie-based sessions, refreshed in
  Next.js middleware.
- **Roles / RBAC** are preserved from the blueprint: a `profiles` table holds a
  `user_role` enum matching the role codes in doc 06 (`owner`, `admin`, `ae`,
  `site_engineer`, `worker`, `client` for the current scope), enforced with
  Row Level Security and a privilege-escalation guard.

## What stays aligned with the docs

- **PostgreSQL** remains the database (doc 02) — Supabase *is* Postgres.
- **Roles and access rules** follow doc 06 exactly (codes, least privilege,
  external vs. internal roles, no self-elevation of role).
- **TypeScript strict, naming, structure, validation, security** follow doc 08.
- **Design tokens and components** follow doc 04.
- **Auth endpoints' behavior** (login, logout, forgot/reset, `/auth/me` via a
  session helper) matches the intent of doc 05 §2, even though transport is
  Supabase rather than custom REST.

## Consequences

- **Superseded:** JWT-issued-by-NestJS auth described in doc 03 §6 and doc 05 §2
  for the auth flow. Supabase manages tokens and refresh.
- **Later modules:** business modules can still be built as a separate API
  (NestJS) or as Next.js server actions/route handlers; either way they
  authorize requests using the Supabase session + the `profiles.role` and the
  permission model in doc 06. RLS provides a defense-in-depth layer at the DB.
- **RBAC codes:** the `module.action` permission catalog in doc 06 remains the
  source of truth; role→permission enforcement for business endpoints will be
  layered on top of the Supabase-authenticated identity.
- **Follow-up:** when docs 03/05 are next revised, update their auth sections to
  reference this ADR rather than the JWT/NestJS auth mechanism.

## Notes

Scope of the implementing change is **Authentication only**; no other modules
were built. See `apps/web/README.md` for setup and
`supabase/migrations/0001_auth_profiles.sql` for the schema.
