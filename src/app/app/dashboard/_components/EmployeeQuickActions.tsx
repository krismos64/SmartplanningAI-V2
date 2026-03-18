/**
 * EmployeeQuickActions - Actions rapides pour l'employe
 *
 * Affiche des boutons d'actions rapides :
 * - Demander un conge
 * - Voir mon planning
 * - Mes demandes
 *
 * @ticket SP-145
 */
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EmployeeQuickActionsProps {
  /** Nombre de demandes en attente */
  pendingRequests: number
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant actions rapides Employee
 *
 * @example
 * <EmployeeQuickActions pendingRequests={2} />
 */
export function EmployeeQuickActions({
  pendingRequests,
  className,
}: EmployeeQuickActionsProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {/* Demander un conge */}
          <Button asChild variant="default">
            <Link href="/app/dashboard/leaves" className="flex items-center gap-2">
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
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Demander un congé
            </Link>
          </Button>

          {/* Voir mon planning */}
          <Button asChild variant="outline">
            <Link href="/app/dashboard/schedules" className="flex items-center gap-2">
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
              Voir mon planning
            </Link>
          </Button>

          {/* Mes demandes */}
          <Button asChild variant="outline" className="relative">
            <Link href="/app/dashboard/leaves" className="flex items-center gap-2">
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
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
              Mes demandes
              {pendingRequests > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
                  {pendingRequests > 9 ? '9+' : pendingRequests}
                </span>
              )}
            </Link>
          </Button>
        </div>

        {/* Message informatif si demandes en attente */}
        {pendingRequests > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-orange-600">
              {pendingRequests}
            </span>{' '}
            {pendingRequests === 1
              ? 'demande en attente'
              : 'demandes en attente'}{' '}
            de validation
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default EmployeeQuickActions
