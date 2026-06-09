# SALIS AUTO - Automotive ERP Platform

## Overview
SALIS AUTO is a world-class automotive ERP platform designed for efficient garage operations at scale. It offers enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and a B2B spare parts supply network. The platform has expanded to **156+ comprehensive modules** across 14 phases, supporting multi-tenant franchise networks, advanced hardware integrations, cutting-edge technologies (AI, blockchain, AR/VR, quantum computing, sustainable energy management), and dedicated mobile web applications. It includes comprehensive compliance and localization features for the Saudi Arabian market (VAT, ZATCA E-Invoicing, Hijri calendar, Zakat, TRN validation, Arabic language, localized exports, SMS).

## User Preferences
- Modern React patterns with hooks
- TypeScript throughout
- Component-based architecture
- Responsive design
- SALIS AUTO brand design system applied across entire UI
- Official SALIS AUTO logo integrated
- Dark theme enforced - avoid white backgrounds throughout the application
- Resizable sidebar with localStorage persistence (200px-400px range, default 280px)
- Brand colors: Blue #0A5ED7→#0BB3FF (primary/success), Deep Navy #0B1F3B (headers), Orange #F97316 (warnings ONLY)

## System Architecture
The application uses a full-stack architecture with clear client-server separation.

**Frontend**: React 18 with Vite, `wouter` for routing, `TanStack Query` for state management, and `shadcn/ui` (Radix UI) for components. AuthProvider context wraps the entire application for centralized authentication state management.

**Backend**: Express server written in TypeScript with a hybrid routing architecture. New modular routes are loaded from `server/routes/` (e.g., `auth.ts`) with priority, then legacy routes from `server/routes.ts` are loaded as fallback. OpenAI API key compatibility is handled automatically by mapping `AI_INTEGRATIONS_OPENAI_API_KEY` to `OPENAI_API_KEY`.

**Authentication**: Custom email/password authentication with comprehensive role-based access control (RBAC). AuthProvider with React Query manages user state via `/api/user`, `/api/login`, `/api/logout`, and `/api/register` endpoints. Session-based authentication using passport.js LocalStrategy.

**Database**: PostgreSQL with Drizzle ORM, comprising **175+ comprehensive modules with 320+ tables**.

**RBAC System**: 24 professional roles, granular permissions for 156+ resources. Role-based sidebar navigation filtering implemented via `roleNavigationMap` in Layout.tsx. Welcome page at `/welcome` routes users to their role-specific portal using `user.primaryPortal` field set by backend enrichment in `/api/user`.

**Role-Based Portal Routing** (via `primaryPortal` field in `/api/user` response):
- `PLATFORM_ADMIN` → `/platform-admin` (PlatformAdminLayout — standalone full-screen, 8-tab dashboard)
- `ADMIN` / `MANAGER` → `/dashboard` (main app Layout with full sidebar)
- `ADVISOR` / `service_advisor` → `/service-advisor` (ServiceAdvisorLayout, 10 pages)
- `STORE_KEEPER` → `/store-keeper` (StoreKeeperLayout, 10 pages)
- `FINANCE_MANAGER` / `finance_manager` → `/finance-portal` (FinanceLayout, 11 pages)
- `CUSTOMER_SUPPORT` / `customer_support` → `/support-portal` (CustomerSupportLayout, 11 pages)
- `HR_MANAGER` / `hr_manager` → `/hr-management`
- `TECHNICIAN` / `technician` → `/technician-portal`
- `CUSTOMER` / `customer` → `/portal/dashboard` (CustomerPortalLayout, 9 pages including Garage Search, Parts Store, Service Tracking, Quotation Approval)
- `PURCHASE_AGENT` / `purchase_agent` → `/purchase-agent`

**Security Notes (Production)**: AUTH_BYPASS=true is set for development only. Disable for production. HR module queries use optional garage-based filtering - in development mode without garageId, returns all records. Production deployments must enforce garageId for tenant isolation.

