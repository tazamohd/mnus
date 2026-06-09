/**
 * SALIS AUTO - Middleware Stack Bootstrap
 * 
 * This file shows how to wire all security and utility middleware
 * into the Express application. Apply this to your server/index.ts.
 * 
 * INTEGRATION INSTRUCTIONS:
 * 1. Import this file in your server/index.ts
 * 2. Call applyMiddleware(app) BEFORE registering routes
 * 3. Call applyErrorHandlers(app) AFTER registering routes
 */

import express, { Express } from 'express';
import { validateEnvironment } from './envValidation';
import { 
  enforceHttps, 
  securityHeaders, 
  authRateLimit, 
  apiRateLimit,
  aiRateLimit,
  requestId, 
  securityLogger,
  bodyLimits 
} from './security';
import { globalErrorHandler, notFoundHandler } from './errorHandler';
import { parsePagination } from './pagination';

// ============================================================
// Apply all middleware BEFORE routes
// ============================================================
export function applyMiddleware(app: Express): void {
  // Step 0: Validate environment at boot
  validateEnvironment();

  // Step 1: HTTPS enforcement (production)
  app.use(enforceHttps);

  // Step 2: Security headers (Helmet)
  app.use(securityHeaders);

  // Step 3: Request correlation ID
  app.use(requestId);

  // Step 4: Security event logging
  app.use(securityLogger);

  // Step 5: Body parsing with size limits
  // NOTE: Stripe webhooks need raw body - handle BEFORE json parsing
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: bodyLimits.json }));
  app.use(express.urlencoded({ extended: true, limit: bodyLimits.urlencoded }));

  // Step 6: General API rate limiting
  app.use('/api/', apiRateLimit);

  // Step 7: Strict rate limiting on auth routes
  app.use('/api/login', authRateLimit);
  app.use('/api/register', authRateLimit);

  // Step 8: AI endpoint rate limiting
  app.use('/api/ai/', aiRateLimit);

  // Step 9: Pagination parsing for list endpoints
  app.use('/api/', parsePagination);

  console.info('[MIDDLEWARE] Security stack applied successfully');
}

// ============================================================
// Apply error handlers AFTER routes
// ============================================================
export function applyErrorHandlers(app: Express): void {
  // 404 handler for unmatched API routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  console.info('[MIDDLEWARE] Error handlers registered');
}

// ============================================================
// Session cleanup (run at startup)
// Fixes [D5] - Clean up expired sessions
// ============================================================
export async function cleanupExpiredSessions(db: any): Promise<void> {
  try {
    const result = await db.execute(
      `DELETE FROM sessions WHERE expire < NOW()`
    );
    console.info(`[CLEANUP] Removed expired sessions`);
  } catch (err) {
    console.warn('[CLEANUP] Failed to clean expired sessions:', err);
  }
}

export default { applyMiddleware, applyErrorHandlers, cleanupExpiredSessions };
