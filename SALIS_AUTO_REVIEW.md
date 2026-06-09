# SALIS AUTO — End-to-End Platform Review
> Generated: June 01, 2026 | Coverage: 9 Portals · 235+ Routes · 290+ DB Tables · 150+ Pages

---

## 📊 Platform Snapshot

| Dimension | Count |
|---|---|
| Role-specific portals | 9 |
| Frontend pages | 150+ |
| App.tsx routes | 235+ |
| Database tables | 290+ |
| API endpoints | 200+ |
| Sidebar navigation groups | 18 workflow groups |
| Roles / RBAC resources | 24 roles · 156+ resources |
| Saudi compliance modules | VAT · ZATCA · Hijri · Zakat · TRN · Arabic RTL |

### Portals
| Portal | Route | Role(s) |
|---|---|---|
| Platform Admin | `/platform-admin` | PLATFORM_ADMIN |
| Main Dashboard | `/dashboard` | ADMIN · MANAGER |
| Service Advisor | `/service-advisor` | ADVISOR |
| Store Keeper | `/store-keeper` | STORE_KEEPER |
| Finance | `/finance-portal` | FINANCE_MANAGER |
| Customer Support | `/support-portal` | CUSTOMER_SUPPORT |
| Technician | `/technician-portal` | TECHNICIAN |
| Purchase Agent | `/purchase-agent` | PURCHASE_AGENT |
| Customer | `/portal/dashboard` | CUSTOMER |

---

## 🔐 1. Security & Authentication

### 🔴 Critical

| # | Issue | Impact | Recommendation |
|---|---|---|---|
| S1 | `AUTH_BYPASS=true` active in env | All auth checks skipped in dev; risk of accidental production deploy | Add startup guard — fail hard if `AUTH_BYPASS=true` and `NODE_ENV=production` |
| S2 | `finance.ts` and `service-advisor.ts` modular routes have **no role guards** | Any authenticated user can hit `/api/budgets`, `/api/advisor-invoices` | Add `requireRole('FINANCE_MANAGER')` / `requireRole('ADVISOR')` at router mount |
| S3 | `GET /api/advisor-invoices` falls back to returning **all records** when `garageId` is missing | Cross-tenant data leakage | Return `400 Bad Request` when `garageId` is absent — never leak all-tenant data |
| S4 | `PATCH /api/users/:id` accepts any field from `req.body` without a whitelist | Over-posting / self-role-escalation | Explicitly whitelist updatable fields; reject unknown keys with 400 |
| S5 | Two separate `isAuthenticated` implementations (`server/auth.ts` vs local copies in each route file) | Bug in one won't affect the other — silent bypass risk | Centralize into `server/middleware/auth.ts` used by all route files |

### 🟠 High

- **`participant_token` stored in `localStorage`** — XSS-accessible. Move to short-lived server-issued token or `httpOnly` cookie.
- **No rate limiting** on `/api/login` or `/api/register` — brute-force / credential stuffing exposure.
- **No CSRF protection** on any POST/PATCH/DELETE endpoint.
- **2FA implemented** (`speakeasy` + `qrcode`) but not enforced for any role — consider mandating for PLATFORM_ADMIN and FINANCE_MANAGER.
- **No `x-content-type-options` / `x-frame-options` headers** — add `helmet` middleware to Express.

---

## 🧭 2. Role-Based Access Control (RBAC)

| # | Issue | Recommendation |
|---|---|---|
| R1 | RBAC enforcement is **frontend-only** (sidebar filtering) — backend doesn't mirror the same restrictions | Move role checks to Express middleware; UI hiding is UX, not security |
| R2 | `PLATFORM_ADMIN` has unrestricted access to all tabs in one page — no tab-level RBAC | Add per-tab permission scoping for delegated platform staff |
| R3 | `MANAGER` and `ADMIN` share identical portal access — no differentiation in permissions | Define MANAGER as a scoped subset of ADMIN with explicit exclusions |
| R4 | Customer role has no ownership scoping — customer A could craft a request for customer B's data | Add `customerId === req.user.id` ownership check on all `/api/customer/*` endpoints |
| R5 | Only `store-keeper.ts` consistently uses `requireStoreKeeperRole` — pattern is not applied elsewhere | Standardize: every modular route file applies a role guard at mount |

---

## ⚡ 3. Frontend Architecture & Performance

### 🔴 Critical

