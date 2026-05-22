# Gold Capital — Advisor Workstation
## Full Stack Architecture Design

**Document owner:** Jonathan Gold  
**Date:** May 2026  
**Status:** Draft for review  
**Audience:** Head of App Delivery

---

## 1. Executive Summary

The Advisor Workstation is a browser-based productivity platform for Gold Capital advisors. The current build is a fully functional static prototype — HTML/CSS/JavaScript, no backend, data hardcoded — that proves the UX, workflow, and feature set before committing to production infrastructure.

This document defines the target full stack architecture to take the workstation from prototype to production: a multi-tenant, advisor-scoped web application backed by real custodian data, CRM sync, and firm-grade authentication.

**Core product areas already designed and validated in prototype:**

| Module | Description |
|--------|-------------|
| Client Dashboard | AUM, performance, household summary |
| Tasks & Inbox | Advisor-level workflow queue + client messaging |
| Review Books | Draft → Ready → Delivered → Archived lifecycle |
| Wire Instructions | Per-account PDF generator with grouped account rail |
| Feature Voting | Backlog prioritization with gamification |
| Announcements | Firm-wide alert banner system |

---

## 2. Current State

```
Static SPA (prototype)
├── index.html
├── css/styles.css          (~3,800 lines, single stylesheet)
├── js/app.js               (~5,000 lines, all rendering + logic)
└── js/data.js              (~1,200 lines, hardcoded mock data)
```

**What the prototype proves:**
- End-to-end advisor workflows function correctly
- UX patterns are validated (routing, panels, modals, print)
- Data shape is defined — can be directly mapped to API contracts

**What it does not have:**
- Authentication or authorization
- Persistent server-side state
- Live custodian / portfolio data
- CRM integration
- Multi-advisor / multi-firm tenancy
- Audit logging (required for compliance)

---

## 3. Target Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTS (Browser)                    │
│              Advisor Workstation (SPA)                   │
│         React + Vite  ·  TypeScript  ·  Auth SDK        │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS / REST
┌───────────────────────▼─────────────────────────────────┐
│                    API GATEWAY                           │
│          Rate limiting · Auth token validation           │
│              AWS API Gateway  or  Nginx                  │
└──────┬────────────────┬────────────────┬────────────────┘
       │                │                │
┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────────────┐
│  Core API   │  │  Doc Engine  │  │   Integration Hub   │
│  (Node /    │  │  (PDF gen)   │  │  (Custodian + CRM   │
│  FastAPI)   │  │  Puppeteer   │  │   data adapters)    │
└──────┬──────┘  └─────────────┘  └─────┬──────────────┘
       │                                 │
┌──────▼─────────────────────────────────▼──────────────┐
│                      DATA LAYER                        │
│   PostgreSQL (primary)  ·  Redis (cache / sessions)    │
└────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│               EXTERNAL INTEGRATIONS                      │
│   Custodians: Schwab · Fidelity · Pershing               │
│   CRM:        Salesforce · Redtail · Wealthbox           │
│   Portfolio:  Orion · Black Diamond · Tamarac            │
│   Auth:       Okta · Auth0 · Microsoft Entra ID          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Layer-by-Layer Design

### 4.1 Frontend

| Attribute | Decision | Rationale |
|-----------|----------|-----------|
| Framework | **React 18 + Vite** | Component reuse across modules; fast HMR; large talent pool |
| Language | **TypeScript** | Type-safe API contracts from day one |
| Routing | **React Router v7** | Mirrors current hash-based SPA routing; minimal rewrite |
| State | **Zustand** | Lightweight; replaces `localStorage` globals with scoped stores |
| Styling | **CSS Modules** | Migrate existing stylesheet; no new CSS framework dependency |
| Auth client | **Auth0 React SDK** | Drop-in SSO; handles token refresh, redirect flows |

**Migration path from prototype:** The existing `js/app.js` render functions map 1:1 to React components. The `data.js` shape becomes the TypeScript interface layer. Estimated component count: ~35.

---

### 4.2 API Layer

**Technology:** Node.js + Fastify (or Python + FastAPI if firm has Python preference)

**Design principles:**
- REST with OpenAPI spec (auto-generated docs)
- All routes scoped to `advisor_id` extracted from JWT — advisors cannot cross-query
- Firm-level routes scoped to `firm_id` for multi-tenant deployments

**Core route groups:**

```
GET  /me                          Advisor profile + preferences
GET  /clients                     Advisor's book of business
GET  /clients/:id                 Single client with accounts
GET  /clients/:id/accounts        Account list (for wire rail)
POST /clients/:id/wire-pdf        Generate + return wire instructions PDF

GET  /tasks                       Advisor task queue
POST /tasks                       Create task
PATCH /tasks/:id                  Update status / assignment

GET  /review-books                All books (filterable by status)
POST /review-books                Create draft
PATCH /review-books/:id           Status transitions
POST /review-books/:id/repurpose  Clone for next period

GET  /messages                    Inbox
POST /messages/:id/read           Mark read

GET  /announcements               Active banners for this firm
POST /announcements/:id/dismiss   Per-advisor dismissal (server-persisted)

GET  /feature-requests            Backlog
POST /feature-requests/:id/vote   Cast vote (rate-limited server-side)
GET  /feature-requests/my-votes   Vote state for current week
```

