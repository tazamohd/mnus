# 🎬 SALIS AUTO — Video Series: "The Story of a Garage" | قصة ورشة

A **12-episode storytelling series** of short videos (60–90 seconds each, ~14 minutes total) that explains the SALIS AUTO platform, how to use it, and how to access the free demo users — **in English and Arabic**.

This isn't a feature tour. It's a story: a Riyadh garage drowning in paper and WhatsApp, the idea that became SALIS AUTO, and one car — **Amal's Camry** — followed from booking to payment through every role in the workshop.

---

## 🎭 The Cast

Recurring characters carry the story across episodes (their names already appear in the platform's seeded demo data):

| Character | بالعربي | Role in the story | Demo account |
|-----------|---------|-------------------|--------------|
| **Abu Khalid** | أبو خالد | Garage owner — his morning chaos opens the series; his dashboard closes it | `admin@salisauto.com` |
| **Amal** | أمل | The customer — her white Camry is the car we follow end to end | `client@salisauto.com` |
| **Faisal** | فيصل | Service advisor — the bridge between Amal and the workshop | `serviceadvisor@salisauto.com` |
| **Saad** | سعد | Technician — hands on the car | `tech@salisauto.com` |
| **Salem** | سالم | Store keeper — parts and shelves | `storekeeper@salisauto.com` |
| **Noura** | نورة | Finance manager — VAT, ZATCA, and getting paid | `finance@salisauto.com` |
| **Sara** | سارة | Support agent — keeps Amal smiling | `support@salisauto.com` |

## 📺 Episode List

| # | Episode | Duration | Story beat |
|---|---------|----------|------------|
| 0 | [The Story of SALIS AUTO · قصة سالس أوتو](./00-the-story.md) | 75s | Abu Khalid's chaos → the idea → the promise. **Rendered in EN + AR** |
| 1 | [Welcome to SALIS AUTO](./01-welcome-to-salis-auto.md) | 60s | What the answer looks like — the platform at a glance. **Rendered (EN)** |
| 2 | [Free Demo Accounts & Logging In](./02-free-demo-accounts-and-login.md) | 75s | The keys to the garage — 9 free accounts, one per role |
| 3 | [The Customer Portal](./03-customer-portal.md) | 90s | Amal books her Camry in — the job that drives the series |
| 4 | [The Service Advisor Portal](./04-service-advisor-portal.md) | 90s | Faisal catches the booking, checks the car in, sends the estimate |
| 5 | [The Technician Portal](./05-technician-portal.md) | 60s | Saad works the job; every update ripples to Amal's phone |
| 6 | [The Store Keeper Portal](./06-store-keeper-portal.md) | 75s | Salem issues the parts — and the shelves think ahead |
| 7 | [The Finance Portal & Saudi Compliance](./07-finance-portal.md) | 90s | Noura's invoice: VAT, ZATCA QR, and getting paid |
| 8 | [The Customer Support Portal](./08-customer-support-portal.md) | 60s | Sara answers before Amal has to ask twice |
| 9 | [The Admin Dashboard](./09-admin-dashboard.md) | 90s | Abu Khalid's new morning — the whole garage on one screen |
| 10 | [Platform Admin — Multi-Tenant Control](./10-platform-admin.md) | 75s | From one garage to a network — and the series recap |
| 11 | [بالسعودي: منصة تفهمنا · Made for Saudi Arabia](./11-saudi-culture.md) | 90s | Abu Khalid, in his own dialect, on why the platform "gets us" |

**Narrative arc:** Episode 0 is the *why* (the story, the pain, the idea). Episode 1 is the *what*. Episode 2 hands the viewer the keys. Episodes 3–9 are the *how* — one repair on Amal's Camry passed hand to hand: booked by Amal, received by Faisal, worked by Saad, supplied by Salem, invoiced by Noura, supported by Sara, overseen by Abu Khalid. Episode 10 zooms out to the network. Episode 11 comes home: Saudi language and culture, in dialect.

---

## 🌍 Languages

Every episode ships with **two narrations**:

- **English** — in each episode's main script table.
- **العربية (MSA / الفصحى المبسطة)** — in each episode's «التعليق الصوتي» section, timed to the same beats. Episode 11 is the exception: it's narrated in **Saudi dialect** (بالسعودي) with an English gloss.

Production guidance:
- Record each language as a separate voice track over the same visuals — or produce two full cuts (recommended for social).
- Arabic pacing: MSA reads slower than English (~120 wpm vs ~140 wpm); the Arabic lines are written to fit the same time slots.
- **Arabic cuts of screen-recorded episodes (2–10) should be captured with the app's Arabic/RTL interface active**, so the visuals match the narration.
- On-screen text overlays: use the bilingual strings given in each episode's overlay checklist; for Arabic cuts, right-align overlays and captions.
- Suggested fonts: Noto Sans Arabic / IBM Plex Sans Arabic for Arabic overlays alongside the brand's Montserrat/Poppins for Latin.

---

## 🎥 Production Notes

### Recording setup
- **Format:** 1920×1080 (1080p), 30fps minimum. Also export 1080×1920 vertical crops for social if needed.
- **Capture:** Screen-record the running app in a clean browser window (hide bookmarks bar, use a fresh profile). OBS Studio, Loom, or macOS/Windows built-in recorders all work.
- **Cursor:** Move slowly and deliberately; pause ~1s on anything the narration mentions.
- **Data:** Record against the seeded demo database so every screen has realistic data — the demo data already contains the cast's names (Amal K., Faisal R., …).

### Narration
- Scripts are timed at a relaxed **~140 words per minute** (English) — read them at natural pace and they will land on the target duration.
- Record voiceover separately from screen capture, then sync in the edit; or feed the narration column into a TTS/AI-presenter tool (ElevenLabs, Synthesia, HeyGen) — the scripts are written to work verbatim. For Arabic, pick an MSA voice (episodes 0–10) or a Saudi-dialect voice (episode 11).

### Branding
- Open every episode with the SALIS AUTO logo on the deep navy (`#0B1F3B`) background, title in Montserrat SemiBold.
- Lower-third overlays: Poppins (Latin) / Noto Sans Arabic (Arabic), white on navy, blue accent bar (`#0A5ED7`).
- Close every episode with the same end card: logo + "Try it free — demo accounts inside / جرّبها ببلاش" + link/QR to the platform.

### Editing conventions used in the scripts
- **[ZOOM]** — punch in ~120% on the named UI element.
- **[OVERLAY: …]** — text overlay to display, verbatim.
- **[CUT]** — hard cut to the named screen.
- Timings are cumulative from 0:00 and are targets, not exact frames.

### Rendered episodes
🎞️ Episodes that need no app footage are already produced as motion graphics — see [`renders/`](./renders/): **Episode 0 in English and Arabic**, and **Episode 1 in English**, with the deterministic generator source for tweaks, re-renders, and vertical variants.

---

## ⚠️ Before you publish

- The demo credentials shown in Episode 2 are **test accounts** — confirm they exist only in demo environments before putting them on screen for a public audience.
- Blur or avoid any screen showing real customer data if recording against a non-seeded database.
- Episode 11's dialect lines were written Najdi-leaning but neutral — have a native Saudi speaker read them once before recording.
