# 🚗 SALIS AUTO — Platform Guide & Free Demo Access

Welcome! This guide explains **what SALIS AUTO is**, **how to use it**, and **how to log in with the free demo users** so you can explore every part of the platform without creating an account.

---

## 1. What Is SALIS AUTO?

SALIS AUTO is a comprehensive **automotive ERP platform** for garages and workshops — from a single-location shop to a multi-tenant franchise network. It manages the entire life of a repair job:

```
Customer books → Vehicle checked in → Diagnosed → Parts issued → Repaired → Invoiced → Paid
```

### What the platform covers

| Area | What you can do |
|------|-----------------|
| **Customers & Vehicles** | Customer records, vehicle history, VIN decoding, online booking |
| **Workshop Operations** | Job cards, appointments, drag-and-drop workshop calendar, live service-bay dashboard |
| **Parts & Inventory** | Stock levels, low-stock alerts, barcode scanning, automated reordering with demand forecasting |
| **Finance** | Invoicing, payments (Stripe/PayPal), expenses, payroll, budgets, P&L, tax reports |
| **Customer Experience** | Customer portal, live service tracking, quotation approval, loyalty program, support tickets & live chat |
| **Saudi Arabia Compliance** | 15% VAT, ZATCA e-invoicing with QR codes, Hijri calendar, Zakat, TRN validation, Arabic RTL |
| **AI & Automation** | AI chatbot, predictive maintenance, demand forecasting, AR-assisted repair guides |

### Technology at a glance

- **Frontend:** React 18 + Vite, TanStack Query, shadcn/ui, Tailwind CSS
- **Backend:** Express.js (TypeScript), PostgreSQL + Drizzle ORM, WebSocket real-time features
- **Auth:** Session-based email/password login with role-based access control (RBAC)

---

## 2. How the Platform Works: Role-Based Portals

SALIS AUTO is built around **roles**. When you log in, the platform reads your role and routes you to the portal built for your job. Each portal only shows the pages and actions that role needs.

| Portal | Who it's for | What's inside |
|--------|--------------|---------------|
| **Platform Admin** (`/platform-admin`) | Platform operators | 8-tab dashboard: Overview, Garages, Suppliers, E-Commerce, Help & Support, Billing, Roles & RBAC, System Health |
| **Main Dashboard** (`/dashboard`) | Garage admins & managers | Full sidebar with 18 workflow groups covering the entire operation |
| **Service Advisor** (`/service-advisor`) | Front-desk advisors | Appointments, job cards, estimates, vehicle check-in, customer communications, invoices |
| **Technician** (`/technician-portal`) | Mechanics | Assigned jobs, time tracking, job execution |
| **Store Keeper** (`/store-keeper`) | Parts/inventory staff | Stock overview, low-stock alerts, receive/issue parts, barcode scanner, suppliers, returns |
| **Finance** (`/finance-portal`) | Accountants | Invoices, payments, expenses, payroll, budget, P&L, revenue, tax/VAT, reports |
| **Customer Support** (`/support-portal`) | Support agents | Tickets, live chat, escalations, call log, SLA tracking, knowledge base, ratings |
| **Customer Portal** (`/portal/dashboard`) | Garage customers | Book appointments, find a garage, track service live, approve quotations, parts store, invoices, vehicle history |
| **Purchase Agent** (`/purchase-agent`) | Purchasing staff | Purchase orders and supplier workflows |

After login, the `/welcome` page automatically routes each user to their portal based on the account's role — you don't need to remember the URLs.

---

## 3. Free Demo Users

The platform ships with pre-seeded demo accounts — **one for each portal** — so you can experience the system from every perspective for free. The database also comes seeded with realistic sample data (customers, vehicles, jobs, invoices, stock), so every portal has something to look at immediately.

### Demo credentials

