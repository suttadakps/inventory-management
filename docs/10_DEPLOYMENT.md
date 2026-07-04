# ARTIVERGES NEXT — Deployment & Operations

| Field | Detail |
|---|---|
| **Document** | 10_DEPLOYMENT — Infrastructure, CI/CD & Operations |
| **Product** | ARTIVERGES NEXT |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-03 |
| **Related** | [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md) · [07_DEVELOPMENT_ROADMAP](07_DEVELOPMENT_ROADMAP.md) · [08_CODING_STANDARDS](08_CODING_STANDARDS.md) |

> Describes how ARTIVERGES NEXT is built, deployed, hosted, secured, backed up, and operated. It covers environments, CI/CD, infrastructure, monitoring, and incident response. Configuration values shown are illustrative defaults, not secrets.

---

## Table of Contents
1. [Deployment Goals](#1-deployment-goals)
2. [Environments](#2-environments)
3. [Infrastructure Topology](#3-infrastructure-topology)
4. [Containerization](#4-containerization)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Configuration & Secrets](#6-configuration--secrets)
7. [Database Operations](#7-database-operations)
8. [File Storage & CDN](#8-file-storage--cdn)
9. [Security & Hardening](#9-security--hardening)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [Backup & Disaster Recovery](#11-backup--disaster-recovery)
12. [Scaling Strategy](#12-scaling-strategy)
13. [Release & Rollback](#13-release--rollback)
14. [Runbooks & Incident Response](#14-runbooks--incident-response)

---

## 1 Deployment Goals

| Goal | Approach |
|---|---|
| Repeatable | Everything containerized; infrastructure as code. |
| Safe releases | Automated tests + gated promotions + easy rollback. |
| Secure | TLS, secrets management, least privilege, hardening. |
| Observable | Centralized logs, metrics, alerts, health checks. |
| Recoverable | Automated backups + tested restore. |
| Scalable | Stateless services scale horizontally. |

---

## 2 Environments

| Environment | Purpose | Data |
|---|---|---|
| **Local / Dev** | Developer machines (Docker Compose). | Seeded/synthetic. |
| **Staging** | Pre-prod mirror for QA/UAT; auto-deployed on merge to `main`. | Anonymized/synthetic. |
| **Production** | Live system for ARTIVERGES GROUP; deployed on release gate. | Real, protected. |

Environments are isolated (separate DBs, storage buckets, secrets, and credentials). No production data in lower environments.

---

## 3 Infrastructure Topology

```
                        ┌──────────────┐
        Users ───────►  │  CDN / WAF   │  (static assets, TLS, edge protection)
                        └──────┬───────┘
                               ▼
                        ┌──────────────┐
                        │Load Balancer │  (HTTPS termination)
                        └──────┬───────┘
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
          ┌───────────┐ ┌───────────┐ ┌───────────┐
          │ Web (SSR) │ │  API #1   │ │  API #2   │  (stateless, autoscaled)
          └───────────┘ └─────┬─────┘ └─────┬─────┘
                              └──────┬───────┘
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
             ┌────────────┐   ┌───────────┐    ┌────────────┐
             │ PostgreSQL │   │   Redis   │    │  Object    │
             │ (primary + │   │(cache/queue)│  │  Storage   │
             │  replica)  │   └─────┬─────┘    │  (S3)      │
             └────────────┘         ▼          └────────────┘
                             ┌───────────────┐
                             │ Worker pool   │  (BullMQ jobs)
                             └───────────────┘
                                     │
                             ┌───────────────┐
                             │ External APIs │  Claude · email/SMS · (gw/e-sign later)
                             └───────────────┘
```

**Recommended hosting:** managed cloud (AWS or equivalent) — ECS/EKS or a managed container platform, RDS (PostgreSQL), ElastiCache (Redis), S3, CloudFront (CDN), and a WAF. Managed services reduce ops burden for the team size in [07_DEVELOPMENT_ROADMAP](07_DEVELOPMENT_ROADMAP.md).

---

## 4 Containerization

- Each app (`web`, `api`, `worker`) ships as a Docker image.
- Multi-stage builds: install → build → slim runtime image.
- Images are immutable and tagged by commit SHA + semantic version.
- Local dev via Docker Compose (api + web + postgres + redis + minio).
- Health endpoints (`/health/live`, `/health/ready`) for orchestration probes.

---

## 5 CI/CD Pipeline

```
Push / PR ──► CI:
  1. Install (pnpm)          4. Unit + integration tests
  2. Lint (ESLint/Prettier)  5. Build web + api + worker
  3. Type-check (tsc)        6. Security scan (deps + secrets)
        │
   All green?  ── no ──► block merge
        │ yes
        ▼
Merge to main ──► CD:
  7. Build & push Docker images (tag = SHA)
  8. Run DB migrations (staging)
  9. Deploy to STAGING (auto)
 10. Smoke tests + E2E (Playwright)
        │
   Release gate (manual approval, per roadmap milestones)
        ▼
 11. Run DB migrations (prod, backward-compatible)
 12. Deploy to PRODUCTION (rolling / blue-green)
 13. Post-deploy smoke tests + monitor
```

- **Merge blocked** unless lint, types, tests, build, and security scans pass ([08_CODING_STANDARDS](08_CODING_STANDARDS.md)).
- **Staging is automatic**; **production requires an approval gate**.
- Migrations are backward-compatible so app and DB can deploy without downtime.

---

## 6 Configuration & Secrets

- **12-factor config:** all environment-specific values via environment variables.
- **Secrets** stored in a managed secret store (AWS Secrets Manager / SSM) — never in code or images.
- `.env` files are gitignored; a committed `.env.example` documents required keys (no values).
- Secrets are injected at runtime; rotated periodically; scoped by least privilege.
- Config categories: DB URL, Redis URL, JWT secrets, storage keys, Claude API key, email/SMS credentials, app URLs.

---

## 7 Database Operations

- **Managed PostgreSQL** (e.g., RDS) with automated minor patching.
- **Migrations** run in CI/CD (Prisma/TypeORM), forward-only, reviewed, backward-compatible for zero-downtime deploys.
- **Read replica** for reporting/dashboards to offload the primary.
- **Connection pooling** (PgBouncer or platform pooler).
- **Point-in-time recovery (PITR)** enabled.
- No manual production schema edits — all via reviewed migrations.

---

## 8 File Storage & CDN

- **Object storage (S3)** for site photos, receipts, and documents; DB stores only metadata.
- Uploads use **pre-signed URLs** (client → storage direct), keeping large files off the API.
- Downloads via **signed, expiring URLs**, permission-checked by the API.
- Static web assets and public images served through a **CDN** with caching.
- Buckets are private by default; lifecycle rules archive old project media to cold storage.

---

## 9 Security & Hardening

- **TLS everywhere** (edge + internal where feasible); HSTS enabled.
- **WAF** in front of the app (OWASP rule set) + rate limiting.
- **Network isolation:** DB, Redis, and storage in private subnets; no public DB access.
- **Least privilege** IAM roles for services; separate credentials per environment.
- **Secrets** never logged; **PII** excluded from logs.
- **Dependency & secret scanning** in CI; container image scanning.
- **Audit logging** of financial and permission changes (see [02_DATABASE](02_DATABASE.md)).
- **Encryption:** at rest (DB, storage) and in transit.
- Regular security reviews per release gate.

---

## 10 Monitoring & Observability

| Signal | Tooling (recommended) |
|---|---|
| **Logs** | Centralized structured logs (JSON) with `requestId`/`userId`. |
| **Metrics** | Request rate, latency (p95/p99), error rate, queue depth, DB/Redis health. |
| **Tracing** | Distributed tracing across API → worker → DB (OpenTelemetry). |
| **Errors** | Error tracking (e.g., Sentry) with alerts. |
| **Uptime** | External health checks on `/health`. |
| **Dashboards** | Ops dashboard for system health; business dashboards live in-app. |
| **Alerts** | Paged on error spikes, latency SLO breaches, failed jobs, low disk, backup failures. |

SLO targets align with [03_SYSTEM_ARCHITECTURE](03_SYSTEM_ARCHITECTURE.md) §12 (e.g., API p95 < 400 ms, 99.5%+ availability).

---

## 11 Backup & Disaster Recovery

| Item | Policy |
|---|---|
| **DB backups** | Automated daily full + continuous WAL (PITR); retained per policy (e.g., 30 days). |
| **Object storage** | Versioning + cross-region replication for critical buckets. |
| **Restore testing** | Periodic restore drills to verify backups are usable. |
| **RPO** | ≤ 15 minutes (via PITR). |
| **RTO** | ≤ 4 hours for full recovery (target, refined post-launch). |
| **DR plan** | Documented failover steps; infrastructure reproducible via IaC. |

Backups are encrypted and access-restricted. A backup is not "done" until a restore has been verified.

---

## 12 Scaling Strategy

- **Stateless API & web** scale horizontally behind the load balancer (autoscaling on CPU/latency).
- **Worker pool** scales on queue depth (BullMQ).
- **DB:** vertical scaling first; read replicas for reporting; partition/archive closed projects over time.
- **Caching:** Redis for hot reads (dashboards, settings) and rate limiting.
- **Future multi-branch/multi-entity** (V3) adds tenant isolation without re-architecting (see [02_DATABASE](02_DATABASE.md) §10).

---

## 13 Release & Rollback

- **Rolling or blue-green** deploys for zero-downtime releases.
- **Backward-compatible migrations** allow app rollback without DB rollback.
- **Rollback:** redeploy the previous image tag (immutable images make this instant).
- **Feature flags** gate risky features so they can be disabled without a redeploy.
- Every production release is tagged, changelogged, and traceable to a commit and roadmap milestone.

---

## 14 Runbooks & Incident Response

- **Runbooks** maintained for: deploy, rollback, DB restore, secret rotation, scaling event, and common failures (queue backlog, DB failover, storage outage).
- **On-call & alerting:** alerts route to the responsible engineer; severity levels defined.
- **Incident process:** detect → triage → mitigate → resolve → **post-mortem** (blameless, with action items).
- **Status communication:** internal stakeholders (and clients where relevant) informed during major incidents.
- **Change management:** production changes go through the pipeline and release gate — no manual hotfixes outside the process except documented emergencies.

---

*End of Document — 10_DEPLOYMENT.md · ARTIVERGES NEXT · v1.0*
