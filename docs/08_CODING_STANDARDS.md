# ARTIVERGES NEXT — Coding Standards

| Field | Detail |
|---|---|
| **Document** | 08_CODING_STANDARDS — Engineering Conventions |
| **Product** | ARTIVERGES NEXT |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |
| **Related** | [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md) · [05_API_SPEC](05_API_SPEC.md) · [07_DEVELOPMENT_ROADMAP](07_DEVELOPMENT_ROADMAP.md) |

> Engineering conventions for building ARTIVERGES NEXT consistently and safely. These standards are mandatory for all contributors and enforced through tooling and code review. This document describes rules and conventions — not application code.

---

## Table of Contents
1. [Guiding Principles](#1-guiding-principles)
2. [Languages & Tooling](#2-languages--tooling)
3. [Project Structure](#3-project-structure)
4. [Naming Conventions](#4-naming-conventions)
5. [TypeScript Rules](#5-typescript-rules)
6. [Backend Conventions](#6-backend-conventions)
7. [Frontend Conventions](#7-frontend-conventions)
8. [API & Data Rules](#8-api--data-rules)
9. [Error Handling & Logging](#9-error-handling--logging)
10. [Security Rules](#10-security-rules)
11. [Testing Standards](#11-testing-standards)
12. [Git Workflow & Commits](#12-git-workflow--commits)
13. [Code Review Checklist](#13-code-review-checklist)
14. [Documentation](#14-documentation)

---

## 1 Guiding Principles

1. **Consistency beats cleverness** — code should read like one author wrote it.
2. **Correctness in money and permissions is non-negotiable** — financial and RBAC code gets extra scrutiny and tests.
3. **Small, vertical, reviewable changes** — one feature slice per PR.
4. **Fail loudly, recover safely** — validate inputs, handle errors explicitly, never swallow exceptions.
5. **Types are documentation** — leverage TypeScript to make illegal states unrepresentable.
6. **Least privilege everywhere** — every endpoint and query respects RBAC and project scope.

---

## 2 Languages & Tooling

| Concern | Standard |
|---|---|
| Language | TypeScript (strict) across frontend, backend, and mobile. |
| Backend | NestJS + Prisma (or TypeORM). |
| Frontend | Next.js (React) + Tailwind. |
| Package manager | pnpm (workspaces / monorepo). |
| Linting | ESLint (shared config), fails CI on error. |
| Formatting | Prettier — single source of truth, no manual style debates. |
| Type checking | `tsc --noEmit` in CI; `strict: true`. |
| Commit hooks | Husky + lint-staged (lint, format, type-check on commit). |
| Testing | Vitest/Jest (unit), Supertest (API), Playwright (E2E). |

---

## 3 Project Structure

**Monorepo (pnpm workspaces):**
```
/apps
  /web        Next.js web app
  /api        NestJS backend
  /mobile     React Native (Phase 2)
/packages
  /ui         shared design-system components
  /types      shared TypeScript types / API contracts
  /config     shared eslint/tsconfig/tailwind
  /utils      shared helpers
```

**Backend module folder (per domain):**
```
/modules/<domain>
  <domain>.controller.ts
  <domain>.service.ts
  <domain>.repository.ts
  dto/
  entities/
  <domain>.module.ts
  <domain>.spec.ts
```

**Frontend feature folder:**
```
/features/<domain>
  components/
  hooks/         (TanStack Query hooks)
  api.ts         (typed client calls)
  pages or routes
```

Modules never import another module's internals — only its public service interface or shared `packages/types`.

---

## 4 Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Files (TS modules) | kebab-case | `purchase-order.service.ts` |
| React components | PascalCase file + export | `ProjectCostCard.tsx` |
| Variables / functions | camelCase | `calculateActualCost()` |
| Types / interfaces / classes | PascalCase | `PurchaseOrder`, `CreateExpenseDto` |
| Enums | PascalCase name, UPPER values | `PoStatus.RECEIVED` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Booleans | `is/has/can` prefix | `isApproved`, `canApprove` |
| DB tables/columns | snake_case | `purchase_orders`, `project_id` |
| API routes | kebab plural | `/purchase-orders` |
| Permission codes | `module.action` | `expense.approve` |

Avoid abbreviations except well-known ones (`id`, `po`, `boq`, `url`).

---

## 5 TypeScript Rules

- `strict: true`; no implicit `any`. Use `unknown` + narrowing over `any`.
- **No `any`** in committed code (lint-enforced). Justify rare exceptions inline.
- Prefer **types/interfaces** for all API payloads; share via `packages/types`.
- Use **discriminated unions** for state (e.g., approval decisions) to make illegal states unrepresentable.
- Validate all external input at the boundary (DTO validation) — never trust request bodies.
- No non-null assertions (`!`) except with a clear, commented invariant.
- Prefer `readonly` and immutability; avoid mutating shared objects.

---

## 6 Backend Conventions

- **Layered:** controller → service → repository (see [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md)). Controllers hold no business logic.
- **DTOs** with class-validator for every request; reject unknown fields.
- **Transactions:** any multi-table write (e.g., approve PO + book cost + notify) runs in a single DB transaction.
- **Guards** enforce authentication, permission code, and project scope on every route.
- **Domain events** for side effects; keep services focused.
- **Money:** use decimal types, never floats. Centralize rounding/tax in a finance util. Currency from settings.
- **Idempotency** on financial create endpoints via `Idempotency-Key`.
- **No business logic in the ORM layer**; repositories only fetch/persist.

---

## 7 Frontend Conventions

- **Server state** via TanStack Query; **local UI state** via Zustand/React state. Don't duplicate server data in global stores.
- **Typed API client** only — no raw `fetch` scattered in components; all calls go through `features/*/api.ts` using shared types.
- **Components:** presentational vs. container separation; keep components small and composable.
- **Design system first** — use `packages/ui`; never hand-roll a button/input that exists.
- **All states handled:** loading (skeleton), empty, error, success for every async view (per [04_UI_DESIGN_SYSTEM](04_UI_DESIGN_SYSTEM.md)).
- **RBAC in UI:** hide/disable actions the user's permissions don't allow (server still enforces — UI is convenience, not security).
- **Accessibility:** semantic HTML, labels, keyboard support, focus management (WCAG 2.1 AA).
- **No inline magic numbers/colors** — use design tokens.

---

## 8 API & Data Rules

- Follow [05_API_SPEC](05_API_SPEC.md): REST conventions, envelope, error shape, pagination.
- **camelCase** JSON; **snake_case** DB; map at the repository boundary.
- **Never expose** internal fields (password hashes, soft-delete internals) in responses.
- **Migrations** are forward-only, reviewed, and reversible where feasible; never edit a shipped migration.
- **No raw SQL** for business logic unless performance-justified and reviewed; parameterize always.
- Pagination defaults enforced server-side (`pageSize` max 100).

---

## 9 Error Handling & Logging

- Throw typed domain errors; a global exception filter maps them to the standard API error shape + correct HTTP code.
- **Never swallow errors** silently; never `catch {}` without handling or rethrowing.
- **Structured logging** (JSON) with `requestId`, `userId`, module, action. No secrets or PII in logs.
- Log levels: `error` (actionable), `warn` (recoverable), `info` (key events), `debug` (dev only).
- User-facing messages are clear and non-technical; technical detail stays in logs.

---

## 10 Security Rules

- **Enforce RBAC on the server for every request** — the UI is not a security boundary.
- Validate and sanitize all input; rely on parameterized queries/ORM to prevent injection.
- Passwords hashed with argon2/bcrypt; never logged or returned.
- Secrets via environment/secret manager — **never** committed. `.env` is gitignored.
- Enforce HTTPS/TLS; secure, httpOnly, sameSite cookies for refresh tokens.
- Apply the least-privilege principle to DB users and service credentials.
- Follow OWASP Top 10; run dependency and secret scanning in CI.
- Audit-log all financial mutations and permission changes.
- File uploads: validate type/size; serve via signed URLs; never trust client-provided paths.

---

## 11 Testing Standards

| Layer | Requirement |
|---|---|
| **Unit** | All services, especially finance (cost rollups, tax, thresholds) and RBAC logic. |
| **API/Integration** | Every endpoint: happy path + auth/permission denial + validation errors. |
| **E2E** | Critical flows: lead→contract, requisition→PO→receipt, expense approval, invoice→payment. |
| **Coverage** | Meaningful coverage on business logic (target ≥ 80% on services); no coverage-gaming. |
| **RBAC tests** | Each protected endpoint verified against allowed and denied roles. |
| **Fixtures** | Deterministic seed data; no reliance on prod data. |

Tests run in CI on every PR; failing tests block merge.

---

## 12 Git Workflow & Commits

- **Trunk-based with short-lived branches:** `feature/<scope>`, `fix/<scope>`, `chore/<scope>`.
- **Never commit directly to `main`.** All changes via PR with review.
- **Conventional Commits:** `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:` — e.g., `feat(procurement): add PO goods receipt`.
- Keep PRs small and focused (one vertical slice).
- **Green CI required** to merge (lint, types, tests, build).
- Squash-merge with a clean, descriptive title.

---

## 13 Code Review Checklist

Reviewers confirm:
- [ ] Correct and matches the requirement/acceptance criteria.
- [ ] RBAC + project scope enforced on new endpoints.
- [ ] Money handled with decimals; tax/rounding centralized.
- [ ] Multi-table writes are transactional.
- [ ] Input validated; errors mapped to the standard shape.
- [ ] Tests added (happy + permission-denied + validation).
- [ ] No secrets, no `any`, no dead/commented code.
- [ ] UI handles loading/empty/error; uses design tokens & shared components.
- [ ] Migrations reviewed and safe.
- [ ] Docs/permission codes/API spec updated if the contract changed.

---

## 14 Documentation

- **Public contracts** (API) stay in sync with [05_API_SPEC](05_API_SPEC.md) / generated OpenAPI.
- **New permission codes** added to [06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md).
- Non-obvious business rules documented as concise code comments explaining *why*, not *what*.
- Each package/app has a README covering setup and run.
- Architecture-affecting decisions recorded as short ADRs (Architecture Decision Records).

---

*End of Document — 08_CODING_STANDARDS.md · ARTIVERGES NEXT · v1.0*
