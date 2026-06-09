# SALIS AUTO - Fix Package Integration Guide

This document explains how to integrate all fixes from this package into your Replit project.

## Overview of Changes

This fix package addresses **33+ issues** identified in the platform audit across 5 categories:

| Category | Files | Key Fixes |
|----------|-------|-----------|
| Security | `server/middleware/auth.ts`, `security.ts` | Auth guards, rate limiting, CSRF, helmet |
| Backend | `server/routes/*.ts`, `services/*.ts` | Pagination, error handling, ZATCA Phase 2 |
| Frontend | `client/src/components/common/*.tsx` | ErrorBoundary, Skeletons, Lazy loading |
| Shared | `shared/vatConfig.ts` | Configurable VAT/GOSI rates |
| Docs | `docs/INTEGRATION_GUIDE.md` | This file |

## Step-by-Step Integration

### Step 1: Install Missing Dependencies

Add these to your `package.json` and run `npm install`:

```json
{
  "dependencies": {
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "zod": "^3.22.4",
    "stripe": "^14.14.0"
  }
}
```

### Step 2: Apply Security Middleware

Copy the following files into your project:

```
fixes/server/middleware/auth.ts       → server/middleware/auth.ts
fixes/server/middleware/security.ts   → server/middleware/security.ts
fixes/server/middleware/pagination.ts → server/middleware/pagination.ts
fixes/server/middleware/errorHandler.ts → server/middleware/errorHandler.ts
fixes/server/middleware/envValidation.ts → server/middleware/envValidation.ts
fixes/server/middleware/index.ts      → server/middleware/index.ts
```

Then in your `server/index.ts`, add:

```typescript
import { applyMiddleware, applyErrorHandlers } from './middleware';

const app = express();

// Apply BEFORE routes
applyMiddleware(app);

// ... your existing route registrations ...

// Apply AFTER routes
applyErrorHandlers(app);
```

### Step 3: Secure Existing Routes

For each route file in `server/routes/`, add role guards at the top:

```typescript
import { isAuthenticated, requireRole, requireGarageId } from '../middleware/auth';

// Example: Finance routes
router.use(isAuthenticated);
router.use(requireRole('FINANCE_MANAGER', 'ADMIN', 'PLATFORM_ADMIN'));
```

Role mapping for existing routes:

| Route Group | Required Roles |
|-------------|---------------|
| `/api/budgets`, `/api/expenses`, `/api/payroll` | FINANCE_MANAGER, ADMIN |
| `/api/job-cards`, `/api/appointments` | ADVISOR, ADMIN, MANAGER |
| `/api/inventory`, `/api/parts` | STORE_KEEPER, ADMIN |
| `/api/customers`, `/api/vehicles` | ADVISOR, ADMIN, MANAGER |
| `/api/customer-portal/*` | CUSTOMER |
| `/api/technician-portal/*` | TECHNICIAN |
| `/api/platform-admin/*` | PLATFORM_ADMIN |
| `/api/users` (write) | ADMIN, PLATFORM_ADMIN |

### Step 4: Add Pagination to List Endpoints

Replace unbounded queries with paginated ones:

```typescript
// Before (loads ALL records):
router.get('/api/job-cards', async (req, res) => {
  const jobCards = await storage.getJobCards(garageId);
  res.json(jobCards);
});

// After (paginated):
import { buildPaginatedResponse } from '../middleware/pagination';

router.get('/api/job-cards', requireGarageId, async (req, res) => {
  const { page, limit, offset } = (req as any).pagination;
  const garageId = (req as any).garageId;
  
  const [data, total] = await Promise.all([
    storage.getJobCards(garageId, { limit, offset }),
    storage.getJobCardCount(garageId),
  ]);
  
  res.json(buildPaginatedResponse(data, total, { page, limit, offset }));
});
```

### Step 5: Apply Frontend Fixes

Copy these files:

```
fixes/client/src/components/common/ErrorBoundary.tsx → client/src/components/common/ErrorBoundary.tsx
fixes/client/src/components/common/Skeletons.tsx     → client/src/components/common/Skeletons.tsx
fixes/client/src/components/common/LazyRoute.tsx     → client/src/components/common/LazyRoute.tsx
fixes/client/src/components/common/PaginationControls.tsx → client/src/components/common/PaginationControls.tsx
fixes/client/src/hooks/usePagination.ts              → client/src/hooks/usePagination.ts
fixes/client/src/lib/apiClient.ts                    → client/src/lib/apiClient.ts
fixes/client/src/lib/safeRender.ts                   → client/src/lib/safeRender.ts
```

#### Fix the Appointments Crash

