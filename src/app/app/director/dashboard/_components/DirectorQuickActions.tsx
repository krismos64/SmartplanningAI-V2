/**
 * DirectorQuickActions - Actions rapides pour le Director
 *
 * Affiche des boutons d'actions rapides :
 * - Gerer les equipes
 * - Voir tous les employes
 * - Rapports
 * - Parametres entreprise
 *
 * @ticket SP-147
 */
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DirectorQuickActionsProps {
  /** Nombre de conges en attente (pour badge) */
  pendingLeaves?: number
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant actions rapides Director
 *
 * @example
 * <DirectorQuickActions pendingLeaves={5} />
 */
export function DirectorQuickActions({
  pendingLeaves = 0,
  className,
}: DirectorQuickActionsProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {/* Gerer les equipes */}
          <Button asChild variant="default">
            <Link href="/app/director/teams" className="flex items-center gap-2">
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
                <path d="M3 21h18" />
                <path d="M9 8h1" />
                <path d="M9 12h1" />
                <path d="M9 16h1" />
                <path d="M14 8h1" />
                <path d="M14 12h1" />
                <path d="M14 16h1" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
              </svg>
              Gérer les équipes
            </Link>
          </Button>

          {/* Voir tous les employes */}
          <Button asChild variant="outline">
            <Link href="/app/dashboard/employees" className="flex items-center gap-2">
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
              Tous les employés
            </Link>
          </Button>

          {/* Conges en attente */}
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Congés en attente
              {pendingLeaves > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
                  {pendingLeaves > 9 ? '9+' : pendingLeaves}
                </span>
              )}
            </Link>
          </Button>

          {/* Parametres entreprise */}
          <Button asChild variant="outline">
            <Link href="/app/settings/company" className="flex items-center gap-2">
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
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Paramètres
            </Link>
          </Button>
        </div>

        {/* Message informatif si conges en attente */}
        {pendingLeaves > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-orange-600">{pendingLeaves}</span>{' '}
            demande{pendingLeaves > 1 ? 's' : ''} de congés en attente de
            validation par les managers
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default DirectorQuickActions