**Real-Time Features**: WebSocket server (`/ws/chat`) for in-app chat support, live notifications, call center real-time updates, and service bay occupancy monitoring with session-based authentication.

**UI/UX Decisions**: The design preserves the Figma aesthetic, ensures responsiveness, and uses a consistent component-based approach with a monochrome design system based on the SALIS AUTO brand. It supports PWA, mobile-responsive navigation, and WCAG 2.1 AA accessibility features, including an offline mode. A pure grayscale design is enforced with distinct light and dark modes. Resizable sidebar with drag handle for user customization.

**Design System & Archetype Wrappers**: A comprehensive UI/UX design system overhaul has been completed across all 150+ application pages using 7 production-ready archetype wrappers: StandardPageLayout (simple pages with header/description), StandardTablePage (data tables), DashboardPage (metrics/cards), FormPage (form-centric), AnalyticsPage (reporting), MobileCardPage (mobile-optimized cards), and TabsPageLayout (multi-tab interfaces).

**Navigation System**: Sidebar navigation completely reorganized into **18 workflow-based groups** that follow natural garage operational sequence: Dashboard & Overview → Customer Intake & Appointments → Vehicle Management → Inspection & Check-In → Diagnostics & Assessment → Service Planning & Scheduling → Parts & Inventory → Service Execution & Operations → Quality & Delivery → Billing & Payments → Analytics & Business Intelligence → Customer Experience & Growth → Team & HR Management → Compliance & Safety → Enterprise & Franchise → Emerging Technologies → AI & Automation Hub → System & Settings.

**Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Features include comprehensive user settings, a print system, undo/redo, keyboard shortcuts, a robust currency system, and action history tracking for audit trails. The database is seeded with realistic sample data.

## Role-Based Portal Components

### Platform Admin (`/platform-admin/*`)
- **Layout**: `client/src/components/PlatformAdminLayout.tsx` — standalone full-screen with deep navy sidebar, no main sidebar
- **Page**: `client/src/pages/PlatformAdmin.tsx` — 8-tab tabbed dashboard (Overview, Garages, Suppliers, E-Commerce, Help & Support, Billing, Roles & RBAC, System Health)
- **Backend**: `/api/platform-admin/stats`, `/api/platform-admin/garages`, `/api/platform-admin/suppliers`, `/api/platform-admin/stores`, `/api/platform-admin/support-tickets`, `/api/platform-admin/system-health`

### Service Advisor Portal (`/service-advisor/*`)
- **Layout**: `client/src/components/ServiceAdvisorLayout.tsx`
- **Pages**: Dashboard, Appointments, Job Cards, Estimates, Active Jobs, Vehicle Check-In, Customer Comms, Invoices, Service History, My Profile

### Store Keeper Portal (`/store-keeper/*`)
- **Layout**: `client/src/components/StoreKeeperLayout.tsx`
- **Pages**: Dashboard, Stock Overview, Low Stock Alerts, Receive Stock, Issue Parts, Parts Search, Suppliers, Returns, Barcode Scanner, Reports, My Profile

### Finance Portal (`/finance-portal/*`)
- **Layout**: `client/src/components/FinanceLayout.tsx`
- **Pages**: Dashboard, Invoices, Payments, Expenses, Payroll, Budget, P&L, Revenue, Tax/VAT, Pending Actions, Reports, My Profile

### Customer Support Portal (`/support-portal/*`)
- **Layout**: `client/src/components/CustomerSupportLayout.tsx`
- **Pages**: Dashboard, Tickets, Live Chat, Customer History, Escalations, Call Log, SLA Tracking, Knowledge Base, Customer Ratings, Reports, My Profile

### Enhanced Customer Portal (`/portal/*`)
- **Layout**: `client/src/components/CustomerPortalLayout.tsx`
- **Pages**: Dashboard, Appointments, Invoices, My Vehicles, Communications, **Find Garage**, **Parts Store**, **Track Service**, **Quotations**, My Profile

## Phase 14 Features (Latest)