| # | Issue | Recommendation |
|---|---|---|
| F1 | `App.tsx` is **1,700+ lines** with 235+ routes loaded as a single bundle chunk | Split with `React.lazy` + `Suspense` per portal group — estimated 40–60% bundle reduction |
| F2 | **No `ErrorBoundary`** anywhere in the app — one bad Recharts render or malformed API response crashes the entire portal | Wrap each portal layout in `<ErrorBoundary fallback={<PortalErrorPage />}>` |
| F3 | **Route mismatch**: `FinanceLayout.tsx` nav points to `/finance-portal/pnl` but `App.tsx` registers `/finance-portal/profit-loss` | Audit and unify all route strings between layout nav arrays and App.tsx definitions |

### 🟠 High

| # | Issue | Recommendation |
|---|---|---|
| F4 | Loading states use a dash `"—"` placeholder — causes layout shift | Replace with `<Skeleton>` from shadcn/ui across all dashboard cards |
| F5 | Several dashboards have **hardcoded fallback values** (e.g., StoreKeeperDashboard defaults to `247` SKUs) | Replace with explicit empty state UI + "No data available" messaging |
| F6 | No **pagination** on any list view — 500+ job cards or invoices loaded into memory at once | Add `limit`/`offset` query params to all list endpoints and virtual scrolling in tables |
| F7 | AI Chatbot widget re-creates WebSocket connection on every render cycle | Use stable `useRef` for the WebSocket instance; reconnect only on disconnect |

### 🟡 Medium

- `CustomerPortalLayout` uses a horizontal top nav; all staff portals use vertical sidebars — jarring for dual-role users.
- Many pages import the same large libraries (recharts, date-fns) per-page — no shared chunk configuration in Vite.
- No React Query devtools configured for development.
- "Orphan" routes: `/emerging-tech`, `/neural-network-prediction`, `/ml-fraud-detection` exist in App.tsx but have no entry point in any navigation group.

---

## 🖥️ 4. Backend Architecture & API Quality

### Architecture Issues

| # | Issue | Recommendation |
|---|---|---|
| B1 | `server/storage.ts` is **11,000+ lines** — a "God Object" for all 290 tables | Split into domain services: `FinanceService.ts`, `InventoryService.ts`, `JobCardService.ts`, `SupportService.ts` |
| B2 | `CREATE TABLE IF NOT EXISTS` DDL runs inside **route handlers** on the first HTTP request | Move all DDL to Drizzle Kit migration files; run migrations at boot, not per-request |
| B3 | `ALTER TABLE` commands run at server startup — failures are swallowed with a warning | Fail fast on migration error; use a migration runner with rollback support |
| B4 | Legacy `server/routes.ts` and modular `server/routes/` coexist — potential for silent route shadowing | Migrate all legacy routes to modular files; add conflict detection to `routes/index.ts` |
| B5 | No request correlation ID — impossible to trace a frontend error to a specific server log line | Add `x-request-id` header middleware (generate UUID per request, echo in response) |

### API Completeness Gaps

| Gap | Affected Resources | Action |
|---|---|---|
| Missing `DELETE` endpoints | `job_cards`, `invoices`, `kb_articles`, `call_logs` | Add soft-delete endpoints (set `deletedAt`) or return `405 Method Not Allowed` with explanation |
| Missing bulk operations | Job card status, payment reconciliation | Add `POST /api/job-cards/bulk-status` and equivalent endpoints |
| No pagination on list endpoints | All `GET` list routes | Add `?page=&limit=` or cursor-based pagination |
| No Stripe webhook handler | Payment confirmation | Add `POST /api/webhooks/stripe` with signature verification |
| No OpenAI streaming | `/api/ai/chat` | Implement SSE streaming with `openai.chat.completions.create({ stream: true })` |

---

## 🗄️ 5. Database & Data Layer

| # | Issue | Recommendation |
|---|---|---|
| D1 | High-frequency filter columns (`status`, `service_type`, `customer_id` on `job_cards`) lack **explicit indexes** | Add `index('idx_job_cards_status').on(jobCards.status)` etc. in `shared/schema.ts` |
| D2 | `getJobCardWithDetails` and "WithDetails" storage methods likely do **N+1 sequential queries** | Rewrite using Drizzle `leftJoin` to fetch related data in a single query |
| D3 | JSONB fields (`vehicleInfo`, `metadata`) stored inconsistently — sometimes as strings, sometimes as parsed objects | Standardize: always parse at storage layer; add TypeScript types for each JSONB shape |
| D4 | No **soft delete** pattern — records are hard-deleted, breaking audit trails | Add `deletedAt: timestamp()` to critical tables (invoices, job cards, users, vehicles) |
| D5 | `sessions` table never cleaned up — expired sessions accumulate indefinitely | Add startup cleanup: `DELETE FROM sessions WHERE expires < NOW()` |
| D6 | 290+ tables with no documented ER diagram | Run `drizzle-kit studio` and publish the diagram to `/docs/schema-diagram.png` |

---

## 🎨 6. UI/UX & Design Consistency

