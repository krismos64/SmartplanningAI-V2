'use client'

import type { LeaveRequest, UserRole } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { LeaveRequestCard } from './LeaveRequestCard'

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
  isLoading?: boolean
}

export function LeavesListMobile({
  requests,
  pagination,
  onLoadMore,
  currentUserRole,
  currentUserId,
  onReview,
  onEdit,
  onCancel,
  isLoading = false,
}: LeavesListMobileProps) {
  const hasMore = requests.length < pagination.total

  return (
    <div className="space-y-3">
      {requests.length === 0 && !isLoading ? (
        <p className="py-8 text-center text-muted-foreground">
          Aucune demande de congé
        </p>
      ) : (
        requests.map((request) => (
          <LeaveRequestCard
            key={request.id}
            request={request}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onCancel={onCancel}
            onReview={onReview}
          />
        ))
      )}

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
        <p className="text-center text-sm text-muted-foreground">
          {requests.length} / {pagination.total} demandes
        </p>
      )}
    </div>
  )
}
