/**
 * Server Error Page - SP-303
 *
 * Custom server error page route for SmartPlanning.
 * Provides a friendly UI when server errors occur.
 * Accessible at /server-error for testing purposes.
 *
 * @see Context7 Documentation:
 * - Next.js 15: Custom error pages in App Router
 * - Pattern: Standalone /server-error route for direct access testing
 *
 * @ticket SP-303
 */

import type { Metadata } from 'next'
import { ServerErrorPage } from '@/components/error/ServerErrorPage'

/**
 * Page metadata for SEO and accessibility
 */
export const metadata: Metadata = {
  title: '500 - Erreur serveur | SmartPlanning',
  description:
    "Une erreur serveur est survenue. Veuillez réessayer ou retourner à l'accueil.",
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * Server Error Page Component
 *
 * This page is accessible at /server-error for testing purposes.
 * In production, users are typically shown this via error.tsx
 * or global-error.tsx when unhandled server errors occur.
 *
 * @returns The ServerErrorPage component
 */
export default function ServerError() {
  return <ServerErrorPage />
}
