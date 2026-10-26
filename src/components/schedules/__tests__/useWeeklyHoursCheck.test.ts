/**
 * @ticket SP-615
 * @description Le hook additionne les créneaux déjà posés, lus par
 * getSchedules, et ceux du formulaire. Cas réel : Patisserie CARL, 22/10/2026.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const { mockGetSchedules } = vi.hoisted(() => ({ mockGetSchedules: vi.fn() }))

vi.mock('@/lib/actions/schedules', () => ({
  getSchedules: (params: unknown) =>
    mockGetSchedules(params) as Promise<unknown>,
}))

import { useWeeklyHoursCheck } from '../useWeeklyHoursCheck'

const CHARLOTTE = 'cl000000000000000000empl1'

/** Créneau déjà en base, à la forme de ScheduleWithRelations utile ici */
const existant = (id: string, iso: string) => ({
  id,
  employeeId: CHARLOTTE,
  startDate: new Date(`${iso}T00:00:00.000Z`),
  startTime: '08:30',
  endTime: '18:30',
  type: 'WORK',
})

const params = {
  employees: [{ id: CHARLOTTE, weeklyHours: 35 }],
  employeeIds: [CHARLOTTE],
  // Lundi 2 novembre 2026, minuit à Paris tel que l'envoie le navigateur
  startDate: new Date('2026-11-01T23:00:00.000Z'),
  endDate: new Date('2026-11-01T23:00:00.000Z'),
  startTime: '08:30',
  endTime: '18:30',
  type: 'WORK',
  recurrenceRule: null,
  enabled: true,
}

describe('useWeeklyHoursCheck', () => {
  beforeEach(() => {
    mockGetSchedules.mockReset()
  })

  it('signale 50 h pour un contrat de 35 h, créneaux existants compris', async () => {
    mockGetSchedules.mockResolvedValue({
      success: true,
      data: {
        schedules: ['2026-11-03', '2026-11-06', '2026-11-07', '2026-11-08'].map(
          (d, i) => existant(`s${i}`, d)
        ),
      },
    })

    const { result } = renderHook(() => useWeeklyHoursCheck(params))

    await waitFor(() => expect(result.current).toHaveLength(1))
    expect(result.current[0]).toMatchObject({
      employeeId: CHARLOTTE,
      totalHours: 50,
      contractHours: 35,
      exceedsLegal: true,
    })

    // La lecture couvre la semaine entière du créneau, du lundi au dimanche
    const call = mockGetSchedules.mock.calls[0] as [
      { startDate: Date; endDate: Date; employeeIds: string[] },
    ]
    expect(call[0].employeeIds).toEqual([CHARLOTTE])
    expect(call[0].startDate.toISOString()).toBe('2026-11-02T00:00:00.000Z')
    expect(call[0].endDate.toISOString()).toBe('2026-11-08T23:59:59.999Z')
  })

  it('en édition, ne compte pas deux fois le créneau modifié', async () => {
    mockGetSchedules.mockResolvedValue({
      success: true,
      data: {
        schedules: [
          existant('edite', '2026-11-02'),
          ...['2026-11-03', '2026-11-04'].map((d, i) => existant(`s${i}`, d)),
        ],
      },
    })

    const { result } = renderHook(() =>
      useWeeklyHoursCheck({ ...params, excludeScheduleId: 'edite' })
    )

    await waitFor(() => expect(mockGetSchedules).toHaveBeenCalled())
    // 3 créneaux de 10 h, le créneau édité compté une seule fois : 30 h
    await new Promise((r) => setTimeout(r, 20))
    expect(result.current).toEqual([])
  })

  it('désactivé, ne lit rien', async () => {
    renderHook(() => useWeeklyHoursCheck({ ...params, enabled: false }))
    await new Promise((r) => setTimeout(r, 400))
    expect(mockGetSchedules).not.toHaveBeenCalled()
  })
})
