/**
 * SALIS AUTO - Security Middleware Stack
 * 
 * FIXES APPLIED:
 * - Rate limiting on auth routes (brute-force protection)
 * - Helmet security headers (x-content-type-options, x-frame-options, etc.)
 * - CSRF protection for state-changing operations
 * - Request correlation IDs for tracing
 * - HTTPS enforcement in production
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// ============================================================
// HTTPS Enforcement (Production Only)
// ============================================================
export function enforceHttps(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'production') {
    // Check x-forwarded-proto header (common behind reverse proxies like Replit/Nginx)
    if (req.headers['x-forwarded-proto'] !== 'https' && !req.secure) {
      res.redirect(301, `https://${req.headers.host}${req.url}`);
      return;
    }
  }
  next();
}

// ============================================================
// Helmet Security Headers
// ============================================================
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow loading cross-origin resources
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// ============================================================
// Rate Limiting - Auth Routes
// ============================================================
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    error: 'Too many login attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMITED',
    retryAfter: 900, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use IP + email combination to prevent distributed attacks
    const email = req.body?.email || 'unknown';
    return `${req.ip}-${email}`;
  },
});

// ============================================================
// Rate Limiting - General API
// ============================================================
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute per IP
  message: {
    error: 'Too many requests. Please slow down.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================
// Rate Limiting - AI Endpoints (expensive operations)
// ============================================================
export const aiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: {
    error: 'AI request limit reached. Please wait before sending more requests.',
    code: 'AI_RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================
// Request Correlation ID
// Fixes [B5] - Enable request tracing from frontend to backend logs
// ============================================================
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = req.headers['x-request-id'] as string || crypto.randomUUID();
  (req as any).requestId = id;
  res.setHeader('x-request-id', id);
  next();
}

// ============================================================
// CSRF Protection (Double-Submit Cookie Pattern)
// ============================================================
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip for GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for API calls with valid session (API clients use session auth)
  // In production, implement proper CSRF token validation
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const csrfHeader = req.headers['x-csrf-token'] as string;
  const csrfCookie = req.cookies?.['csrf-token'];

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    res.status(403).json({
      error: 'Invalid or missing CSRF token',
      code: 'CSRF_VIOLATION',
    });
    return;
  }

  next();
}

// ============================================================
// Request Body Size Limit
// ============================================================
export const bodyLimits = {
  json: '10mb',      // General JSON payloads
  upload: '50mb',    // File uploads
  urlencoded: '10mb', // Form submissions
};

// ============================================================
// Security Event Logger
// ============================================================
export function securityLogger(req: Request, res: Response, next: NextFunction): void {
  const originalEnd = res.end;
  
  res.end = function(...args: any[]) {
    // Log security-relevant events
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn(`[SECURITY] ${req.method} ${req.path} - ${res.statusCode} - IP: ${req.ip} - User: ${(req.user as any)?.email || 'anonymous'}`);
    }
    
    if (req.path.includes('/login') && res.statusCode === 200) {
      console.info(`[AUTH] Successful login - Email: ${req.body?.email} - IP: ${req.ip}`);
    }

    return originalEnd.apply(res, args as any);
  };

  next();
}

export default {
  enforceHttps,
  securityHeaders,
  authRateLimit,
  apiRateLimit,
  aiRateLimit,
  requestId,
  csrfProtection,
  bodyLimits,
  securityLogger,
};
