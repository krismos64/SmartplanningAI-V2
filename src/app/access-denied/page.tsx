/**
 * Access Denied Page - SP-305
 *
 * Custom 403 error page route for SmartPlanning.
 * Provides a friendly UI when users lack permissions.
 * Accessible at /access-denied for testing purposes.
 *
 * @see Context7 Documentation:
 * - Next.js 15: Custom error pages in App Router
 * - Pattern: Standalone /access-denied route for direct access testing
 *
 * @ticket SP-305
 */

import type { Metadata } from 'next'
import { ForbiddenPage } from '@/components/error/ForbiddenPage'

/**
 * Page metadata for SEO and accessibility
 */
export const metadata: Metadata = {
  title: '403 - Accès refusé | SmartPlanning',
  description:
    "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * Access Denied Page Component
 *
 * This page is accessible at /access-denied for testing purposes.
 * In production, users are typically shown this via forbidden.tsx
 * when authorization checks fail.
 *
 * @returns The ForbiddenPage component
 */
export default function AccessDenied() {
  return <ForbiddenPage />
}