In the Appointments page component, find where vehicle info is rendered and wrap it:

```tsx
// Before (CRASHES when vehicle is an object):
<td>{appointment.vehicle}</td>

// After (safe):
import { safeDisplay } from '@/lib/safeRender';
<td>{safeDisplay(appointment.vehicle)}</td>
```

#### Add Code Splitting

In your router file, replace direct imports with lazy imports:

```tsx
// Before:
import Dashboard from './pages/Dashboard';

// After:
import { lazyPage } from './components/common/LazyRoute';
const Dashboard = lazyPage(() => import('./pages/Dashboard'), 'Dashboard');
```

### Step 6: Environment Configuration

Add these environment variables to your Replit Secrets:

```
# Required
SESSION_SECRET=<generate-a-32-char-random-string>
AUTH_BYPASS=false

# Recommended
NODE_ENV=production
STRIPE_WEBHOOK_SECRET=whsec_...

# Remove or set to false in production
AUTH_BYPASS=false
```

### Step 7: Database Migrations

Run these SQL statements to add the new tables:

```sql
-- VAT Configuration (configurable rates)
CREATE TABLE IF NOT EXISTS vat_config (
  id SERIAL PRIMARY KEY,
  country_code TEXT NOT NULL DEFAULT 'SA',
  vat_rate REAL NOT NULL DEFAULT 0.15,
  vat_registration_number TEXT,
  company_name_ar TEXT,
  company_name_en TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMP NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMP,
  changed_by TEXT,
  change_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- GOSI Configuration
CREATE TABLE IF NOT EXISTS gosi_config (
  id SERIAL PRIMARY KEY,
  employee_contribution_rate REAL NOT NULL DEFAULT 0.0975,
  employer_contribution_rate REAL NOT NULL DEFAULT 0.1175,
  max_contribution_salary REAL NOT NULL DEFAULT 45000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMP NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Persistent Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  garage_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  channel TEXT NOT NULL DEFAULT 'in_app',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Insert default VAT config
INSERT INTO vat_config (country_code, vat_rate, company_name_en, company_name_ar, is_active)
VALUES ('SA', 0.15, 'SALIS AUTO', 'ساليس أوتو', true);

-- Insert default GOSI config
INSERT INTO gosi_config (employee_contribution_rate, employer_contribution_rate, max_contribution_salary, is_active)
VALUES (0.0975, 0.1175, 45000, true);
```

## Verification Checklist

After integration, verify:

- [ ] `AUTH_BYPASS=true` fails to start in production
- [ ] Rate limiting blocks after 10 failed login attempts
- [ ] Finance routes return 403 for non-finance users
- [ ] Customer portal only shows the logged-in customer's data
- [ ] PATCH /api/users/:id rejects `role` field from non-admins
- [ ] List endpoints return paginated responses with `pagination` metadata
- [ ] ErrorBoundary catches crashes without white-screening
- [ ] Appointments page no longer crashes on vehicle object
- [ ] Health endpoint responds at GET /api/health
- [ ] Skeleton loading states appear during data fetching

## Files Included

```
fixes/
├── server/
│   ├── middleware/
│   │   ├── index.ts           # Bootstrap/wiring
│   │   ├── auth.ts            # Authentication & authorization
│   │   ├── security.ts        # Rate limiting, helmet, CSRF
│   │   ├── pagination.ts      # Pagination utilities
│   │   ├── errorHandler.ts    # Global error handling
│   │   └── envValidation.ts   # Environment validation
│   ├── routes/
│   │   ├── health.ts          # Health check endpoints
│   │   ├── webhooks.ts        # Stripe webhook handler
│   │   ├── finance.ts         # Secured finance routes
│   │   ├── users.ts           # Secured user routes
│   │   ├── customerPortal.ts  # Ownership-scoped customer routes
│   │   └── serviceAdvisor.ts  # Secured advisor routes
│   └── services/
│       ├── zatcaService.ts    # ZATCA Phase 2 e-invoicing
│       └── notificationService.ts # Multi-channel notifications
├── client/
│   └── src/
│       ├── components/common/
│       │   ├── ErrorBoundary.tsx     # Crash prevention
│       │   ├── Skeletons.tsx         # Loading states
│       │   ├── LazyRoute.tsx         # Code splitting
│       │   └── PaginationControls.tsx # Pagination UI
│       ├── hooks/
│       │   └── usePagination.ts      # Pagination hook
│       └── lib/
│           ├── apiClient.ts          # HTTP client
│           └── safeRender.ts         # Safe value display
├── shared/
│   └── vatConfig.ts           # Configurable VAT/GOSI
└── docs/
    └── INTEGRATION_GUIDE.md   # This file
```
