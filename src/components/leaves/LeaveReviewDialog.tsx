'use client'

import type { LeaveRequest, LeaveRequestStatus } from '@prisma/client'
import { useState, useCallback } from 'react'
import { reviewLeaveRequest } from '@/lib/actions/leaves'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { LeaveTypeBadge } from './LeaveTypeBadge'
import { CheckCircle, XCircle } from 'lucide-react'

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
  }
}

interface LeaveReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: LeaveRequestWithEmployee
  onSuccess?: () => void
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function LeaveReviewDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: LeaveReviewDialogProps) {
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState('')

  const action = useCallback(
    (data: { status: LeaveRequestStatus; reviewComment?: string }) =>
      reviewLeaveRequest(request.id, data),
    [request.id]
  )

  const { mutate, isPending } = useCrudMutation(action, {
    successMessage: 'Demande traitée',
    onSuccess: () => {
      onOpenChange(false)
      setComment('')
      onSuccess?.()
    },
  })

  const handleApprove = () => {
    setCommentError('')
    void mutate({
      status: 'APPROVED' as LeaveRequestStatus,
      reviewComment: comment || undefined,
    })
  }

  const handleReject = () => {
    if (!comment.trim()) {
      setCommentError('Un commentaire est obligatoire en cas de refus')
      return
    }
    setCommentError('')
    void mutate({
      status: 'REJECTED' as LeaveRequestStatus,
      reviewComment: comment,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Examiner la demande</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {request.employee.firstName} {request.employee.lastName}
            </span>
            <LeaveTypeBadge type={request.type} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground">
            {dateFormatter.format(new Date(request.startDate))} –{' '}
            {dateFormatter.format(new Date(request.endDate))} ({request.days}{' '}
            jour{request.days > 1 ? 's' : ''})
          </p>
          {request.reason && (
            <p className="text-sm text-muted-foreground">
              Motif : {request.reason}
            </p>
          )}

          <div>
            <label
              htmlFor="review-comment"
              className="mb-1 block text-sm font-medium"
            >
              Commentaire
            </label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              data-testid="review-comment"
            />
            {commentError && (
              <p className="mt-1 text-sm text-destructive">{commentError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isPending}
            data-testid="reject-button"
          >
            <XCircle className="mr-1 h-4 w-4" />
            Refuser
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
            data-testid="approve-button"
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Approuver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
