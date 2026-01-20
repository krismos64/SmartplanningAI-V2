/**
 * Error Components - SP-304 & SP-302
 *
 * Centralized exports for error handling components.
 * Use ErrorBoundaryWrapper to wrap components that might throw errors.
 * Use NotFoundPage for custom 404 pages.
 */

// Error Boundary (SP-304)
export { ErrorBoundaryWrapper } from './ErrorBoundary'
export type { ErrorBoundaryWrapperProps } from './ErrorBoundary'

export { ErrorFallback } from './ErrorFallback'
export type { ErrorFallbackProps } from './ErrorFallback'

// Not Found Page (SP-302)
export { NotFoundPage } from './NotFoundPage'
export { NotFoundIllustration } from './NotFoundIllustration'
