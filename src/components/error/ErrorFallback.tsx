'use client'

/**
 * ErrorFallback Component - SP-304
 *
 * Fallback UI displayed when an error is caught by ErrorBoundary.
 * Provides user-friendly error display with retry and navigation options.
 *
 * @see Context7 Documentation:
 * - react-error-boundary: FallbackComponent receives error and resetErrorBoundary props
 * - Design: Uses Shadcn/ui Card and Button components for consistency
 * - Accessibility: WCAG 2.1 AA compliant with role="alert" and aria-labels
 *
 * @example
 * <ErrorBoundary FallbackComponent={ErrorFallback}>
 *   <App />
 * </ErrorBoundary>
 */

import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'

/**
 * Props for ErrorFallback component
 */
export interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error & { digest?: string }
  /** Function to reset the error boundary and retry rendering */
  resetErrorBoundary: () => void
}

/**
 * ErrorFallback - Displays a user-friendly error UI
 *
 * Features:
 * - Error icon with clear messaging
 * - "Retry" button to attempt recovery
 * - "Home" button to navigate to safety
 * - Collapsible error details in development mode
 * - Responsive design (mobile-first)
 * - Dark mode support via Tailwind
 * - Accessible with proper ARIA attributes
 */
export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Navigate to home page
   */
  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-labelledby="error-title"
      aria-describedby="error-description"
      className="flex min-h-[400px] w-full items-center justify-center p-4"
    >
      <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle
              className="h-8 w-8 text-destructive"
              aria-hidden="true"
            />
          </div>
          <CardTitle id="error-title" className="text-xl text-destructive">
            Une erreur est survenue
          </CardTitle>
          <CardDescription id="error-description">
            Nous sommes désolés, quelque chose s&apos;est mal passé. Vous pouvez
            réessayer ou retourner à l&apos;accueil.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error message summary */}
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-sm text-muted-foreground">
              {error.message || 'Erreur inconnue'}
            </p>
          </div>

          {/* Development mode: Show stack trace */}
          {isDevelopment && error.stack && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:bg-muted/50"
                aria-expanded={showDetails}
                aria-controls="error-stack-trace"
              >
                <span className="font-medium">Détails techniques (dev)</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showDetails ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {showDetails && (
                <div
                  id="error-stack-trace"
                  className="max-h-48 overflow-auto rounded-lg bg-muted p-3"
                >
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Error digest for production debugging */}
          {error.digest && (
            <p className="text-center text-xs text-muted-foreground">
              Code erreur : {error.digest}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={resetErrorBoundary}
            variant="default"
            className="w-full sm:flex-1"
            aria-label="Réessayer de charger la page"
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Réessayer
          </Button>
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full sm:flex-1"
            aria-label="Retourner à la page d'accueil"
          >
            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
            Accueil
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
