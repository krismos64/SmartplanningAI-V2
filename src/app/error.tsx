'use client'

/**
 * Error Page - SP-304
 *
 * Next.js App Router error boundary for route segments.
 * Automatically catches errors in child components and displays fallback UI.
 *
 * @see Context7 Documentation:
 * - Next.js 15: error.tsx must be a Client Component ('use client')
 * - Receives error and reset props automatically
 * - Errors bubble up to nearest parent error boundary
 *
 * IMPORTANT: This file handles errors at the route segment level.
 * For root layout errors, use global-error.tsx instead.
 */

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error'

/**
 * Props for Next.js error page
 */
interface ErrorPageProps {
  /** The error that was thrown */
  error: Error & { digest?: string }
  /** Function to reset the error boundary */
  reset: () => void
}

/**
 * Error - Next.js route segment error boundary
 *
 * Features:
 * - Catches errors in route segment and children
 * - Logs errors to console (and optionally to monitoring service)
 * - Displays user-friendly fallback UI
 * - Provides reset functionality to retry rendering
 *
 * @param props - Error page props from Next.js
 * @returns Error fallback UI
 */
export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('🚨 Next.js Error Boundary caught:', error)

    // In production, send to error monitoring service
    // Example: Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <ErrorFallback error={error} resetErrorBoundary={reset} />
    </div>
  )
}
