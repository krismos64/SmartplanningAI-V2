/**
 * Tests unitaires pour SchedulePdfDocument
 *
 * @ticket SP-403
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import {
  SchedulePdfDocument,
  type ScheduleForPdf,
} from '../SchedulePdfDocument'

// Cast helper pour contourner l'incompatibilité de types React 19 / @react-pdf
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
const render = (el: React.ReactElement) => renderToBuffer(el as any)

// Helper pour créer un schedule de test
function makeSchedule(
  overrides: Omit<Partial<ScheduleForPdf>, 'employee'> & {
    employee?: Partial<ScheduleForPdf['employee']>
  } = {}
): ScheduleForPdf {
  const { employee: empOverrides, ...rest } = overrides
  return {
    id: `sched-${Math.random().toString(36).slice(2, 8)}`,
    startDate: new Date('2026-01-26'),
    endDate: new Date('2026-01-26'),
    startTime: '09:00',
    endTime: '17:00',
    type: 'WORK',
    title: null,
    employee: {
      id: 'emp-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      weeklyHours: 35,
      ...empOverrides,
    },
    ...rest,
  }
}

const defaultProps = {
  period: {
    start: new Date('2026-01-26'),
    end: new Date('2026-02-01'),
  },
  viewMode: 'week' as const,
  companyName: 'Acme Corp',
  generatedAt: new Date('2026-01-27T10:00:00'),
}

describe('SchedulePdfDocument', () => {
  it('genere un buffer PDF valide', async () => {
    const buffer = await render(
      React.createElement(SchedulePdfDocument, {
        ...defaultProps,
        schedules: [makeSchedule()],
      })
    )
    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('le buffer commence par le header %PDF-', async () => {
    const buffer = await render(
      React.createElement(SchedulePdfDocument, {
        ...defaultProps,
        schedules: [makeSchedule()],
      })
    )
    const header = buffer.subarray(0, 5).toString('ascii')
    expect(header).toBe('%PDF-')
  })

  it('genere un PDF avec une liste vide', async () => {
    const buffer = await render(
      React.createElement(SchedulePdfDocument, {
        ...defaultProps,
        schedules: [],
      })
    )
    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('genere un PDF en vue mois', async () => {
    const buffer = await render(
      React.createElement(SchedulePdfDocument, {
        ...defaultProps,
        viewMode: 'month',
        period: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-31'),
        },
        schedules: [makeSchedule()],
      })
    )
    const header = buffer.subarray(0, 5).toString('ascii')
    expect(header).toBe('%PDF-')
  })

  it('genere un PDF avec plusieurs employes', async () => {
    const schedules = [
      makeSchedule({
        employee: { id: 'e1', firstName: 'Alice', lastName: 'Martin' },
      }),
      makeSchedule({
        employee: { id: 'e2', firstName: 'Bob', lastName: 'Durand' },
      }),
      makeSchedule({
        employee: { id: 'e3', firstName: 'Claire', lastName: 'Bernard' },
      }),
    ]
    const buffer = await render(
      React.createElement(SchedulePdfDocument, {
        ...defaultProps,
        schedules,
      })
    )
    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('supporte les 7 types de shift', async () => {
    const types = [
      'WORK',
      'MEETING',
      'BREAK',
      'TRAINING',
      'REMOTE',
      'ON_CALL',
      'OVERTIME',
    ] as const
    const schedules = types.map((type, i) =>
      makeSchedule({
        type,
        employee: {
          id: `e-${i}`,
          firstName: `Prenom${i}`,
          lastName: `Nom${i}`,
        },
      })
    )
    const buffer = await render(
      React.createElement(SchedulePdfDocument, {
        ...defaultProps,
        schedules,
      })
    )
    const header = buffer.subarray(0, 5).toString('ascii')
    expect(header).toBe('%PDF-')
    expect(buffer.length).toBeGreaterThan(100)
  })
})