---

### 4.3 Authentication & Authorization

**Provider:** Auth0 (or Okta if firm already has enterprise Okta)

**Flow:**
1. Advisor hits workstation URL → redirect to IdP login
2. IdP returns JWT with claims: `advisor_id`, `firm_id`, `role`
3. API gateway validates JWT on every request — no auth logic in app code
4. Row-level security in Postgres enforces data isolation

**Roles:**

| Role | Access |
|------|--------|
| `advisor` | Own book of business only |
| `associate` | Read + limited write on assigned advisor's clients |
| `compliance` | Read-only across firm |
| `admin` | Full firm access + announcements management |

---

### 4.4 Database

**Primary:** PostgreSQL 16 on AWS RDS (or Supabase for faster initial deployment)

**Key tables:**

```sql
firms          (id, name, wire_config jsonb, settings jsonb)
advisors       (id, firm_id, name, title, initials, email, role)
clients        (id, firm_id, advisor_id, display_name, tier, aum, ...)
accounts       (id, client_id, name, num, type, group, custodian)
tasks          (id, advisor_id, client_id, status, priority, due_date, ...)
messages       (id, client_id, advisor_id, body, read, created_at)
review_books   (id, advisor_id, client_id, status, type, meeting_date, ...)
announcements  (id, firm_id, type, message, cta jsonb, expires_at)
banner_dismissals (advisor_id, announcement_id, dismissed_at)
feature_requests  (id, title, category, description, vote_count, status)
feature_votes     (advisor_id, feature_id, week_key, voted_at)
audit_log      (id, advisor_id, action, resource_type, resource_id, ts)
```

**Caching:** Redis for:
- Session tokens (TTL = JWT expiry)
- Feature vote weekly quotas (key: `votes:{advisor_id}:{week_key}`)
- Announcement active state (invalidated on firm settings change)

---

### 4.5 Document Engine

Wire instructions and (future) review book PDFs need print-quality output.

**Approach:** Dedicated microservice using **Puppeteer** (headless Chrome) or **WeasyPrint**

```
POST /doc/wire-instructions
  Body: { client_id, account_id, advisor_id }
  Response: PDF binary (Content-Type: application/pdf)
```

The existing print CSS (`@media print`) already produces a clean document — the doc engine simply loads the wire doc HTML template and calls `page.pdf()`. No new design work required.

---

### 4.6 Integration Hub

Third-party data is normalized into the workstation's internal schema by adapter services. Advisors see the same UI regardless of which custodian holds the assets.

**Custodian adapters (Phase 2):**

| Custodian | Method | Data |
|-----------|--------|------|
| Schwab | REST API (OAuth) | Accounts, positions, balances, transactions |
| Fidelity | SFTP + REST | Accounts, performance |
| Pershing | NetX360 API | Accounts, positions |

**CRM adapters (Phase 2):**

| CRM | Method | Data |
|-----|--------|------|
| Salesforce | REST API | Client contact, relationships, notes |
| Redtail | REST API | Household, relationships |
| Wealthbox | REST API | Contacts, tasks, events |

**Portfolio analytics (Phase 3):**

| System | Data |
|--------|------|
| Orion / Black Diamond / Tamarac | Performance, allocation, holdings |

Each adapter runs as a scheduled sync job (nightly or real-time webhook depending on provider capability) and writes normalized rows into the Postgres schema.

---

## 5. Infrastructure & Deployment

**Recommended stack for initial production:**

| Component | Service | Notes |
|-----------|---------|-------|
| Frontend hosting | **Vercel** | Git-push deploy; edge CDN; preview URLs per branch |
| API hosting | **Railway** or **AWS ECS** | Railway for speed-to-market; ECS if firm requires AWS |
| Database | **AWS RDS** (Postgres) | Managed, automated backups, Multi-AZ option |
| Cache | **AWS ElastiCache** (Redis) | Or Upstash Redis for simpler ops |
| PDF engine | **AWS Lambda** | Puppeteer layer; invoked per-request |
| Secrets | **AWS Secrets Manager** | API keys, DB creds, custodian credentials |
| CDN | **CloudFront** or Vercel edge | Static assets + API caching |

**CI/CD (GitHub Actions):**

```
push → main
  ├── Lint + TypeScript check
  ├── Unit tests
  ├── Integration tests (against test DB)
  ├── Build frontend bundle
  ├── Deploy API to staging
  ├── Smoke tests against staging
  └── Deploy to production (on approval)
```

---

## 6. Security & Compliance

Financial services platforms require additional controls beyond standard web security.

