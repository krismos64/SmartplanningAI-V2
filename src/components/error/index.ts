/**
 * Error Components - SP-304, SP-302, SP-303 & SP-305
 *
 * Centralized exports for error handling components.
 * Use ErrorBoundaryWrapper to wrap components that might throw errors.
 * Use NotFoundPage for custom 404 pages.
 * Use ServerErrorPage for custom 500 pages.
 * Use ForbiddenPage for custom 403 pages.
 */

// Error Boundary (SP-304)
export { ErrorBoundaryWrapper } from './ErrorBoundary'
export type { ErrorBoundaryWrapperProps } from './ErrorBoundary'

export { ErrorFallback } from './ErrorFallback'
export type { ErrorFallbackProps } from './ErrorFallback'

// Not Found Page (SP-302)
export { NotFoundPage } from './NotFoundPage'
export { NotFoundIllustration } from './NotFoundIllustration'

// Server Error Page (SP-303)
export { ServerErrorPage } from './ServerErrorPage'
export type { ServerErrorPageProps } from './ServerErrorPage'

// Forbidden Page (SP-305)
export { ForbiddenPage } from './ForbiddenPage'
export type { ForbiddenPageProps } from './ForbiddenPage'
