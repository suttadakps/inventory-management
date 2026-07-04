# ARTIVERGES NEXT — Documentation Hub

| Field | Detail |
|---|---|
| **Product** | ARTIVERGES NEXT |
| **Company** | ARTIVERGES GROUP |
| **What it is** | Internal ERP & construction management platform — sales to project delivery to after-sales. |
| **Platform** | Responsive Web (Phase 1) · Mobile App (Phase 2) |
| **Status** | Documentation baseline — v1.0 |
| **Last Updated** | 2026-07-03 |

> **This is the entry point for every developer and AI agent working on ARTIVERGES NEXT.**
> Read this file first. It explains what each document is, the order to read them in, and how to use them **before writing any code**. The `docs/` folder is the single source of truth — if code and docs disagree, that is a bug to be reconciled, not ignored.

---

## Table of Contents
1. [How to Use This Documentation](#1-how-to-use-this-documentation)
2. [The Documents](#2-the-documents)
3. [Recommended Reading Order](#3-recommended-reading-order)
4. [Developer Workflow — Before You Write Code](#4-developer-workflow--before-you-write-code)
5. [Architecture Principles](#5-architecture-principles)
6. [Project Conventions (Quick Reference)](#6-project-conventions-quick-reference)
7. [Guidance for AI Agents](#7-guidance-for-ai-agents)
8. [Document Ownership & Change Control](#8-document-ownership--change-control)

---

## 1 How to Use This Documentation

These ten documents form a **connected blueprint**. Each answers a different question:

- **What are we building and why?** → the PRD.
- **How is data shaped?** → the Database doc.
- **How does the system fit together?** → Architecture.
- **What does it look and feel like?** → UI Design System.
- **How do clients talk to the server?** → API Spec.
- **Who can do what?** → Permission Matrix.
- **In what order do we build it?** → Development Roadmap.
- **How do we write the code?** → Coding Standards.
- **What does the AI layer do?** → AI Features.
- **How do we ship and run it?** → Deployment.

**Golden rule:** never start a feature by opening an empty file. Start by reading the relevant docs (§4), because every feature touches at least the PRD, Database, API Spec, Permission Matrix, and Coding Standards.

---

## 2 The Documents

| # | Document | Purpose | Read it when… |
|---|---|---|---|
| 00 | **[README.md](README.md)** *(this file)* | Entry point, reading order, conventions. | Always first. |
| 01 | **[01_PRD.md](01_PRD.md)** | Product vision, personas, roles, the 24 core modules, business workflows, MVP scope, roadmap, success metrics. The *why* and *what*. | Before any work — understand the product and the module you're building. |
| 02 | **[02_DATABASE.md](02_DATABASE.md)** | Logical data model: entities, relationships, ERD, enums/status lifecycles, indexing, integrity, auditing. | Before touching data, models, or migrations. |
| 03 | **[03_SYSTEM_ARCHITECTURE.md](03_SYSTEM_ARCHITECTURE.md)** | Tech stack, modular structure, layers, auth/RBAC, approval engine, files, real-time, AI, non-functional requirements. | Before designing any feature — know where your code lives. |
| 04 | **[04_UI_DESIGN_SYSTEM.md](04_UI_DESIGN_SYSTEM.md)** | Design tokens (color/type/spacing), components, status colors, app shell, responsive, accessibility. | Before building any UI. |
| 05 | **[05_API_SPEC.md](05_API_SPEC.md)** | REST conventions, auth, error shapes, pagination, endpoint catalog, approvals, uploads, WebSocket. | Before adding or calling any endpoint. |
| 06 | **[06_PERMISSION_MATRIX.md](06_PERMISSION_MATRIX.md)** | RBAC: roles, permission codes, module×role matrix, project scoping, approval thresholds. | Before adding any endpoint or UI action — every action needs a permission. |
| 07 | **[07_DEVELOPMENT_ROADMAP.md](07_DEVELOPMENT_ROADMAP.md)** | Phasing (Foundation → MVP → V2 → V3), sprint groups, milestones, critical path. | To know if a feature is in scope now or deferred. |
| 08 | **[08_CODING_STANDARDS.md](08_CODING_STANDARDS.md)** | Languages, structure, naming, TS rules, security, testing, git workflow, review checklist. | Before writing code — and again at review time. |
| 09 | **[09_AI_FEATURES.md](09_AI_FEATURES.md)** | AI Assistant capabilities, permission-scoped retrieval, guardrails, privacy, phasing. | Before working on any AI feature. |
| 10 | **[10_DEPLOYMENT.md](10_DEPLOYMENT.md)** | Environments, CI/CD, secrets, DB ops, backups/DR, monitoring, scaling, incident response. | Before deploying, configuring infra, or handling ops. |

---

## 3 Recommended Reading Order

### 3.1 First-time onboarding (read fully, in order)
```
README (this) ──► 01_PRD ──► 03_SYSTEM_ARCHITECTURE ──► 02_DATABASE ──► 06_PERMISSION_MATRIX
      ──► 05_API_SPEC ──► 04_UI_DESIGN_SYSTEM ──► 08_CODING_STANDARDS
      ──► 07_DEVELOPMENT_ROADMAP ──► 09_AI_FEATURES ──► 10_DEPLOYMENT
```
Rationale: understand the product (01), then the shape of the system (03), then the data it runs on (02), then who's allowed to do what (06), then the contract (05) and look-and-feel (04), then how to code it (08). Roadmap, AI, and deployment complete the picture.

### 3.2 By role — where to focus
| Your role | Read closely | Skim |
|---|---|---|
| **Backend engineer** | 01, 02, 03, 05, 06, 08 | 04, 07, 09, 10 |
| **Frontend engineer** | 01, 04, 05, 06, 08 | 02, 03, 07 |
| **Full-stack** | All | — |
| **Mobile engineer (Phase 2)** | 01, 03, 04, 05, 06, 08 | 02, 10 |
| **AI engineer** | 01, 03, 06, 09, 08 | 02, 05 |
| **DevOps / SRE** | 03, 10, 08 | 02, 07 |
| **QA** | 01, 05, 06, 07, 08 | 02, 04 |
| **Designer** | 01, 04, 06 | 03, 05 |
| **PM / stakeholder** | 01, 07 | 06, 09 |

---

## 4 Developer Workflow — Before You Write Code

Follow this checklist **for every feature or ticket**. Do not skip to coding.

1. **Confirm scope & phase** — Is this feature in the current phase? Check the module in **[01_PRD](01_PRD.md)** and the phase in **[07_DEVELOPMENT_ROADMAP](07_DEVELOPMENT_ROADMAP.md)**. If it's a V2/V3 feature, stop — it's out of scope for now.
2. **Understand the requirement** — Re-read the relevant module section in the **PRD** and the workflow it belongs to (§7 of the PRD).
3. **Locate your module** — Find where the code belongs in **[03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE)** §5 (module structure) and the folder layout in **[08_CODING_STANDARDS](08_CODING_STANDARDS)** §3.
4. **Check the data model** — Review the entities/relationships in **[02_DATABASE](02_DATABASE.md)**. If you need a schema change, plan a reviewed, backward-compatible migration.
5. **Define permissions** — Identify the permission code(s) in **[06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md)**. Every endpoint and UI action needs one. Add new codes to that doc *before* release. Confirm project-scope rules.
6. **Design the API** — Follow conventions and the endpoint catalog in **[05_API_SPEC](05_API_SPEC.md)**: envelope, error shape, pagination, approvals interface. Keep shared types in `packages/types`.
7. **Design the UI** — Use tokens and components from **[04_UI_DESIGN_SYSTEM](04_UI_DESIGN_SYSTEM.md)**. Handle loading/empty/error states and status colors. Hide actions the user's permissions don't allow.
8. **Consider AI** — If the feature exposes data the AI Assistant could use, confirm it stays permission-scoped per **[09_AI_FEATURES](09_AI_FEATURES.md)**.
9. **Write to standard** — Apply **[08_CODING_STANDARDS](08_CODING_STANDARDS.md)**: strict TypeScript, layered backend, transactional writes for money, tests (happy + permission-denied + validation).
10. **Verify before merge** — Run the Code Review Checklist in **[08_CODING_STANDARDS](08_CODING_STANDARDS.md)** §13. Update docs (API spec, permission codes) if the contract changed. Green CI required.

> **If your change contradicts a document, that's a signal.** Either the design is wrong (fix the code) or the doc is outdated (update the doc via change control, §8). Never silently diverge.

---

## 5 Architecture Principles

These principles are the "constitution" of the codebase. Every decision should be checkable against them.

1. **Single source of truth.** One relational database; every business fact lives in exactly one authoritative place. Other modules reference it — they don't copy it.
2. **Preserve the commercial thread.** Lead → BOQ → Quotation → Contract → Project → Invoice → Warranty stays connected by explicit relationships so any record is traceable end to end.
3. **Budget vs. actual by design.** Actual cost is always derivable by aggregating real transactions (expenses, POs, inventory, payroll, reimbursements) against the BOQ baseline. This is the platform's flagship capability — protect its correctness.
4. **RBAC is the security boundary — everywhere.** The server enforces permissions and project scope on every request. The UI (and the AI) only ever *reflects* those rules; it never *is* the rule.
5. **Modular but not fragmented.** A modular monolith with clear domain boundaries. Modules talk through service interfaces and domain events, never by reaching into each other's tables — so it can split into services later at low cost.
6. **Financial correctness is non-negotiable.** Money uses decimals (never floats); multi-table writes are transactional; finance is append-corrective (void/adjust, never silent edits); everything is audit-logged.
7. **Assistive AI, never autonomous.** AI drafts, summarizes, and answers within the user's permissions. Humans approve and decide. AI never bypasses RBAC and never writes without confirmation.
8. **Cloud-native and stateless.** Services scale horizontally; state lives in Postgres, Redis, and object storage — not in app memory.
9. **Least privilege by default.** Roles, DB users, service credentials, and external access all get the minimum they need.
10. **Auditable and recoverable.** Soft deletes, audit logs, tested backups. Nothing important is ever truly lost.

---

## 6 Project Conventions (Quick Reference)

Full detail in **[08_CODING_STANDARDS](08_CODING_STANDARDS.md)**; this is the at-a-glance version.

| Area | Convention |
|---|---|
| **Language** | TypeScript (strict) everywhere — web, API, mobile. No `any`. |
| **Stack** | Next.js (web) · NestJS + Prisma/PostgreSQL (API) · Redis · S3 · Claude API · React Native (Phase 2). |
| **Repo** | pnpm monorepo: `/apps` (web, api, worker, mobile) + `/packages` (ui, types, config, utils). |
| **Files** | kebab-case (`purchase-order.service.ts`); React components PascalCase. |
| **Code** | camelCase vars/functions; PascalCase types/classes; UPPER_SNAKE constants; `is/has/can` booleans. |
| **DB** | snake_case tables/columns; UUID PKs; `created_at`/`updated_at`/`deleted_at`; soft deletes. |
| **API** | REST, kebab plural routes (`/purchase-orders`); camelCase JSON; standard envelope + error shape; `/v1` versioned. |
| **Permissions** | `module.action` codes; every endpoint + UI action mapped in the Permission Matrix. |
| **Money** | Decimals only; centralized tax/rounding; currency from settings. |
| **Writes** | Multi-table business writes are transactional; financial creates are idempotent. |
| **Git** | Trunk-based, short-lived branches; Conventional Commits; PRs only; green CI to merge. |
| **Tests** | Unit (services/finance/RBAC) + API (happy/denied/validation) + E2E on critical flows. |
| **Secrets** | Env vars + secret manager; never committed; `.env` gitignored. |
| **UI states** | Every async view handles loading / empty / error / success; status colors are semantic. |
| **Accessibility** | WCAG 2.1 AA; keyboard + screen-reader support; status never by color alone. |

---

## 7 Guidance for AI Agents

If you are an AI agent (e.g., Claude Code) working in this repository, treat this section as operating instructions.

- **Read before writing.** Load the relevant docs for the task (use §4's mapping) before generating code. Do not infer the data model, API shape, or permissions from guesswork — they are specified here.
- **Respect scope and phase.** Do not implement V2/V3 features (mobile, full client portal, integrations, advanced AI) during MVP unless explicitly told to. Check **[07_DEVELOPMENT_ROADMAP](07_DEVELOPMENT_ROADMAP.md)**.
- **Enforce RBAC.** Every endpoint you add needs a permission code from **[06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md)** and, where relevant, a project-scope check. Never rely on the UI to restrict access.
- **Follow the contract.** Match **[05_API_SPEC](05_API_SPEC.md)** conventions exactly (envelope, errors, pagination). Reuse shared types in `packages/types`.
- **Protect money and data.** Use decimals for money, wrap multi-table writes in transactions, and never expose secrets or internal fields.
- **Keep AI assistive.** Any AI feature must retrieve data as the requesting user and never bypass permissions or write without human confirmation (**[09_AI_FEATURES](09_AI_FEATURES.md)**).
- **Keep docs in sync.** If you change a contract (new endpoint, new permission, schema change), update the corresponding document in the same change. Docs and code must not drift.
- **Do not invent stack or structure.** The stack, folder layout, and conventions are fixed in docs 03 and 08. Don't introduce new frameworks or patterns without them being reflected in the docs first.
- **When docs conflict with a request, surface it.** If a task contradicts these documents, flag the conflict and ask, rather than silently diverging.

---

## 8 Document Ownership & Change Control

- **These documents are living but governed.** They are the master blueprint; changes are deliberate, not casual.
- **Change with the code.** When a feature changes a contract, update the relevant doc **in the same pull request** (API spec, permission codes, schema notes). Reviewers check this (see Code Review Checklist, [08_CODING_STANDARDS](08_CODING_STANDARDS.md) §13).
- **Versioning.** Each doc carries a version and "Last Updated" date in its header. Bump them on material change.
- **Cross-references.** Documents link to each other; keep links valid when renaming files.
- **Architecture decisions.** Significant decisions that change these docs should be recorded as short ADRs (Architecture Decision Records) and reflected here.
- **Source of truth precedence.** For any disagreement: the **PRD** governs *what/why*; **Architecture + Coding Standards** govern *how*; the **Permission Matrix + API Spec** govern *contracts*. Code conforms to docs; docs are corrected when the design genuinely evolves.

---

*ARTIVERGES NEXT — Documentation Hub · v1.0 · Start every task here.*
