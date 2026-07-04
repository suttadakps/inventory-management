# ARTIVERGES NEXT — Product Requirements Document (PRD)

| Field | Detail |
|---|---|
| **Document** | 01_PRD — Master Product Requirements Document |
| **Product Name** | ARTIVERGES NEXT |
| **Company** | ARTIVERGES GROUP |
| **Business Domain** | Construction, Renovation & Interior Turnkey Solutions |
| **Product Type** | Internal ERP & Construction Management Platform |
| **Target Platform** | Responsive Web Application (Phase 1) · Mobile App (Phase 2) |
| **Document Owner** | Product Management |
| **Status** | Draft — Master Blueprint |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |

> **Purpose of this document.** This PRD is the single source of truth and master blueprint for the ARTIVERGES NEXT platform. Every downstream artifact — technical architecture, data model, UI/UX design, sprint backlog, and QA plan — must trace back to the requirements described here. It defines *what* we are building and *why*, not *how* we will build it. No code or technical implementation detail is included.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Business Objectives](#2-business-objectives)
3. [Problems We Are Solving](#3-problems-we-are-solving)
4. [User Personas](#4-user-personas)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Core Modules](#6-core-modules)
7. [Main Workflows](#7-main-workflows)
8. [MVP Scope](#8-mvp-scope)
9. [Future Roadmap](#9-future-roadmap)
10. [Success Metrics](#10-success-metrics)
11. [Risks](#11-risks)
12. [Assumptions](#12-assumptions)
13. [Glossary](#13-glossary)

---

# 1 Product Vision

**ARTIVERGES NEXT is the operational backbone of ARTIVERGES GROUP** — a unified platform that connects every stage of the construction lifecycle, from the first sales lead to the final warranty claim, inside a single, transparent system.

Today, construction and interior turnkey businesses run on a fragmented mix of spreadsheets, chat groups, paper site reports, and disconnected accounting tools. Information is trapped in silos, decisions are made on stale data, and profit leaks quietly through untracked expenses, material wastage, and scope creep.

Our vision is to replace that fragmentation with **one connected system of record** where:

- **Sales, project, and finance data flow as one continuous thread** — a lead becomes a BOQ, a quotation, a contract, a live project, and a warranty record without ever leaving the platform or being re-keyed.
- **Every stakeholder sees the truth relevant to their role** — the Owner sees company-wide profitability, the Site Engineer sees today's tasks and material status, and the Client sees verified progress with photos.
- **Field and office operate in real time** — site progress, photos, expenses, and material requests captured on-site are instantly visible to the back office.
- **Money is protected by design** — every expense, purchase order, reimbursement, and change order passes through structured approval, so cost overruns are caught before they happen, not discovered at project close.
- **Intelligence is built in** — an AI Assistant surfaces risks, summarizes project health, and answers operational questions in natural language.

The end state is a company that can **scale the number of projects it runs without scaling chaos** — where growth is limited by ambition and capacity, not by the ceiling of manual coordination.

---

# 2 Business Objectives

The platform exists to serve concrete, measurable business goals for ARTIVERGES GROUP:

| # | Objective | Description |
|---|---|---|
| **BO-1** | **Protect and improve project margins** | Track budgeted vs. actual cost at line-item level so overruns are visible in real time, not at project close. Target: reduce average cost overrun per project. |
| **BO-2** | **Shorten the sales-to-contract cycle** | Move a lead from survey to signed contract faster by digitizing BOQ, quotation, and approval steps. Fewer manual handoffs, faster client turnaround. |
| **BO-3** | **Eliminate revenue and cost leakage** | Enforce structured approvals on expenses, purchases, reimbursements, and change orders so nothing is spent or billed without a trail. |
| **BO-4** | **Create a single source of truth** | Consolidate CRM, projects, procurement, inventory, and finance into one database, removing duplicate data entry and reconciliation effort. |
| **BO-5** | **Improve cash flow visibility and control** | Link invoices, payments, and project milestones so the company always knows what is owed, what is overdue, and what is collectible. |
| **BO-6** | **Increase client trust and retention** | Give clients transparent, verifiable progress and a clean warranty/defect resolution experience, driving referrals and repeat business. |
| **BO-7** | **Enable data-driven decisions** | Provide dashboards and reports that let leadership steer the business on live numbers rather than intuition. |
| **BO-8** | **Scale operations without proportional overhead** | Allow the company to take on more concurrent projects without a linear increase in administrative headcount. |

---

# 3 Problems We Are Solving

ARTIVERGES GROUP, like most mid-size construction and interior firms, currently faces a set of recurring, expensive problems:

### 3.1 Fragmented tools and data silos
Sales lives in one spreadsheet, BOQs in another, site updates in chat groups, and finance in a separate accounting package. There is no single place to see the truth about a project, and the same data is entered multiple times.

### 3.2 Invisible cost overruns
Because budgeted cost and actual spend are tracked in different systems (or not tracked at all), overruns are discovered only when a project is nearly finished — far too late to correct. Profit erodes silently.

### 3.3 Untracked and unapproved spending
Site-level purchases, worker reimbursements, and petty cash flow with weak controls. Money is spent before anyone with authority approves it, and receipts go missing.

### 3.4 Poor field-to-office communication
Site progress, delays, and material shortages are communicated informally (phone calls, chat photos) and are easily lost. The office reacts late to problems it should have seen coming.

### 3.5 Manual, error-prone BOQ and quotation process
Quotations are built by hand in spreadsheets, prone to formula errors, version confusion, and inconsistent pricing. Approvals are chased over email and chat.

### 3.6 No structured change management
When a client requests a change mid-project, it is often agreed verbally and executed without a formal change order — leading to disputes over scope and payment.

### 3.7 Weak procurement and inventory control
Materials are ordered reactively, stock is not tracked, and wastage and duplicate purchasing go unnoticed. There is no link between what a project needs, what was ordered, and what was consumed.

### 3.8 Opaque client experience
Clients have no reliable window into their project's status and must rely on phone updates. Warranty and defect requests after handover are handled ad hoc, hurting satisfaction and referrals.

### 3.9 Difficult, backward-looking reporting
Producing a management report means manually consolidating data from many sources. By the time a report exists, the data is stale.

**ARTIVERGES NEXT directly addresses each of these problems** through connected modules, enforced workflows, real-time field capture, and built-in reporting and AI.

---

# 4 User Personas

Personas represent the real people who will use ARTIVERGES NEXT day to day. Each has distinct goals, frustrations, and success criteria.

### Persona 1 — "Rajan", the Company Owner
- **Role context:** Founder and managing director. Ultimately accountable for growth and profitability.
- **Goals:** See company-wide health at a glance; know which projects make money and which bleed; make fast, confident decisions.
- **Frustrations:** Data arrives late and inconsistent; he learns about overruns after the fact; he can't compare projects easily.
- **Success looks like:** A single dashboard showing revenue, cost, margin, and cash position across all projects, updated live.

### Persona 2 — "Priya", the Admin
- **Role context:** Runs the back office and keeps the system clean and trustworthy.
- **Goals:** Manage users and permissions; ensure master data (clients, rates, catalogs) is accurate; keep operations flowing.
- **Frustrations:** Chasing people for updates; correcting duplicate or wrong data; being the manual glue between departments.
- **Success looks like:** Well-governed roles, clean master data, and automated handoffs instead of manual coordination.

### Persona 3 — "Arun", the AE / Project Manager
- **Role context:** Owns the client relationship and the commercial + delivery success of assigned projects.
- **Goals:** Convert leads efficiently; keep projects on budget and schedule; keep clients happy.
- **Frustrations:** Juggling quotations, contracts, site status, and finance across disconnected tools; scope creep without documentation.
- **Success looks like:** A project cockpit that shows commercial and delivery status together, with alerts before things go wrong.

### Persona 4 — "Suresh", the Site Engineer
- **Role context:** Technical lead on site; translates drawings and BOQ into executed work.
- **Goals:** Know today's tasks and required materials; log progress; raise material requests and defects.
- **Frustrations:** Missing materials, unclear priorities, and reporting the same status repeatedly through different channels.
- **Success looks like:** A mobile-friendly view of tasks, material status, and a fast way to log progress and photos from the field.

### Persona 5 — "Kumar", the Foreman
- **Role context:** Supervises the daily labor crew on site.
- **Goals:** Assign and track worker tasks; record attendance and work done; report issues.
- **Frustrations:** Paper timesheets, verbal task lists, and no easy way to prove work completed.
- **Success looks like:** Simple daily logging of crew, tasks, and completed work with photo proof.

### Persona 6 — "Ali", the Worker
- **Role context:** Skilled/unskilled laborer executing on-site tasks.
- **Goals:** Know what to do; get reimbursed for out-of-pocket expenses; be paid correctly.
- **Frustrations:** Reimbursements delayed or lost; unclear pay calculation.
- **Success looks like:** A simple way to submit expense receipts and see attendance/pay clearly (via the future Worker App).

### Persona 7 — "Meena", Accounting
- **Role context:** Manages invoices, payments, payroll, and financial accuracy.
- **Goals:** Bill on time, collect on time, pay accurately, and keep clean books.
- **Frustrations:** Reconciling data from many sources; chasing approvals; unlinked expenses and invoices.
- **Success looks like:** Finance data flowing automatically from projects, with every transaction traceable and approved.

### Persona 8 — "Vikram", Procurement
- **Role context:** Sources materials and manages suppliers and purchase orders.
- **Goals:** Buy the right materials at the right price and time; avoid stockouts and over-ordering.
- **Frustrations:** Reactive purchasing, no link to project needs, no supplier price history.
- **Success looks like:** Purchase requests tied to project BOQ, managed POs, and inventory visibility.

### Persona 9 — "Deepa", the Client
- **Role context:** The homeowner or business commissioning the project.
- **Goals:** Trust that work is progressing, understand costs and changes, and get issues fixed under warranty.
- **Frustrations:** No visibility; surprises in cost; slow defect resolution.
- **Success looks like:** A clean portal showing verified progress, approvals, invoices, and a simple way to raise warranty issues.

### Persona 10 — "Global Interiors", the Partner
- **Role context:** External subcontractor, vendor, or referral partner collaborating on projects.
- **Goals:** Receive clear scope, submit work/updates, and get paid on agreed terms.
- **Frustrations:** Unclear expectations and payment delays.
- **Success looks like:** Scoped access to relevant project information and a clear collaboration and payment trail.

---

# 5 User Roles & Permissions

ARTIVERGES NEXT is **role-based**. Every user is assigned one or more roles, and each role grants a defined set of responsibilities and access rights. The principle is **least privilege**: users see and act on only what their role requires.

### 5.1 Role Responsibilities

#### Owner
- Full visibility across the entire company: all projects, all finances, all reports.
- Reviews company-wide profitability, cash flow, and performance dashboards.
- Approves high-value contracts, change orders, and expenses above defined thresholds.
- Sets strategic targets and monitors KPIs.
- Ultimate authority over configuration and role assignment (typically delegated to Admin).

#### Admin
- Manages users, roles, and permissions.
- Maintains master data: clients, partners, material catalogs, rate cards, tax and company settings.
- Configures workflows, approval thresholds, and notification rules.
- Ensures data integrity and system governance.
- Provides operational support to all other roles.

#### AE (Account Executive / Project Manager)
- Owns assigned leads, clients, and projects end to end.
- Manages the sales pipeline: leads, surveys, BOQs, quotations, and approvals.
- Creates and manages contracts and change orders.
- Oversees project delivery: progress, cost, schedule, and client communication.
- Raises and approves expenses/purchases within delegated limits.

#### Site Engineer
- Executes assigned projects technically on-site.
- Updates project progress and task completion.
- Uploads site photos and documents.
- Raises material requests (purchase requisitions) and reports defects.
- Records site-level observations and issues.

#### Foreman
- Supervises the on-site labor crew.
- Records worker attendance and daily work logs.
- Assigns and tracks worker-level tasks under the Site Engineer's direction.
- Reports progress and issues from the crew to the Site Engineer.

#### Worker
- Executes assigned on-site tasks.
- Submits expense reimbursement requests with receipts.
- Views own attendance and (future) pay information via the Worker App.
- Limited, self-service access only.

#### Accounting
- Manages invoices, payments, and receivables/payables.
- Runs payroll and processes worker reimbursements.
- Reviews and approves financial transactions within policy.
- Reconciles project costs and maintains financial accuracy.
- Generates financial reports.

#### Procurement
- Manages suppliers/vendors and material catalog pricing.
- Converts approved material requests into purchase orders.
- Tracks PO status, deliveries, and inventory receipts.
- Monitors stock levels and flags shortages or over-ordering.

#### Client
- Views own project(s) only: progress, photos, milestones.
- Reviews and approves quotations, contracts, and change orders.
- Views own invoices and payment status.
- Raises warranty and defect requests after handover.
- **Read/approve/limited-submit access only — no internal operational data.**

#### Partner
- Scoped, external-collaboration access to the specific projects they are assigned to.
- Views relevant scope, submits updates or deliverables, and tracks their payment/collaboration status.
- **No access to internal company-wide data.**

### 5.2 Permission Matrix (Indicative)

Legend: **F** = Full (create/edit/delete) · **E** = Edit/Contribute · **A** = Approve · **V** = View only · **S** = Self-service (own records only) · **—** = No access

| Module | Owner | Admin | AE | Site Eng. | Foreman | Worker | Accounting | Procurement | Client | Partner |
|---|---|---|---|---|---|---|---|---|---|---|
| Dashboard | F | F | E | E | V | S | E | E | V | V |
| Projects | F | F | F | E | E | S | V | V | V | V |
| CRM / Leads | F | F | F | — | — | — | — | — | — | — |
| Clients | F | F | E | V | — | — | V | — | S | — |
| BOQ | F | F | F | V | — | — | V | V | V | — |
| Quotation | F | F | F | — | — | — | V | — | A | — |
| Contracts | A | F | E | — | — | — | V | — | A | V |
| Procurement | V | F | E | E | — | — | V | F | — | — |
| Purchase Orders | A | F | E | — | — | — | V | F | — | — |
| Inventory | V | F | V | E | E | — | V | F | — | — |
| Expenses | A | F | E | E | E | S | A | E | — | S |
| Worker Reimbursement | A | F | A | E | E | S | A | — | — | — |
| Payroll | A | F | V | — | — | S | F | — | — | — |
| Project Cost Tracking | F | F | E | V | — | — | E | V | — | — |
| Project Progress | F | F | E | E | E | V | V | V | V | E |
| Site Photos | F | F | E | E | E | S | V | — | V | E |
| Documents | F | F | E | E | V | — | V | V | V | V |
| Invoices | V | F | E | — | — | — | F | — | V | V |
| Payments | V | F | V | — | — | — | F | — | V | V |
| Warranty | F | F | E | E | — | — | V | — | S | — |
| Notifications | F | F | E | E | E | S | E | E | S | S |
| Reports | F | F | E | V | — | — | E | V | V | — |
| AI Assistant | F | F | E | E | V | — | E | E | V | — |
| Settings | F | F | — | — | — | — | — | — | — | — |

> The final permission matrix will be confirmed during design. Approval thresholds (e.g., expense value limits per role) are configurable in Settings.

---

# 6 Core Modules

Each module below is a functional area of the platform. Together they form the connected system of record.

### 6.1 Dashboard
The role-aware landing screen. Every user lands on a dashboard tailored to their responsibilities.
- **Owner:** company-wide revenue, cost, margin, cash position, project health heatmap, alerts.
- **AE:** pipeline value, project statuses, pending approvals, overdue items.
- **Site Engineer/Foreman:** today's tasks, material status, open defects.
- **Accounting:** receivables, payables, overdue invoices, payroll due.
- **Client:** own project progress, pending approvals, invoices.
- Configurable KPI widgets, alerts, and quick actions. Drill-down from any widget into the underlying module.

### 6.2 Projects
The central hub around which everything revolves.
- Project profile: client, scope, contract value, timeline, assigned team.
- Links to the project's BOQ, quotation, contract, procurement, costs, progress, photos, documents, invoices, and warranty.
- Status lifecycle (e.g., Planning → Active → On Hold → Completed → Warranty → Closed).
- Team assignment and role-based access to each project.
- Milestones and schedule overview.

### 6.3 CRM / Leads
Manages the top of the sales funnel.
- Lead capture (source, contact, requirement, budget, location).
- Pipeline stages (New → Contacted → Survey Scheduled → Qualified → Quoted → Won/Lost).
- Activity log: calls, meetings, notes, follow-ups, reminders.
- Assignment to AEs and conversion of a won lead into a Client + Project.

### 6.4 Clients
The master record of all customers.
- Client profile: contact details, addresses, communication history.
- Linked projects, contracts, invoices, and warranty records.
- Client portal access management.

### 6.5 BOQ (Bill of Quantities)
The structured breakdown of everything a project requires.
- Line items grouped by category/section (civil, electrical, interior, etc.).
- Each item: description, unit, quantity, rate, material vs. labor split, cost estimate.
- Built from templates or catalog items for speed and consistency.
- Feeds directly into Quotation and Project Cost Tracking (budgeted cost baseline).
- Versioning to track revisions.

### 6.6 Quotation
The client-facing commercial proposal generated from the BOQ.
- Applies margins, discounts, taxes, and terms to BOQ costs.
- Professional, branded quotation output for client review.
- Version control and revision history.
- Sent to client for approval; approval status tracked.
- Approved quotation flows into Contract.

### 6.7 Contracts
The formal, binding agreement with the client.
- Generated from the approved quotation.
- Captures scope, value, payment schedule/milestones, timeline, and terms.
- Digital approval/sign-off tracking.
- Basis for milestone-based invoicing.
- Linked to change orders that amend the contract.

### 6.8 Procurement
Manages the sourcing of materials needed to execute projects.
- Purchase requisitions (material requests) raised from site/BOQ.
- Approval routing before purchasing.
- Supplier/vendor management and price references.
- Converts approved requisitions into Purchase Orders.

### 6.9 Purchase Orders (PO)
Formal orders placed with suppliers.
- Generated from approved requisitions.
- PO details: supplier, items, quantities, prices, delivery terms.
- Status tracking (Draft → Approved → Sent → Partially Received → Received → Closed).
- Links deliveries to Inventory and costs to Project Cost Tracking.

### 6.10 Inventory
Tracks materials received, stored, and consumed.
- Stock by material and location/warehouse/site.
- Goods receipt against POs.
- Material issue/consumption to projects.
- Stock levels, low-stock alerts, and reconciliation.
- Links consumption to project actual cost.

### 6.11 Expenses
Captures all project and operational spending.
- Expense entry with category, project, amount, receipt attachment.
- Structured approval workflow before an expense is booked.
- Links to Project Cost Tracking as actual cost.
- Distinguishes project-billable vs. overhead expenses.

### 6.12 Worker Reimbursement
Handles out-of-pocket expenses paid by workers/site staff.
- Reimbursement request with receipt and project link.
- Approval routing (Foreman/Site Engineer → AE → Accounting).
- Payment tracking and link to payroll/finance.

### 6.13 Payroll
Manages compensation for company staff and workers.
- Attendance and work-log inputs (from Foreman logs).
- Salary/wage calculation, allowances, deductions.
- Pay run generation and payment tracking.
- Links labor cost to Project Cost Tracking.

### 6.14 Project Cost Tracking
The financial heart of delivery — budget vs. actual.
- Budgeted cost baseline from the BOQ.
- Actual cost aggregated from expenses, purchase orders, inventory consumption, reimbursements, and payroll.
- Real-time variance (over/under budget) at project and line-item level.
- Margin calculation (contract value − actual cost).
- Alerts when actuals approach or exceed budget.

### 6.15 Project Progress
Tracks physical execution against plan.
- Task/milestone list with % completion.
- Progress updates from Site Engineer/Foreman.
- Schedule status (on track / delayed) and timeline view.
- Feeds client-facing progress and milestone-based invoicing triggers.

### 6.16 Site Photos
Visual proof and record of on-site work.
- Photo upload from site, tagged to project, task, and date.
- Before/during/after documentation.
- Feeds client portal progress views and defect evidence.

### 6.17 Documents
Central repository for all project and company documents.
- Drawings, permits, contracts, certificates, reports.
- Organized by project and category; version-aware.
- Role-based access control on sensitive documents.

### 6.18 Invoices
Billing to clients.
- Generated from contract milestones or progress.
- Line items, taxes, terms, and due dates.
- Status tracking (Draft → Sent → Partially Paid → Paid → Overdue).
- Linked to payments and receivables reporting.

### 6.19 Payments
Records money in and out.
- Client payment receipts against invoices.
- Supplier/partner payments against POs and contracts.
- Payment method, reference, and reconciliation.
- Feeds cash flow and financial reporting.

### 6.20 Warranty
Manages post-handover obligations and defects.
- Warranty record per project (coverage, period, terms).
- Client-raised defect/warranty requests.
- Defect workflow: logged → assigned → resolved → verified → closed.
- History and SLA tracking.

### 6.21 Notifications
Keeps everyone informed in real time.
- In-app (and future push/email) alerts for approvals, assignments, status changes, overdue items, and defects.
- Role- and event-based notification rules.
- Action links directly to the relevant record.

### 6.22 Reports
Turns operational data into insight.
- Sales/pipeline, project cost & margin, procurement, inventory, financial (receivables/payables/cash flow), and productivity reports.
- Filterable by project, period, client, and role.
- Exportable (PDF/Excel) for management review.

### 6.23 AI Assistant
Built-in intelligence layer across the platform.
- Natural-language Q&A over company/project data ("Which projects are over budget?").
- Project health summaries and risk flags.
- Assisted BOQ/quotation drafting and report summarization.
- Smart alerts and recommendations. (Advanced AI capabilities phased per roadmap.)

### 6.24 Settings
System configuration and governance.
- Company profile, branding, tax, and currency settings.
- Users, roles, and permission management.
- Workflow and approval-threshold configuration.
- Master data: catalogs, rate cards, templates.
- Notification rules and integrations.

---

# 7 Main Workflows

## 7.1 Primary End-to-End Lifecycle

The core business flow that ARTIVERGES NEXT digitizes end to end:

```
Lead
  ↓
Site Survey
  ↓
BOQ
  ↓
Quotation
  ↓
Client Approval
  ↓
Contract
  ↓
Project (created)
  ↓
Material Procurement
  ↓
Construction
  ↓
Progress Tracking
  ↓
Inspection
  ↓
Completion (Handover)
  ↓
Warranty
```

**Narrative:** A lead is captured in CRM and assigned to an AE. A site survey is scheduled and its findings recorded. From the survey, a BOQ is built. The BOQ is priced into a Quotation and sent for **Client Approval**. On approval, a Contract is generated and signed, which creates a live Project. Procurement sources materials, construction begins, and the Site Engineer/Foreman update Progress. Inspections verify quality, the project reaches Completion and handover, and it moves into the Warranty phase for post-handover support.

## 7.2 Expense Approval Workflow

```
Expense submitted (Site Engineer / Foreman / Worker / AE)
  ↓
Receipt & project linked
  ↓
Review (AE / Project Manager)
  ↓
Finance review (Accounting)
  ↓  ┌─ Rejected → returned to submitter with reason
Approved
  ↓
Booked to Project Cost Tracking (actual cost)
  ↓
Payment / reimbursement processed
```
High-value expenses above a configurable threshold escalate to Owner approval.

## 7.3 Purchase Workflow

```
Material need identified (from BOQ / site request)
  ↓
Purchase Requisition raised (Site Engineer / AE)
  ↓
Approval (AE / Owner per threshold)
  ↓
Procurement converts to Purchase Order
  ↓
PO sent to Supplier
  ↓
Goods received → Inventory updated (Goods Receipt)
  ↓
Cost booked to Project Cost Tracking
  ↓
Supplier payment scheduled (Accounting)
```

## 7.4 Change Order Workflow

```
Change requested (Client or internal)
  ↓
Impact assessed (scope, cost, timeline) by AE
  ↓
Change Order document created (amends BOQ/Contract)
  ↓
Client Approval
  ↓  ┌─ Rejected → no change; logged
Approved
  ↓
Contract value & schedule updated
  ↓
Revised BOQ/budget flows to Project Cost Tracking
  ↓
Execution proceeds under new scope
```

## 7.5 Defect Workflow

```
Defect reported (Client / Site Engineer / Inspection)
  ↓
Logged & categorized (severity, project, location)
  ↓
Assigned (Site Engineer / crew)
  ↓
Rectification work performed
  ↓
Verification / re-inspection
  ↓  ┌─ Not resolved → reassigned
Resolved & Closed (with photo proof)
```

## 7.6 Warranty Workflow

```
Project handover → Warranty record activated (coverage & period)
  ↓
Client raises Warranty Request (via portal)
  ↓
Validated against warranty terms & period
  ↓  ┌─ Out of scope → chargeable quote / declined
In scope → routed to Defect Workflow
  ↓
Resolved, verified & closed
  ↓
Warranty history updated; SLA tracked
```

---

# 8 MVP Scope

The MVP (Version 1) delivers the **connected core** — enough to run a real project end to end on the platform and prove the value of a single source of truth. It is a **responsive web application**.

### 8.1 In Scope for MVP

**Foundation**
- User authentication, role-based access control, and core Settings (company profile, users/roles, master data, tax/currency).
- Role-aware Dashboard (core KPIs and quick actions).
- Notifications (in-app).

**Sales & commercial core**
- CRM / Leads (capture, pipeline, activities, conversion).
- Clients (master records).
- BOQ (line items, categories, templates, versioning).
- Quotation (from BOQ, margins/tax, client approval status).
- Contracts (from approved quotation, milestones, sign-off).

**Delivery core**
- Projects (central hub, team, status lifecycle).
- Project Progress (tasks/milestones, % completion, updates).
- Site Photos (upload, tagging).
- Documents (repository with role-based access).

**Procurement & cost core**
- Procurement / Purchase Requisitions with approval.
- Purchase Orders.
- Inventory (basic goods receipt and consumption).
- Expenses with approval workflow.
- Worker Reimbursement with approval workflow.
- **Project Cost Tracking (budget vs. actual)** — the flagship MVP capability.

**Finance core**
- Invoices (milestone-based).
- Payments (receipts and basic supplier payments).

**Post-delivery**
- Warranty and Defect management (basic).

**Insight**
- Reports (core set: pipeline, project cost & margin, receivables/payables).

### 8.2 Explicitly Out of MVP (Deferred)
- Native mobile apps (Worker App, field mobile app) — Phase 2.
- Full-featured Client Portal (basic client view only in MVP).
- Advanced AI Assistant (basic assistant/summaries only in MVP; advanced NL analytics later).
- Full Payroll automation (basic payroll/reimbursement in MVP; advanced payroll later).
- Advanced inventory (multi-warehouse logistics, barcode) — later.
- External integrations (accounting software, e-signature, payment gateways) — later.

### 8.3 MVP Success Definition
The MVP is successful when ARTIVERGES GROUP can run **at least one full real project** — lead → contract → delivery → invoice → warranty — entirely inside the platform, with **live budget-vs-actual cost visibility** and **no parallel spreadsheet** for the core flow.

---

# 9 Future Roadmap

### 9.1 Version 2
- **Mobile App (Phase 2):** field-optimized apps for Site Engineer, Foreman, and Worker (offline-friendly progress, photos, requests, reimbursements).
- **Client Portal (full):** rich, self-service client experience — progress, approvals, invoices, payments, and warranty requests.
- **Worker App:** attendance, task view, reimbursement submission, and pay visibility.
- **Advanced Procurement & Inventory:** multi-warehouse, barcode/QR, supplier price history and comparison.
- **Enhanced Payroll:** full attendance-to-pay automation, statutory handling.

### 9.2 Version 3
- **Integrations:** accounting software, payment gateways, e-signature, cloud storage.
- **Advanced scheduling:** Gantt/critical-path planning and resource allocation.
- **Partner Portal (full):** subcontractor collaboration, deliverables, and payment tracking.
- **Multi-branch / multi-entity** support for company expansion.
- **Advanced analytics & BI dashboards.**

### 9.3 AI Features (Progressive)
- Natural-language querying of company and project data.
- Predictive cost-overrun and delay risk detection.
- Automated project health summaries and daily digests.
- AI-assisted BOQ/quotation generation and pricing suggestions.
- Document intelligence (auto-extract from drawings/invoices/receipts).
- Smart procurement recommendations.

### 9.4 Mobile App
- Progressive rollout: read/monitor first, then full field data capture, then offline sync.

### 9.5 Client Portal
- From basic project view (MVP) to full transactional portal (approvals, payments, warranty).

### 9.6 Worker App
- Simple, low-literacy-friendly interface for attendance, tasks, reimbursements, and pay.

---

# 10 Success Metrics

Success is measured across three lenses: **Business**, **User**, and **Financial**. Baselines will be captured before rollout; targets set during onboarding.

### 10.1 Business KPIs
| KPI | Definition | Target Direction |
|---|---|---|
| Lead-to-contract conversion rate | % of leads that become signed contracts | ↑ Increase |
| Sales cycle time | Days from lead to signed contract | ↓ Decrease |
| On-time project delivery rate | % of projects completed by planned date | ↑ Increase |
| Change orders formally documented | % of changes captured as approved change orders | ↑ Increase (toward 100%) |
| Projects run fully on platform | % of active projects managed end to end in the system | ↑ Increase (toward 100%) |

### 10.2 User KPIs
| KPI | Definition | Target Direction |
|---|---|---|
| Active user adoption | % of intended users actively using the system weekly | ↑ Increase |
| Field update timeliness | % of progress updates logged same-day from site | ↑ Increase |
| Approval turnaround time | Avg. time to approve expenses/POs/change orders | ↓ Decrease |
| Duplicate data entry | Instances of re-keying the same data across tools | ↓ Decrease (toward zero) |
| Client portal engagement | % of clients actively viewing their projects | ↑ Increase |

### 10.3 Financial KPIs
| KPI | Definition | Target Direction |
|---|---|---|
| Average project margin | (Contract value − actual cost) / contract value | ↑ Increase |
| Cost overrun rate | Avg. actual-vs-budget variance per project | ↓ Decrease |
| Cost/revenue leakage | Untracked/unapproved spend as % of project cost | ↓ Decrease (toward zero) |
| Days Sales Outstanding (DSO) | Avg. days to collect client payments | ↓ Decrease |
| Overdue receivables | Value/% of invoices past due | ↓ Decrease |
| Procurement savings | Cost avoided via controlled/comparative purchasing | ↑ Increase |

---

# 11 Risks

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-1 | **Low user adoption** — field staff resist moving off chat/paper | High | Medium | Simple, mobile-friendly UX; training; make the system the only source of truth; leadership mandate. |
| R-2 | **Data migration & master-data quality** — messy legacy data | Medium | High | Phased migration; data cleansing; Admin governance of master data. |
| R-3 | **Scope creep** — modules expand beyond MVP | High | Medium | Strict MVP boundary (Section 8); roadmap discipline; change control on the product itself. |
| R-4 | **Connectivity on site** — poor internet in the field | Medium | Medium | Responsive/lightweight web first; offline-capable mobile in Phase 2. |
| R-5 | **Approval bottlenecks** — workflows slow down operations | Medium | Medium | Configurable thresholds; delegation; notifications and escalation. |
| R-6 | **Financial accuracy dependence** — cost tracking only as good as inputs | High | Medium | Enforced links (PO→inventory→cost), receipt requirements, reconciliation reports. |
| R-7 | **Role/permission complexity** — 10 roles risk misconfiguration | Medium | Medium | Clear default matrix; least-privilege; audit of access. |
| R-8 | **Over-reliance on AI outputs** | Medium | Low | Position AI as assistive; keep human approval on decisions; show data sources. |
| R-9 | **Client/Partner external access security** | High | Low | Strict scoping, least privilege, and access review for external roles. |
| R-10 | **Timeline & resourcing** for an ambitious module set | High | Medium | MVP-first delivery; prioritized roadmap; iterative releases. |

---

# 12 Assumptions

- ARTIVERGES GROUP will operate the platform as its **primary system of record** and phase out parallel spreadsheets for core flows.
- Users have access to modern web browsers and, for field staff, smartphones for the future mobile phase.
- Reasonable internet connectivity is available at offices; site connectivity may be intermittent (addressed by Phase 2 offline mobile).
- Master data (clients, catalogs, rate cards, tax rules) can be sourced and maintained by an Admin.
- The 10 defined roles adequately represent all user types; additional roles can be configured later.
- Approval thresholds, tax rates, and workflow rules are **configurable**, not hard-coded, and will be set during onboarding.
- Currency and tax handling reflect a single operating jurisdiction in MVP; multi-entity/multi-currency is a future roadmap item.
- Leadership sponsors adoption and enforces platform-first ways of working.
- Historical/legacy data migration scope will be agreed separately; the platform is usable starting from new projects even without full migration.
- External integrations (accounting, payments, e-signature) are **not** required for MVP and will be added per roadmap.

---

# 13 Glossary

| Term | Definition |
|---|---|
| **ERP** | Enterprise Resource Planning — software unifying core business processes (sales, projects, procurement, finance) in one system. |
| **AE** | Account Executive / Project Manager — owns client relationships and project delivery. |
| **BOQ** | Bill of Quantities — an itemized breakdown of materials, labor, and quantities required for a project, with rates and costs. |
| **Quotation** | The priced, client-facing commercial proposal derived from the BOQ. |
| **Contract** | The formal, binding agreement generated from an approved quotation, defining scope, value, milestones, and terms. |
| **Change Order** | A formally documented and approved modification to an existing contract's scope, cost, or timeline. |
| **PO (Purchase Order)** | A formal order issued to a supplier for materials, generated from an approved requisition. |
| **Purchase Requisition** | An internal request to purchase materials, raised before a PO and subject to approval. |
| **Goods Receipt** | The recorded receipt of materials against a PO, updating inventory. |
| **Inventory** | Stock of materials tracked from receipt through consumption to a project. |
| **Project Cost Tracking** | Real-time comparison of budgeted cost (from BOQ) against actual cost (expenses, POs, inventory, payroll, reimbursements). |
| **Margin** | Contract value minus actual cost; the profit on a project. |
| **Variance** | The difference between budgeted and actual cost, per line item or project. |
| **Reimbursement** | Repayment to a worker/staff member for approved out-of-pocket project expenses. |
| **Milestone** | A defined project stage used for progress tracking and milestone-based invoicing. |
| **Defect** | A quality issue in delivered work requiring rectification. |
| **Warranty** | The post-handover coverage period during which the company remedies qualifying defects. |
| **RBAC** | Role-Based Access Control — permissions granted according to a user's role. |
| **MVP** | Minimum Viable Product — the smallest release that delivers real, usable value (Version 1). |
| **KPI** | Key Performance Indicator — a measurable value tracking performance against an objective. |
| **DSO** | Days Sales Outstanding — average days taken to collect payment after invoicing. |
| **Client Portal** | The scoped, external interface through which clients view and act on their own projects. |
| **Partner** | An external subcontractor, vendor, or referral collaborator with scoped project access. |

---

*End of Document — 01_PRD.md · ARTIVERGES NEXT · Master Product Requirements Document (v1.0)*
