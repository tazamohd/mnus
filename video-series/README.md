# 🎬 SALIS AUTO — Video Series: "Explore the Platform"

A series of **10 short videos** (60–90 seconds each) that explain the SALIS AUTO platform, show how to use it, and demonstrate how to access the free demo users.

Each episode has a **production-ready script**: timed narration, a shot-by-shot recording plan, on-screen text overlays, and the demo account to record with. Total series runtime: **~12 minutes**.

---

## 📺 Episode List

| # | Episode | Duration | Demo account used |
|---|---------|----------|-------------------|
| 1 | [Welcome to SALIS AUTO](./01-welcome-to-salis-auto.md) | 60s | — (no login) |
| 2 | [Free Demo Accounts & Logging In](./02-free-demo-accounts-and-login.md) | 75s | `client@salisauto.com` |
| 3 | [The Customer Portal](./03-customer-portal.md) | 90s | `client@salisauto.com` |
| 4 | [The Service Advisor Portal](./04-service-advisor-portal.md) | 90s | `serviceadvisor@salisauto.com` |
| 5 | [The Technician Portal](./05-technician-portal.md) | 60s | `tech@salisauto.com` |
| 6 | [The Store Keeper Portal](./06-store-keeper-portal.md) | 75s | `storekeeper@salisauto.com` |
| 7 | [The Finance Portal & Saudi Compliance](./07-finance-portal.md) | 90s | `finance@salisauto.com` |
| 8 | [The Customer Support Portal](./08-customer-support-portal.md) | 60s | `support@salisauto.com` |
| 9 | [The Admin Dashboard](./09-admin-dashboard.md) | 90s | `admin@salisauto.com` |
| 10 | [Platform Admin — Multi-Tenant Control](./10-platform-admin.md) | 75s | `superadmin@salisauto.com` |

**Narrative arc:** Episodes 1–2 introduce the platform and demo access. Episodes 3–9 follow **one repair job** through the system — the same booking made by the customer in Episode 3 is picked up by the advisor in Episode 4, executed in 5, supplied with parts in 6, invoiced in 7, supported in 8, and overseen in 9. Episode 10 zooms out to the multi-tenant view.

---

## 🎥 Production Notes

### Recording setup
- **Format:** 1920×1080 (1080p), 30fps minimum. Also export 1080×1920 vertical crops for social if needed.
- **Capture:** Screen-record the running app in a clean browser window (hide bookmarks bar, use a fresh profile). OBS Studio, Loom, or macOS/Windows built-in recorders all work.
- **Cursor:** Move slowly and deliberately; pause ~1s on anything the narration mentions.
- **Data:** Record against the seeded demo database so every screen has realistic data.

### Narration
- Scripts are timed at a relaxed **~140 words per minute** — read them at natural pace and they will land on the target duration.
- Record voiceover separately from screen capture, then sync in the edit; or feed the narration column into a TTS/AI-presenter tool (ElevenLabs, Synthesia, HeyGen) — the scripts are written to work verbatim.

### Branding
- Open every episode with the SALIS AUTO logo on the deep navy (`#0B1F3B`) background, title in Montserrat SemiBold.
- Lower-third overlays: Poppins, white on navy, blue accent bar (`#0A5ED7`).
- Close every episode with the same end card: logo + "Try it free — demo accounts inside" + link/QR to the platform.

### Editing conventions used in the scripts
- **[ZOOM]** — punch in ~120% on the named UI element.
- **[OVERLAY: …]** — text overlay to display, verbatim.
- **[CUT]** — hard cut to the named screen.
- Timings are cumulative from 0:00 and are targets, not exact frames.

---

## ⚠️ Before you publish

- The demo credentials shown in Episode 2 are **test accounts** — confirm they exist only in demo environments before putting them on screen for a public audience.
- Blur or avoid any screen showing real customer data if recording against a non-seeded database.
