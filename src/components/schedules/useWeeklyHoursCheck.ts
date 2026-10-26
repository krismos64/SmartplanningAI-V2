/**
 * Hook useWeeklyHoursCheck : dépassements hebdomadaires d'un créneau en saisie
 *
 * @ticket SP-615
 * @description Additionne, pour chaque employé sélectionné, les créneaux déjà
 * posés et ceux que le formulaire va créer, récurrence comprise, semaine par
 * semaine. Signale les semaines au-delà du contrat ou des 48 h légales.
 * Avertissement seulement : la création n'est jamais bloquée.
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { getSchedules } from '@/lib/actions/schedules'
import {
  generateOccurrences,
  type RecurrenceRule,
} from '@/lib/utils/recurrence'
import {
  addCalendarDays,
  endOfCalendarDay,
  toCalendarDay,
} from '@/lib/utils/schedule-date'
import {
  findWeeklyHoursWarnings,
  weekStartOf,
  type ShiftForHours,
  type WeeklyHoursWarning,
} from '@/lib/utils/weekly-hours'

interface UseWeeklyHoursCheckParams {
  employees: { id: string; weeklyHours?: number }[]
  employeeIds: string[]
  startDate: Date | null
  endDate: Date | null
  startTime: string
  endTime: string
  type: string
  recurrenceRule: RecurrenceRule | null
  /** Créneau en cours d'édition, à ne pas compter deux fois */
  excludeScheduleId?: string
  enabled: boolean
}

export function useWeeklyHoursCheck({
  employees,
  employeeIds,
  startDate,
  endDate,
  startTime,
  endTime,
  type,
  recurrenceRule,
  excludeScheduleId,
  enabled,
}: UseWeeklyHoursCheckParams): WeeklyHoursWarning[] {
  // Créneaux que le formulaire va créer, en jours calendaires
  const planned = useMemo<ShiftForHours[]>(() => {
    if (!enabled || !startDate || !endDate || employeeIds.length === 0) {
      return []
    }
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return []
    const start = toCalendarDay(startDate)
    const end = toCalendarDay(endDate)
    const days = recurrenceRule
      ? generateOccurrences(start, end, recurrenceRule).map((o) => o.startDate)
      : [start]
    return employeeIds.flatMap((employeeId) =>
      days.map((day) => ({
        employeeId,
        startDate: day,
        startTime,
        endTime,
        type,
      }))
    )
  }, [
    enabled,
    startDate,
    endDate,
    employeeIds,
    recurrenceRule,
    startTime,
    endTime,
    type,
  ])

  // Semaines touchées, pour borner la lecture des créneaux existants
  const range = useMemo(() => {
    if (planned.length === 0) return null
    const times = planned.map((p) => weekStartOf(p.startDate).getTime())
    const from = new Date(Math.min(...times))
    const to = endOfCalendarDay(
      addCalendarDays(new Date(Math.max(...times)), 6)
    )
    return { from, to }
  }, [planned])

  const [existing, setExisting] = useState<ShiftForHours[]>([])
  const idsKey = employeeIds.join(',')
  const fromTime = range?.from.getTime()
  const toTime = range?.to.getTime()

  useEffect(() => {
    if (fromTime === undefined || toTime === undefined || !idsKey) {
      setExisting([])
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      void getSchedules({
        employeeIds: idsKey.split(','),
        startDate: new Date(fromTime),
        endDate: new Date(toTime),
        limit: 500,
      }).then((result) => {
        if (cancelled || !result.success) return
        setExisting(
          result.data.schedules
            .filter((s) => s.id !== excludeScheduleId)
            .map((s) => ({
              employeeId: s.employeeId,
              startDate: toCalendarDay(new Date(s.startDate)),
              startTime: s.startTime,
              endTime: s.endTime,
              type: s.type,
            }))
        )
      })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [idsKey, fromTime, toTime, excludeScheduleId])

  return useMemo(() => {
    if (planned.length === 0) return []
    const contracts = new Map<string, number>()
    for (const e of employees) {
      if (typeof e.weeklyHours === 'number') contracts.set(e.id, e.weeklyHours)
    }
    const plannedKeys = new Set(
      planned.map((p) => weekStartOf(p.startDate).getTime())
    )
    return findWeeklyHoursWarnings([...existing, ...planned], contracts).filter(
      (w) => plannedKeys.has(w.weekStart.getTime())
    )
  }, [planned, existing, employees])
}
