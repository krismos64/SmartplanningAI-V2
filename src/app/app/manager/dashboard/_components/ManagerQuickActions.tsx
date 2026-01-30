/**
 * ManagerQuickActions - Actions rapides pour le manager
 *
 * Affiche des boutons d'actions rapides :
 * - Voir l'equipe
 * - Planning
 * - Tous les conges
 *
 * @ticket SP-316
 */
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ManagerQuickActionsProps {
  /** Nombre de conges en attente (pour badge) */
  pendingLeaveRequests?: number
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant actions rapides Manager
 *
 * @example
 * <ManagerQuickActions pendingLeaveRequests={3} />
 */
export function ManagerQuickActions({
  pendingLeaveRequests = 0,
  className,
}: ManagerQuickActionsProps) {
  return (
    <Card
      className={cn('overflow-hidden', className)}
      data-testid="manager-quick-actions"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {/* Voir l'equipe */}
          <Button asChild variant="default">
            <Link
              href="/app/dashboard/employees"
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Voir l&apos;equipe
            </Link>
          </Button>

          {/* Planning */}
          <Button asChild variant="outline">
            <Link
              href="/app/dashboard/schedules"
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Voir le planning
            </Link>
          </Button>

          {/* Tous les conges */}
          <Button asChild variant="outline" className="relative">
            <Link
              href="/app/dashboard/leaves"
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                <polyline points="7.5 19.79 7.5 14.6 3 12" />
                <polyline points="21 12 16.5 14.6 16.5 19.79" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Tous les conges
              {pendingLeaveRequests > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
                  {pendingLeaveRequests > 9 ? '9+' : pendingLeaveRequests}
                </span>
              )}
            </Link>
          </Button>

          {/* Notes d'incident */}
          <Button asChild variant="outline">
            <Link
              href="/app/dashboard/incidents"
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Notes d&apos;incident
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ManagerQuickActions
