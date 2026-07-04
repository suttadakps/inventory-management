# @artiverges/database

Database schema and typed Prisma client for **ARTIVERGES NEXT**.

> Covers the core entities: Users (profiles), Clients, Projects, ProjectMembers,
> BOQ (+ items), Quotation (+ items), Expenses (+ items), Payments, Payroll,
> Suppliers, Materials, PurchaseOrders (+ items), Tasks, Documents, Photos,
> Notifications. Modeled per `../../docs/02_DATABASE.md`.

## Source of truth

There are two artifacts, kept in sync:

| Artifact | Role |
|---|---|
| `../../supabase/migrations/*.sql` | **Authoritative for deployment.** Applied to the Supabase Postgres database (Supabase is our Postgres — see `../../docs/adr/0001`). |
| `prisma/schema.prisma` | Mirrors the SQL; generates the typed client used by the (future) API layer. |

- `0001_auth_profiles.sql` — auth: `profiles`, `user_role`, RLS, signup trigger.
- `0002_core_schema.sql` — all core business tables, indexes, constraints,
  `updated_at` triggers, and baseline RLS.

The Prisma `User` model maps to the existing `profiles` table (1:1 with Supabase
`auth.users`). Audit columns (`created_by`/`updated_by`) and a few external links
are stored as scalar UUIDs with FKs enforced in SQL.

## Setup

```bash
cd packages/database
npm install
cp .env.example .env        # fill DATABASE_URL / DIRECT_URL from Supabase
```

## Apply the schema (Supabase)

```bash
supabase db push
# or run each file in the Supabase SQL Editor, in order (0001, then 0002)
```

## Prisma commands

```bash
npm run validate   # validate schema
npm run format     # format schema
npm run generate   # generate the typed client
npm run db:pull    # re-introspect the DB into schema.prisma (drift check)
npm run studio     # browse data
```

## Usage

```ts
import { prisma } from "@artiverges/database";

const projects = await prisma.project.findMany({
  where: { status: "active" },
  include: { client: true, members: true },
});
```

## Design notes

- **Money** is `numeric(14,2)`; **quantities** `numeric(14,3)`. Never floats.
- **UUID** primary keys (`gen_random_uuid()`).
- **Soft delete** via `deleted_at` on business tables; partial indexes target
  active rows.
- **Check constraints** guard non-negative amounts/quantities,
  `progress_pct` ∈ [0,100], and `end_date >= start_date`.
- **RLS** is enabled on every table as a coarse safety net (staff baseline +
  scoped client-portal read). Fine-grained RBAC is enforced at the
  application/API layer per `../../docs/06_PERMISSION_MATRIX.md`.
- Verified: Prisma `validate`/`generate` pass, and both SQL migrations execute
  cleanly on a real Postgres engine.
```
