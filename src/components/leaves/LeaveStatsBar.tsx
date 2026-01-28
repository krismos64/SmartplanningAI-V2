'use client'

import { LeaveRequestStatus } from '@prisma/client'
import { Clock, CheckCircle, XCircle, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaveStatsBarProps {
  stats: {
    pending: number
    approved: number
    rejected: number
    cancelled: number
  }
  onStatClick?: (status: LeaveRequestStatus) => void
  activeStatus?: LeaveRequestStatus | null
  className?: string
}

const STAT_CONFIG = [
  {
    status: 'PENDING' as LeaveRequestStatus,
    key: 'pending' as const,
    label: 'En attente',
    icon: Clock,
    colorClass: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    activeClass: 'ring-2 ring-yellow-500',
  },
  {
    status: 'APPROVED' as LeaveRequestStatus,
    key: 'approved' as const,
    label: 'Approuvés',
    icon: CheckCircle,
    colorClass: 'bg-green-100 text-green-800 hover:bg-green-200',
    activeClass: 'ring-2 ring-green-500',
  },
  {
    status: 'REJECTED' as LeaveRequestStatus,
    key: 'rejected' as const,
    label: 'Refusés',
    icon: XCircle,
    colorClass: 'bg-red-100 text-red-800 hover:bg-red-200',
    activeClass: 'ring-2 ring-red-500',
  },
  {
    status: 'CANCELLED' as LeaveRequestStatus,
    key: 'cancelled' as const,
    label: 'Annulés',
    icon: Ban,
    colorClass: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    activeClass: 'ring-2 ring-gray-500',
  },
]

export function LeaveStatsBar({
  stats,
  onStatClick,
  activeStatus,
  className,
}: LeaveStatsBarProps) {
  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Filtres rapides par statut"
    >
      {STAT_CONFIG.map(
        ({ status, key, label, icon: Icon, colorClass, activeClass }) => (
          <button
            key={status}
            type="button"
            onClick={() => onStatClick?.(status)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
              colorClass,
              onStatClick && 'cursor-pointer',
              !onStatClick && 'cursor-default',
              activeStatus === status && activeClass
            )}
            aria-pressed={activeStatus === status}
            aria-label={`${label}: ${stats[key]}`}
          >
            <Icon className="h-4 w-4" />
            <span>{stats[key]}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      )}
    </div>
  )
}
