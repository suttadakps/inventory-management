# ARTIVERGES NEXT — System Architecture

| Field | Detail |
|---|---|
| **Document** | 03_SYSTEM_ARCHITECTURE — Technical Architecture |
| **Product** | ARTIVERGES NEXT |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |
| **Related** | [01_PRD](01_PRD.md) · [02_DATABASE](02_DATABASE.md) · [05_API_SPEC](05_API_SPEC.md) · [10_DEPLOYMENT](10_DEPLOYMENT.md) |

> Defines the technical architecture, technology stack, and cross-cutting design of ARTIVERGES NEXT. It describes *how the system is structured*, not feature requirements (see the PRD) or implementation code.

---

## Table of Contents
1. [Architecture Goals](#1-architecture-goals)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Application Layers](#4-application-layers)
5. [Module / Domain Structure](#5-module--domain-structure)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Approval & Workflow Engine](#7-approval--workflow-engine)
8. [File & Media Handling](#8-file--media-handling)
9. [Notifications & Real-Time](#9-notifications--real-time)
10. [AI Assistant Architecture](#10-ai-assistant-architecture)
11. [Integrations](#11-integrations)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Mobile Strategy (Phase 2)](#13-mobile-strategy-phase-2)

---

## 1 Architecture Goals

| Goal | Approach |
|---|---|
| **Single source of truth** | One relational DB (PostgreSQL) behind a unified API. |
| **Modular but not fragmented** | Modular monolith — clear domain boundaries in one deployable, splittable into services later. |
| **Role-secure** | Centralized RBAC enforced at the API layer for every request. |
| **Real-time field visibility** | API + WebSocket notifications; responsive web now, mobile later. |
| **Financial correctness** | Transactional writes, audit logging, append-corrective finance. |
| **Extensible for AI & integrations** | Clean service layer the AI Assistant and external systems call through. |
| **Cloud-native & scalable** | Stateless API, horizontal scaling, managed data services. |

---

## 2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Web Frontend** | Next.js (React) + TypeScript | SSR/SSG, strong ecosystem, responsive, PWA-capable. |
| **Styling / UI** | Tailwind CSS + component library (see [04_UI_DESIGN_SYSTEM](04_UI_DESIGN_SYSTEM.md)) | Consistent design system, fast delivery. |
| **State/Data fetching** | TanStack Query + Zustand | Server-cache + light client state. |
| **Backend API** | Node.js + NestJS (TypeScript) | Modular, DI-based, well-suited to domain modules and RBAC guards. |
| **API style** | REST (JSON) + OpenAPI; WebSocket for real-time | Simple, well-understood; documented contract (see [05_API_SPEC](05_API_SPEC.md)). |
| **Database** | PostgreSQL 16 | Relational integrity, transactions, JSONB flexibility. |
| **ORM** | Prisma (or TypeORM) | Type-safe data access, migrations. |
| **Cache / Queue** | Redis | Sessions, rate limiting, job queue, caching. |
| **Background jobs** | BullMQ (Redis-backed) | Async: notifications, cost rollups, report generation, AI calls. |
| **Object storage** | S3-compatible (AWS S3 / MinIO) | Photos, receipts, documents. |
| **Auth** | JWT (access + refresh), bcrypt/argon2 hashing | Stateless, RBAC-friendly. |
| **AI** | Anthropic Claude API (Opus / Sonnet) | AI Assistant, summaries, NL querying (see [09_AI_FEATURES](09_AI_FEATURES.md)). |
| **Search** | PostgreSQL full-text (MVP) → OpenSearch (later) | Start simple, scale search later. |
| **Hosting** | Containers (Docker) on cloud (AWS ECS/EKS or equivalent) | Portable, scalable (see [10_DEPLOYMENT](10_DEPLOYMENT.md)). |
| **Mobile (Phase 2)** | React Native (Expo) | Shared TypeScript, reuse API and types. |

> The stack is a recommendation optimized for a single TypeScript talent pool end to end. It can be substituted (e.g., NestJS → Django, Prisma → TypeORM) without changing the architecture shape.

---

## 3 High-Level Architecture

```
        ┌─────────────────────────────────────────────────────────┐
        │                        CLIENTS                           │
        │  Web App (Next.js)   Client Portal   Mobile App (P2)     │
        └───────────────┬───────────────┬──────────────┬──────────┘
                        │  HTTPS / WSS   │              │
                        ▼                ▼              ▼
        ┌─────────────────────────────────────────────────────────┐
        │                   API GATEWAY / EDGE                     │
        │      TLS · rate limiting · routing · auth check          │
        └───────────────────────────┬─────────────────────────────┘
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │              BACKEND (NestJS Modular Monolith)           │
        │                                                          │
        │  Auth/RBAC │ CRM │ Commercial │ Projects │ Procurement   │
        │  Inventory │ Finance │ Warranty │ Notifications │ AI      │
        │                                                          │
        │  ── Service Layer (business logic, transactions) ──      │
        │  ── Approval/Workflow Engine ── Audit ── Events ──       │
        └───┬───────────────┬──────────────┬──────────────┬───────┘
            ▼               ▼              ▼              ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────────┐
      │PostgreSQL│   │  Redis   │   │ Object   │   │ Claude API │
      │  (data)  │   │cache/queue│  │ Storage  │   │   (AI)     │
      └──────────┘   └─────┬────┘   └──────────┘   └────────────┘
                           ▼
                   ┌───────────────┐
                   │ Worker (BullMQ)│  notifications · rollups · reports · AI jobs
                   └───────────────┘
                           │
                   ┌───────────────┐
                   │  Integrations │  email/SMS · payment gw · e-sign (roadmap)
                   └───────────────┘
```

---

## 4 Application Layers

**Backend follows a clean, layered structure per module:**

1. **Controller (HTTP/WS)** — request/response, validation (DTOs), no business logic.
2. **Guard/Policy** — authentication + RBAC + per-project scope checks.
3. **Service** — business logic, orchestrates repositories, wraps transactions, emits domain events.
4. **Repository / ORM** — data access to PostgreSQL.
5. **Domain events** — decouple side effects (e.g., "ExpenseApproved" → book to `project_costs`, notify, audit).

**Frontend layered structure:**
1. **Pages/Routes** (Next.js) — role-aware layouts.
2. **Feature modules** — one folder per domain (projects, procurement, finance…).
3. **Data layer** — typed API client + TanStack Query hooks.
4. **UI kit** — shared components from the design system.

---

## 5 Module / Domain Structure

Backend modules map 1:1 to the PRD's core modules and the DB domains:

| Module | Responsibility |
|---|---|
| `auth` | Login, tokens, password, sessions. |
| `iam` | Users, roles, permissions, project membership. |
| `crm` | Leads, activities, conversion. |
| `clients` | Clients, contacts, partners. |
| `commercial` | BOQ, quotation, contracts, change orders. |
| `projects` | Projects, tasks, progress, inspections. |
| `media` | Site photos, documents, attachments. |
| `procurement` | Suppliers, requisitions, purchase orders. |
| `inventory` | Stock, goods receipts, movements. |
| `finance` | Expenses, reimbursements, invoices, payments, payroll, project costs. |
| `warranty` | Warranties, defects. |
| `workflow` | Approval engine (cross-module). |
| `notifications` | In-app/real-time + email/SMS dispatch. |
| `reporting` | Aggregations, exports. |
| `ai` | AI Assistant orchestration. |
| `settings` | Company config, thresholds, catalogs. |

Modules communicate through **service interfaces and domain events**, never by reaching into each other's tables — keeping a future split into microservices low-cost.

---

## 6 Authentication & Authorization

- **Authentication:** JWT access token (short-lived) + refresh token (rotating, stored httpOnly). Passwords hashed with argon2/bcrypt. Optional SSO later.
- **Authorization (RBAC):**
  - Every user has one or more **roles**; roles map to **permissions** (`module.action` codes).
  - API guards check the required permission for each endpoint.
  - **Per-project scoping:** `project_members` restricts users (esp. Site Engineer, Foreman, Client, Partner) to their assigned projects.
  - **External roles (Client, Partner)** hit a restricted policy set — read/approve/limited-submit only.
- **Approval thresholds** (e.g., expense value limits) are policy data in `settings`, evaluated by the workflow engine — see [06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md).
- All access decisions and sensitive mutations are written to `audit_logs`.

---

## 7 Approval & Workflow Engine

A single, configurable engine powers all approval flows (expense, purchase, change order, reimbursement, quotation) described in the PRD's workflows.

- **Polymorphic `approvals` records** attach to any entity.
- **Rules** (from `settings`): who approves, in what order, and value thresholds that escalate (e.g., > X → Owner).
- **State machine** advances the entity's status on each decision and emits events (approved → book cost/notify; rejected → return to submitter).
- **Auditable**: every decision logged with actor, level, comment, timestamp.

This keeps workflow logic centralized and configurable rather than duplicated per module.

---

## 8 File & Media Handling

- Uploads go directly to **object storage** via pre-signed URLs (offloads the API).
- The DB stores only `attachments` metadata (key, name, type, size, uploader).
- Site photos and documents reference attachments; access is permission-checked (e.g., client-visible vs. internal).
- Images are processed asynchronously (thumbnails, compression) by the worker.

---

## 9 Notifications & Real-Time

- **In-app notifications** persisted in `notifications`, delivered live via **WebSocket** (Socket.IO) to connected clients.
- **Async fan-out** via BullMQ: domain events → notification jobs → in-app + (Phase-appropriate) email/SMS/push.
- **Triggers:** approvals pending/decided, assignments, status changes, overdue invoices, new defects.
- Mobile push (FCM/APNs) added in Phase 2.

---

## 10 AI Assistant Architecture

- The `ai` module orchestrates calls to the **Claude API**.
- **Retrieval:** user question → permission-scoped data retrieval (only data the user may see) → structured context → Claude → answer.
- **Guardrails:** AI never bypasses RBAC; it queries through the same service/permission layer.
- **Use cases (MVP → later):** project health summaries, NL Q&A over reports, BOQ/quotation drafting assistance, report summarization, risk flags.
- Long-running AI tasks run as background jobs; results streamed to the UI.
- Full detail in [09_AI_FEATURES](09_AI_FEATURES.md).

---

## 11 Integrations

| Integration | Phase | Purpose |
|---|---|---|
| Email / SMS provider | MVP | Notifications, invoices. |
| Object storage (S3) | MVP | File storage. |
| Claude API | MVP | AI Assistant. |
| Payment gateway | Roadmap (V2/V3) | Online client payments. |
| E-signature | Roadmap | Contract signing. |
| Accounting software | Roadmap | Finance sync/export. |
| Cloud storage (Drive/Dropbox) | Roadmap | Document sync. |

Integrations are isolated behind adapter interfaces so providers can be swapped without touching business logic.

---

## 12 Non-Functional Requirements

| Attribute | Target |
|---|---|
| **Availability** | 99.5%+ (MVP), improving with roadmap. |
| **Performance** | Core list/detail API responses < 400 ms p95; dashboards < 1.5 s. |
| **Scalability** | Stateless API scales horizontally; read replicas for reporting. |
| **Security** | TLS everywhere, RBAC, least privilege, encrypted secrets, hashed passwords, audit logs, OWASP Top 10 hardening. |
| **Data protection** | Encryption at rest (DB + storage), soft deletes, backups (see [10_DEPLOYMENT](10_DEPLOYMENT.md)). |
| **Auditability** | All financial and permission changes logged. |
| **Reliability** | Transactional writes; idempotent job processing. |
| **Accessibility** | WCAG 2.1 AA target for web (see [04_UI_DESIGN_SYSTEM](04_UI_DESIGN_SYSTEM.md)). |
| **Observability** | Centralized logs, metrics, error tracking, health checks. |

---

## 13 Mobile Strategy (Phase 2)

- **React Native (Expo)** app reusing the same REST API and shared TypeScript types.
- **Field-first:** progress updates, site photos (camera), material requests, reimbursements, attendance.
- **Offline-friendly:** local queue + sync for poor site connectivity.
- **Push notifications** via FCM/APNs.
- Separate lightweight **Worker App** experience for low-literacy, task-focused use.

---

*End of Document — 03_SYSTEM_ARCHITECTURE.md · ARTIVERGES NEXT · v1.0*
