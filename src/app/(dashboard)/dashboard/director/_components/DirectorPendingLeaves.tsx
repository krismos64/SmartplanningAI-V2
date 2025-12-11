/**
 * DirectorPendingLeaves - Liste des conges en attente
 *
 * Affiche les 5 derniers conges en attente de validation
 * avec lien vers la liste complete.
 *
 * @ticket SP-147
 */
'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PendingLeaveItem {
  id: string
  employeeName: string
  teamName: string
  startDate: Date
  endDate: Date
  type: string
}

export interface DirectorPendingLeavesProps {
  /** Liste des conges en attente (max 5) */
  pendingLeaves: PendingLeaveItem[]
  /** Nombre total de conges en attente */
  totalPending: number
  /** Etat de chargement */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Formate une date en francais court
 */
function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

/**
 * Formate une periode de dates
 */
function formatDateRange(startDate: Date, endDate: Date): string {
  const start = formatDateShort(startDate)
  const end = formatDateShort(endDate)

  if (start === end) {
    return start
  }
  return `${start} - ${end}`
}

/**
 * Labels francais pour les types de conges
 */
const leaveTypeLabels: Record<string, string> = {
  PAID_LEAVE: 'Conges payes',
  SICK_LEAVE: 'Maladie',
  UNPAID_LEAVE: 'Sans solde',
  RTT: 'RTT',
  PARENTAL_LEAVE: 'Parental',
  OTHER: 'Autre',
}

/**
 * Liste des conges en attente
 *
 * @example
 * <DirectorPendingLeaves
 *   pendingLeaves={leaves}
 *   totalPending={12}
 * />
 */
export function DirectorPendingLeaves({
  pendingLeaves,
  totalPending,
  isLoading = false,
  className,
}: DirectorPendingLeavesProps) {
  const isEmpty = pendingLeaves.length === 0

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              Conges en attente
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {totalPending > 0
                ? `${totalPending} demande${totalPending > 1 ? 's' : ''} en attente`
                : 'Aucune demande en attente'}
            </p>
          </div>
          {totalPending > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
              {totalPending > 9 ? '9+' : totalPending}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-emerald-500/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-emerald-600"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Toutes les demandes ont ete traitees
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {pendingLeaves.slice(0, 5).map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{leave.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {leave.teamName} · {leaveTypeLabels[leave.type] ?? leave.type}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium">
                      {formatDateRange(leave.startDate, leave.endDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Lien vers toutes les demandes */}
            {totalPending > 5 && (
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/leaves/pending">
                    Voir toutes les demandes ({totalPending})
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default DirectorPendingLeaves
