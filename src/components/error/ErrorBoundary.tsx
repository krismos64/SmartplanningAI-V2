'use client'

/**
 * ErrorBoundary Component - SP-304
 *
 * Wrapper component using react-error-boundary to catch JavaScript errors
 * in child components and display a fallback UI.
 *
 * @see Context7 Documentation:
 * - react-error-boundary: ErrorBoundary with FallbackComponent, onError, onReset, resetKeys
 * - Next.js 15: Error boundaries must be Client Components ('use client')
 * - React 19: Error boundaries catch errors during rendering, in lifecycle methods,
 *   and in constructors. They do NOT catch errors in event handlers, async code,
 *   server-side rendering, or errors thrown in the boundary itself.
 *
 * @example
 * // Basic usage
 * <ErrorBoundaryWrapper>
 *   <App />
 * </ErrorBoundaryWrapper>
 *
 * @example
 * // With custom fallback
 * <ErrorBoundaryWrapper fallback={<CustomError />}>
 *   <App />
 * </ErrorBoundaryWrapper>
 *
 * @example
 * // With resetKeys for automatic recovery
 * <ErrorBoundaryWrapper resetKeys={[userId]}>
 *   <UserProfile userId={userId} />
 * </ErrorBoundaryWrapper>
 */

import { ReactNode, ErrorInfo } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { ErrorFallback } from './ErrorFallback'

/**
 * Structured error log for debugging and monitoring
 */
interface ErrorLogData {
  timestamp: string
  message: string
  stack?: string
  componentStack?: string
  url: string
  userAgent: string
}

/**
 * Props for ErrorBoundaryWrapper component
 */
export interface ErrorBoundaryWrapperProps {
  /** Child components to render */
  children: ReactNode
  /** Optional custom fallback component */
  fallback?: ReactNode
  /** Optional custom fallback render function */
  fallbackRender?: (props: FallbackProps) => ReactNode
  /** Keys that trigger automatic reset when changed */
  resetKeys?: unknown[]
  /** Callback when error boundary resets */
  onReset?: () => void
}

/**
 * Logs error information to console with structured data
 * In production, this could be extended to send to a monitoring service
 *
 * @param error - The error that was caught (unknown type from react-error-boundary)
 * @param info - Additional error info including componentStack
 */
function logError(error: unknown, info: ErrorInfo): void {
  // Safely extract error information
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  const errorLog: ErrorLogData = {
    timestamp: new Date().toISOString(),
    message: errorMessage,
    stack: errorStack,
    componentStack: info.componentStack ?? undefined,
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
  }

  // Log to console in development
  console.group('🚨 ErrorBoundary caught an error')
  console.error('Error:', error)
  console.error('Component Stack:', info.componentStack)
  console.table({
    Timestamp: errorLog.timestamp,
    URL: errorLog.url,
    Message: errorLog.message,
  })
  console.groupEnd()

  // In production, send to error monitoring service
  // Example: Sentry, LogRocket, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorService(errorLog)
  // }
}

/**
 * Handles reset actions for analytics or state cleanup
 */
function handleReset(): void {
  // Log reset action
  console.info('🔄 ErrorBoundary reset - attempting to recover')

  // Clear any cached error state if needed
  // Reset any application state that might have caused the error
}

/**
 * ErrorBoundaryWrapper - Main error boundary component for SmartPlanning
 *
 * Features:
 * - Catches rendering errors in child components
 * - Displays user-friendly fallback UI
 * - Logs errors with structured data
 * - Supports automatic reset via resetKeys
 * - Customizable fallback component
 *
 * @param props - Component props
 * @returns Error boundary wrapped children
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,
  fallbackRender,
  resetKeys,
  onReset,
}: ErrorBoundaryWrapperProps) {
  /**
   * Combined reset handler that calls both internal and external handlers
   */
  const handleResetCallback = () => {
    handleReset()
    onReset?.()
  }

  // Determine which fallback to use
  const fallbackProps = fallbackRender
    ? { fallbackRender }
    : fallback
      ? { fallback }
      : { FallbackComponent: ErrorFallback }

  return (
    <ErrorBoundary
      {...fallbackProps}
      onError={logError}
      onReset={handleResetCallback}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  )
}
