/**
 * Not Found Page - SP-302
 *
 * Next.js App Router custom 404 page.
 * Automatically rendered when notFound() is called or a route doesn't exist.
 *
 * @see Context7 Documentation:
 * - Next.js 15: not-found.tsx exports default function for custom 404 UI
 * - Renders when no route matches or notFound() is called
 *
 * @ticket SP-302
 */

import { NotFoundPage } from '@/components/error/NotFoundPage'

export default function NotFound() {
  return <NotFoundPage />
}
