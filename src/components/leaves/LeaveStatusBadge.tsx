'use client'

import type { LeaveRequestStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import {
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_COLORS,
} from '@/lib/validations/leave'
import { Clock, CheckCircle, XCircle, Ban } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const STATUS_ICONS: Record<LeaveRequestStatus, LucideIcon> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  CANCELLED: Ban,
}

interface LeaveStatusBadgeProps {
  status: LeaveRequestStatus
  size?: 'default' | 'sm' | 'lg'
}

export function LeaveStatusBadge({
  status,
  size = 'default',
}: LeaveStatusBadgeProps) {
  const label = LEAVE_STATUS_LABELS[status]
  const colorClass = LEAVE_STATUS_COLORS[status]
  const IconComponent = STATUS_ICONS[status]

  return (
    <Badge className={colorClass} size={size} icon={<IconComponent />}>
      {label}
    </Badge>
  )
}
