/**
 * ManagerPendingLeaves - Liste des conges en attente de validation
 *
 * Affiche les demandes de conges a valider par le manager
 * avec actions rapides Approuver/Refuser.
 *
 * @ticket SP-316
 */
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface PendingLeaveItem {
  id: string
  employeeName: string
  startDate: Date
  endDate: Date
  type: string
  reason?: string
}

export interface ManagerPendingLeavesProps {
  /** Liste des conges en attente */
  pendingLeaves: PendingLeaveItem[]
  /** Callback pour approuver une demande */
  onApprove?: (leaveId: string) => Promise<{ success: boolean; error?: string }>
  /** Callback pour refuser une demande */
  onReject?: (leaveId: string) => Promise<{ success: boolean; error?: string }>
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
  PAID_LEAVE: 'CP',
  SICK_LEAVE: 'Maladie',
  UNPAID_LEAVE: 'Sans solde',
  RTT: 'RTT',
  PARENTAL_LEAVE: 'Parental',
  FAMILY_EVENT: 'Famille',
  OTHER: 'Autre',
}

/**
 * Couleurs pour les badges de type de conge
 */
const leaveTypeColors: Record<string, string> = {
  PAID_LEAVE: 'bg-blue-100 text-blue-800',
  SICK_LEAVE: 'bg-red-100 text-red-800',
  UNPAID_LEAVE: 'bg-gray-100 text-gray-800',
  RTT: 'bg-purple-100 text-purple-800',
  PARENTAL_LEAVE: 'bg-pink-100 text-pink-800',
  FAMILY_EVENT: 'bg-amber-100 text-amber-800',
  OTHER: 'bg-slate-100 text-slate-800',
}

/**
 * Liste des conges en attente avec actions
 *
 * @example
 * <ManagerPendingLeaves
 *   pendingLeaves={leaves}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 * />
 */
export function ManagerPendingLeaves({
  pendingLeaves,
  onApprove,
  onReject,
  isLoading = false,
  className,
}: ManagerPendingLeavesProps) {
  const [isPending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const isEmpty = pendingLeaves.length === 0

  const handleApprove = (leaveId: string) => {
    if (!onApprove) return

    setProcessingId(leaveId)
    startTransition(async () => {
      const result = await onApprove(leaveId)
      if (result.success) {
        toast.success('Demande approuvee')
      } else {
        toast.error(result.error ?? "Erreur lors de l'approbation")
      }
      setProcessingId(null)
    })
  }

  const handleReject = (leaveId: string) => {
    if (!onReject) return

    setProcessingId(leaveId)
    startTransition(async () => {
      const result = await onReject(leaveId)
      if (result.success) {
        toast.success('Demande refusee')
      } else {
        toast.error(result.error ?? 'Erreur lors du refus')
      }
      setProcessingId(null)
    })
  }

  return (
    <Card
      className={cn('overflow-hidden', className)}
      data-testid="manager-pending-leaves"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              Conges a valider
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {pendingLeaves.length > 0
                ? `${pendingLeaves.length} demande${pendingLeaves.length > 1 ? 's' : ''} en attente`
                : 'Aucune demande en attente'}
            </p>
          </div>
          {pendingLeaves.length > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
              {pendingLeaves.length > 9 ? '9+' : pendingLeaves.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
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
              {pendingLeaves.slice(0, 5).map((leave) => {
                const isProcessing = processingId === leave.id && isPending

                return (
                  <div
                    key={leave.id}
                    className={cn(
                      'flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between',
                      isProcessing && 'opacity-50'
                    )}
                    data-testid={`pending-leave-${leave.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">
                          {leave.employeeName}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            leaveTypeColors[leave.type] ?? leaveTypeColors.OTHER
                          )}
                        >
                          {leaveTypeLabels[leave.type] ?? leave.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDateRange(leave.startDate, leave.endDate)}
                      </p>
                    </div>

                    {/* Actions */}
                    {(onApprove || onReject) && (
                      <div className="flex gap-2">
                        {onApprove && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleApprove(leave.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <svg
                                className="h-4 w-4 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            ) : (
                              'Approuver'
                            )}
                          </Button>
                        )}
                        {onReject && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleReject(leave.id)}
                            disabled={isProcessing}
                          >
                            Refuser
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Lien vers toutes les demandes */}
            {pendingLeaves.length > 5 && (
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/app/dashboard/leaves?status=PENDING">
                    Voir toutes les demandes ({pendingLeaves.length})
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

export default ManagerPendingLeaves
