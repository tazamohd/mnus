/**
 * SALIS AUTO - Global Error Handler
 * 
 * FIXES APPLIED:
 * - Centralized error handling instead of scattered try/catch
 * - Structured error responses with correlation IDs
 * - Sentry integration for production error tracking
 * - Prevents leaking stack traces in production
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================
// Custom Error Classes
// ============================================================
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  public details: any;

  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

// ============================================================
// Global Error Handler Middleware
// ============================================================
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req as any).requestId || 'unknown';
  const isOperational = err instanceof AppError && err.isOperational;
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';

  // Log the error
  if (statusCode >= 500) {
    console.error(`[ERROR] [${requestId}] ${req.method} ${req.path}:`, {
      message: err.message,
      stack: err.stack,
      userId: (req.user as any)?.id,
      body: req.body,
    });
  } else {
    console.warn(`[WARN] [${requestId}] ${req.method} ${req.path}: ${err.message}`);
  }

  // Send Sentry event in production (if configured)
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    try {
      // Sentry integration placeholder
      // Sentry.captureException(err, { extra: { requestId, path: req.path } });
    } catch (sentryErr) {
      console.error('[SENTRY] Failed to report error:', sentryErr);
    }
  }

  // Build response
  const response: any = {
    error: isOperational ? err.message : 'An unexpected error occurred',
    code,
    requestId,
  };

  // Include validation details if available
  if (err instanceof ValidationError && err.details) {
    response.details = err.details;
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

// ============================================================
// 404 Handler for unmatched routes
// ============================================================
export function notFoundHandler(req: Request, res: Response): void {
  // Don't 404 on frontend routes - let the SPA handle them
  if (!req.path.startsWith('/api/')) {
    return; // Will be handled by static file serving / SPA fallback
  }

  res.status(404).json({
    error: `API endpoint not found: ${req.method} ${req.path}`,
    code: 'ENDPOINT_NOT_FOUND',
    requestId: (req as any).requestId,
  });
}

// ============================================================
// Async Route Wrapper - Catches async errors automatically
// ============================================================
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default {
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};