| Area | Issue | Recommendation |
|---|---|---|
| **Branding** | CustomerPortalLayout lacks the SALIS AUTO logo and header present in all staff portals | Apply the brand header + SALIS AUTO logo to the customer portal |
| **Dark mode** | Phase 12–14 pages (AR, blockchain, IoT, emerging tech) are missing `.dark:` Tailwind variants | Audit all pages added in phases 12–14 for dark mode completeness |
| **Mobile responsiveness** | Data tables across all portals overflow horizontally on small screens | Wrap all `<Table>` in `overflow-x-auto`; add mobile card-view fallback for key tables |
| **Empty states** | List pages show a blank box when there is no data | Add illustrated empty states with contextual call-to-action buttons |
| **Form validation** | Most forms show errors only on submit — no inline real-time feedback | Set `mode: 'onChange'` in `react-hook-form` for live validation |
| **Toast overload** | Concurrent mutations stack 5+ toast notifications at once | Implement toast deduplication or a notification center panel |
| **Accessibility** | Icon-only buttons (search clear, filters, close) have no `aria-label` | Audit all icon buttons and add descriptive `aria-label` attributes |
| **Skeleton consistency** | Some portals have skeletons; others use dash placeholders or nothing | Create a shared `<DashboardSkeleton>` component used by all role dashboards |

---

## 🇸🇦 7. Saudi Arabia Compliance (ZATCA / VAT / Localization)

| # | Feature | Current State | Recommendation |
|---|---|---|---|
| C1 | **ZATCA Phase 2 e-invoicing** | Partial — schema exists, edge cases have `TODO` comments | Complete QR code generation per GAZT technical specs; add ZATCA API submission |
| C2 | **Hijri calendar** | Implemented | Verify conversion on Islamic leap years and month boundary edge cases |
| C3 | **Arabic RTL layout** | UI has Arabic text support | Audit all flex/grid layouts with `dir="rtl"` — test sidebar, tables, forms |
| C4 | **TRN validation** | Frontend-only check | Add server-side TRN format validation (exactly 15 digits) in the API |
| C5 | **Zakat calculation** | Module exists | Wire Nisab threshold to a live gold/silver price feed rather than a hardcoded value |
| C6 | **VAT rate (15%)** | Hardcoded in logic | Add a `vat_config` table so rate changes don't require a code deployment |
| C7 | **Localized PDF/Excel export** | Implemented with jsPDF | Test Arabic font rendering — Arabic text requires an RTL text shaping library (e.g., `bidi-js`) |

---

## 🤖 8. AI & Emerging Technologies

| Module | Current State | Issue | Recommendation |
|---|---|---|---|
| **AI Chatbot** | Working | No response streaming — full answer buffered before display | Use `stream: true` with SSE; render tokens as they arrive |
| **Predictive Maintenance** | Demo mode | Logic is hardcoded, not a real model | Integrate with OpenAI function calling or a dedicated ML inference endpoint |
| **3D Parts Viewer** | Route exists | No 3D library integrated | Integrate `@react-three/fiber` + `drei`; load GLTF part models |
| **AR Overlay** | Simulated overlays | No real AR | Use WebXR Device API with graceful fallback to 2D step-by-step guides |
| **Blockchain Service History** | Schema exists | No real chain integration | Decide on real chain (Polygon / Hyperledger Fabric) or clearly mark as "Coming Soon" |
| **IoT Sensors** | Static dashboard data | No real sensor feed | Wire up MQTT broker or WebSocket feed from hardware |
| **Voice Commands** | Frontend UI present | Backend intent pipeline incomplete | Complete voice-to-intent pipeline or remove from nav until ready |
| **Neural Network / ML Fraud** | Page routes exist | No model endpoints | Connect to a real inference API or gate pages behind a "Coming Soon" flag |

---

## 📱 9. Mobile & PWA

| # | Issue | Recommendation |
|---|---|---|
| M1 | PWA service worker only caches static assets | Cache critical API responses (vehicles, job cards) for offline technician workflow |
| M2 | `/mobile/*` pages are a separate directory — duplicate logic with main pages | Consolidate with responsive design + media queries; eliminate the parallel page tree |
| M3 | Barcode scanner camera permission errors are not handled gracefully | Add permission-denied fallback UI with manual SKU entry option |
| M4 | No push notifications — technicians must keep the app open to receive job assignments | Implement Web Push API (VAPID keys + service worker `push` event) |

---

## 🔗 10. Third-Party Integrations

