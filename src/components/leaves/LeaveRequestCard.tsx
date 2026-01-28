'use client'

import type { LeaveRequest, LeaveRequestStatus, UserRole } from '@prisma/client'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LeaveTypeBadge } from './LeaveTypeBadge'
import { LeaveStatusBadge } from './LeaveStatusBadge'
import { Pencil, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
  }
}

interface LeaveRequestCardProps {
  request: LeaveRequestWithEmployee
  currentUserRole: UserRole
  currentUserId: string
  onEdit?: (id: string) => void
  onCancel?: (id: string) => void
  onReview?: (id: string) => void
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function LeaveRequestCard({
  request,
  currentUserRole,
  currentUserId,
  onEdit,
  onCancel,
  onReview,
  className,
}: LeaveRequestCardProps) {
  const isOwner = request.employee.id === currentUserId
  const isPending = request.status === ('PENDING' as LeaveRequestStatus)
  const isCancelled = request.status === ('CANCELLED' as LeaveRequestStatus)
  const canManage =
    currentUserRole === 'MANAGER' ||
    currentUserRole === 'DIRECTOR' ||
    currentUserRole === 'SYSTEM_ADMIN'

  const showEdit = isOwner && isPending && onEdit
  const showCancel = isOwner && isPending && onCancel
  const showReview = canManage && isPending && onReview

  return (
    <Card
      className={cn(className)}
      data-testid={`leave-request-card-${request.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <LeaveTypeBadge type={request.type} size="sm" />
        <LeaveStatusBadge status={request.status} size="sm" />
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          <span className="font-medium">
            {request.employee.firstName} {request.employee.lastName}
          </span>
        </p>
        <p className="text-muted-foreground">
          {dateFormatter.format(new Date(request.startDate))} –{' '}
          {dateFormatter.format(new Date(request.endDate))}
        </p>
        <p className="text-muted-foreground">
          {request.days} jour{request.days > 1 ? 's' : ''}
          {request.halfDay ? ' (demi-journée)' : ''}
        </p>
        {request.reason && (
          <p className="text-muted-foreground">{request.reason}</p>
        )}
      </CardContent>
      {!isCancelled && (showEdit || showCancel || showReview) && (
        <CardFooter className="gap-2 pt-0">
          {showEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(request.id)}
            >
              <Pencil className="mr-1 h-3 w-3" />
              Modifier
            </Button>
          )}
          {showCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(request.id)}
            >
              <X className="mr-1 h-3 w-3" />
              Annuler
            </Button>
          )}
          {showReview && (
            <Button size="sm" onClick={() => onReview(request.id)}>
              <CheckCircle className="mr-1 h-3 w-3" />
              Examiner
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
