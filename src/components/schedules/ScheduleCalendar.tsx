/**
 * Composant ScheduleCalendar - Calendrier responsive
 *
 * @description Calendrier avec Schedule-X sur desktop et vue cards sur mobile
 * Desktop (≥768px) : Schedule-X avec vues jour/semaine/mois
 * Mobile (<768px) : Cards empilées verticalement (pas de scroll horizontal)
 *
 * @ticket SP-396
 */

'use client'

import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/hooks'
import { ScheduleWithRelations } from '@/lib/actions/schedules'
import { ScheduleCalendarDesktop } from './ScheduleCalendarDesktop'
import { ScheduleCalendarMobile } from './ScheduleCalendarMobile'
import { WeeklyGridView } from './WeeklyGridView'
import { Skeleton } from '@/components/ui/skeleton'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'
import type { LeaveRequestWithEmployee } from '@/lib/actions/leaves'

// ============================================================================
// Types
// ============================================================================

export interface ScheduleCalendarProps {
  /** Liste des schedules à afficher */
  schedules: ScheduleWithRelations[]
  /** Mode de vue actuel */
  viewMode: 'day' | 'week' | 'month'
  /** Date courante du calendrier */
  currentDate: Date
  /** Callback au clic sur un schedule */
  onScheduleClick?: (schedule: ScheduleWithRelations) => void
  /** Callback lors de la mise à jour d'un schedule (drag & drop) */
  onScheduleUpdate?: (id: string, startDate: Date, endDate: Date) => void
  /** Callback lors du changement de date */
  onDateChange?: (date: Date) => void
  /** État de chargement */
  isLoading?: boolean
  /** Autorise l'édition (drag & drop) */
  canEdit?: boolean
  /** Indisponibilités à afficher en overlay (SP-402) */
  availabilities?: AvailabilityWithEmployee[]
  /** Afficher les indisponibilités (SP-402) */
  showAvailabilities?: boolean
  /** Callback au clic sur une indisponibilité (SP-402) */
  onAvailabilityClick?: (availability: AvailabilityWithEmployee) => void
  /** Congés approuvés à afficher en overlay (SP-415) */
  leaveRequests?: LeaveRequestWithEmployee[]
  /** Afficher les congés (SP-415) */
  showLeaves?: boolean
  /** Callback au clic sur un congé (SP-415) */
  onLeaveClick?: (leave: LeaveRequestWithEmployee) => void
  /** Callback quand Schedule-X change de période (navigation interne) */
  onRangeChange?: (start: Date, end: Date) => void
  /** IDs des équipes pour charger les congés (vue grille) */
  teamIds?: string[]
  /** ID entreprise */
  companyId?: string
}

// ============================================================================
// Composant principal
// ============================================================================

export function ScheduleCalendar(props: ScheduleCalendarProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [mounted, setMounted] = useState(false)

  // Éviter l'hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Afficher skeleton pendant le montage
  if (!mounted) {
    return <ScheduleCalendarSkeleton />
  }

  // Desktop : vue grille pour semaine, Schedule-X pour jour/mois
  // Mobile : vue jour par jour
  return (
    <div data-testid="schedule-calendar">
      {!isDesktop ? (
        <ScheduleCalendarMobile {...props} />
      ) : props.viewMode === 'week' ? (
        <WeeklyGridView
          schedules={props.schedules}
          currentDate={props.currentDate}
          onScheduleClick={props.onScheduleClick}
          onRangeChange={props.onRangeChange}
          canEdit={props.canEdit}
          isLoading={props.isLoading}
          teamIds={props.teamIds}
        />
      ) : (
        <ScheduleCalendarDesktop {...props} />
      )}
    </div>
  )
}

// ============================================================================
// Skeleton de chargement
// ============================================================================

function ScheduleCalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="h-12 rounded bg-muted" />

      {/* Grid skeleton pour desktop */}
      <div className="hidden grid-cols-7 gap-2 md:grid">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-32 w-full rounded" />
          </div>
        ))}
      </div>

      {/* Cards skeleton pour mobile */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-8 w-40 rounded" />
            <Skeleton className="h-24 w-full rounded" />
            <Skeleton className="h-24 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
