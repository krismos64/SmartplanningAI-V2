/**
 * Overlay pour afficher les indisponibilités sur Schedule-X
 *
 * @description Transforme les indisponibilités en background events Schedule-X
 * @ticket SP-402
 */

'use client'

import { useMemo } from 'react'
import { Temporal } from 'temporal-polyfill'
import { AvailabilityType } from '@prisma/client'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'

// ============================================================================
// Types
// ============================================================================

export interface ScheduleXBackgroundEvent {
  id: string
  title: string
  start: string
  end: string
  calendarId: string
  _customData?: {
    availability: AvailabilityWithEmployee
    isBackground: true
  }
}

export interface AvailabilityOverlayProps {
  availabilities: AvailabilityWithEmployee[]
  onAvailabilityClick?: (availability: AvailabilityWithEmployee) => void
}

// ============================================================================
// Configuration des couleurs pour Schedule-X calendars
// ============================================================================

export const AVAILABILITY_CALENDAR_CONFIG: Record<
  AvailabilityType,
  {
    lightColors: { main: string; container: string; onContainer: string }
    darkColors: { main: string; container: string; onContainer: string }
  }
> = {
  VACATION: {
    lightColors: {
      main: '#3b82f6',
      container: 'rgba(59, 130, 246, 0.15)',
      onContainer: '#1e40af',
    },
    darkColors: {
      main: '#60a5fa',
      container: 'rgba(59, 130, 246, 0.25)',
      onContainer: '#93c5fd',
    },
  },
  SICK: {
    lightColors: {
      main: '#ef4444',
      container: 'rgba(239, 68, 68, 0.15)',
      onContainer: '#991b1b',
    },
    darkColors: {
      main: '#f87171',
      container: 'rgba(239, 68, 68, 0.25)',
      onContainer: '#fca5a5',
    },
  },
  TRAINING: {
    lightColors: {
      main: '#8b5cf6',
      container: 'rgba(139, 92, 246, 0.12)',
      onContainer: '#5b21b6',
    },
    darkColors: {
      main: '#a78bfa',
      container: 'rgba(139, 92, 246, 0.20)',
      onContainer: '#c4b5fd',
    },
  },
  UNAVAILABLE: {
    lightColors: {
      main: '#6b7280',
      container: 'rgba(107, 114, 128, 0.15)',
      onContainer: '#374151',
    },
    darkColors: {
      main: '#9ca3af',
      container: 'rgba(107, 114, 128, 0.25)',
      onContainer: '#d1d5db',
    },
  },
  PREFERRED: {
    lightColors: {
      main: '#eab308',
      container: 'rgba(234, 179, 8, 0.10)',
      onContainer: '#854d0e',
    },
    darkColors: {
      main: '#facc15',
      container: 'rgba(234, 179, 8, 0.15)',
      onContainer: '#fde047',
    },
  },
  OTHER: {
    lightColors: {
      main: '#64748b',
      container: 'rgba(100, 116, 139, 0.12)',
      onContainer: '#334155',
    },
    darkColors: {
      main: '#94a3b8',
      container: 'rgba(100, 116, 139, 0.20)',
      onContainer: '#cbd5e1',
    },
  },
}

// ============================================================================
// Labels avec emojis
// ============================================================================

const TYPE_LABELS: Record<AvailabilityType, string> = {
  VACATION: '\u{1F3D6}\u{FE0F} Vacances',
  SICK: '\u{1F912} Maladie',
  TRAINING: '\u{1F4DA} Formation',
  UNAVAILABLE: '\u{26D4} Indisponible',
  PREFERRED: '\u{2B50} Preference',
  OTHER: '\u{1F4DD} Autre',
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Formate une date pour Schedule-X (format ISO avec timezone)
 */
function formatScheduleXDate(date: Date, time?: string | null): string {
  const plainDate = Temporal.PlainDate.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  })

  if (time) {
    const [hours, minutes] = time.split(':').map(Number)
    const plainTime = Temporal.PlainTime.from({
      hour: hours,
      minute: minutes,
    })
    const dateTime = plainDate.toPlainDateTime(plainTime)
    return dateTime.toZonedDateTime('Europe/Paris').toString()
  }

  // Par défaut, début de journée
  const dateTime = plainDate.toPlainDateTime({ hour: 0, minute: 0 })
  return dateTime.toZonedDateTime('Europe/Paris').toString()
}

