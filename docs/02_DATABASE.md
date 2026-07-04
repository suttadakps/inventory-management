# ARTIVERGES NEXT — Database Design

| Field | Detail |
|---|---|
| **Document** | 02_DATABASE — Data Model & Schema Design |
| **Product** | ARTIVERGES NEXT |
| **Database** | PostgreSQL 16 (relational, single source of truth) |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |
| **Related** | [01_PRD](01_PRD.md) · [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md) · [05_API_SPEC](05_API_SPEC.md) |

> This document defines the logical data model for ARTIVERGES NEXT. It describes entities, relationships, key fields, and design conventions. It is database-technology-agnostic in intent but written against **PostgreSQL** as the chosen engine. No application code is included.

---

## Table of Contents
1. [Design Principles](#1-design-principles)
2. [Conventions](#2-conventions)
3. [Entity Overview](#3-entity-overview)
4. [Entity Relationship Diagram (Logical)](#4-entity-relationship-diagram-logical)
5. [Core Tables](#5-core-tables)
6. [Enumerations & Status Lifecycles](#6-enumerations--status-lifecycles)
7. [Indexing Strategy](#7-indexing-strategy)
8. [Data Integrity & Constraints](#8-data-integrity--constraints)
9. [Auditing & Soft Deletes](#9-auditing--soft-deletes)
10. [Multi-Tenancy & Scalability Notes](#10-multi-tenancy--scalability-notes)

---

## 1 Design Principles

1. **Single source of truth** — every business fact lives in exactly one authoritative table; other modules reference it by foreign key.
2. **Traceability** — the commercial thread (Lead → BOQ → Quotation → Contract → Project → Invoice → Warranty) is preserved through explicit foreign keys so any record can be traced end to end.
3. **Budget vs. actual by design** — actual cost is always derivable by aggregating child transactions (expenses, PO lines, inventory issues, payroll, reimbursements) against the BOQ baseline.
4. **Normalization first** — normalize to 3NF; denormalize only for proven read performance needs (e.g., cached project cost summaries).
5. **RBAC-ready** — permissions are data-driven (roles, permissions, and per-project assignments) so access rules can change without schema changes.
6. **Auditable & recoverable** — all business tables carry audit columns and soft-delete support.

---

## 2 Conventions

| Convention | Rule |
|---|---|
| Table names | `snake_case`, plural nouns (e.g., `projects`, `purchase_orders`). |
| Primary keys | `id` — UUID v4 (globally unique, migration-friendly). |
| Foreign keys | `<entity>_id` (e.g., `project_id`, `client_id`). |
| Timestamps | `created_at`, `updated_at` (UTC, `timestamptz`). |
| Soft delete | `deleted_at` (`timestamptz`, nullable). |
| Money | `numeric(14,2)`; currency held at company/project level. |
| Booleans | `is_` prefix (e.g., `is_active`). |
| Enums | Backed by PostgreSQL `enum` types or reference tables (see §6). |
| Audit | `created_by`, `updated_by` reference `users.id`. |
| JSON | `jsonb` for flexible metadata (e.g., settings, custom fields). |

---

## 3 Entity Overview

| Domain | Key Entities |
|---|---|
| **Identity & Access** | `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `project_members` |
| **CRM & Clients** | `leads`, `lead_activities`, `clients`, `client_contacts`, `partners` |
| **Commercial** | `boqs`, `boq_items`, `quotations`, `quotation_items`, `contracts`, `contract_milestones`, `change_orders`, `change_order_items` |
| **Projects & Delivery** | `projects`, `tasks`, `progress_updates`, `site_photos`, `documents`, `inspections` |
| **Procurement & Inventory** | `suppliers`, `purchase_requisitions`, `requisition_items`, `purchase_orders`, `po_items`, `goods_receipts`, `inventory_items`, `stock_movements` |
| **Finance** | `expenses`, `reimbursements`, `invoices`, `invoice_items`, `payments`, `payroll_runs`, `payroll_items`, `project_costs` |
| **After-Sales** | `warranties`, `defects`, `defect_updates` |
| **Platform** | `notifications`, `approvals`, `audit_logs`, `settings`, `attachments` |

---

## 4 Entity Relationship Diagram (Logical)

```
                         ┌──────────┐
                         │  users   │───< user_roles >───┐
                         └────┬─────┘                    │
                              │                     ┌─────▼─────┐
                        created_by / assigned       │   roles   │
                              │                      └────┬─────┘
                              │                     role_permissions
                              │                           │
                              │                      ┌────▼──────┐
                              │                      │permissions│
                              │                      └───────────┘

 leads ──converts──> clients ──has──> projects <──assigned── project_members
   │                    │                 │
 lead_activities   client_contacts        │
                                          ├──> boqs ──> boq_items
                                          │      │
                                          │   priced_into
                                          │      ▼
                                          ├──> quotations ──> quotation_items
                                          │      │
                                          │   approved_into
                                          │      ▼
                                          ├──> contracts ──> contract_milestones
                                          │      │                    │
                                          │  amended_by          triggers
                                          │      ▼                    ▼
                                          │  change_orders         invoices ──> invoice_items
                                          │                           │
                                          │                        payments
                                          │
                                          ├──> tasks ──> progress_updates
                                          ├──> site_photos
                                          ├──> documents / inspections
                                          │
                                          ├──> purchase_requisitions ──> requisition_items
                                          │            │
                                          │        converted_to
                                          │            ▼
                                          │      purchase_orders ──> po_items
                                          │            │
                                          │        goods_receipts ──> stock_movements ──> inventory_items
                                          │
                                          ├──> expenses
                                          ├──> reimbursements
                                          ├──> payroll_items (via payroll_runs)
                                          │
                                          ├──> project_costs (budget vs actual rollup)
                                          │
                                          └──> warranties ──> defects ──> defect_updates

 approvals, notifications, audit_logs, attachments, settings  → cross-cutting
```

---

## 5 Core Tables

Representative tables with their most important columns. `id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by` are implied on all business tables and omitted for brevity except where noted.

### 5.1 Identity & Access

**users**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| full_name | text | |
| email | citext UNIQUE | login identity |
| phone | text | |
| password_hash | text | null if SSO |
| status | enum(user_status) | active / invited / suspended |
| last_login_at | timestamptz | |

**roles** — `id`, `name` (Owner, Admin, AE, Site Engineer, Foreman, Worker, Accounting, Procurement, Client, Partner), `is_system`.

**permissions** — `id`, `code` (e.g., `project.create`), `module`, `description`.

**role_permissions** — `role_id` FK, `permission_id` FK (composite unique). See [06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md).

**user_roles** — `user_id` FK, `role_id` FK.

**project_members** — `project_id` FK, `user_id` FK, `project_role` enum. Scopes per-project access.

### 5.2 CRM & Clients

**leads** — `title`, `source`, `contact_name`, `contact_phone`, `requirement`, `estimated_budget numeric`, `location`, `stage` enum(lead_stage), `assigned_to` FK users, `client_id` FK (nullable, set on conversion).

**lead_activities** — `lead_id` FK, `type` enum(call/meeting/note/followup), `notes`, `due_at`, `completed_at`.

**clients** — `name`, `type` enum(individual/business), `primary_email`, `primary_phone`, `billing_address`, `portal_user_id` FK users (nullable).

**client_contacts** — `client_id` FK, `name`, `role`, `email`, `phone`.

**partners** — `name`, `type` enum(subcontractor/vendor/referral), `contact`, `terms`, `portal_user_id` FK.

### 5.3 Commercial

**boqs** — `project_id` FK (nullable pre-project), `lead_id` FK (nullable), `version` int, `status` enum(boq_status), `total_cost numeric`.

**boq_items** — `boq_id` FK, `section`, `description`, `unit`, `quantity numeric`, `material_rate numeric`, `labor_rate numeric`, `line_cost numeric`, `sort_order`.

**quotations** — `boq_id` FK, `project_id` FK (nullable), `client_id` FK, `version` int, `margin_pct numeric`, `discount numeric`, `tax_pct numeric`, `subtotal`, `total`, `status` enum(quotation_status), `sent_at`, `approved_at`.

**quotation_items** — `quotation_id` FK, mirrors `boq_items` with `unit_price` (post-margin), `line_total`.

**contracts** — `quotation_id` FK, `project_id` FK, `client_id` FK, `contract_no` UNIQUE, `value numeric`, `start_date`, `end_date`, `status` enum(contract_status), `signed_at`.

**contract_milestones** — `contract_id` FK, `name`, `amount numeric`, `due_date`, `status`, `invoice_id` FK (nullable).

**change_orders** — `contract_id` FK, `project_id` FK, `co_no`, `reason`, `cost_delta numeric`, `schedule_delta_days` int, `status` enum(approval_status), `approved_at`.

**change_order_items** — `change_order_id` FK, item detail + `cost_delta`.

### 5.4 Projects & Delivery

**projects**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| code | text UNIQUE | human reference (e.g., PRJ-2026-014) |
| name | text | |
| client_id | uuid FK | |
| contract_id | uuid FK | nullable |
| status | enum(project_status) | planning/active/on_hold/completed/warranty/closed |
| start_date / end_date | date | |
| contract_value | numeric | |
| budget_cost | numeric | from approved BOQ |
| actual_cost | numeric | cached rollup from project_costs |
| manager_id | uuid FK users | AE |

**tasks** — `project_id` FK, `name`, `assigned_to` FK, `planned_start`, `planned_end`, `progress_pct numeric`, `status`, `parent_task_id` FK (nullable, for WBS).

**progress_updates** — `project_id` FK, `task_id` FK (nullable), `progress_pct`, `note`, `reported_by` FK, `reported_at`.

**site_photos** — `project_id` FK, `task_id` FK (nullable), `attachment_id` FK, `phase` enum(before/during/after), `caption`, `taken_at`.

**documents** — `project_id` FK (nullable for company docs), `category`, `title`, `attachment_id` FK, `version`, `visibility` enum(internal/client/partner).

**inspections** — `project_id` FK, `type`, `result` enum(pass/fail), `inspector_id` FK, `inspected_at`, `notes`.

### 5.5 Procurement & Inventory

**suppliers** — `name`, `contact`, `payment_terms`, `rating`.

**purchase_requisitions** — `project_id` FK, `requested_by` FK, `status` enum(approval_status), `needed_by`.

**requisition_items** — `requisition_id` FK, `boq_item_id` FK (nullable), `material`, `unit`, `quantity`, `est_price`.

**purchase_orders** — `requisition_id` FK (nullable), `supplier_id` FK, `project_id` FK, `po_no` UNIQUE, `status` enum(po_status), `total numeric`, `expected_date`.

**po_items** — `po_id` FK, `material`, `unit`, `quantity`, `unit_price`, `line_total`, `received_qty`.

**goods_receipts** — `po_id` FK, `received_by` FK, `received_at`, `notes`.

**inventory_items** — `material`, `unit`, `location`, `on_hand_qty numeric`, `reorder_level numeric`. (Master stock record.)

**stock_movements** — `inventory_item_id` FK, `type` enum(receipt/issue/adjustment/return), `quantity`, `project_id` FK (nullable, for issues), `reference` (PO/GR/manual), `moved_at`.

### 5.6 Finance

**expenses** — `project_id` FK (nullable for overhead), `category`, `amount numeric`, `spent_by` FK, `attachment_id` FK (receipt), `status` enum(approval_status), `is_billable` bool, `approved_at`.

**reimbursements** — `worker_id` FK users, `project_id` FK, `amount`, `attachment_id` FK, `status` enum(approval_status), `paid_at`.

**invoices** — `project_id` FK, `client_id` FK, `contract_milestone_id` FK (nullable), `invoice_no` UNIQUE, `subtotal`, `tax`, `total`, `status` enum(invoice_status), `due_date`, `sent_at`.

**invoice_items** — `invoice_id` FK, `description`, `quantity`, `unit_price`, `line_total`.

**payments** — `type` enum(incoming/outgoing), `invoice_id` FK (nullable), `po_id` FK (nullable), `party_type` enum(client/supplier/partner), `amount`, `method`, `reference`, `paid_at`.

**payroll_runs** — `period_start`, `period_end`, `status`, `total numeric`.

**payroll_items** — `payroll_run_id` FK, `user_id` FK, `days_worked`, `gross`, `allowances`, `deductions`, `net`, `project_id` FK (nullable, for labor cost allocation).

**project_costs** — rollup ledger: `project_id` FK, `source_type` enum(expense/po/inventory/payroll/reimbursement), `source_id` uuid, `boq_section` text (nullable), `amount numeric`, `incurred_at`. Aggregated for budget-vs-actual.

### 5.7 After-Sales

**warranties** — `project_id` FK, `coverage`, `start_date`, `end_date`, `terms`, `status` enum(active/expired).

**defects** — `warranty_id` FK (nullable), `project_id` FK, `reported_by` FK, `severity` enum(low/medium/high/critical), `description`, `status` enum(defect_status), `assigned_to` FK, `sla_due_at`, `resolved_at`.

**defect_updates** — `defect_id` FK, `note`, `attachment_id` FK (nullable), `status`, `updated_by` FK.

### 5.8 Platform / Cross-Cutting

**approvals** — polymorphic: `entity_type` (expense/requisition/po/change_order/quotation/reimbursement), `entity_id` uuid, `approver_id` FK, `decision` enum(pending/approved/rejected), `level` int, `comment`, `decided_at`. Drives all approval workflows.

**notifications** — `user_id` FK, `type`, `title`, `body`, `entity_type`, `entity_id`, `is_read` bool, `sent_at`.

**audit_logs** — `actor_id` FK, `action`, `entity_type`, `entity_id`, `before jsonb`, `after jsonb`, `ip`, `created_at`.

**attachments** — `file_key` (object storage), `file_name`, `mime_type`, `size_bytes`, `uploaded_by` FK. Referenced by photos, receipts, documents.

**settings** — `key`, `value jsonb`, `scope` enum(company/module). Holds tax rates, currency, approval thresholds, workflow config.

---

## 6 Enumerations & Status Lifecycles

| Enum | Values |
|---|---|
| `user_status` | active · invited · suspended |
| `lead_stage` | new · contacted · survey_scheduled · qualified · quoted · won · lost |
| `boq_status` | draft · finalized · superseded |
| `quotation_status` | draft · sent · approved · rejected · revised |
| `contract_status` | draft · sent · signed · active · closed · cancelled |
| `project_status` | planning · active · on_hold · completed · warranty · closed |
| `approval_status` | draft · pending · approved · rejected |
| `po_status` | draft · approved · sent · partially_received · received · closed · cancelled |
| `invoice_status` | draft · sent · partially_paid · paid · overdue · void |
| `defect_status` | reported · assigned · in_progress · resolved · verified · closed · reopened |

**Example lifecycle — Purchase Order:** `draft → approved → sent → partially_received → received → closed` (with `cancelled` as a terminal exception). Each transition is recorded in `audit_logs`.

---

## 7 Indexing Strategy

- **Primary keys:** UUID PK on every table.
- **Foreign keys:** index every FK column (`project_id`, `client_id`, `contract_id`, etc.) — critical for join and rollup performance.
- **Status filters:** composite indexes on `(status, project_id)` for list screens (e.g., open POs by project).
- **Time-series:** index `incurred_at` / `created_at` on `project_costs`, `payments`, `stock_movements` for reporting ranges.
- **Uniqueness:** unique indexes on `users.email`, `projects.code`, `contracts.contract_no`, `purchase_orders.po_no`, `invoices.invoice_no`.
- **Search:** trigram/`GIN` indexes on text search fields (client name, project name).
- **Partial indexes:** `WHERE deleted_at IS NULL` to keep active-row lookups fast.

---

## 8 Data Integrity & Constraints

- **Foreign keys** enforce referential integrity; use `ON DELETE RESTRICT` for financial links, `ON DELETE CASCADE` only for owned children (e.g., `boq_items` under `boqs`).
- **Check constraints:** non-negative amounts/quantities, `progress_pct BETWEEN 0 AND 100`, `end_date >= start_date`.
- **Unique constraints:** business identifiers (see §7) and composite keys on join tables.
- **Not-null:** all foreign keys required by the business thread (e.g., `invoices.project_id`).
- **Transactional writes:** multi-table operations (e.g., PO approval + cost booking) run in a single DB transaction.
- **Derived-value consistency:** `projects.actual_cost` is a cached rollup refreshed on `project_costs` change; source of truth remains the ledger.

---

## 9 Auditing & Soft Deletes

- Every business table carries `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`.
- **Soft delete:** records are marked `deleted_at` rather than physically removed, preserving financial and legal history.
- **audit_logs** captures before/after JSON snapshots for sensitive entities (contracts, invoices, payments, approvals, permissions).
- Financial records (invoices, payments, payroll) are **append-corrective** — corrections are new records/void entries, never silent edits.

---

## 10 Multi-Tenancy & Scalability Notes

- **MVP:** single-tenant (one company — ARTIVERGES GROUP). Schema already isolates configuration in `settings`.
- **Future multi-entity/branch:** introduce an `organization_id` / `branch_id` column on top-level tables and row-level security policies, without restructuring relationships.
- **Scaling reads:** heavy reporting can use read replicas; `project_costs` and dashboard summaries can be materialized.
- **File storage:** binaries live in object storage (see [10_DEPLOYMENT](10_DEPLOYMENT.md)); the DB stores only `attachments` metadata.
- **Archival:** closed projects older than a retention window can be moved to cold storage/partitions.

---

*End of Document — 02_DATABASE.md · ARTIVERGES NEXT · v1.0*
