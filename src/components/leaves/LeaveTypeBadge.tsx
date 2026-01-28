'use client'

import type { LeaveType } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import {
  LEAVE_TYPE_LABELS,
  LEAVE_TYPE_COLORS,
  LEAVE_TYPE_ICONS,
} from '@/lib/validations/leave'
import {
  Palmtree,
  Clock,
  Stethoscope,
  CalendarOff,
  Heart,
  Baby,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Palmtree,
  Clock,
  Stethoscope,
  CalendarOff,
  Heart,
  Baby,
  CalendarDays,
}

interface LeaveTypeBadgeProps {
  type: LeaveType
  size?: 'default' | 'sm' | 'lg'
  showIcon?: boolean
}

export function LeaveTypeBadge({
  type,
  size = 'default',
  showIcon = true,
}: LeaveTypeBadgeProps) {
  const label = LEAVE_TYPE_LABELS[type]
  const colorClass = LEAVE_TYPE_COLORS[type]
  const iconName = LEAVE_TYPE_ICONS[type]
  const IconComponent = ICON_MAP[iconName]

  return (
    <Badge
      className={colorClass}
      size={size}
      icon={showIcon && IconComponent ? <IconComponent /> : undefined}
    >
      {label}
    </Badge>
  )
}
