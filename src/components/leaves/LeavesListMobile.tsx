'use client'

import type { LeaveRequest, LeaveRequestStatus, UserRole } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LeaveStatusBadge } from './LeaveStatusBadge'
import { LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS } from '@/lib/validations/leave'
import { Pencil, X, CheckCircle, Settings, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsImpersonating } from '@/hooks'

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
    user?: {
      image: string | null
    } | null
  }
}

interface LeavesListMobileProps {
  requests: LeaveRequestWithEmployee[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  onLoadMore?: () => void
  currentUserRole: UserRole
  currentUserId: string
  onReview?: (id: string) => void
  onEdit?: (id: string) => void
  onCancel?: (id: string) => void
  onManage?: (id: string) => void
  isLoading?: boolean
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
})

export function LeavesListMobile({
  requests,
  pagination,
  onLoadMore,
  currentUserRole,
  currentUserId,
  onReview,
  onEdit,
  onCancel,
  onManage,
  isLoading = false,
}: LeavesListMobileProps) {
  const hasMore = requests.length < pagination.total
  const isImpersonating = useIsImpersonating()

  if (requests.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Calendar className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm">Aucune demande de congé</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => {
        const isOwner = request.employee.id === currentUserId
        const isPending = request.status === ('PENDING' as LeaveRequestStatus)
        const isApproved = request.status === ('APPROVED' as LeaveRequestStatus)
        const isCancelled =
          request.status === ('CANCELLED' as LeaveRequestStatus)
        const canManage =
          currentUserRole === 'MANAGER' ||
          currentUserRole === 'DIRECTOR' ||
          currentUserRole === 'SYSTEM_ADMIN'

        const showEdit = isOwner && isPending && onEdit
        const showCancel = isOwner && (isPending || isApproved) && onCancel
        const showReview = canManage && isPending && onReview
        const showManage = canManage && isApproved && onManage
        const hasActions =
          !isCancelled && (showEdit || showCancel || showReview || showManage)

        const typeLabel = LEAVE_TYPE_LABELS[request.type]
        const typeColor = LEAVE_TYPE_COLORS[request.type]
        const employeeName = `${request.employee.firstName} ${request.employee.lastName}`
        const initials =
          `${request.employee.firstName?.[0] ?? ''}${request.employee.lastName?.[0] ?? ''}`.toUpperCase()

        return (
          <div
            key={request.id}
            className="rounded-lg border bg-card"
            data-testid={`leave-request-card-${request.id}`}
          >
            {/* Ligne principale */}
            <div className="flex items-center gap-3 p-3">
              {/* Avatar */}
              <Avatar className="h-9 w-9 flex-shrink-0">
                {request.employee.user?.image && (
                  <AvatarImage
                    src={request.employee.user.image}
                    alt={employeeName}
                  />
                )}
                <AvatarFallback className="text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {employeeName}
                  </span>
                  <LeaveStatusBadge status={request.status} size="sm" />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-medium',
                      typeColor
                    )}
                  >
                    {typeLabel}
                  </span>
                  <span>
                    {dateFormatter.format(new Date(request.startDate))} –{' '}
                    {dateFormatter.format(new Date(request.endDate))}
                  </span>
                  <span>
                    ({request.days}j{request.halfDay ? ' ½' : ''})
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {hasActions && (
              <div className="flex gap-1.5 border-t px-3 py-2">
                {showReview && (
                  <Button
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => onReview(request.id)}
                    disabled={isImpersonating}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Examiner
                  </Button>
                )}
                {showManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => onManage(request.id)}
                    disabled={isImpersonating}
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Gérer
                  </Button>
                )}
                {showEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onEdit(request.id)}
                    disabled={isImpersonating}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
                {showCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => onCancel(request.id)}
                    disabled={isImpersonating}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}

      {hasMore && onLoadMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onLoadMore}
          disabled={isLoading}
        >
          {isLoading ? 'Chargement...' : 'Voir plus'}
        </Button>
      )}

      {requests.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {requests.length} / {pagination.total} demande
          {pagination.total > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
