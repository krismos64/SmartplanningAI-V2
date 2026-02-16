'use client'

/**
 * Global Error Page - SP-304
 *
 * Next.js App Router global error boundary for the root layout.
 * This is the last resort error handler when the root layout itself crashes.
 *
 * @see Context7 Documentation:
 * - Next.js 15: global-error.tsx MUST include <html> and <body> tags
 * - It replaces the root layout when active
 * - Required for catching errors in the root layout
 *
 * IMPORTANT: This component is only active in production.
 * In development, errors will show the Next.js error overlay instead.
 */

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

/**
 * Props for Next.js global error page
 */
interface GlobalErrorPageProps {
  /** The error that was thrown */
  error: Error & { digest?: string }
  /** Function to reset the error boundary */
  reset: () => void
}

/**
 * GlobalError - Next.js root layout error boundary
 *
 * Features:
 * - Catches errors in root layout (when error.tsx can't)
 * - MUST include <html> and <body> tags (replaces root layout)
 * - Minimal inline styles (since CSS may not be loaded)
 * - Provides recovery options
 *
 * NOTE: Uses inline styles because global CSS might not be available
 * when the root layout crashes.
 *
 * @param props - Global error page props from Next.js
 * @returns Complete HTML page with error UI
 */
export default function GlobalError({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    // ChunkLoadError = déploiement en cours, les anciens chunks n'existent plus
    if (
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk')
    ) {
      const reloadKey = 'chunk-reload-global'
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1')
        window.location.reload()
        return
      }
      sessionStorage.removeItem(reloadKey)
    }

    // Log the critical error
    console.error('🚨 CRITICAL: Next.js Global Error Boundary caught:', error)

    // In production, this should trigger high-priority alerts
    // Example: Sentry.captureException(error, { level: 'fatal' })
  }, [error])

  /**
   * Navigate to home page
   */
  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030712',
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          role="alert"
          aria-live="assertive"
          style={{
            maxWidth: '28rem',
            width: '100%',
            margin: '1rem',
            padding: '2rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center',
          }}
        >
          {/* Error Icon */}
          <div
            style={{
              width: '4rem',
              height: '4rem',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle
              style={{
                width: '2rem',
                height: '2rem',
                color: '#ef4444',
              }}
              aria-hidden="true"
            />
          </div>

          {/* Title */}
          <h1
            style={{
              margin: '0 0 0.5rem',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#ef4444',
            }}
          >
            Une erreur critique est survenue
          </h1>

          {/* Description */}
          <p
            style={{
              margin: '0 0 1.5rem',
              fontSize: '0.875rem',
              color: '#9ca3af',
            }}
          >
            L&apos;application a rencontré un problème inattendu. Veuillez
            réessayer ou retourner à l&apos;accueil.
          </p>

          {/* Error Message (Production-safe) */}
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1.5rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              fontSize: '0.75rem',
              color: '#9ca3af',
            }}
          >
            {error.digest && <p style={{ margin: 0 }}>Code: {error.digest}</p>}
            {process.env.NODE_ENV === 'development' && (
              <p style={{ margin: error.digest ? '0.5rem 0 0' : 0 }}>
                {error.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexDirection: 'column',
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#fff',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = '#2563eb')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = '#3b82f6')
              }
              aria-label="Réessayer de charger la page"
            >
              <RefreshCw style={{ width: '1rem', height: '1rem' }} />
              Réessayer
            </button>

            <button
              onClick={handleGoHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#d1d5db',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor =
                  'rgba(255,255,255,0.05)')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
              aria-label="Retourner à la page d'accueil"
            >
              <Home style={{ width: '1rem', height: '1rem' }} />
              Accueil
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
