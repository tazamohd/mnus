/**
 * SALIS AUTO - Lazy Route Component
 * 
 * FIXES APPLIED:
 * - [F4] Code-split heavy pages (currently all in one 7.3MB bundle)
 * - Wraps React.lazy with Suspense + ErrorBoundary
 * - Provides consistent loading and error states
 * - Reduces initial bundle size significantly
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { PageSkeleton } from './Skeletons';

interface LazyRouteProps {
  pageName: string;
  children: React.ReactNode;
}

/**
 * Wraps a lazy-loaded page with Suspense fallback and ErrorBoundary
 */
export function LazyRoute({ pageName, children }: LazyRouteProps) {
  return (
    <ErrorBoundary pageName={pageName}>
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Helper to create a lazy-loaded route component
 * Usage: const Dashboard = lazyPage(() => import('../pages/Dashboard'), 'Dashboard');
 */
export function lazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  pageName: string
) {
  const LazyComponent = lazy(importFn);

  return function LazyPageWrapper(props: React.ComponentProps<T>) {
    return (
      <ErrorBoundary pageName={pageName}>
        <Suspense fallback={<PageSkeleton />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

/**
 * Example usage in router configuration:
 * 
 * // Before (all pages loaded upfront):
 * import Dashboard from './pages/Dashboard';
 * import JobCards from './pages/JobCards';
 * import Inventory from './pages/Inventory';
 * 
 * // After (code-split with lazy loading):
 * const Dashboard = lazyPage(() => import('./pages/Dashboard'), 'Dashboard');
 * const JobCards = lazyPage(() => import('./pages/JobCards'), 'Job Cards');
 * const Inventory = lazyPage(() => import('./pages/Inventory'), 'Inventory');
 * 
 * // In routes:
 * <Route path="/dashboard" element={<Dashboard />} />
 * <Route path="/job-cards" element={<JobCards />} />
 * <Route path="/inventory" element={<Inventory />} />
 */

export default LazyRoute;
