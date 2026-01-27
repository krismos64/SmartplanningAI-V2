/**
 * Tests unitaires pour generateScheduleExcel
 *
 * @ticket SP-404
 */

import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import {
  generateScheduleExcel,
  type ScheduleForExcel,
} from '../generateScheduleExcel'

const mockSchedules: ScheduleForExcel[] = [
  {
    id: '1',
    startDate: new Date('2026-01-27'),
    endDate: new Date('2026-01-27'),
    startTime: '09:00',
    endTime: '17:00',
    type: 'WORK',
    status: 'CONFIRMED',
    title: 'Shift matin',
    description: null,
    location: 'Bureau A',
    employee: { firstName: 'Jean', lastName: 'Dupont', weeklyHours: 35 },
    team: { name: 'Équipe A' },
  },
  {
    id: '2',
    startDate: new Date('2026-01-27'),
    endDate: new Date('2026-01-27'),
    startTime: '14:00',
    endTime: '18:00',
    type: 'MEETING',
    status: 'CONFIRMED',
    title: 'Réunion',
    description: 'Réunion hebdomadaire',
    location: 'Salle B',
    employee: { firstName: 'Marie', lastName: 'Martin', weeklyHours: 35 },
    team: { name: 'Équipe B' },
  },
]

const defaultOptions = {
  schedules: mockSchedules,
  period: { start: new Date('2026-01-27'), end: new Date('2026-02-02') },
  companyName: 'Test Company',
}

describe('generateScheduleExcel', () => {
  it('genere un buffer Excel valide', () => {
    const buffer = generateScheduleExcel(defaultOptions)
    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('contient 3 feuilles (Planning, Résumé, Statistiques)', () => {
    const buffer = generateScheduleExcel(defaultOptions)
    const wb = XLSX.read(buffer, { type: 'buffer' })
    expect(wb.SheetNames).toEqual(['Planning', 'Résumé', 'Statistiques'])
  })

  it('a les bonnes colonnes dans la feuille Planning', () => {
    const buffer = generateScheduleExcel(defaultOptions)
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets['Planning']!
    const data: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

    expect(data[0]).toContain('Employé')
    expect(data[0]).toContain('Date')
    expect(data[0]).toContain('Début')
    expect(data[0]).toContain('Fin')
    expect(data[0]).toContain('Durée (h)')
    expect(data[0]).toContain('Type')
    expect(data[0]).toContain('Statut')
  })

  it('calcule correctement les durées', () => {
    const buffer = generateScheduleExcel(defaultOptions)
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets['Planning']!
    const data: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws)

    // Jean: 09:00-17:00 = 8h
    expect(data[0]?.['Durée (h)']).toBe(8)
    // Marie: 14:00-18:00 = 4h
    expect(data[1]?.['Durée (h)']).toBe(4)
  })

  it('gere une liste vide de schedules', () => {
    const buffer = generateScheduleExcel({
      ...defaultOptions,
      schedules: [],
    })

    expect(buffer).toBeInstanceOf(Buffer)

    const wb = XLSX.read(buffer, { type: 'buffer' })
    expect(wb.SheetNames).toHaveLength(3)
  })

  it('inclut les statistiques correctes', () => {
    const buffer = generateScheduleExcel(defaultOptions)
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets['Statistiques']!
    const data: (string | number)[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
    })

    const totalShiftsRow = data.find((row) => row[0] === 'Total shifts')
    expect(totalShiftsRow?.[1]).toBe(2)

    const totalHoursRow = data.find((row) => row[0] === 'Total heures')
    expect(totalHoursRow?.[1]).toBe(12)
  })

  it('genere le resume par employe avec heures par type', () => {
    const buffer = generateScheduleExcel(defaultOptions)
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets['Résumé']!
    const data: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws)

    expect(data).toHaveLength(2)

    const dupont = data.find(
      (r) => typeof r['Employé'] === 'string' && r['Employé'].includes('Dupont')
    )
    expect(dupont?.['Total heures']).toBe(8)
    expect(dupont?.['Travail']).toBe(8)

    const martin = data.find(
      (r) => typeof r['Employé'] === 'string' && r['Employé'].includes('Martin')
    )
    expect(martin?.['Total heures']).toBe(4)
    expect(martin?.['Réunion']).toBe(4)
  })
})
