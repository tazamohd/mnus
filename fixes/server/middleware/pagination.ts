/**
 * SALIS AUTO - Pagination Middleware
 * 
 * FIXES APPLIED:
 * - [F6] Add limit/offset query params to all list endpoints
 * - [B4-API] No pagination on list endpoints
 * - Prevents loading 500+ records into memory at once
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================
// Pagination Configuration
// ============================================================
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 25,
  maxLimit: 100,
};

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================
// Pagination Middleware - Parses and validates query params
// ============================================================
export function parsePagination(req: Request, res: Response, next: NextFunction): void {
  const page = Math.max(1, parseInt(req.query.page as string) || PAGINATION_DEFAULTS.page);
  const limit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.limit)
  );
  const offset = (page - 1) * limit;

  (req as any).pagination = { page, limit, offset } as PaginationParams;
  next();
}

// ============================================================
// Helper: Build paginated response
// ============================================================
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pagination.limit);

  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
}

// ============================================================
// Helper: Apply pagination to Drizzle query
// ============================================================
export function applyPaginationToQuery(query: any, pagination: PaginationParams) {
  return query.limit(pagination.limit).offset(pagination.offset);
}

export default {
  parsePagination,
  buildPaginatedResponse,
  applyPaginationToQuery,
  PAGINATION_DEFAULTS,
};