| Control | Implementation |
|---------|----------------|
| Data encryption at rest | RDS encryption enabled; S3 SSE |
| Data encryption in transit | TLS 1.3 enforced; HSTS headers |
| Audit logging | Every data mutation logged to `audit_log` with `advisor_id` + timestamp |
| Session management | Short-lived JWTs (1hr) + silent refresh; server-side revocation via Redis |
| MFA | Enforced at IdP level (Auth0/Okta) |
| RBAC | Role claims in JWT; enforced at API gateway + row-level in Postgres |
| Penetration testing | Annual third-party pen test recommended |
| SOC 2 | Cloud providers (AWS, Vercel) are SOC 2 compliant; firm's own processes scope depends on data classification |
| Wire instruction sensitivity | Wire PDFs generated server-side, never cached; access logged per-request |

---

## 7. Phased Delivery Plan

### Phase 1 — Foundation (Weeks 1–8)
_Goal: Production app with real auth, persistent data, no external integrations_

- [ ] React migration of existing prototype (component-by-component)
- [ ] Auth0 SSO integration
- [ ] Postgres schema + seed from prototype data
- [ ] Core API (clients, tasks, messages, review books, wire instructions)
- [ ] PDF generation service (wire instructions)
- [ ] Deploy to staging + production environments
- [ ] CI/CD pipeline

**Deliverable:** Advisors can log in, see their book of business, manage tasks, generate wire PDFs. Data is real and persistent.

---

### Phase 2 — Data Integrations (Weeks 9–20)
_Goal: Live custodian and CRM data replaces manual entry_

- [ ] Schwab API adapter (primary custodian)
- [ ] Salesforce / Redtail CRM sync
- [ ] Nightly account sync jobs
- [ ] Real AUM, account balances, positions in client view
- [ ] Fidelity / Pershing adapters (if applicable)

**Deliverable:** Advisor workstation reflects live book of business. No manual data entry for client/account setup.

---

### Phase 3 — Analytics & Intelligence (Weeks 21–32)
_Goal: Portfolio analytics, review book automation, AI-assisted drafting_

- [ ] Portfolio performance data (Orion / Black Diamond / Tamarac)
- [ ] Review book generation with real portfolio data
- [ ] AI draft assist for review book narrative (Claude API)
- [ ] Bulk wire instruction batch export
- [ ] Compliance reporting exports
- [ ] Mobile-responsive pass (tablet use in client meetings)

**Deliverable:** Full workflow from data → review book → client meeting → archive is automated. Advisors spend time advising, not assembling.

---

## 8. Open Questions for App Delivery

1. **Custodian priority** — Which custodian(s) hold the majority of AUM? This determines Phase 2 sequencing. Schwab API is the most mature; Pershing can be slower to onboard.

2. **CRM** — Does Gold Capital have an existing CRM (Salesforce, Redtail, Wealthbox)? Or is this greenfield?

3. **Auth** — Does the firm already have Okta or Microsoft Entra ID for SSO? This changes the auth provider choice.

4. **Hosting constraints** — Any requirement to deploy within a specific cloud (AWS vs Azure vs GCP) or on-premise?

5. **Compliance scope** — What data classification applies to client AUM / account numbers? Does the firm have a CISO or compliance officer to loop in before Phase 2?

6. **Team composition** — Is this an internal build, agency-led, or hybrid? Phase 1 can be delivered by a team of 2–3 engineers; Phase 2 requires custodian relationship management in parallel.

---

## 9. Effort Estimates (Rough Order of Magnitude)

| Phase | Engineering Effort | Calendar Time |
|-------|-------------------|---------------|
| Phase 1 — Foundation | 2–3 engineers × 8 weeks | ~2 months |
| Phase 2 — Integrations | 2–3 engineers × 12 weeks | ~3 months |
| Phase 3 — Analytics | 3–4 engineers × 12 weeks | ~3 months |
| **Total** | | **~8 months to full production** |

Note: Custodian API onboarding (credentials, agreements, sandbox access) typically adds 4–8 weeks of lead time that runs in parallel, not in series. Start those conversations at project kickoff.

---

## Appendix — Prototype → Production Data Mapping

The prototype's `data.js` objects map directly to the production schema. No redesign needed — only hydration from real sources.

| Prototype | Production source |
|-----------|-------------------|
| `clients[]` | CRM (Salesforce/Redtail) + Custodian account rollup |
| `client.accounts[]` | Custodian API (account list per household) |
| `client.aum` | Custodian API (sum of account balances) |
| `advisor.wire` | Firm settings table (admin-managed) |
| `tasks[]` | Tasks table (advisor-created + CRM sync) |
| `clientMessages[]` | Messages table |
| `reviewBooks[]` | Review books table |
| `ANNOUNCEMENTS[]` | Announcements table (admin-managed) |
| `FEATURE_REQUESTS[]` | Feature requests table (product-managed) |

---

*Prepared by: Jonathan Gold | Gold Capital*  
*Document version: 0.1 — internal draft*
