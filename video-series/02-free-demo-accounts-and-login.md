# Episode 2 — Free Demo Accounts & Logging In

**Duration:** ~75s · **Demo account:** `client@salisauto.com` / `client123` · **Audience:** anyone who wants hands-on access

## Goal
Viewers learn that there are 9 free demo accounts — one per portal — and see a real login from start to finish, including how role-based routing lands each account in the right portal.

## Script

| Time | On-screen (what to record) | Narration |
|------|---------------------------|-----------|
| 0:00 | Title card. [OVERLAY: "Episode 2 — Free Demo Access"] | You don't need to sign up to explore SALIS AUTO — the demo ships with nine free accounts, one for every role in a garage. |
| 0:08 | Full-screen graphic: the demo credentials table (all 9 rows: Platform Admin, Admin, Service Advisor, Technician, Store Keeper, Finance, Support, Customer, Purchase Agent). Hold 6s. | Here they are. Every account uses a simple password — the role name plus one-two-three. Screenshot this table, or find it in the Platform Guide in the repository. |
| 0:20 | [CUT] Login page in the browser. | Let's log in as a customer. Open the app and you'll land on the login page. |
| 0:26 | Type `client@salisauto.com`, then `client123`. [ZOOM] on the fields while typing. | Enter the demo email — client at salisauto dot com — and the password, client one-two-three. |
| 0:36 | Click Sign In. Show the redirect to `/portal/dashboard`. | Click Sign In. Notice what happens: the platform reads the account's role and routes you straight to the right portal — no URLs to remember. |
| 0:46 | Customer portal dashboard, brief pan. | Because this is a customer account, we've landed in the Customer Portal, with the seeded demo data already loaded. |
| 0:53 | Open profile menu → Logout → back at login page. Type `finance@salisauto.com` briefly. | To try a different role, just log out and sign in with another account from the table — finance, technician, support — each one lands in its own portal. |
| 1:05 | End card. [OVERLAY: "Next: the Customer Portal — book & track a service"] | That's all there is to it. In the next episode we'll stay logged in as the customer and book a real service. See you there. |

## Overlays checklist
- Demo credentials table graphic (0:08) — build once, reuse in the series end cards
- "Role-based routing: one login → your portal" (0:36)
- "⚠️ Demo accounts — remove before production" (small, at 0:08)

## Production note
The credentials table graphic should match `PLATFORM_GUIDE.md` §3 exactly. Keep it on screen ≥6 seconds so viewers can screenshot it.
