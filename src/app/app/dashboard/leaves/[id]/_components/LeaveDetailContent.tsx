/**
 * LeaveDetailContent - Client Component pour la page détail congé
 *
 * @description Affiche les détails, timeline et actions RBAC
 * @ticket SP-414
 */

'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { LeaveRequest, UserRole } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  ChevronRight,
  ArrowLeft,
  Ban,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  LeaveDetailCard,
  LeaveTimeline,
  LeaveStatusBadge,
  LeaveReviewDialog,
  type TimelineEvent,
} from '@/components/leaves'
import { cancelLeaveRequest } from '@/lib/actions/leaves'

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
  }
}

interface LeaveDetailContentProps {
  request: LeaveRequestWithEmployee
  timelineEvents: TimelineEvent[]
  currentUser: {
    id: string
    role: UserRole
  }
}

export function LeaveDetailContent({
  request,
  timelineEvents,
  currentUser,
}: LeaveDetailContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  const isOwner = request.employee.id === currentUser.id
  const canCancel = isOwner && request.status === 'PENDING'
  const canReview =
    request.status === 'PENDING' &&
    ['MANAGER', 'DIRECTOR', 'SYSTEM_ADMIN'].includes(currentUser.role)

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelLeaveRequest(request.id)
      if (result.success) {
        toast.success('Demande annulée avec succès')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleReviewSuccess = () => {
    setReviewDialogOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/app/dashboard/leaves"
          className="transition-colors hover:text-foreground"
        >
          Congés
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Détail de la demande</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Demande de {request.employee.firstName}{' '}
              {request.employee.lastName}
            </h1>
            <LeaveStatusBadge status={request.status} />
          </div>
          <p className="text-muted-foreground">
            Créée le{' '}
            {new Date(request.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/app/dashboard/leaves">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending}>
                  <Ban className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirmer l&apos;annulation
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir annuler cette demande de congé ?
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Non, garder</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    Oui, annuler
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canReview && (
            <>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => setReviewDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Refuser
              </Button>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setReviewDialogOpen(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approuver
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale - Détails */}
        <div className="space-y-6 lg:col-span-2">
          <LeaveDetailCard request={request} />

          {/* Infos employé */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nom</span>
                <span className="font-medium">
                  {request.employee.firstName} {request.employee.lastName}
                </span>
              </div>
              {request.employee.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium">{request.employee.email}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaveTimeline events={timelineEvents} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de review */}
      {canReview && (
        <LeaveReviewDialog
          request={request}
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}
