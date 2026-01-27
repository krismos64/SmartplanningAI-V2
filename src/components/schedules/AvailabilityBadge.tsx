/**
 * Badge compact pour afficher une indisponibilité
 *
 * @description Badge avec emoji et nom pour affichage mobile/compact
 * @ticket SP-402
 */

'use client'

import { cn } from '@/lib/utils'
import { AvailabilityType } from '@prisma/client'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'

// ============================================================================
// Configuration des types
// ============================================================================

export const AVAILABILITY_TYPE_CONFIG: Record<
  AvailabilityType,
  {
    emoji: string
    label: string
    bgColor: string
    textColor: string
    borderColor: string
  }
> = {
  VACATION: {
    emoji: '\u{1F3D6}\u{FE0F}',
    label: 'Vacances',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  SICK: {
    emoji: '\u{1F912}',
    label: 'Maladie',
    bgColor: 'bg-red-100 dark:bg-red-900/40',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-300 dark:border-red-700',
  },
  TRAINING: {
    emoji: '\u{1F4DA}',
    label: 'Formation',
    bgColor: 'bg-violet-100 dark:bg-violet-900/40',
    textColor: 'text-violet-700 dark:text-violet-300',
    borderColor: 'border-violet-300 dark:border-violet-700',
  },
  UNAVAILABLE: {
    emoji: '\u{26D4}',
    label: 'Indisponible',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-300 dark:border-gray-600',
  },
  PREFERRED: {
    emoji: '\u{2B50}',
    label: 'Preference',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/40',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
  },
  OTHER: {
    emoji: '\u{1F4DD}',
    label: 'Autre',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-300 dark:border-slate-600',
  },
}

// Types "hard" (bloquants)
export const HARD_AVAILABILITY_TYPES: AvailabilityType[] = [
  'VACATION',
  'SICK',
  'UNAVAILABLE',
]

// ============================================================================
// Types
// ============================================================================

export interface AvailabilityBadgeProps {
  availability: AvailabilityWithEmployee
  onClick?: (availability: AvailabilityWithEmployee) => void
  compact?: boolean
  showEmployee?: boolean
  className?: string
}

// ============================================================================
// Composant
// ============================================================================

export function AvailabilityBadge({
  availability,
  onClick,
  compact = false,
  showEmployee = true,
  className,
}: AvailabilityBadgeProps) {
  const config = AVAILABILITY_TYPE_CONFIG[availability.type]
  const isHard = HARD_AVAILABILITY_TYPES.includes(availability.type)

  const handleClick = () => {
    onClick?.(availability)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(availability)
    }
  }

  const employeeName = showEmployee
    ? `${availability.employee.firstName} ${availability.employee.lastName}`
    : null

  if (compact) {
    return (
      <span
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick ? handleClick : undefined}
        onKeyDown={onClick ? handleKeyDown : undefined}
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border',
          config.bgColor,
          config.textColor,
          config.borderColor,
          onClick && 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1',
          isHard && 'ring-1 ring-red-400/50',
          className
        )}
        aria-label={`${config.label}${employeeName ? ` - ${employeeName}` : ''}`}
      >
        <span aria-hidden="true">{config.emoji}</span>
        {employeeName && (
          <span className="truncate max-w-[80px]">{employeeName}</span>
        )}
      </span>
    )
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded-md border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        onClick && 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1',
        isHard && 'ring-1 ring-red-400/50',
        className
      )}
      aria-label={`${config.label}${employeeName ? ` - ${employeeName}` : ''}`}
    >
      <span className="text-base" aria-hidden="true">
        {config.emoji}
      </span>
      <div className="flex flex-col min-w-0">
        {employeeName && (
          <span className="text-sm font-medium truncate">{employeeName}</span>
        )}
        <span className="text-xs opacity-75">{config.label}</span>
      </div>
    </div>
  )
}
