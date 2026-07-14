# SALIS AUTO — Design Blueprint

Canonical UI/UX and systems reference for the SALIS AUTO automotive ERP platform.
Covers **every role, portal, route and module**, plus the full set of architecture and
flow diagrams and per-portal wireframes.

## What's here

| File | Description |
|------|-------------|
| [`salis-auto-design-blueprint.html`](./salis-auto-design-blueprint.html) | The complete blueprint — best viewed as a rendered Artifact (Mermaid diagrams render natively). |

> The HTML is authored as an **Artifact-native document**: Mermaid diagrams use
> `<pre class="mermaid">` blocks and render on claude.ai/artifacts (and the Claude
> app's artifact viewer) without any external scripts. Opening the raw file in a plain
> browser will show diagram source unless a Mermaid runtime is present.

## Contents of the blueprint

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

## Design system reference

- **Deep Navy** `#0B1F3B` — headers, rails, primary ground
- **Brand gradient** `#0A5ED7 → #0BB3FF` — primary actions, accents, success
- **Signal Orange** `#F97316` — warnings **only**
- **Semantic** `#12A150` good · `#E5484D` critical
- Dark theme default; full light-mode support; RTL/Arabic, Hijri, SAR/multi-currency;
  PWA + offline; WCAG 2.1 AA.

## Diagram & wireframe index

27 diagrams (Fig 1–24 + 3 lifecycle sets) and 9 wireframes (WF 1–9). See the blueprint's
left-hand index for direct navigation.