/**
 * Formate l'heure de fin pour Schedule-X
 * Si pas d'heure de fin, utiliser 23:59 pour une journée complète
 */
function formatScheduleXEndDate(date: Date, time?: string | null): string {
  const plainDate = Temporal.PlainDate.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  })

  if (time) {
    const [hours, minutes] = time.split(':').map(Number)
    const plainTime = Temporal.PlainTime.from({
      hour: hours,
      minute: minutes,
    })
    const dateTime = plainDate.toPlainDateTime(plainTime)
    return dateTime.toZonedDateTime('Europe/Paris').toString()
  }

  // Par défaut, fin de journée
  const dateTime = plainDate.toPlainDateTime({ hour: 23, minute: 59 })
  return dateTime.toZonedDateTime('Europe/Paris').toString()
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Transforme les indisponibilités en background events pour Schedule-X
 */
export function useAvailabilityOverlayEvents(
  availabilities: AvailabilityWithEmployee[]
): ScheduleXBackgroundEvent[] {
  return useMemo(() => {
    return availabilities.map((avail) => {
      const employeeName = `${avail.employee.firstName} ${avail.employee.lastName}`
      const typeLabel = TYPE_LABELS[avail.type]

      return {
        id: `avail-${avail.id}`,
        title: `${employeeName} - ${typeLabel}`,
        start: formatScheduleXDate(avail.startDate, avail.startTime),
        end: formatScheduleXEndDate(avail.endDate, avail.endTime),
        calendarId: `availability-${avail.type.toLowerCase()}`,
        _customData: {
          availability: avail,
          isBackground: true as const,
        },
      }
    })
  }, [availabilities])
}

// ============================================================================
// Composant Overlay (alternative CSS)
// ============================================================================

export interface AvailabilityOverlayItemProps {
  availability: AvailabilityWithEmployee
  onClick?: (availability: AvailabilityWithEmployee) => void
  style?: React.CSSProperties
}

export function AvailabilityOverlayItem({
  availability,
  onClick,
  style,
}: AvailabilityOverlayItemProps) {
  const config = AVAILABILITY_CALENDAR_CONFIG[availability.type]
  const typeLabel = TYPE_LABELS[availability.type]
  const employeeName = `${availability.employee.firstName} ${availability.employee.lastName}`

  const handleClick = () => {
    onClick?.(availability)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(availability)
    }
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className="pointer-events-auto absolute inset-0 cursor-pointer transition-opacity hover:opacity-90"
      style={{
        backgroundColor: config.lightColors.container,
        borderLeft: `3px solid ${config.lightColors.main}`,
        ...style,
      }}
      aria-label={`${employeeName} - ${typeLabel}`}
    >
      <div
        className="truncate p-1 text-xs font-medium"
        style={{ color: config.lightColors.onContainer }}
      >
        <span>{employeeName}</span>
        <span className="ml-1 opacity-75">{typeLabel}</span>
      </div>
    </div>
  )
}

// ============================================================================
// Export du composant principal
// ============================================================================

export function AvailabilityOverlay({
  availabilities: _availabilities,
  onAvailabilityClick: _onAvailabilityClick,
}: AvailabilityOverlayProps) {
  // Ce composant retourne null car l'intégration se fait au niveau de ScheduleCalendarDesktop
  // Le hook useAvailabilityOverlayEvents est exporté pour utilisation directe
  // Il est gardé pour une utilisation potentielle future avec un layer CSS custom
  return null
}

// Export pour utilisation dans ScheduleCalendarDesktop
export { formatScheduleXDate, formatScheduleXEndDate }
