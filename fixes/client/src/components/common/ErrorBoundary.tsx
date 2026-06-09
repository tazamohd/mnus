/**
 * SALIS AUTO - Error Boundary Component
 * 
 * FIXES APPLIED:
 * - [F1] Wrap every page in ErrorBoundary to prevent white-screen crashes
 * - [F2] Appointments page crash from rendering vehicle object as React child
 * - Provides user-friendly error UI with retry option
 * - Reports errors to monitoring service
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  pageName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log to console in development
    console.error(`[ErrorBoundary] ${this.props.pageName || 'Unknown'} crashed:`, error, errorInfo);

    // Report to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to Sentry/error tracking
    // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Error Message */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {this.props.pageName 
                ? `The ${this.props.pageName} page encountered an error.`
                : 'An unexpected error occurred on this page.'}
              {' '}Please try again or contact support if the issue persists.
            </p>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-32 text-red-600">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
