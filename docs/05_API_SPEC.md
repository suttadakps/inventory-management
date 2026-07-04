# ARTIVERGES NEXT — API Specification

| Field | Detail |
|---|---|
| **Document** | 05_API_SPEC — REST API Contract |
| **Product** | ARTIVERGES NEXT |
| **Style** | REST / JSON over HTTPS · OpenAPI 3.1 · WebSocket for real-time |
| **Base URL** | `https://api.artiverges.app/v1` |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |
| **Related** | [02_DATABASE](02_DATABASE.md) · [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md) · [06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md) |

> Defines the API contract: conventions, authentication, error handling, and the endpoint catalog per module. Request/response shapes are illustrative (field-level detail lives in the OpenAPI file generated from the backend). No implementation code is included.

---

## Table of Contents
1. [Conventions](#1-conventions)
2. [Authentication](#2-authentication)
3. [Authorization](#3-authorization)
4. [Standard Request Patterns](#4-standard-request-patterns)
5. [Standard Response Envelope](#5-standard-response-envelope)
6. [Error Handling](#6-error-handling)
7. [Endpoint Catalog](#7-endpoint-catalog)
8. [Approval Endpoints (Cross-Module)](#8-approval-endpoints-cross-module)
9. [Files & Uploads](#9-files--uploads)
10. [Real-Time (WebSocket)](#10-real-time-websocket)
11. [Webhooks (Roadmap)](#11-webhooks-roadmap)
12. [Versioning & Rate Limiting](#12-versioning--rate-limiting)

---

## 1 Conventions

| Rule | Detail |
|---|---|
| Protocol | HTTPS only. JSON request/response (`application/json`). |
| Resource naming | Plural nouns, kebab where multi-word: `/purchase-orders`. |
| HTTP methods | `GET` (read), `POST` (create), `PATCH` (partial update), `PUT` (replace), `DELETE` (soft delete). |
| IDs | UUID v4 in paths: `/projects/{projectId}`. |
| Timestamps | ISO 8601 UTC (`2026-07-03T10:15:00Z`). |
| Money | Decimal string + currency from company settings. |
| Casing | `camelCase` JSON fields. |
| Idempotency | `Idempotency-Key` header supported on financial POSTs. |

---

## 2 Authentication

- **Scheme:** JWT Bearer. `Authorization: Bearer <accessToken>`.
- **Login** returns a short-lived access token + rotating refresh token (httpOnly cookie).

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Email + password → tokens |
| POST | `/auth/refresh` | Rotate access token |
| POST | `/auth/logout` | Invalidate refresh token |
| POST | `/auth/forgot-password` | Start reset |
| POST | `/auth/reset-password` | Complete reset |
| GET | `/auth/me` | Current user, roles, permissions |

```jsonc
// POST /auth/login  → 200
{
  "accessToken": "eyJ...",
  "expiresIn": 900,
  "user": {
    "id": "…", "fullName": "Arun P", "email": "arun@artiverges.app",
    "roles": ["ae"], "permissions": ["project.read", "quotation.create", "…"]
  }
}
```

---

## 3 Authorization

- Every endpoint declares a required permission code (`module.action`) — see [06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md).
- **Project-scoped resources** additionally check `project_members` — a Site Engineer/Client only accesses their assigned projects.
- Missing permission → `403`. Out-of-scope project → `403` (or `404` to avoid leaking existence for external roles).

---

## 4 Standard Request Patterns

**List endpoints** support common query params:

| Param | Example | Meaning |
|---|---|---|
| `page`, `pageSize` | `?page=2&pageSize=25` | Pagination (default 25, max 100) |
| `sort` | `?sort=-createdAt` | `-` = descending |
| `q` | `?q=villa` | Full-text search |
| `status` | `?status=active` | Filter by status |
| `projectId` | `?projectId=…` | Scope to a project |
| `from`,`to` | `?from=2026-01-01&to=2026-03-31` | Date range |
| `include` | `?include=items` | Expand relations |

---

## 5 Standard Response Envelope

**Single resource:**
```jsonc
{ "data": { /* resource */ } }
```

**Collection:**
```jsonc
{
  "data": [ /* items */ ],
  "meta": { "page": 1, "pageSize": 25, "total": 143, "totalPages": 6 }
}
```

---

## 6 Error Handling

Consistent error shape with machine-readable codes:

```jsonc
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Quantity must be greater than 0.",
    "details": [ { "field": "items[0].quantity", "issue": "min" } ],
    "requestId": "req_8f2a…"
  }
}
```

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Bad input |
| 401 | `UNAUTHENTICATED` | Missing/expired token |
| 403 | `FORBIDDEN` | Lacks permission / project scope |
| 404 | `NOT_FOUND` | Missing or hidden resource |
| 409 | `CONFLICT` | State conflict (e.g., approving an approved item) |
| 422 | `UNPROCESSABLE` | Business rule violation (e.g., over-threshold) |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL` | Unexpected |

---

## 7 Endpoint Catalog

Endpoints grouped by module. `{id}` is a UUID. All support the standard list params and envelope. This is the contract surface; field detail is in OpenAPI.

### 7.1 IAM (Users, Roles)
| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/users` | List / create users |
| GET/PATCH/DELETE | `/users/{id}` | Read / update / deactivate |
| GET | `/roles` · `/permissions` | RBAC catalog |
| POST | `/users/{id}/roles` | Assign roles |

### 7.2 CRM / Leads
| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/leads` | List / create leads |
| GET/PATCH/DELETE | `/leads/{id}` | Manage lead |
| POST | `/leads/{id}/activities` | Log activity/follow-up |
| POST | `/leads/{id}/convert` | Convert → client (+ optional project) |

### 7.3 Clients & Partners
| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/clients` · `/clients/{id}` | Manage clients |
| GET/POST | `/clients/{id}/contacts` | Client contacts |
| GET/POST | `/partners` · `/partners/{id}` | Manage partners |

### 7.4 Commercial (BOQ, Quotation, Contract, Change Order)
| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/boqs` · `/boqs/{id}` | Manage BOQs |
| POST | `/boqs/{id}/items` · PATCH `/boq-items/{id}` | BOQ line items |
| POST | `/boqs/{id}/versions` | New BOQ version |
| GET/POST | `/quotations` · `/quotations/{id}` | Manage quotations |
| POST | `/quotations/{id}/send` | Send to client |
| POST | `/quotations/{id}/approve` · `/reject` | Client decision |
| GET/POST | `/contracts` · `/contracts/{id}` | Manage contracts |
| POST | `/contracts/{id}/sign` | Record signature |
| GET/POST | `/change-orders` · `/change-orders/{id}` | Manage change orders |

### 7.5 Projects & Delivery
| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/projects` · `/projects/{id}` | Manage projects |
| GET/POST | `/projects/{id}/members` | Team assignment |
| GET/POST | `/projects/{id}/tasks` · PATCH `/tasks/{id}` | Tasks / WBS |
| POST | `/projects/{id}/progress` | Progress update |
| GET/POST | `/projects/{id}/photos` | Site photos |
| GET/POST | `/projects/{id}/documents` | Documents |
| GET/POST | `/projects/{id}/inspections` | Inspections |
| GET | `/projects/{id}/costs` | Budget vs. actual summary |

### 7.6 Procurement & Inventory
| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/suppliers` · `/suppliers/{id}` | Suppliers |
| GET/POST | `/requisitions` · `/requisitions/{id}` | Purchase requisitions |
| POST | `/requisitions/{id}/convert` | → Purchase order |
| GET/POST | `/purchase-orders` · `/purchase-orders/{id}` | POs |
| POST | `/purchase-orders/{id}/receipts` | Goods receipt |
| GET | `/inventory` · `/inventory/{id}` | Stock |
| GET/POST | `/inventory/{id}/movements` | Stock movements |

### 7.7 Finance
| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/expenses` · `/expenses/{id}` | Expenses |
| GET/POST | `/reimbursements` · `/reimbursements/{id}` | Worker reimbursements |
| GET/POST | `/invoices` · `/invoices/{id}` | Invoices |
| POST | `/invoices/{id}/send` | Send invoice |
| GET/POST | `/payments` · `/payments/{id}` | Payments (in/out) |
| GET/POST | `/payroll/runs` · `/payroll/runs/{id}` | Payroll runs |
| GET | `/payroll/runs/{id}/items` | Payroll items |

### 7.8 Warranty & Defects
| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/warranties` · `/warranties/{id}` | Warranty records |
| GET/POST | `/defects` · `/defects/{id}` | Defects |
| POST | `/defects/{id}/updates` | Defect progress/status |

### 7.9 Notifications & Reports
| Method | Path | Purpose |
|---|---|---|
| GET | `/notifications` | List (unread filter) |
| POST | `/notifications/{id}/read` | Mark read |
| GET | `/reports/{reportKey}` | Parametrized report data |
| POST | `/reports/{reportKey}/export` | Export (PDF/Excel) — async job |

### 7.10 AI Assistant
| Method | Path | Purpose |
|---|---|---|
| POST | `/ai/query` | NL question → scoped answer |
| POST | `/ai/projects/{id}/summary` | Project health summary |
| POST | `/ai/boqs/{id}/assist` | BOQ/quote drafting assistance |

### 7.11 Settings
| Method | Path | Purpose |
|---|---|---|
| GET/PATCH | `/settings` | Company/module config |
| GET/PATCH | `/settings/approval-thresholds` | Approval rules |
| GET/POST | `/settings/catalogs/*` | Rate cards, material catalog, templates |

---

## 8 Approval Endpoints (Cross-Module)

All approval workflows (expense, requisition, PO, change order, reimbursement, quotation) share one interface, backed by the workflow engine ([03](03_SYSTEM_ARCHITECTURE.md)):

| Method | Path | Purpose |
|---|---|---|
| GET | `/approvals?assignedTo=me&status=pending` | My pending approvals |
| GET | `/approvals?entityType=expense&entityId={id}` | Approval trail for an entity |
| POST | `/approvals/{id}/decide` | `{ "decision": "approved" \| "rejected", "comment": "…" }` |

Approving/rejecting advances the target entity's status and triggers downstream effects (e.g., booking cost, notifications).

```jsonc
// POST /approvals/{id}/decide → 200
{ "data": { "id": "…", "entityType": "expense", "entityId": "…",
            "decision": "approved", "level": 1, "decidedAt": "2026-07-03T…Z" } }
```

---

## 9 Files & Uploads

Two-step, storage-offloaded upload:

1. `POST /attachments/presign` → returns a pre-signed upload URL + `attachmentId`.
2. Client uploads the binary directly to object storage.
3. Reference `attachmentId` when creating a photo/receipt/document.

| Method | Path | Purpose |
|---|---|---|
| POST | `/attachments/presign` | Get upload URL |
| GET | `/attachments/{id}` | Metadata + signed download URL (permission-checked) |

---

## 10 Real-Time (WebSocket)

- **Endpoint:** `wss://api.artiverges.app/v1/realtime` (JWT on connect).
- Server pushes events to authorized users; the UI updates notifications, approvals, and live status.

| Event | Payload |
|---|---|
| `notification.created` | notification object |
| `approval.pending` | approval assigned to you |
| `approval.decided` | your submitted item decided |
| `project.status.changed` | project id + new status |
| `defect.created` | new defect on your project |

---

## 11 Webhooks (Roadmap)

For future integrations (payment gateway, e-sign, accounting). Outbound signed webhooks:
- `invoice.paid`, `contract.signed`, `payment.received`.
Configured in Settings with a shared secret; retried with backoff.

---

## 12 Versioning & Rate Limiting

- **Versioning:** URL-based (`/v1`). Breaking changes → `/v2`; additive changes are non-breaking.
- **Deprecation:** `Deprecation` + `Sunset` headers announce retirement.
- **Rate limiting:** per-user/IP token bucket; `429` with `Retry-After`. Standard limits documented per client type (web, mobile, integration).
- **Pagination limits:** `pageSize` max 100.

---

*End of Document — 05_API_SPEC.md · ARTIVERGES NEXT · v1.0*
