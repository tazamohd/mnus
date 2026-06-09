/**
 * SALIS AUTO - Centralized Authentication & Authorization Middleware
 * 
 * FIXES APPLIED:
 * - [S1] Production guard for AUTH_BYPASS
 * - [S2] Centralized role guards (requireRole) for all route files
 * - [S5] Single isAuthenticated implementation replacing duplicates
 * - [R1] Backend RBAC enforcement (not just frontend sidebar filtering)
 * - [R4] Ownership scoping for customer endpoints
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================
// PRODUCTION GUARD: Fail fast if AUTH_BYPASS is enabled in production
// ============================================================
if (process.env.NODE_ENV === 'production' && process.env.AUTH_BYPASS === 'true') {
  console.error('🚨 FATAL: AUTH_BYPASS=true is not allowed in production!');
  console.error('🚨 Set AUTH_BYPASS=false or remove it from environment variables.');
  process.exit(1);
}

// ============================================================
// Type Definitions
// ============================================================
export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'ADVISOR'
  | 'TECHNICIAN'
  | 'STORE_KEEPER'
  | 'FINANCE_MANAGER'
  | 'CUSTOMER_SUPPORT'
  | 'HR_MANAGER'
  | 'PURCHASE_AGENT'
  | 'CUSTOMER'
  | 'system_administrator'
  | 'admin'
  | 'manager'
  | 'service_advisor'
  | 'technician'
  | 'store_keeper'
  | 'finance_manager'
  | 'customer_support'
  | 'hr_manager'
  | 'purchase_agent'
  | 'customer';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  garageId?: string | null;
  userType?: string;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

// ============================================================
// Role Hierarchy & Normalization
// ============================================================
const ROLE_NORMALIZATION: Record<string, string> = {
  'system_administrator': 'ADMIN',
  'admin': 'ADMIN',
  'manager': 'MANAGER',
  'service_advisor': 'ADVISOR',
  'technician': 'TECHNICIAN',
  'store_keeper': 'STORE_KEEPER',
  'finance_manager': 'FINANCE_MANAGER',
  'customer_support': 'CUSTOMER_SUPPORT',
  'hr_manager': 'HR_MANAGER',
  'purchase_agent': 'PURCHASE_AGENT',
  'customer': 'CUSTOMER',
};

function normalizeRole(role: string): string {
  return ROLE_NORMALIZATION[role] || role.toUpperCase();
}

// ============================================================
// Core Middleware: isAuthenticated
// ============================================================
export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  // Development bypass (ONLY works when NODE_ENV !== 'production')
  if (process.env.AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production') {
    return next();
  }

  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).json({ 
      error: 'Authentication required',
      code: 'UNAUTHENTICATED' 
    });
    return;
  }

  next();
}

// ============================================================
// Role Guard: requireRole
// ============================================================
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Development bypass
    if (process.env.AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production') {
      return next();
    }

    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHENTICATED' 
      });
      return;
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));

    // PLATFORM_ADMIN always has access
    if (userRole === 'PLATFORM_ADMIN') {
      return next();
    }

    if (!normalizedAllowed.includes(userRole)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        currentRole: req.user.role
      });
      return;
    }

    next();
  };
}

// ============================================================
// Tenant Scoping: requireGarageId
// Fixes [S3] - Never return all-tenant data when garageId is missing
// ============================================================
export function requireGarageId(req: Request, res: Response, next: NextFunction): void {
  // Development bypass
  if (process.env.AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production') {
    return next();
  }

  const garageId = req.query.garageId || req.params.garageId || req.user?.garageId;

  if (!garageId) {
    // PLATFORM_ADMIN can access all tenants explicitly
    if (req.user && normalizeRole(req.user.role) === 'PLATFORM_ADMIN') {
      return next();
    }

    res.status(400).json({
      error: 'garageId is required for tenant-scoped operations',
      code: 'MISSING_GARAGE_ID'
    });
    return;
  }

  // Attach garageId to request for downstream use
  (req as any).garageId = garageId;
  next();
}

// ============================================================
// Ownership Scoping: requireOwnership
// Fixes [R4] - Ensure customers can only access their own data
// ============================================================
export function requireOwnership(paramName: string = 'customerId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Development bypass
    if (process.env.AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production') {
      return next();
    }

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRole = normalizeRole(req.user.role);

    // Staff roles can access any customer's data
    if (userRole !== 'CUSTOMER') {
      return next();
    }

    // Customers can only access their own data
    const requestedId = req.params[paramName] || req.query[paramName];
    if (requestedId && requestedId !== req.user.id) {
      res.status(403).json({
        error: 'You can only access your own data',
        code: 'OWNERSHIP_VIOLATION'
      });
      return;
    }

    // Inject customer's own ID for list queries
    req.query[paramName] = req.user.id;
    next();
  };
}

// ============================================================
// Field Whitelist: sanitizeUpdateFields
// Fixes [S4] - Prevent over-posting / self-role-escalation
// ============================================================
export function sanitizeUpdateFields(allowedFields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      const sanitized: Record<string, any> = {};
      for (const field of allowedFields) {
        if (field in req.body) {
          sanitized[field] = req.body[field];
        }
      }
      // Reject if unknown fields were sent
      const unknownFields = Object.keys(req.body).filter(k => !allowedFields.includes(k));
      if (unknownFields.length > 0) {
        console.warn(`[SECURITY] Rejected unknown fields in PATCH: ${unknownFields.join(', ')}`);
      }
      req.body = sanitized;
    }
    next();
  };
}

export default {
  isAuthenticated,
  requireRole,
  requireGarageId,
  requireOwnership,
  sanitizeUpdateFields,
};
