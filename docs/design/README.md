# SALIS AUTO — Design Documentation

Canonical UI/UX and systems reference for the SALIS AUTO automotive ERP platform.
Covers **every role, portal, route and module**, plus the full set of architecture and
flow diagrams and per-portal wireframes.

## What's here

| File | Description |
|------|-------------|
| [`salis-auto-design-blueprint.html`](./salis-auto-design-blueprint.html) | The complete blueprint — architecture diagrams, ERDs, data flows, state machines, RBAC matrix, route inventories and signature wireframes for every portal. |
| [`salis-auto-wireframe-gallery.html`](./salis-auto-wireframe-gallery.html) | Wireframe gallery (Part 2) — 38+ mid-fidelity screen wireframes across all 10 portals, plus universal loading/empty/error/offline reference states. |

> Both files are authored as **Artifact-native documents**: Mermaid diagrams use
> `<pre class="mermaid">` blocks and CSS wireframes render inline. Best viewed as
> rendered Artifacts on claude.ai; opening the raw files in a plain browser will
> show Mermaid source unless a Mermaid runtime is present.

## Contents

### Part 1 — Design Blueprint

**Foundation** — Overview · Design system (brand palette, typography, 7 layout
archetypes, component inventory) · Information architecture (portal map + 18 workflow
groups) · Roles & RBAC matrix (24 roles → 10 portals).

**Architecture** — System architecture (containers/components) · Deployment & infra ·
Entity relationships (core operational ERD + HR/Finance/Support domains) · Data flow
(DFD Level 0 + Level 1) · System & state flows (job card, invoice, appointment, PO
lifecycles).

**Portals & screens** (module per module, route per route):

1. Auth & onboarding
2. Platform Admin (`/platform-admin`)
3. Admin / Manager app (`/dashboard`, 18 groups)
4. Service Advisor (`/service-advisor`)
5. Technician (`/technician-portal`)
6. Store Keeper (`/store-keeper`)
7. Purchase Agent (`/purchase-agent`)
8. Finance (`/finance-portal`)
9. Customer Support (`/support-portal`)
10. HR Manager (`/hr-management`)
11. Customer portal (`/portal`)

**Flows & scenarios** — User flows for every role · Key scenarios as sequence diagrams
(login/RBAC routing, end-to-end service→ZATCA→payment, automated reorder, real-time bay
occupancy, support escalation) · Edge & error states · Role × scenario coverage matrix.

### Part 2 — Wireframe Gallery

38+ screens organized by portal:

- **Auth** — Register, 2FA setup
- **Platform Admin** — Garage management, RBAC editor, system health, billing
- **Admin / Manager** — Appointments, workshop calendar, inventory, analytics dashboard
- **Service Advisor** — Dashboard, estimates, vehicle check-in, communications
- **Technician** — Job queue (mobile), inspection checklist, OBD diagnostics, AR overlay
- **Store Keeper** — Stock grid, receive goods, reorder alerts, returns processing
- **Purchase Agent** — PO builder, RFQ comparison
- **Finance** — Dashboard, payroll run, P&L report, VAT/ZATCA filing
- **Customer Support** — Ticket view, SLA board, knowledge base, call log
- **HR** — Employee directory, attendance calendar
- **Customer** — Booking wizard, find-a-garage map, parts store, invoice history
- **Reference states** — Loading skeleton, empty state, error boundary, offline (PWA)

## Design system reference

- **Deep Navy** `#0B1F3B` — headers, rails, primary ground
- **Brand gradient** `#0A5ED7 → #0BB3FF` — primary actions, accents, success
- **Signal Orange** `#F97316` — warnings **only**
- **Semantic** `#12A150` good · `#E5484D` critical
- Dark theme default; full light-mode support; RTL/Arabic, Hijri, SAR/multi-currency;
  PWA + offline; WCAG 2.1 AA.

## Diagram & wireframe index

27 diagrams (Fig 1–24 + 3 lifecycle sets) and 9 blueprint wireframes (WF 1–9) in Part 1.
38+ screen wireframes in Part 2. See each file's left-hand nav for direct navigation.
