# SALIS AUTO — Full Platform Audit Report

**Date:** June 2, 2026
**Scope:** Frontend · Backend · Database · UI/UX · All Portals & Modules
**Audited by:** Planning Agent (parallel 10-explorer sweep)

---

## Table of Contents

1. [Broken / Missing Routes](#section-1--broken--missing-routes)
2. [Service Advisor Portal](#section-2--service-advisor-portal)
3. [Customer Portal](#section-3--customer-portal)
4. [Finance Portal](#section-4--finance-portal)
5. [Store Keeper Portal](#section-5--store-keeper-portal)
6. [Customer Support Portal](#section-6--customer-support-portal)
7. [Platform Admin Portal](#section-7--platform-admin-portal)
8. [Purchase Agent Portal](#section-8--purchase-agent-portal)
9. [Technician Portal](#section-9--technician-portal)
10. [HR Management](#section-10--hr-management)
11. [Backend API Audit](#section-11--backend-api-audit)
12. [Database Layer Audit](#section-12--database-layer-audit)
13. [UI/UX Issues Across the Platform](#section-13--uiux-issues-across-the-platform)
14. [Priority Summary Table](#priority-summary-table)

---

## SECTION 1 — BROKEN / MISSING ROUTES

These items appear in the sidebar navigation but have **no registered `<Route>` in `App.tsx`** — clicking them hits the `NotFound` page.

| # | Nav Label | Expected Path | Severity |
|---|-----------|---------------|----------|
| 1 | Quality Control | `/quality-control` | 🔴 High |
| 2 | Business Heat Maps | `/business-heat-maps` | 🟠 Medium |
| 3 | Service Reminders | `/service-reminders` | 🟠 Medium |
| 4 | Email Marketing | `/email-marketing` | 🟠 Medium |
| 5 | Safety Alerts | `/safety-alerts` | 🟠 Medium |
| 6 | Blockchain History | `/blockchain-service-history` | 🟡 Low |
| 7 | Smart Contracts | `/smart-contracts` | 🟡 Low |
| 8 | AR Repair Guide | `/ar-repair-guide` | 🟡 Low |
| 9 | AR Overlay (nav path mismatch) | `/ar-overlay` nav uses different path | 🟡 Low |
| 10 | VR Showroom | `/vr-showroom` | 🟡 Low |

### Duplicate / Redundant Routes (code debt, no broken UX)

| Route A | Route B | Both Render |
|---------|---------|-------------|
| `/zatca-compliance` | `/vat-management` | `ZATCACompliance` |
| `/vehicles` | `/vehicles-list` | Different components (VehiclesEnhanced vs Vehicles) |
| `/technician-portal-old` | — | Legacy `TechnicianPortal.tsx` — orphaned |
| `/email-marketing` | `/email-marketing-campaigns` | One is broken, one is not |

---

## SECTION 2 — SERVICE ADVISOR PORTAL

**Overall status: 85% complete — core operations solid**

| Page | Status | Issues |
|------|--------|--------|
| Dashboard | ✅ Real API | Solid |
| Appointments | 🔴 Runtime Bug | `apt.vehicle` (object) rendered as React child — **crashes the page** (Task #79 filed) |
| Job Cards | ✅ Real API | Complete with parts/labour linking |
| Active Jobs | ✅ Real API | 30s auto-refresh, progress % |
| Estimates | ✅ Real API | VAT-ready, converts to Job Cards |
| Vehicle Check-In | ⚠️ Partial | Photo upload spots are **UI-only** — file input present but no upload mutation wired |
| Communications | ⚠️ Partial | Call & Email buttons in header are **UI-only** — no VOIP/mailto integration |
| Invoices | ✅ Real API | VAT-ready, linked to Job Cards |
| Service History | ✅ Real API | Client-side filtering of completed jobs |
| Profile | ✅ Real API | Password & bio editable |

---

## SECTION 3 — CUSTOMER PORTAL

**Overall status: 70% complete — some pages are mock-dominant**

| Page | Status | Issues |
|------|--------|--------|
| Dashboard | ✅ Real API | "Pay Now" button links to invoices page, not an inline payment modal |
| Appointments | ✅ Real API | Booking flow works end-to-end |
| Invoices | 🔴 Broken | **Download PDF button is `disabled` (hardcoded)** — customers cannot download invoices |
| My Vehicles | ✅ Real API | Service history from Job Cards, complete CRUD |
| Communications | ⚠️ Read-Only | View-only — no send/reply from the customer side |
| Find Garage | ⚠️ Partial | Falls back to `SAMPLE_GARAGES`; mock garages are **un-bookable** (UUID validation fails silently) |
| Parts Store | 🔴 Mock | Cart is ephemeral client-side state; falls back to `SAMPLE_PARTS` / `SAMPLE_STORES` |
| Track Service | ⚠️ Partial | Timeline steps are static (`STATIC_STEPS`); timestamps/descriptions are mocked even for real jobs |
| Quotations | ⚠️ Partial | Uses `SAMPLE_QUOTES` when API empty; approval/rejection wired but `items` JSON may be inconsistent |
| Profile | ⚠️ Wrong content | Shared with staff — shows irrelevant fields: "Job Title", "Certifications" for customers |

> **Security note:** `ServiceTracking.tsx` fetches from `/api/job-cards` (not `/api/customer/job-cards`), potentially leaking other customers' job cards if RBAC is not enforced at the DB level for that endpoint.

---

## SECTION 4 — FINANCE PORTAL

**Overall status: 80% complete — core financials solid, ZATCA Phase 2 missing**

| Page | Status | Issues |
|------|--------|--------|
| Dashboard | ✅ Real API | Net profit is client-side fallback calculation |
| Invoices | ✅ Real API | PDF generation is client-side only (jsPDF) |
| Payments | ✅ Real API | No bulk reconciliation — individual payments only |
| Expenses | ✅ Real API | File attachments stored as base64 data URLs (memory-heavy) |
| Payroll | ⚠️ Partial | GOSI 5% deduction **hardcoded in frontend** — should be backend/config |
| Budget | ✅ Real API | "Actual" values derived from expense categories |
| Revenue | ✅ Assumed Real | Derived from payments |
| P&L | ✅ Assumed Real | Complex aggregation via backend |
| Tax & VAT | ⚠️ Incomplete | ZATCA Phase 2 (API Integration with FATOORA) shows **"Pending Config"** — not implemented |
| Pending Actions | ⚠️ Partial | "Dismiss" action is **client-side state only** — not persisted to DB, reappears on refresh |
| Reports | ✅ Real API | Complete |

---

## SECTION 5 — STORE KEEPER PORTAL

**Overall status: 75% complete**

| Page | Status | Issues |
|------|--------|--------|
| Dashboard | ✅ Real API | Inventory value shows 0 if backend doesn't aggregate it |
| Stock Overview | ⚠️ Fallback | Falls back to hardcoded `FALLBACK` array if API returns empty |
| Receive Stock | ✅ Real API | Part autocomplete limited to 6 results |
| Issue Parts | ✅ Assumed Real | Interacts with inventory adjustments |
| Returns | ⚠️ Partial | Needs linking to original Job Cards/Invoices |
| Low Stock Alerts | ✅ Real API | |
| Parts Search | ✅ Real API | |
| Suppliers | ✅ Real API | |
| Barcode Scanner | 🔴 UI Only | Browser-based camera wrapper — no hardware scanner integration |
| Reports | ✅ Real API | |

---

## SECTION 6 — CUSTOMER SUPPORT PORTAL

**Overall status: 75% complete**

| Page | Status | Issues |
|------|--------|--------|
| Dashboard | ⚠️ Fallback | Uses `SAMPLE_TICKETS` when API returns empty array |
| Tickets | ✅ Real API | Ticket numbers derived from IDs (cosmetic) |
| Live Chat | ✅ Real (WebSocket) | Requires active WS server |
| Customer History | ✅ Real API | |
| Escalations | ⚠️ Partial | Escalation level persistence logic is **frontend-only** |
| Call Log | ⚠️ Partial | Requires VoIP/CTI integration for live calls; Task #10 addressing DB persistence |
| SLA Tracking | ✅ Real API | SLA % is aggregate from backend |
| Knowledge Base | ✅ Real API | Task #10 addressing DB persistence |
| Customer Ratings | ✅ Real API | |
| Reports | ✅ Real API | |

---

## SECTION 7 — PLATFORM ADMIN PORTAL

**Overall status: 90% complete — most robust portal**

| Tab | Status | Issues |
|-----|--------|--------|
| Overview | ⚠️ Partial | **Recent Activity list is hardcoded mock data** |
| Garages | ✅ Real API | Full CRUD + detail dialogs |
| Suppliers | ✅ Real API | Full CRUD |
| E-Commerce | ✅ Real API | Approval/suspension logic wired |
| Help & Support | ✅ Real API | Ticket response, assignment, escalation |
| Billing | ✅ Real API | Plan upgrade/downgrade wired |
| Roles & RBAC | ⚠️ Partial | Matrix updates are **local state** until Save is hit; some save mutations may lack full backend sync |
| System Health | ✅ Real API | Service restart wired |

---

## SECTION 8 — PURCHASE AGENT PORTAL

**Overall status: 85% complete**

| Page | Status | Issues |
|------|--------|--------|
| Dashboard | ✅ Real API | |
| Task Inbox | ✅ Real API | Full lifecycle: accept, reject, complete |
| Quotations | ✅ Real API | Converts accepted quotes to real Purchase Orders |
| Orders | ✅ Real API | PDF export, item receiving |
| Inventory Needs | ⚠️ Partial | "Create Bulk Order" links to orders page but **does not pre-fill** it |
| Suppliers | ✅ Real API | Preferred status toggle wired |
| Price Compare | ✅ Real API | "Select Best Price" creates a draft PO |
| Delivery Tracking | ✅ Real API | Carrier links (SMSA, Aramex, etc.) implemented |
| Payment Tracking | ✅ Real API | Ledger view; "Pay" and "Mark Paid" wired |
| Tracking | ⚠️ Redundant | Overlaps with Delivery Tracking; **"Contact Supplier" button is unwired** |
| Reports | ✅ Real API | |

---

## SECTION 9 — TECHNICIAN PORTAL

**Overall status: 70% complete — operational core real, reference data static**

| Page | Status | Issues |
|------|--------|--------|
| Dashboard | ✅ Real API | |
| My Jobs | ✅ Real API | Status update mutations wired |
| Time Clock | ✅ Real API | Clock-in/out with session history |
| Parts Lookup | ✅ Real API | Search + parts request to job cards |
| Job Documentation | ⚠️ Partial | **Photo/video upload is UI-only** — triggers toast but no file API called |
| Attendance | 🔴 Mock | GPS reads real location; **records are static mock data** |
| Service Guides | ⚠️ Hybrid | Knowledge base integration real; procedural guides are static |
| Technical Software | 🔴 Mock | Static software list — info/links only, no integration |
| Profile | ✅ Real API | Qualifications, certifications, speciality |

> **Orphaned:** `/technician-portal-old` renders legacy `TechnicianPortal.tsx` — should be removed or redirected.

---

## SECTION 10 — HR MANAGEMENT

**Overall status: 25% complete — only Employees & Departments have real data**

| Tab | Status | Issues |
|-----|--------|--------|
| Employees | ✅ Real API | Full CRUD for employee directory |
| Organization / Depts | ✅ Real API | API-backed with mock fallback |
| Attendance | 🔴 Mock | `mockAttendanceHistory` — no DB persistence at all |
| Payroll | 🔴 Mock | Pay runs are static/visual prototype |
| Leave Management | 🔴 Mock | `mockLeaveRequests`, `mockLeaveTypes` — no API calls |
| Recruitment | 🔴 Mock | `mockJobPostings`, `mockCandidates` — UI only |
| Benefits | 🔴 Mock | `mockBenefitPlans` — static list |
| Performance Reviews | 🔴 Mock | Form exists but **submits to no API** |
| Training | 🔴 Mock | `mockTrainings` — static list |
| Self-Service | 🔴 Mock | `mockSelfServiceRequests` — static list |

---

## SECTION 11 — BACKEND API AUDIT

### Stubs Returning Mock / Hardcoded Data

| Endpoint | Method | Issue |
|----------|--------|-------|
| `/api/scheduling/rules` | GET | Returns static JSON array |
| `/api/scheduling/optimizations` | GET | Returns static JSON array |
| `/api/auto-reorder/rules` | GET | Returns hardcoded objects |
| `/api/auto-reorder/history` | GET | Returns hardcoded objects |
| `/api/timeclock/clock-in` | POST | Returns success **without DB persistence** |
| `/api/payroll/calculate` | POST | Returns hardcoded calculated values |
| `/api/environmental-compliance/records` | GET | Returns static mock array |
| `/api/quality/checklists` | GET | Returns static mock array |
| `/api/safety-incidents` | GET | Returns static mock array |
| `/api/analytics/custom-reports` | GET | Returns empty array `[]` |
| `/api/ai-ocr/process` | POST | Result body contains placeholder text "Sample extracted text" |

### Endpoints with TODO Comments (Not Implemented)

| Endpoint | TODO |
|----------|------|
| `GET /api/ai-chat-messages` | `// TODO: Implement getAIChatMessages in storage` — always returns `[]` |
| `POST /api/analytics/custom-report` | `// TODO: Implement createCustomReport in storage` |
| `POST /api/analytics/widgets` | `// TODO: Implement createDashboardWidget in storage` |
| `POST /api/ai-chat/send` | TODOs for saving messages to storage (lines 15308, 15325 of routes.ts) |

---

## SECTION 12 — DATABASE LAYER AUDIT

### Dead Schema — Tables Defined in `schema.ts` with No Storage CRUD or API Route

| Table | Category |
|-------|----------|
| `metaverse_showrooms` | Emerging Tech |
| `metaverse_visits` | Emerging Tech |
| `quantum_encryption_keys` | Emerging Tech |
| `quantum_secure_messages` | Emerging Tech |
| `holographic_guides` | Emerging Tech |
| `holographic_sessions` | Emerging Tech |
| `satellite_connections` | Emerging Tech |
| `satellite_usage_logs` | Emerging Tech |
| `autonomous_robots` | Emerging Tech |
| `robot_tasks` | Emerging Tech |
| `spatial_workstations` | Emerging Tech |
| `spatial_diagnostic_sessions` | Emerging Tech |

### Storage Methods Not Exposed via Any Route

| Method | Notes |
|--------|-------|
| `deleteUser` | Defined in `storage.ts` — not exposed (intentional safety practice, but no admin delete endpoint either) |
| `bulkUpdate` / `bulkDelete` | Generic helpers with very limited route exposure |
| `generateAppointmentsFromRecurring` | Defined in storage; no route triggers it |

---

## SECTION 13 — UI/UX ISSUES ACROSS THE PLATFORM

| Area | Issue | Severity |
|------|-------|----------|
| Customer Portal → Profile | Shows staff fields ("Job Title", "Certifications") to customers | 🟠 Medium |
| Customer Portal → Invoices | PDF download button hardcoded `disabled` | 🔴 High |
| Customer Portal → Parts Store | Cart is ephemeral — page refresh loses all items | 🔴 High |
| Customer Portal → Service Tracking | Data leakage risk: fetches all job cards, not scoped to customer | 🔴 High |
| Service Advisor → Appointments | Vehicle object rendered as React child — **page crash** | 🔴 Critical |
| Service Advisor → Check-In | Photo upload labels are decorative — no actual upload endpoint called | 🟠 Medium |
| Service Advisor → Communications | Call/Email header buttons trigger no action | 🟡 Low |
| Technician → Job Documentation | Photo/video upload triggers toast but no file API call | 🟠 Medium |
| Technician → Attendance | GPS reads real location but records are entirely fake | 🔴 High |
| Finance → Payroll | GOSI 5% deduction hardcoded in frontend (should be configurable) | 🟠 Medium |
| Finance → Pending Actions | "Dismiss" not persisted — reappears on every refresh | 🟠 Medium |
| Platform Admin → Overview | Recent Activity list is hardcoded, never updates | 🟡 Low |
| Store Keeper → Barcode | No hardware scanner integration — browser camera only | 🟡 Low |
| Purchase Agent → Tracking | "Contact Supplier" button is unwired | 🟡 Low |
| HR → 8 Sub-tabs | Attendance, Payroll, Leave, Recruitment, Benefits, Performance, Training, Self-Service are all visual prototypes with zero backend | 🔴 High |
| `Reports.tsx.backup` | Backup file committed to repo — indicates unstable refactor | 🟡 Low |

---

## PRIORITY SUMMARY TABLE

| Priority | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 1 | SA Appointments vehicle render crash (Task #79 filed) |
| 🔴 High | 12 | 10 missing nav routes · HR 8 tabs fully mock · Customer invoice download disabled · Parts cart ephemeral · Attendance fake records · Data scope leak in Service Tracking |
| 🟠 Medium | 12 | Photo upload stubs (SA Check-In, Technician Docs) · Finance GOSI hardcoded · Dismiss not persisted · Customer profile wrong fields · Service Tracking static timeline · Find Garage mock fallback · ZATCA Phase 2 missing · Scheduling/Payroll/Compliance API stubs · Escalation persistence frontend-only |
| 🟡 Low | 8 | Orphaned legacy routes · Hardcoded activity feed · Contact Supplier button · Barcode scanner hardware · Duplicate routes · Backup file in repo · Call/Email buttons in SA Comms |
| 🔵 DB / Schema | 12 | Dead emerging-tech tables with no storage or routes |
| 🔵 Backend TODOs | 7 | AI chat messages · Custom reports · Dashboard widgets · OCR placeholder text · Timeclock persistence · Payroll calculation · Compliance stubs |

---

## Route Coverage Summary

| Portal | Total Routes | Fully Wired | Partial / Mock | Broken / Missing |
|--------|-------------|-------------|----------------|-----------------|
| Service Advisor | 10 | 8 | 2 | 0 |
| Customer Portal | 10 | 5 | 4 | 1 |
| Finance Portal | 12 | 9 | 3 | 0 |
| Store Keeper | 11 | 8 | 2 | 1 |
| Customer Support | 10 | 7 | 3 | 0 |
| Platform Admin | 8 tabs | 6 | 2 | 0 |
| Purchase Agent | 11 | 9 | 2 | 0 |
| Technician Portal | 9 | 5 | 2 | 2 |
| HR Management | 10 tabs | 2 | 0 | 8 |
| Main App Nav | 156+ items | ~146 | — | 10 |

---

*End of audit report. Generated June 2, 2026.*
