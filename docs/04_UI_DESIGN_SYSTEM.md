# ARTIVERGES NEXT — UI Design System

| Field | Detail |
|---|---|
| **Document** | 04_UI_DESIGN_SYSTEM — Design Language & Component Library |
| **Product** | ARTIVERGES NEXT |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |
| **Related** | [01_PRD](01_PRD.md) · [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md) · [08_CODING_STANDARDS](08_CODING_STANDARDS.md) |

> Defines the visual language, design tokens, components, and interaction patterns for ARTIVERGES NEXT. It ensures every screen — across 10 roles and 24 modules — feels like one coherent, professional product. No implementation code is included; token values are specified for designers and engineers to apply.

---

## Table of Contents
1. [Design Principles](#1-design-principles)
2. [Brand & Tone](#2-brand--tone)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing, Grid & Layout](#5-spacing-grid--layout)
6. [Elevation, Radius & Borders](#6-elevation-radius--borders)
7. [Iconography & Imagery](#7-iconography--imagery)
8. [Core Components](#8-core-components)
9. [Data Display Patterns](#9-data-display-patterns)
10. [Navigation & App Shell](#10-navigation--app-shell)
11. [Status, Feedback & States](#11-status-feedback--states)
12. [Forms & Validation](#12-forms--validation)
13. [Responsive & Mobile](#13-responsive--mobile)
14. [Accessibility](#14-accessibility)

---

## 1 Design Principles

1. **Clarity over decoration** — this is an operational tool; information density and legibility win over flourish.
2. **Role-aware** — each user sees a focused workspace, not the whole ERP. Hide what a role can't act on.
3. **Field-friendly** — large touch targets, high contrast, readable in sunlight and on small screens.
4. **Consistency** — one component library, one set of tokens; the same pattern behaves the same everywhere.
5. **Fast to scan** — status colors, clear hierarchy, and predictable layouts so users find the truth quickly.
6. **Trustworthy with numbers** — financial data is presented precisely, aligned, and unambiguous.

---

## 2 Brand & Tone

- **Personality:** professional, solid, dependable — a construction-grade tool, not a consumer toy.
- **Voice:** clear, direct, action-oriented ("Approve expense", "Raise requisition").
- **Feel:** clean surfaces, confident structure, an engineering-blue primary with warm accent for action.

---

## 3 Color System

Colors are defined as **design tokens**. Light mode is primary; dark mode tokens provided for future/field use.

### 3.1 Brand & Primary
| Token | Hex | Use |
|---|---|---|
| `--color-primary-700` | `#123A6B` | Headers, primary buttons (hover) |
| `--color-primary-600` | `#1B4F91` | Primary actions, active nav |
| `--color-primary-500` | `#2563B0` | Links, focus accents |
| `--color-primary-100` | `#E3ECF7` | Selected rows, subtle fills |

### 3.2 Accent (Action / Construction)
| Token | Hex | Use |
|---|---|---|
| `--color-accent-600` | `#E0691A` | Key CTAs, highlights (construction amber) |
| `--color-accent-100` | `#FCE9DA` | Accent backgrounds |

### 3.3 Semantic / Status
| Token | Hex | Meaning |
|---|---|---|
| `--color-success` | `#1E8E5A` | Approved, paid, on track, resolved |
| `--color-warning` | `#C9871A` | Pending, due soon, at risk |
| `--color-danger` | `#C0392B` | Rejected, overdue, over budget, critical defect |
| `--color-info` | `#2563B0` | Informational, in progress |
| `--color-neutral` | `#6B7280` | Draft, inactive |

### 3.4 Neutrals (Surfaces & Text)
| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#F5F7FA` | App background |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-border` | `#E2E6EC` | Dividers, inputs |
| `--color-text-primary` | `#1A2230` | Body text |
| `--color-text-secondary` | `#5B6472` | Labels, meta |
| `--color-text-disabled` | `#9AA3B0` | Disabled |

> **Status colors are semantic, not decorative.** The same status uses the same color in every module (e.g., "Overdue" is always danger red). See §11.

---

## 4 Typography

| Token | Value |
|---|---|
| **Primary font** | Inter (system fallback: -apple-system, Segoe UI, Roboto) |
| **Numeric/monospace** | "Roboto Mono" / tabular numerals for financial columns |

### Type Scale
| Token | Size / Line | Weight | Use |
|---|---|---|---|
| `display` | 32 / 40 | 700 | Page hero (rare) |
| `h1` | 24 / 32 | 700 | Page titles |
| `h2` | 20 / 28 | 600 | Section headers |
| `h3` | 16 / 24 | 600 | Card titles |
| `body` | 14 / 22 | 400 | Default text |
| `body-sm` | 13 / 20 | 400 | Secondary text |
| `caption` | 12 / 16 | 500 | Labels, badges, meta |
| `mono` | 14 / 22 | 500 | Amounts, IDs, quantities (tabular) |

> Financial figures use **tabular (monospaced) numerals** and right-alignment so columns line up.

---

## 5 Spacing, Grid & Layout

- **Base unit:** 4px. Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64`.
- **Grid:** 12-column responsive grid, 24px gutters (desktop).
- **Content max-width:** 1440px; tables may go full-width.
- **Density modes:** Comfortable (default) and Compact (data-heavy tables/finance screens).
- **App shell:** fixed left sidebar (nav) + top bar + scrollable content region.

---

## 6 Elevation, Radius & Borders

| Token | Value |
|---|---|
| `--radius-sm` | 6px (inputs, badges) |
| `--radius-md` | 10px (cards, modals) |
| `--radius-lg` | 16px (feature panels) |
| `--shadow-1` | subtle card shadow |
| `--shadow-2` | dropdowns, popovers |
| `--shadow-3` | modals, drawers |
| Border width | 1px default; 2px for focus rings |

Surfaces are flat with light shadows — avoid heavy skeuomorphism. Focus rings are always visible for accessibility.

---

## 7 Iconography & Imagery

- **Icon set:** a single consistent line-icon library (e.g., Lucide), 20/24px, 1.5px stroke.
- Each module has a recognizable icon used in nav, headers, and empty states.
- **Site photos** are first-class imagery: shown in galleries with phase tags (before/during/after) and lightbox.
- Avatars: initials fallback with role-color ring.

---

## 8 Core Components

The shared UI kit. Every component supports the states in §11 and is theme-token-driven.

| Component | Notes |
|---|---|
| **Button** | Variants: primary, secondary, accent, ghost, danger. Sizes sm/md/lg. Loading & disabled states. |
| **Input / Textarea / Select** | Label, helper, error, prefix/suffix (e.g., currency). |
| **Combobox / Multiselect** | For clients, materials, assignees. Searchable. |
| **Date & Date-range picker** | Schedules, due dates, report ranges. |
| **Checkbox / Radio / Toggle** | Standard form controls. |
| **Badge / Status pill** | Semantic-colored (see §11). |
| **Tag / Chip** | Categories, filters. |
| **Card** | Content container; KPI card variant. |
| **Table (DataGrid)** | Sort, filter, paginate, column pin, row select, density. |
| **Tabs** | Within project/detail pages. |
| **Modal / Drawer** | Create/edit flows, approvals. |
| **Toast / Alert / Banner** | Feedback and system messages. |
| **Tooltip / Popover** | Hints, quick actions. |
| **Stepper** | Multi-step flows (BOQ → quote → contract). |
| **Timeline** | Progress, defect/approval history. |
| **File uploader** | Drag-drop, receipts/photos/documents, preview. |
| **Avatar / AvatarGroup** | Users, project teams. |
| **Empty state** | Illustration + primary action. |
| **Skeleton loaders** | For every async surface. |
| **KPI widget** | Value, delta, trend sparkline (dashboards). |
| **Approval action bar** | Approve / Reject / Comment (reused across workflows). |

---

## 9 Data Display Patterns

- **List + Detail:** most modules use a filterable list (table) → detail page pattern.
- **Detail pages** use tabbed layouts (Overview, Costs, Progress, Photos, Documents, Invoices…).
- **Financial tables:** right-aligned tabular numerals, running totals, variance colored (over budget = danger).
- **Budget vs. Actual:** paired bars / progress meter with variance %; the signature widget of Project Cost Tracking.
- **Dashboards:** KPI cards row → charts → alert/task lists, all drill-down enabled.
- **Filters:** persistent filter bar with saved views per user.

---

## 10 Navigation & App Shell

```
┌──────────────────────────────────────────────────────────────┐
│ Top bar: search · notifications · AI Assistant · user menu    │
├───────────┬──────────────────────────────────────────────────┤
│           │  Breadcrumb / Page title / actions               │
│  Sidebar  ├──────────────────────────────────────────────────┤
│  (role-   │                                                   │
│  filtered │            Page content (cards / tables)          │
│  modules) │                                                   │
│           │                                                   │
└───────────┴──────────────────────────────────────────────────┘
```

- **Sidebar** shows only modules the role can access (RBAC-filtered) — an AE sees CRM/Projects/Finance; a Worker sees a minimal set.
- **Top bar** hosts global search, notifications bell (live count), the **AI Assistant** launcher, and the user/role switcher.
- **Client & Partner** get a simplified portal shell (fewer nav items, branded).

---

## 11 Status, Feedback & States

**Universal status mapping** (color from §3.3), applied everywhere:

| Status family | Color | Examples |
|---|---|---|
| Positive / done | success | Approved, Paid, Completed, Resolved, On Track |
| In progress / info | info | Active, Sent, In Progress |
| Attention / pending | warning | Pending, Due Soon, At Risk, Partially Paid |
| Negative / blocked | danger | Rejected, Overdue, Over Budget, Critical |
| Inactive / draft | neutral | Draft, On Hold, Closed |

**Component states (all interactive components must define):** default · hover · focus · active · disabled · loading · error · empty.

**Feedback:** success/failure toasts for every mutation; inline validation on forms; confirm dialogs for destructive/financial actions.

---

## 12 Forms & Validation

- **Labels always visible** (no placeholder-only fields).
- **Inline validation** on blur and submit; errors in danger color with helper text.
- **Currency & quantity inputs** show unit/symbol and enforce numeric formatting.
- **Multi-step flows** (BOQ, quotation, contract) use a stepper with save-per-step and a review summary.
- **Approval forms** always show what is being approved (amount, project, requester) before the decision.
- **Autosave/draft** for long forms (BOQ) to prevent data loss.

---

## 13 Responsive & Mobile

- **Breakpoints:** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
- **Web is fully responsive** — sidebar collapses to a drawer; tables become stacked cards on small screens.
- **Field priority:** progress updates, photo capture, approvals, and requisitions are optimized for phone use even on web (Phase 2 native app builds on these patterns).
- **Touch targets:** minimum 44×44px.

---

## 14 Accessibility

- Target **WCAG 2.1 AA**.
- Color contrast ≥ 4.5:1 for text; status never conveyed by color alone (pair with icon/label).
- Full keyboard navigation and visible focus rings.
- Semantic HTML + ARIA roles for custom components.
- Screen-reader labels on icons, inputs, and actions.
- Respect reduced-motion preferences.

---

*End of Document — 04_UI_DESIGN_SYSTEM.md · ARTIVERGES NEXT · v1.0*
