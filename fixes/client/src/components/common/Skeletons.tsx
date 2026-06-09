/**
 * SALIS AUTO - Skeleton Loading Components
 * 
 * FIXES APPLIED:
 * - [F3] Replace raw "Loading..." text with proper skeleton states
 * - Provides consistent loading UX across all pages
 * - Reduces perceived load time
 */

import React from 'react';

// ============================================================
// Base Skeleton Pulse Animation
// ============================================================
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

// ============================================================
// Dashboard Card Skeleton
// ============================================================
export function DashboardCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ============================================================
// Table Skeleton
// ============================================================
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-100 dark:border-gray-700 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="border-b border-gray-50 dark:border-gray-700/50 p-4">
          <div className="flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton 
                key={`cell-${rowIdx}-${colIdx}`} 
                className={`h-4 flex-1 ${colIdx === 0 ? 'max-w-[120px]' : ''}`} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Chart Skeleton
// ============================================================
export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 ${height}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="flex items-end gap-2 h-[calc(100%-60px)]">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton 
            key={`bar-${i}`} 
            className="flex-1 rounded-t" 
            style={{ height: `${30 + Math.random() * 60}%` }} 
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Page Skeleton (full page loading state)
// ============================================================
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <DashboardCardSkeleton key={`card-${i}`} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div>
          <TableSkeleton rows={4} columns={2} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Form Skeleton
// ============================================================
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
      <Skeleton className="h-6 w-40 mb-6" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={`field-${i}`} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================
// List Item Skeleton
// ============================================================
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton key={`item-${i}`} />
      ))}
    </div>
  );
}

export { Skeleton };
export default {
  Skeleton,
  DashboardCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  PageSkeleton,
  FormSkeleton,
  ListSkeleton,
  ListItemSkeleton,
};
