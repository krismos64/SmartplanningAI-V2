/**
 * Forbidden Page - SP-305
 *
 * Next.js 15 App Router file convention for 403 Forbidden errors.
 * This file is automatically rendered when forbidden() is called.
 * Requires experimental.authInterrupts: true in next.config.js
 *
 * @see Context7 Documentation:
 * - Next.js 15: forbidden.tsx file convention
 * - Function: forbidden() from next/navigation
 *
 * @ticket SP-305
 */

import { ForbiddenPage } from '@/components/error/ForbiddenPage'

/**
 * Forbidden Component
 *
 * Rendered automatically by Next.js when forbidden() is called
 * in a Server Component, Server Action, or Route Handler.
 * Returns 403 HTTP status code.
 *
 * @returns The ForbiddenPage component
 */
export default function Forbidden() {
  return <ForbiddenPage />
}
