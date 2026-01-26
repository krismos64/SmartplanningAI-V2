/**
 * Tests unitaires pour les schemas de validation Schedule
 *
 * @ticket SP-393
 */

import { describe, it, expect } from 'vitest'
import {
  recurrenceRuleSchema,
  createScheduleSchema,
  updateScheduleSchema,
  scheduleFiltersSchema,
  scheduleTypeLabels,
  scheduleStatusLabels,
  recurrenceFrequencyLabels,
} from '../schedule'
import { timeSchema } from '../common'
import { ScheduleType, ScheduleStatus } from '@prisma/client'

// ============================================================================
// timeSchema
// ============================================================================

describe('timeSchema', () => {
  describe('formats valides', () => {
    it('accepte 09:00', () => {
      expect(timeSchema.safeParse('09:00').success).toBe(true)
    })

    it('accepte 9:00 (sans zero)', () => {
      expect(timeSchema.safeParse('9:00').success).toBe(true)
    })

    it('accepte 14:30', () => {
      expect(timeSchema.safeParse('14:30').success).toBe(true)
    })

    it('accepte 23:59', () => {
      expect(timeSchema.safeParse('23:59').success).toBe(true)
    })

    it('accepte 00:00', () => {
      expect(timeSchema.safeParse('00:00').success).toBe(true)
    })

    it('accepte 0:00', () => {
      expect(timeSchema.safeParse('0:00').success).toBe(true)
    })
  })

  describe('formats invalides', () => {
    it('rejette 25:00 (heure > 23)', () => {
      const result = timeSchema.safeParse('25:00')
      expect(result.success).toBe(false)
    })

    it('rejette 09:60 (minutes > 59)', () => {
      const result = timeSchema.safeParse('09:60')
      expect(result.success).toBe(false)
    })

    it('rejette "invalid"', () => {
      const result = timeSchema.safeParse('invalid')
      expect(result.success).toBe(false)
    })

    it('rejette chaine vide', () => {
      const result = timeSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('rejette 9:0 (minutes incomplete)', () => {
      const result = timeSchema.safeParse('9:0')
      expect(result.success).toBe(false)
    })

    it('rejette 24:00', () => {
      const result = timeSchema.safeParse('24:00')
      expect(result.success).toBe(false)
    })
  })
})

// ============================================================================
// recurrenceRuleSchema
// ============================================================================

describe('recurrenceRuleSchema', () => {
  describe('regles valides', () => {
    it('accepte une regle avec endDate', () => {
      const result = recurrenceRuleSchema.safeParse({
        frequency: 'WEEKLY',
        interval: 1,
        endDate: new Date('2026-12-31'),
      })
      expect(result.success).toBe(true)
    })

    it('accepte une regle avec occurrences', () => {
      const result = recurrenceRuleSchema.safeParse({
        frequency: 'DAILY',
        occurrences: 10,
      })
      expect(result.success).toBe(true)
    })

    it('accepte une regle avec daysOfWeek', () => {
      const result = recurrenceRuleSchema.safeParse({
        frequency: 'WEEKLY',
        daysOfWeek: [1, 2, 3, 4, 5], // Lundi-Vendredi
        occurrences: 12,
      })
      expect(result.success).toBe(true)
    })

    it('accepte toutes les frequences', () => {
      const frequencies = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']
      frequencies.forEach((frequency) => {
        const result = recurrenceRuleSchema.safeParse({
          frequency,
          occurrences: 5,
        })
        expect(result.success).toBe(true)
      })
    })

    it('applique interval par defaut a 1', () => {
      const result = recurrenceRuleSchema.parse({
        frequency: 'WEEKLY',
        occurrences: 5,
      })
      expect(result.interval).toBe(1)
    })
  })

  describe('regles invalides', () => {
    it('rejette sans endDate ni occurrences', () => {
      const result = recurrenceRuleSchema.safeParse({
        frequency: 'WEEKLY',
      })
      expect(result.success).toBe(false)
      if (!result.success && result.error.issues.length > 0) {
        expect(result.error.issues[0]?.message).toContain('date de fin')
      }
    })

    it('rejette frequence invalide', () => {
      const result = recurrenceRuleSchema.safeParse({
        frequency: 'INVALID',
        occurrences: 5,
      })
      expect(result.success).toBe(false)
    })

    it('rejette interval > 12', () => {
      const result = recurrenceRuleSchema.safeParse({
        frequency: 'WEEKLY',
        interval: 13,
        occurrences: 5,
      })
      expect(result.success).toBe(false)
    })

    it('rejette occurrences > 52', () => {
      const result = recurrenceRuleSchema.safeParse({
        frequency: 'WEEKLY',
        occurrences: 53,
      })
      expect(result.success).toBe(false)
    })

    it('rejette daysOfWeek avec jour invalide', () => {
      const result = recurrenceRuleSchema.safeParse({
        frequency: 'WEEKLY',
        daysOfWeek: [1, 7], // 7 est invalide
        occurrences: 5,
      })
      expect(result.success).toBe(false)
    })
  })
})

// ============================================================================
// createScheduleSchema
// ============================================================================

describe('createScheduleSchema', () => {
  const validSchedule = {
    employeeId: 'clxxxxxxxxxxxxxxxxxx1',
    companyId: 'clxxxxxxxxxxxxxxxxxx2',
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-02-01'),
    startTime: '09:00',
    endTime: '17:00',
  }

  describe('schedules valides', () => {
    it('accepte un schedule minimal valide', () => {
      const result = createScheduleSchema.safeParse(validSchedule)
      expect(result.success).toBe(true)
    })

    it('accepte un schedule avec tous les champs', () => {
      const result = createScheduleSchema.safeParse({
        ...validSchedule,
        teamId: 'clxxxxxxxxxxxxxxxxxx3',
        title: 'Reunion equipe',
        description: 'Reunion hebdomadaire',
        location: 'Salle A',
        color: '#3B82F6',
        type: 'MEETING',
        status: 'CONFIRMED',
      })
      expect(result.success).toBe(true)
    })

    it('accepte multi-employes avec employeeIds', () => {
      const result = createScheduleSchema.safeParse({
        ...validSchedule,
        employeeId: undefined,
        employeeIds: ['clxxxxxxxxxxxxxxxxxx1', 'clxxxxxxxxxxxxxxxxxx3'],
      })
      expect(result.success).toBe(true)
    })

    it('accepte un schedule recurrent valide', () => {
      const result = createScheduleSchema.safeParse({
        ...validSchedule,
        isRecurring: true,
        recurrenceRule: {
          frequency: 'WEEKLY',
          daysOfWeek: [1, 2, 3, 4, 5],
          occurrences: 12,
        },
      })
      expect(result.success).toBe(true)
    })

    it('applique les valeurs par defaut', () => {
      const result = createScheduleSchema.parse(validSchedule)
      expect(result.type).toBe('WORK')
      expect(result.status).toBe('DRAFT')
      expect(result.isRecurring).toBe(false)
    })
  })

  describe('schedules invalides', () => {
    it('rejette si fin avant debut', () => {
      const result = createScheduleSchema.safeParse({
        ...validSchedule,
        startTime: '17:00',
        endTime: '09:00',
      })
      expect(result.success).toBe(false)
    })

    it('rejette si recurrent sans regle', () => {
      const result = createScheduleSchema.safeParse({
        ...validSchedule,
        isRecurring: true,
      })
      expect(result.success).toBe(false)
    })

    it('rejette sans employeeId ni employeeIds', () => {
      const result = createScheduleSchema.safeParse({
        ...validSchedule,
        employeeId: undefined,
      })
      expect(result.success).toBe(false)
    })

    it('rejette employeeId invalide', () => {
      const result = createScheduleSchema.safeParse({
        ...validSchedule,
        employeeId: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('rejette titre trop long', () => {
      const result = createScheduleSchema.safeParse({
        ...validSchedule,
        title: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
    })

    it('rejette couleur invalide', () => {
      const result = createScheduleSchema.safeParse({
        ...validSchedule,
        color: 'red',
      })
      expect(result.success).toBe(false)
    })
  })
})

// ============================================================================
// updateScheduleSchema
// ============================================================================

describe('updateScheduleSchema', () => {
  it('accepte une modification partielle', () => {
    const result = updateScheduleSchema.safeParse({
      id: 'clxxxxxxxxxxxxxxxxxx1',
      title: 'Nouveau titre',
    })
    expect(result.success).toBe(true)
  })

  it('requiert un ID valide', () => {
    const result = updateScheduleSchema.safeParse({
      title: 'Nouveau titre',
    })
    expect(result.success).toBe(false)
  })

  it('rejette ID invalide', () => {
    const result = updateScheduleSchema.safeParse({
      id: 'invalid',
      title: 'Nouveau titre',
    })
    expect(result.success).toBe(false)
  })

  it('valide les dates si toutes fournies', () => {
    const result = updateScheduleSchema.safeParse({
      id: 'clxxxxxxxxxxxxxxxxxx1',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-01'),
      startTime: '17:00',
      endTime: '09:00', // Invalide
    })
    expect(result.success).toBe(false)
  })

  it('accepte dates partielles', () => {
    const result = updateScheduleSchema.safeParse({
      id: 'clxxxxxxxxxxxxxxxxxx1',
      startTime: '10:00',
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// scheduleFiltersSchema
// ============================================================================

describe('scheduleFiltersSchema', () => {
  it('applique les valeurs par defaut', () => {
    const result = scheduleFiltersSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sortBy).toBe('startDate')
    expect(result.sortOrder).toBe('asc')
  })

  it('accepte tous les filtres', () => {
    const result = scheduleFiltersSchema.safeParse({
      companyId: 'clxxxxxxxxxxxxxxxxxx1',
      employeeId: 'clxxxxxxxxxxxxxxxxxx2',
      teamId: 'clxxxxxxxxxxxxxxxxxx3',
      type: 'WORK',
      status: 'CONFIRMED',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      isRecurring: true,
      search: 'reunion',
      page: 2,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    expect(result.success).toBe(true)
  })

  it('accepte filtres par types multiples', () => {
    const result = scheduleFiltersSchema.safeParse({
      types: ['WORK', 'MEETING', 'REMOTE'],
    })
    expect(result.success).toBe(true)
  })

  it('rejette limit > 100', () => {
    const result = scheduleFiltersSchema.safeParse({
      limit: 101,
    })
    expect(result.success).toBe(false)
  })

  it('rejette page < 1', () => {
    const result = scheduleFiltersSchema.safeParse({
      page: 0,
    })
    expect(result.success).toBe(false)
  })

  it('convertit les dates string en Date', () => {
    const result = scheduleFiltersSchema.parse({
      startDate: '2026-02-01',
    })
    expect(result.startDate).toBeInstanceOf(Date)
  })
})

// ============================================================================
// Labels et options
// ============================================================================

describe('Labels francais', () => {
  it('scheduleTypeLabels contient tous les types', () => {
    const types: ScheduleType[] = [
      'WORK',
      'MEETING',
      'BREAK',
      'TRAINING',
      'REMOTE',
      'ON_CALL',
      'OVERTIME',
    ]
    types.forEach((type) => {
      expect(scheduleTypeLabels[type]).toBeDefined()
      expect(typeof scheduleTypeLabels[type]).toBe('string')
    })
  })

  it('scheduleStatusLabels contient tous les statuts', () => {
    const statuses: ScheduleStatus[] = [
      'DRAFT',
      'CONFIRMED',
      'CANCELLED',
      'COMPLETED',
    ]
    statuses.forEach((status) => {
      expect(scheduleStatusLabels[status]).toBeDefined()
      expect(typeof scheduleStatusLabels[status]).toBe('string')
    })
  })

  it('recurrenceFrequencyLabels contient toutes les frequences', () => {
    const frequencies = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'] as const
    frequencies.forEach((freq) => {
      expect(recurrenceFrequencyLabels[freq]).toBeDefined()
    })
  })
})
