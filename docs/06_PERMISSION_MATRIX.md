# ARTIVERGES NEXT — Permission Matrix

| Field | Detail |
|---|---|
| **Document** | 06_PERMISSION_MATRIX — RBAC Definition |
| **Product** | ARTIVERGES NEXT |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |
| **Related** | [01_PRD](01_PRD.md) · [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md) · [05_API_SPEC](05_API_SPEC.md) |

> The authoritative Role-Based Access Control (RBAC) definition for ARTIVERGES NEXT. Every API endpoint and UI action maps to a permission code here. This document is the contract between product, security, and engineering.

---

## Table of Contents
1. [Model & Concepts](#1-model--concepts)
2. [Roles](#2-roles)
3. [Permission Code Scheme](#3-permission-code-scheme)
4. [Access Levels Legend](#4-access-levels-legend)
5. [Module × Role Matrix](#5-module--role-matrix)
6. [Detailed Permission Codes](#6-detailed-permission-codes)
7. [Project-Scoped Access Rules](#7-project-scoped-access-rules)
8. [Approval Thresholds](#8-approval-thresholds)
9. [External Roles (Client & Partner)](#9-external-roles-client--partner)
10. [Governance](#10-governance)

---

## 1 Model & Concepts

- **Users** are granted one or more **Roles**.
- **Roles** are collections of **Permissions** (`module.action` codes).
- Access is the **union** of all the user's roles' permissions.
- **Project scope** further restricts certain roles to only their assigned projects (`project_members`).
- **Approval thresholds** are value-based rules layered on top of permissions (configurable in Settings).
- Principle: **least privilege** — grant only what a role's responsibilities require.

---

## 2 Roles

| Role | Code | Scope | Summary |
|---|---|---|---|
| Company Owner | `owner` | Global | Full visibility; high-value approvals; strategy. |
| Admin | `admin` | Global | System governance, users, master data, config. |
| AE / Project Manager | `ae` | Assigned projects + own pipeline | Sales-to-delivery ownership. |
| Site Engineer | `site_engineer` | Assigned projects | Technical execution, progress, requisitions, defects. |
| Foreman | `foreman` | Assigned projects | Crew supervision, attendance, work logs. |
| Worker | `worker` | Self | Task view, reimbursements, attendance. |
| Accounting | `accounting` | Global (finance) | Invoices, payments, payroll, approvals. |
| Procurement | `procurement` | Global (procurement) | Suppliers, POs, inventory. |
| Client | `client` | Own projects | Portal: view, approve, warranty requests. |
| Partner | `partner` | Assigned projects | Scoped external collaboration. |

---

## 3 Permission Code Scheme

Format: `<module>.<action>[.<qualifier>]`

- **Actions:** `read`, `create`, `update`, `delete`, `approve`, `export`, `manage`.
- **Qualifiers:** `own` (only self/assigned), `all` (global).
- Examples: `project.read`, `expense.approve`, `invoice.create`, `settings.manage`, `progress.update.own`.

---

## 4 Access Levels Legend

| Symbol | Level | Meaning |
|---|---|---|
| **F** | Full | Create, read, update, delete |
| **M** | Manage | Full + configure/administer |
| **E** | Edit | Create/update (no delete) |
| **A** | Approve | Approve/reject in workflow |
| **V** | View | Read only |
| **S** | Self / Scoped | Only own or assigned records |
| **—** | None | No access |

---

## 5 Module × Role Matrix

Legend from §4. External roles (Client/Partner) are always project- or self-scoped.

| Module | owner | admin | ae | site_engineer | foreman | worker | accounting | procurement | client | partner |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Dashboard | F | M | E | S | V | S | E | E | V | V |
| Projects | F | M | F | S/E | S/E | S | V | V | S/V | S/V |
| CRM / Leads | F | M | F | — | — | — | — | — | — | — |
| Clients | F | M | E | V | — | — | V | — | S | — |
| BOQ | F | M | F | V | — | — | V | V | S/V | — |
| Quotation | F | M | F | — | — | — | V | — | S/A | — |
| Contracts | A | M | E | — | — | — | V | — | S/A | S/V |
| Change Orders | A | M | E | — | — | — | V | — | S/A | — |
| Procurement | V | M | E | S/E | — | — | V | F | — | — |
| Purchase Orders | A | M | E | — | — | — | V | F | — | — |
| Inventory | V | M | V | S/E | S/E | — | V | F | — | — |
| Expenses | A | M | E/A | S/E | S/E | S | A | E | — | S |
| Worker Reimbursement | A | M | A | S/E/A | S/E/A | S | A | — | — | — |
| Payroll | A | M | V | — | — | S | F | — | — | — |
| Project Cost Tracking | F | M | E | V | — | — | E | V | — | — |
| Project Progress | F | M | E | S/E | S/E | V | V | V | S/V | S/E |
| Site Photos | F | M | E | S/E | S/E | S | V | — | S/V | S/E |
| Documents | F | M | E | S/E | V | — | V | V | S/V | S/V |
| Invoices | V | M | E | — | — | — | F | — | S/V | S/V |
| Payments | V | M | V | — | — | — | F | — | S/V | S/V |
| Warranty | F | M | E | S/E | — | — | V | — | S | — |
| Defects | F | M | E | S/E | S/E | — | V | — | S | S/E |
| Notifications | S | S | S | S | S | S | S | S | S | S |
| Reports | F | M | E | V | — | — | E | V | S/V | — |
| AI Assistant | F | M | E | S/E | V | — | E | E | S/V | — |
| Settings | M | M | — | — | — | — | — | — | — | — |

> Where two levels appear (e.g., `S/E`), the role has that level **within its assigned scope only**. Notifications are always self-scoped.

---

## 6 Detailed Permission Codes

Representative permission codes per module (full list generated from backend and kept in sync with [05_API_SPEC](05_API_SPEC.md)).

| Module | Permission codes |
|---|---|
| IAM | `user.read`, `user.manage`, `role.manage`, `permission.read` |
| CRM | `lead.read`, `lead.create`, `lead.update`, `lead.convert`, `lead.delete` |
| Clients | `client.read`, `client.create`, `client.update` |
| BOQ | `boq.read`, `boq.create`, `boq.update`, `boq.delete` |
| Quotation | `quotation.read`, `quotation.create`, `quotation.send`, `quotation.approve` |
| Contracts | `contract.read`, `contract.create`, `contract.update`, `contract.approve`, `contract.sign` |
| Change Orders | `changeorder.read`, `changeorder.create`, `changeorder.approve` |
| Projects | `project.read`, `project.create`, `project.update`, `project.manage_members` |
| Progress | `progress.read`, `progress.update.own`, `progress.update` |
| Media | `photo.read`, `photo.upload`, `document.read`, `document.upload` |
| Procurement | `requisition.read`, `requisition.create`, `requisition.approve`, `po.read`, `po.create`, `po.approve` |
| Inventory | `inventory.read`, `inventory.update`, `stock.move` |
| Expenses | `expense.read`, `expense.create`, `expense.approve` |
| Reimbursement | `reimbursement.read`, `reimbursement.create.own`, `reimbursement.approve` |
| Payroll | `payroll.read`, `payroll.run`, `payroll.approve` |
| Cost | `cost.read`, `cost.export` |
| Invoices | `invoice.read`, `invoice.create`, `invoice.send` |
| Payments | `payment.read`, `payment.create` |
| Warranty | `warranty.read`, `warranty.manage`, `defect.read`, `defect.create`, `defect.update` |
| Reports | `report.read`, `report.export` |
| AI | `ai.query`, `ai.assist` |
| Settings | `settings.read`, `settings.manage`, `settings.thresholds.manage` |

---

## 7 Project-Scoped Access Rules

Some roles are global; others are limited to projects they are assigned to via `project_members`:

| Role | Scope rule |
|---|---|
| owner, admin | All projects (global). |
| accounting, procurement | Global within their function (all projects' finance/procurement). |
| ae | Projects where they are the manager or a member. |
| site_engineer, foreman | Only assigned projects. |
| worker | Only own tasks/records. |
| client | Only projects for their client account. |
| partner | Only projects they are explicitly added to. |

**Enforcement:** the API checks both (a) the permission code and (b) project membership for scoped resources. Failing either → denied.

---

## 8 Approval Thresholds

Value-based rules layered on approval permissions, configured in Settings (`/settings/approval-thresholds`). Example default policy:

| Workflow | Auto / Level 1 | Escalation |
|---|---|---|
| Expense | ≤ ₹25,000 → AE approves | > ₹25,000 → Owner approves |
| Purchase Requisition / PO | ≤ ₹100,000 → AE approves | > ₹100,000 → Owner approves |
| Worker Reimbursement | ≤ ₹10,000 → Site Engineer + Accounting | > ₹10,000 → AE + Accounting |
| Change Order | Any value → Client + AE | > contract Δ threshold → Owner |
| Quotation | AE prepares | Client approval always required |

> Currency and exact thresholds are configurable; values above are illustrative defaults for ARTIVERGES GROUP.

---

## 9 External Roles (Client & Partner)

External roles operate through the **portal** with a deliberately narrow surface:

**Client can:**
- View own projects: progress, photos, milestones, documents marked client-visible.
- Approve/reject quotations, contracts, and change orders.
- View own invoices and payment status.
- Raise warranty/defect requests.

**Client cannot:** see costs/margins, other clients, internal operations, or any global data.

**Partner can:**
- View assigned projects' relevant scope, submit updates/progress on their portion, upload deliverables.
- Track their own payment/collaboration status.

**Partner cannot:** see company financials, other partners, or unassigned projects.

Both are strictly project- or self-scoped and read/approve/limited-submit only.

---

## 10 Governance

- **Roles are data-driven** — permissions can be adjusted without code changes; the matrix here is the source of truth.
- **Every permission change is audited** (`audit_logs`), including who changed what and when.
- **Periodic access review** — Admin reviews role assignments and external access on a defined cadence.
- **Separation of duties** — e.g., the person who submits an expense cannot approve their own; finance approval is distinct from operational approval.
- **New modules/actions** must define their permission codes here before release.

---

*End of Document — 06_PERMISSION_MATRIX.md · ARTIVERGES NEXT · v1.0*
