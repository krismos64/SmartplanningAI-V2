/**
 * Error Logger Utility - SP-303
 *
 * Server-side error logging utility for SmartPlanning.
 * Provides structured logging for server errors with context information.
 *
 * @see Context7 Documentation:
 * - Next.js 15: Error handling in Server Components and API routes
 * - Pattern: Structured logging for production monitoring integration
 *
 * @ticket SP-303
 *
 * @example
 * // In an API route
 * import { logServerError } from '@/lib/utils/error-logger';
 *
 * try {
 *   // ... code
 * } catch (error) {
 *   await logServerError(error as Error, { route: '/api/example' });
 *   return NextResponse.json({ error: 'Server error' }, { status: 500 });
 * }
 */

/**
 * Context information for error logging
 */
export interface ErrorContext {
  /** The route where the error occurred */
  route?: string
  /** User ID if authenticated */
  userId?: string
  /** Request ID for tracing */
  requestId?: string
  /** HTTP method (GET, POST, etc.) */
  method?: string
  /** Additional custom data */
  [key: string]: unknown
}

/**
 * Structured error log data
 */
export interface ErrorLogData {
  /** ISO timestamp of the error */
  timestamp: string
  /** Error message */
  message: string
  /** Error name/type */
  name: string
  /** Stack trace (development only) */
  stack?: string
  /** Next.js error digest (production) */
  digest?: string
  /** Additional context */
  context: ErrorContext
  /** Environment (development/production) */
  environment: string
}

/**
 * Safely extracts error information from unknown error type
 *
 * @param error - The error to extract info from (unknown type)
 * @returns Structured error information
 */
function extractErrorInfo(error: unknown): {
  message: string
  name: string
  stack?: string
  digest?: string
} {
  if (error instanceof Error) {
    return {
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack,
      digest: (error as Error & { digest?: string }).digest,
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
      name: 'Error',
    }
  }

  return {
    message: String(error) || 'Unknown error',
    name: 'Error',
  }
}

/**
 * Logs a server error with structured data
 *
 * In development: Logs to console with full details
 * In production: Logs to console (can be extended for monitoring services)
 *
 * @param error - The error to log (supports Error objects and unknown types)
 * @param context - Optional context information (route, userId, etc.)
 * @returns Promise that resolves when logging is complete
 *
 * @example
 * // Basic usage
 * await logServerError(new Error('Database connection failed'));
 *
 * @example
 * // With context
 * await logServerError(error, {
 *   route: '/api/users',
 *   method: 'POST',
 *   userId: 'user-123',
 * });
 */
// eslint-disable-next-line @typescript-eslint/require-await -- Async for future monitoring integration
export async function logServerError(
  error: unknown,
  context: ErrorContext = {}
): Promise<void> {
  const timestamp = new Date().toISOString()
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Extract error information safely
  const errorInfo = extractErrorInfo(error)

  // Build structured log data
  const errorLog: ErrorLogData = {
    timestamp,
    message: errorInfo.message,
    name: errorInfo.name,
    stack: isDevelopment ? errorInfo.stack : undefined,
    digest: errorInfo.digest,
    context: {
      ...context,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    },
    environment: process.env.NODE_ENV || 'development',
  }

  // Console logging (always)
  if (isDevelopment) {
    // Development: Full details with formatting
    console.group('🚨 Server Error')
    console.error('Error:', errorInfo.message)
    console.error('Name:', errorInfo.name)
    if (errorInfo.stack) {
      console.error('Stack:', errorInfo.stack)
    }
    console.table({
      Timestamp: timestamp,
      Route: context.route || 'N/A',
      Method: context.method || 'N/A',
      UserId: context.userId || 'N/A',
    })
    console.groupEnd()
  } else {
    // Production: JSON format for log aggregation
    console.error(JSON.stringify(errorLog))
  }

  // TODO: Future integration with monitoring services
  // Uncomment and configure when ready:
  //
  // Sentry integration example:
  // if (process.env.SENTRY_DSN) {
  //   const Sentry = await import('@sentry/nextjs');
  //   Sentry.captureException(error, {
  //     extra: context,
  //     tags: { route: context.route },
  //   });
  // }
  //
  // LogRocket integration example:
  // if (process.env.LOGROCKET_APP_ID) {
  //   const LogRocket = await import('logrocket');
  //   LogRocket.captureException(error as Error);
  // }
  //
  // Custom webhook example:
  // if (process.env.ERROR_WEBHOOK_URL) {
  //   await fetch(process.env.ERROR_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(errorLog),
  //   });
  // }
}

/**
 * Creates a pre-configured error logger with default context
 *
 * Useful for creating route-specific loggers with consistent context.
 *
 * @param defaultContext - Default context to include in all logs
 * @returns A function that logs errors with the default context
 *
 * @example
 * // Create a logger for a specific route
 * const logger = createErrorLogger({ route: '/api/users', method: 'POST' });
 *
 * // Use it later
 * await logger(error, { userId: 'user-123' });
 */
export function createErrorLogger(defaultContext: ErrorContext) {
  return async (error: unknown, additionalContext: ErrorContext = {}) => {
    await logServerError(error, { ...defaultContext, ...additionalContext })
  }
}
