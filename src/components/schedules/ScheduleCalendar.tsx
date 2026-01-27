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
import { Skeleton } from '@/components/ui/skeleton'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'

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

  // Desktop : Schedule-X calendar
  // Mobile/Tablet : Cards view
  return isDesktop ? (
    <ScheduleCalendarDesktop {...props} />
  ) : (
    <ScheduleCalendarMobile {...props} />
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