### 1. Real-Time Service Bay Occupancy Dashboard
- **Location**: `/service-bay-dashboard`
- **Features**: Live bay status monitoring with WebSocket updates, technician assignments, job progress tracking
- **Database Tables**: `serviceBays`, `serviceBayAssignments`, `serviceBaySessions`
- **Security**: Transactional row locking in `startBaySession` to prevent race conditions

### 2. Automated Inventory Reordering with Predictive Demand Forecasting
- **Location**: `/automated-reordering`
- **Features**: AI-powered demand prediction, automatic reorder point calculations, supplier integration

### 3. Customer Loyalty Program with Tiered Rewards
- **Location**: `/loyalty-program`
- **Features**: Points accumulation, tier progression (Bronze/Silver/Gold/Platinum), rewards redemption, referral bonuses

### 4. Interactive Workshop Calendar with Drag-and-Drop Scheduling
- **Location**: `/workshop-calendar`
- **Features**: Visual calendar with drag-and-drop job scheduling, technician availability, resource allocation
- **Libraries**: react-big-calendar, @dnd-kit/core, @dnd-kit/sortable

### 5. Augmented Reality Overlay for Mechanics
- **Location**: `/ar-overlay`
- **Features**: AR-assisted repair guides, parts identification, step-by-step visual instructions

## Saudi Arabia Compliance Stack
VAT registration, ZATCA certification, Zakat settings, Arabic company details, TRN validation, Hijri calendar conversion, localized PDF/Excel export services, Twilio SMS integration.

## Test Credentials
| Email | Password | Role | Portal |
|-------|----------|------|--------|
| superadmin@salisauto.com | superadmin123 | PLATFORM_ADMIN | /platform-admin |
| admin@salisauto.com | admin123 | system_administrator | /dashboard |
| tech@salisauto.com | tech123 | technician | /technician-portal |
| client@salisauto.com | client123 | customer | /portal/dashboard |
| agent@salisauto.com | agent123 | purchase_agent | /purchase-agent |
| finance@salisauto.com | finance123 | finance_manager | /finance-portal |
| storekeeper@salisauto.com | storekeeper123 | STORE_KEEPER | /store-keeper |
| support@salisauto.com | support123 | CUSTOMER_SUPPORT | /support-portal |
| serviceadvisor@salisauto.com | advisor123 | ADVISOR | /service-advisor |

## External Dependencies
- PostgreSQL with Drizzle ORM
- Express.js + TypeScript
- React 18 + Vite
- wouter (routing)
- @tanstack/react-query (state management)
- shadcn/ui + Radix UI (components)
- Tailwind CSS (styling)
- Zod (validation)
- recharts (charts)
- Twilio (SMS)
- Stripe + PayPal (payments)
- OpenAI API (AI features)
- Google Calendar + Gmail
- react-big-calendar + @dnd-kit (scheduling)
- speakeasy + qrcode (2FA)
- jspdf (PDF generation)

## Key Files
- `client/src/App.tsx` - Main application with AuthProvider wrapper and all 235+ routes
- `client/src/components/Layout.tsx` - Resizable sidebar with navigation groups for main app
- `client/src/components/PlatformAdminLayout.tsx` - Standalone full-screen layout for Platform Admin
- `client/src/components/ServiceAdvisorLayout.tsx` - Service Advisor portal layout
- `client/src/components/StoreKeeperLayout.tsx` - Store Keeper portal layout
- `client/src/components/FinanceLayout.tsx` - Finance portal layout
- `client/src/components/CustomerSupportLayout.tsx` - Customer Support portal layout
- `client/src/components/CustomerPortalLayout.tsx` - Customer portal layout (with 9 nav items)
- `client/src/hooks/useAuth.tsx` - AuthProvider context and authentication hooks
- `server/routes/index.ts` - Hybrid routing system
- `server/routes/auth.ts` - Authentication endpoints
- `server/storage.ts` - Database storage interface
- `shared/schema.ts` - Drizzle ORM schema with 320+ tables
