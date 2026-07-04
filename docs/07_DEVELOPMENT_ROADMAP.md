# ARTIVERGES NEXT — Development Roadmap

| Field | Detail |
|---|---|
| **Document** | 07_DEVELOPMENT_ROADMAP — Delivery Plan & Phasing |
| **Product** | ARTIVERGES NEXT |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |
| **Related** | [01_PRD](01_PRD.md) · [08_CODING_STANDARDS](08_CODING_STANDARDS.md) · [10_DEPLOYMENT](10_DEPLOYMENT.md) |

> The phased delivery plan for ARTIVERGES NEXT — how the scope in the PRD is sequenced into buildable, releasable increments. Timelines are indicative and expressed in relative sprints/phases; calendar dates are set at planning time.

---

## Table of Contents
1. [Delivery Approach](#1-delivery-approach)
2. [Roadmap Overview](#2-roadmap-overview)
3. [Phase 0 — Foundation](#3-phase-0--foundation)
4. [Phase 1 — MVP (Version 1)](#4-phase-1--mvp-version-1)
5. [Phase 2 — Version 2](#5-phase-2--version-2)
6. [Phase 3 — Version 3](#6-phase-3--version-3)
7. [AI Feature Track](#7-ai-feature-track)
8. [Milestones & Release Gates](#8-milestones--release-gates)
9. [Team & Roles](#9-team--roles)
10. [Dependencies & Critical Path](#10-dependencies--critical-path)
11. [Risk-Adjusted Sequencing](#11-risk-adjusted-sequencing)

---

## 1 Delivery Approach

- **Agile, iterative** — 2-week sprints, working software each sprint.
- **Vertical slices** — deliver end-to-end value per feature (UI + API + DB + tests), not layer-by-layer.
- **MVP-first discipline** — defend the MVP boundary from the PRD; defer everything else to the roadmap.
- **Continuous delivery** — automated pipeline to staging every merge; production on release gates (see [10_DEPLOYMENT](10_DEPLOYMENT.md)).
- **Definition of Done** per feature: implemented, tested, documented, permission-mapped, reviewed, deployed to staging.

---

## 2 Roadmap Overview

```
Phase 0        Phase 1 (MVP / V1)            Phase 2 (V2)         Phase 3 (V3)
Foundation  →  Connected Core            →   Mobile & Portal   →  Integrations & Scale
~2–3 sprints   ~8–12 sprints                 ~6–8 sprints         ~6–8 sprints

AI track:      basic assist ─────────────────► advanced AI ──────► predictive AI
```

| Phase | Theme | Primary Outcome |
|---|---|---|
| 0 | Foundation | Architecture, auth, RBAC, CI/CD, design system ready. |
| 1 (MVP) | Connected Core | Run a real project end to end with live budget-vs-actual. |
| 2 (V2) | Mobile & Portals | Field mobile app, full client portal, worker app. |
| 3 (V3) | Integrations & Scale | Payments, e-sign, accounting sync, multi-branch, BI. |

---

## 3 Phase 0 — Foundation

**Goal:** everything needed before feature work accelerates.

| Workstream | Deliverables |
|---|---|
| Architecture | Repo structure, modular backend skeleton, DB migrations tooling. |
| Auth & RBAC | Login, JWT, roles/permissions engine, guards (per [06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md)). |
| Design system | Tokens + core components from [04_UI_DESIGN_SYSTEM](04_UI_DESIGN_SYSTEM.md). |
| App shell | Role-aware navigation, layout, notifications shell. |
| Platform services | Attachments/uploads, audit logging, notification pipeline, approval engine scaffold. |
| DevOps | CI/CD, environments (dev/staging/prod), object storage, monitoring baseline. |

**Exit criteria:** a user can log in, see a role-filtered shell, and the pipeline deploys to staging automatically.

---

## 4 Phase 1 — MVP (Version 1)

Delivers the PRD's MVP scope. Sequenced so the **commercial thread** is usable early, then delivery, then cost/finance, then after-sales.

### Sprint groups

**MVP-A · Sales & Commercial Core**
- CRM / Leads (capture, pipeline, activities, conversion)
- Clients (master records)
- BOQ (items, sections, templates, versioning)
- Quotation (from BOQ, margins/tax, client approval)
- Contracts (from quotation, milestones, sign-off)

**MVP-B · Projects & Delivery Core**
- Projects hub (lifecycle, team assignment)
- Project Progress (tasks, % completion, updates)
- Site Photos (upload, tagging)
- Documents (repository + visibility)

**MVP-C · Procurement, Inventory & Cost Core**
- Suppliers, Purchase Requisitions (+ approval)
- Purchase Orders + Goods Receipt
- Inventory (basic stock, movements)
- Expenses (+ approval), Worker Reimbursement (+ approval)
- **Project Cost Tracking (budget vs. actual)** — flagship

**MVP-D · Finance & After-Sales Core**
- Invoices (milestone-based), Payments
- Basic Payroll
- Warranty + Defect management (basic)

**MVP-E · Insight & Assist**
- Core Reports (pipeline, project cost & margin, receivables/payables)
- Role-aware Dashboards
- Basic AI Assistant (summaries, scoped Q&A)

**Exit criteria (MVP success):** ARTIVERGES GROUP runs at least one full real project — lead → contract → delivery → invoice → warranty — entirely in the platform, with live budget-vs-actual and no parallel spreadsheet.

---

## 5 Phase 2 — Version 2

**Theme:** take the platform to the field and to external stakeholders.

- **Mobile App (React Native/Expo):** progress, site photos (camera), requisitions, reimbursements, attendance — offline-friendly.
- **Worker App:** simple task/attendance/reimbursement/pay view.
- **Client Portal (full):** progress, approvals, invoices, payments, warranty self-service.
- **Advanced Procurement & Inventory:** multi-warehouse, barcode/QR, supplier price history/comparison.
- **Enhanced Payroll:** full attendance-to-pay automation.

---

## 6 Phase 3 — Version 3

**Theme:** integrate, scale, and deepen intelligence.

- **Integrations:** payment gateway, e-signature, accounting software, cloud storage.
- **Advanced scheduling:** Gantt / critical path, resource allocation.
- **Partner Portal (full):** subcontractor collaboration + payments.
- **Multi-branch / multi-entity** with multi-currency.
- **Advanced analytics / BI dashboards.**

---

## 7 AI Feature Track

Runs in parallel, maturing across phases (detail in [09_AI_FEATURES](09_AI_FEATURES.md)):

| Phase | AI capability |
|---|---|
| MVP | Project health summaries, scoped NL Q&A, report summarization. |
| V2 | AI-assisted BOQ/quotation drafting, daily digests, smart alerts. |
| V3 | Predictive cost-overrun & delay risk, document intelligence (extract from receipts/drawings), procurement recommendations. |

---

## 8 Milestones & Release Gates

| Milestone | Gate criteria |
|---|---|
| **M0 — Foundation ready** | Auth, RBAC, shell, CI/CD live on staging. |
| **M1 — Commercial thread** | Lead → contract works end to end. |
| **M2 — Delivery live** | Projects, progress, photos, documents usable. |
| **M3 — Cost engine** | Budget vs. actual accurate against a real project. |
| **M4 — Finance live** | Invoices, payments, payroll operational. |
| **M5 — MVP GA** | Full MVP success criteria met; UAT signed off; production launch. |
| **M6 — Mobile & Portal** | V2 apps/portal in production. |
| **M7 — Integrated & Scaled** | V3 integrations and multi-branch live. |

**Every release gate requires:** passing automated tests, security review, permission mapping verified, UAT sign-off, and deployment runbook validated.

---

## 9 Team & Roles

Indicative delivery team (scales by phase):

| Role | Responsibility |
|---|---|
| Product Manager | Backlog, priorities, acceptance. |
| Solution Architect | Architecture, standards, reviews. |
| Backend Engineers | API, domain modules, DB. |
| Frontend Engineers | Web app, design-system implementation. |
| Mobile Engineers (Phase 2+) | React Native apps. |
| UI/UX Designer | Design system, flows, usability. |
| QA Engineer | Test strategy, automation, UAT. |
| DevOps Engineer | CI/CD, infra, monitoring. |
| AI Engineer (part-time → growing) | AI Assistant features. |

---

## 10 Dependencies & Critical Path

```
Foundation (auth, RBAC, shell)
        │
        ▼
CRM → Clients → BOQ → Quotation → Contract   (commercial thread)
                                     │
                                     ▼
                                 Projects ──► Progress / Photos / Documents
                                     │
                                     ▼
             Procurement/PO ──► Inventory ──┐
             Expenses / Reimbursement ──────┼──► Project Cost Tracking (needs BOQ + all cost sources)
             Payroll ───────────────────────┘
                                     │
                                     ▼
                        Invoices ──► Payments
                                     │
                                     ▼
                           Warranty / Defects
```

**Critical path:** Foundation → Commercial thread → Projects → **Project Cost Tracking** (depends on BOQ baseline + all actual-cost feeders). Cost Tracking is the highest-value, highest-dependency feature and paces MVP completion.

---

## 11 Risk-Adjusted Sequencing

- **De-risk early:** build the approval engine and cost-rollup mechanism in MVP-A/C, since many features depend on them.
- **Ship value fast:** the commercial thread (MVP-A) gives users something usable within the first sprint group, driving adoption (mitigates PRD risk R-1).
- **Guard the boundary:** V2/V3 features stay out of MVP regardless of enthusiasm (mitigates scope-creep risk R-3).
- **Field connectivity** deferred to Phase 2 mobile with offline sync (mitigates risk R-4); MVP stays responsive-web.
- **Data quality** addressed in Foundation with Admin master-data tooling (mitigates risk R-2).

---

*End of Document — 07_DEVELOPMENT_ROADMAP.md · ARTIVERGES NEXT · v1.0*