| Integration | Status | Gap | Action Required |
|---|---|---|---|
| **Twilio SMS** | Configured | Missing env secrets | Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |
| **Stripe** | Initialized | No webhook handler for `payment_intent.succeeded` | Add `POST /api/webhooks/stripe` with signature verification via `stripe.webhooks.constructEvent` |
| **PayPal** | Referenced in code | No actual SDK calls found | Complete the integration or remove references |
| **OpenAI** | Working | No token usage tracking or per-tenant cost controls | Add `max_tokens` caps; log usage per tenant to a `ai_usage_logs` table |
| **Google Calendar** | Configured | No cancellation sync — deleted appointments don't remove calendar events | Add Calendar event deletion on appointment cancellation |
| **Gmail** | Configured | Plain text emails only — no HTML templates | Build branded HTML email templates for appointment confirmations, invoices, and receipts |
| **Carrier APIs** (DHL/FedEx/ARAMEX) | Stubbed | Real API calls not implemented | Complete carrier integration; surface real tracking events in DeliveryTracking page |

---

## 🚀 11. Production Readiness Checklist

| Priority | Item | Status | Action |
|---|---|---|---|
| 🔴 Critical | Disable `AUTH_BYPASS` for production | ❌ Not enforced | Add boot-time `process.env` check; throw if set in production |
| 🔴 Critical | HTTPS enforcement | ❌ Missing | Add HTTP → HTTPS redirect middleware |
| 🔴 Critical | Rate limiting on auth routes | ❌ Missing | Add `express-rate-limit` to `/api/login` and `/api/register` |
| 🟠 High | Health check endpoint | ❌ Missing | Add `GET /api/health` returning DB connectivity + service status |
| 🟠 High | Structured logging | ❌ `console.log` everywhere | Replace with `pino` or `winston` with log levels and JSON output |
| 🟠 High | API versioning | ❌ Missing | Prefix all routes with `/api/v1/` |
| 🟠 High | Helmet security headers | ❌ Missing | Add `helmet()` middleware to Express |
| 🟡 Medium | Error tracking (Sentry) | ❌ Missing | Add `@sentry/node` to catch unhandled server errors |
| 🟡 Medium | DB connection pool config | ⚠️ Default | Set explicit `max`, `idleTimeoutMillis`, `connectionTimeoutMillis` on pg pool |
| 🟡 Medium | API response compression | ❌ Missing | Add `compression` middleware |
| 🟡 Medium | Environment validation | ❌ Missing | Add `zod` env schema validation at boot (fail fast on missing required secrets) |
| 🟢 Low | OpenAPI / Swagger docs | ❌ Missing | Auto-generate from Zod schemas using `zod-to-openapi` |
| 🟢 Low | ER diagram | ❌ Missing | Generate with `drizzle-kit studio`; publish to `/docs/` |

---

## 📋 Prioritized Action Roadmap

### 🔴 Phase 1 — Security & Stability (Do First)
1. Add role guards (`requireRole`) to `finance.ts` and `service-advisor.ts`
2. Enforce `garageId` on all tenant-scoped endpoints — return 400 if missing
3. Whitelist fields in `PATCH /api/users/:id` to prevent over-posting
4. Add `<ErrorBoundary>` wrappers to all 9 portal root layouts
5. Fix route mismatch: `/finance-portal/pnl` ↔ `/finance-portal/profit-loss`
6. Add `helmet()` and `express-rate-limit` middleware

### 🟠 Phase 2 — Performance & Architecture (Do Next)
7. Lazy-load `App.tsx` routes by portal group with `React.lazy`
8. Replace dash placeholders with `<Skeleton>` loading states
9. Add server-side pagination (`limit`/`offset`) to all list endpoints
10. Add indexes on `status`, `customer_id`, `garage_id` across key tables
11. Begin splitting `server/storage.ts` into domain service modules
12. Move all `CREATE TABLE` / `ALTER TABLE` DDL to Drizzle migration files

### 🟡 Phase 3 — UX & Completeness (Do After)
13. Complete ZATCA Phase 2 QR code generation and API submission
14. Add streaming to OpenAI chat endpoint (SSE)
15. Implement Web Push notifications for technician job assignments
16. Add Stripe webhook handler for payment confirmation
17. Add empty state illustrations across all list pages
18. Audit all Phase 12–14 pages for dark mode completeness
19. Add `aria-label` to all icon-only buttons

### 🟢 Phase 4 — Production Polish (Before Go-Live)
20. Add boot-time `AUTH_BYPASS` production guard
21. Add HTTPS redirect middleware
22. Add `pino` structured logging with request IDs
23. Add Sentry error tracking
24. Generate and publish ER diagram
25. Auto-generate OpenAPI docs from Zod schemas

---

*Review scope: full codebase analysis of frontend (React/Vite), backend (Express/TypeScript), database (PostgreSQL/Drizzle), all portal layouts, API routes, and schema — SALIS AUTO v14 (156+ modules, 14 phases).*
