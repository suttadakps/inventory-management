# ARTIVERGES NEXT — AI Features

| Field | Detail |
|---|---|
| **Document** | 09_AI_FEATURES — AI Assistant & Intelligence Layer |
| **Product** | ARTIVERGES NEXT |
| **AI Provider** | Anthropic Claude API (Opus 4.8 / Sonnet) |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |
| **Related** | [01_PRD](01_PRD.md) · [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md) · [06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md) |

> Specifies the AI capabilities of ARTIVERGES NEXT: what the AI does, how it stays safe and permission-scoped, and how features phase in across the roadmap. AI is an assistive layer — it never bypasses RBAC and never makes autonomous financial or approval decisions.

---

## Table of Contents
1. [Vision for AI](#1-vision-for-ai)
2. [Guiding Principles](#2-guiding-principles)
3. [Capability Phasing](#3-capability-phasing)
4. [Feature Catalog](#4-feature-catalog)
5. [Architecture & Data Flow](#5-architecture--data-flow)
6. [Permission-Scoped Retrieval](#6-permission-scoped-retrieval)
7. [Prompting & Context Strategy](#7-prompting--context-strategy)
8. [Safety, Accuracy & Guardrails](#8-safety-accuracy--guardrails)
9. [Privacy & Data Handling](#9-privacy--data-handling)
10. [Model Selection & Cost](#10-model-selection--cost)
11. [Evaluation & Monitoring](#11-evaluation--monitoring)

---

## 1 Vision for AI

The AI Assistant turns ARTIVERGES NEXT from a system of record into a **system of insight**. Instead of hunting through modules and reports, users ask questions in plain language and get trustworthy, permission-scoped answers — and the system proactively flags risks (cost overruns, delays, overdue invoices) before they become problems.

The assistant meets each role where they are:
- **Owner:** "Which projects are over budget this quarter?"
- **AE:** "Summarize the health of the Marina Villa project."
- **Accounting:** "Which invoices are overdue and by how much?"
- **Procurement:** "What's pending goods receipt this week?"

---

## 2 Guiding Principles

1. **Assistive, never autonomous** — AI drafts, summarizes, and answers; humans approve and decide.
2. **RBAC-bound** — AI can only see and reason over data the requesting user is permitted to see.
3. **Grounded & cited** — answers are based on real system data, with sources/records referenced; no fabrication.
4. **Transparent** — users know they're talking to AI and can drill into the underlying records.
5. **Private by default** — company data is not used to train external models.
6. **Graceful uncertainty** — when unsure or data is missing, the assistant says so rather than guessing.

---

## 3 Capability Phasing

| Phase | AI Capabilities |
|---|---|
| **MVP (V1)** | Project health summaries · scoped natural-language Q&A over projects/finance/reports · report summarization. |
| **V2** | AI-assisted BOQ/quotation drafting · daily digests · smart proactive alerts · defect/warranty triage assistance. |
| **V3** | Predictive cost-overrun & schedule-delay risk scoring · document intelligence (extract from receipts, invoices, drawings) · procurement recommendations & price insights. |

---

## 4 Feature Catalog

### 4.1 Natural-Language Q&A (MVP)
Ask operational questions; the assistant retrieves scoped data and answers with figures + links to records.
- *"How much have we spent on the Skyline project vs. budget?"*
- *"List active projects delayed past their planned end date."*

### 4.2 Project Health Summary (MVP)
On-demand summary of a project: budget vs. actual, progress %, schedule status, open defects, pending approvals, and flagged risks — one paragraph plus key metrics.

### 4.3 Report Summarization (MVP)
Turns a data-heavy report into a concise narrative highlighting what changed and what needs attention.

### 4.4 BOQ & Quotation Assist (V2)
Suggests BOQ line items from a project description or template, proposes quantities/rates from catalogs and history, and drafts a quotation the AE reviews and edits. **Human finalizes and prices.**

### 4.5 Daily Digest & Smart Alerts (V2)
Role-tailored morning digest (approvals pending, overdue items, at-risk projects) and event-driven alerts when metrics cross thresholds.

### 4.6 Defect / Warranty Triage (V2)
Suggests severity and likely category for incoming defects and drafts a response to the client for review.

### 4.7 Predictive Risk Scoring (V3)
Flags projects trending toward cost overrun or delay based on spend velocity, progress vs. schedule, and change-order history — surfaced as early warnings, not verdicts.

### 4.8 Document Intelligence (V3)
Extracts structured data from uploaded receipts, supplier invoices, and drawings (amounts, items, dates) to pre-fill expenses/POs — human confirms before posting.

### 4.9 Procurement Recommendations (V3)
Suggests suppliers and flags price anomalies using historical PO data.

---

## 5 Architecture & Data Flow

The `ai` module orchestrates all AI calls (see [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md)):

```
User (role X) ── question ──► AI module
                                │
                 1. Auth + permission check (user's roles/scope)
                                │
                 2. Intent parse → determine data needed
                                │
                 3. Permission-scoped retrieval via SAME service/RBAC layer
                    (only data user X may access)
                                │
                 4. Build grounded context (records + metrics)
                                │
                 5. Claude API call (system prompt + context + question)
                                │
                 6. Post-process: attach source record links, format
                                │
                 ◄── Answer (grounded, cited, scoped) ──
```

- **Long-running tasks** (digests, extraction, risk scoring) run as background jobs (BullMQ) and stream/notify results.
- The AI module **never queries the DB directly** — it goes through the same permission-enforcing services as the rest of the app.

---

## 6 Permission-Scoped Retrieval

AI answers must respect [06_PERMISSION_MATRIX](06_PERMISSION_MATRIX.md) exactly:

- The retrieval step runs **as the requesting user**, using their permissions and project scope.
- A Client asking a question can only get data about their own projects; a Site Engineer only their assigned projects; an AE only their pipeline/projects.
- Costs and margins are **never** surfaced to roles that lack `cost.read` (e.g., Client, Worker).
- If a question requires data the user can't access, the assistant declines that part and explains why — it never leaks restricted data.

This makes RBAC the security boundary for AI, identical to the rest of the platform.

---

## 7 Prompting & Context Strategy

- **System prompt** establishes role, tone (professional, concise), grounding rules ("answer only from provided data; if absent, say so"), and formatting (figures with currency, links to records).
- **Context assembly** provides only the retrieved, scoped records/metrics needed — not the whole database — keeping prompts focused and token-efficient.
- **Structured outputs** for machine-consumable features (e.g., extraction, risk scores) use JSON schemas validated before use.
- **No hidden actions:** the model returns text/structured data; the application performs any writes only after human confirmation.

---

## 8 Safety, Accuracy & Guardrails

| Risk | Guardrail |
|---|---|
| Hallucination / made-up figures | Ground strictly in retrieved data; instruct to say "not available" when missing; show source records. |
| Overstepping into decisions | AI cannot approve, pay, or change records — outputs are drafts/answers only. |
| Data leakage across roles | Permission-scoped retrieval; AI sees only what the user sees. |
| Bad extraction posted blindly | Human confirmation required before any AI-extracted data is saved. |
| Over-reliance | UI labels AI content and links to underlying data for verification. |
| Prompt injection (via documents/notes) | Treat retrieved content as data, not instructions; sanitize and constrain. |

All AI interactions are logged (prompt metadata, not sensitive content beyond policy) for auditing and quality review.

---

## 9 Privacy & Data Handling

- Company data sent to the Claude API is **not used to train models** (per enterprise API terms) and is transmitted over TLS.
- Minimize data sent: only the scoped context required for the task.
- PII handling follows the platform's data-protection rules; sensitive fields are excluded from prompts where not needed.
- Configurable retention for AI request logs; users/Admin can review AI activity.
- The AI feature can be disabled per company/module via Settings.

---

## 10 Model Selection & Cost

- **Default:** Claude (latest capable model) for reasoning-heavy tasks (summaries, Q&A, risk analysis).
- **Lighter/faster model** for high-volume, simpler tasks (short classifications, digests) to control cost/latency.
- **Caching** of stable context (e.g., project metadata) to reduce tokens.
- **Batching & background processing** for digests and bulk extraction.
- Cost monitored per feature; budgets and rate limits configurable.

---

## 11 Evaluation & Monitoring

- **Grounding checks:** sample AI answers verified against source data for accuracy.
- **Feedback loop:** users can flag unhelpful/incorrect answers; flags feed prompt/retrieval improvements.
- **Regression evals:** a test set of representative questions run against prompt/model changes before release.
- **Observability:** latency, token cost, error rate, and decline rate tracked per feature.
- **Human-in-the-loop metrics:** measure how often AI drafts are accepted vs. edited to gauge quality.

---

*End of Document — 09_AI_FEATURES.md · ARTIVERGES NEXT · v1.0*