| # | Portal to explore | Email | Password |
|---|-------------------|-------|----------|
| 1 | 🛠️ Platform Admin | `superadmin@salisauto.com` | `superadmin123` |
| 2 | 📊 Main Dashboard (Admin) | `admin@salisauto.com` | `admin123` |
| 3 | 🗓️ Service Advisor | `serviceadvisor@salisauto.com` | `advisor123` |
| 4 | 🔧 Technician | `tech@salisauto.com` | `tech123` |
| 5 | 📦 Store Keeper | `storekeeper@salisauto.com` | `storekeeper123` |
| 6 | 💰 Finance Manager | `finance@salisauto.com` | `finance123` |
| 7 | 🎧 Customer Support | `support@salisauto.com` | `support123` |
| 8 | 🚘 Customer | `client@salisauto.com` | `client123` |
| 9 | 🛒 Purchase Agent | `agent@salisauto.com` | `agent123` |

> ⚠️ These accounts are for **demo and testing only**. Remove or change them before any production deployment.

### How to log in with a demo user

1. Open the app in your browser (see [Running the platform](#5-running-the-platform-locally) below, or use your hosted demo URL).
2. On the **login page**, enter one of the email/password pairs from the table above.
3. Click **Sign In** — you'll land on the portal for that role automatically.
4. To try a different role, **log out** (profile menu → Logout) and sign in with another demo account.

---

## 4. A Guided Tour: What to Try in Each Portal

A suggested 15-minute walkthrough that follows a repair job through the whole system:

1. **Start as the Customer** (`client@salisauto.com`) — book an appointment, browse the parts store, and open **Track Service** to see live job status.
2. **Switch to the Service Advisor** (`serviceadvisor@salisauto.com`) — see the appointment arrive, check the vehicle in, create a job card and an estimate.
3. **Switch to the Technician** (`tech@salisauto.com`) — open the assigned job, log time, and progress the work.
4. **Switch to the Store Keeper** (`storekeeper@salisauto.com`) — issue the parts the job needs and watch stock levels update; check the low-stock alerts.
5. **Switch to Finance** (`finance@salisauto.com`) — find the generated invoice, record a payment, and open the Tax/VAT report to see the 15% VAT and ZATCA QR handling.
6. **Switch to Customer Support** (`support@salisauto.com`) — open the ticket queue and the live chat console.
7. **Finish as the Admin** (`admin@salisauto.com`) — open the main dashboard to see the whole operation: workshop calendar, service-bay occupancy, analytics, and the 18 sidebar workflow groups.
8. **Bonus — Platform Admin** (`superadmin@salisauto.com`) — see the multi-tenant view: all garages, suppliers, billing, and system health in one place.

---

## 5. Running the Platform Locally

### Prerequisites

- Node.js 18+
- A PostgreSQL database

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
#    DATABASE_URL and SESSION_SECRET are required; payment/SMS keys are optional for a demo
cp .env.example .env

# 3. Create the database schema
npm run db:push

# 4. Start the dev server
npm run dev
```

Then open the printed local URL in your browser and log in with any [demo user](#demo-credentials).

### Minimum environment variables for a demo

```bash
DATABASE_URL=postgresql://user:pass@host:5432/salisauto
SESSION_SECRET=any-long-random-string
```

Stripe, PayPal, Twilio, and OpenAI keys are only needed if you want to try payments, SMS reminders, or the AI features.

---

## 6. Where to Go Next

| Document | What it covers |
|----------|----------------|
| [README.md](./README.md) | Full feature list, architecture, and deployment |
| [replit.md](./replit.md) | System architecture, portal routing, and key files |
| [PLATFORM_AUDIT_REPORT.md](./PLATFORM_AUDIT_REPORT.md) | Platform audit findings |
| [fixes/docs/INTEGRATION_GUIDE.md](./fixes/docs/INTEGRATION_GUIDE.md) | Integrating the audit fix package |

---

**Enjoy exploring SALIS AUTO!** 🇸🇦 Built for modern garages, ready for the Saudi market with full ZATCA compliance.
