'use client'

/**
 * ServerPagination — Contrôle de pagination pour les listes paginées serveur
 *
 * Source unique (SP-547) : le bloc « Page X sur Y » + Précédent/Suivant était
 * recopié verbatim dans UsersDataTable, SubscriptionsDataTable,
 * PaymentsDataTable et EmailLogsDataTable. Contrairement à
 * DataTablePagination (couplé à une instance TanStack Table), ce composant
 * prend des props plates — adapté aux tables paginées par Server Actions.
 *
 * Ne rend rien si totalPages <= 1 (comportement historique des 4 tables).
 *
 * @ticket SP-547
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface ServerPaginationProps {
  /** Page courante (1-indexée) */
  page: number
  /** Nombre total de pages */
  totalPages: number
  /** Nombre total de résultats (affiché dans le libellé) */
  total: number
  /** Désactive les boutons pendant un chargement */
  isLoading?: boolean
  onPrevious: () => void
  onNext: () => void
}

export function ServerPagination({
  page,
  totalPages,
  total,
  isLoading = false,
  onPrevious,
  onNext,
}: ServerPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-sm text-muted-foreground">
        Page {page} sur {totalPages} ({total} résultat{total > 1 ? 's' : ''})
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page <= 1 || isLoading}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages || isLoading}
        >
          Suivant
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
