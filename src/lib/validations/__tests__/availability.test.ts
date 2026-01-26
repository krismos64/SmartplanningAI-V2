/**
 * Tests unitaires pour les schemas de validation Availability
 *
 * @ticket SP-393
 */

import { describe, it, expect } from 'vitest'
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  availabilityFiltersSchema,
  availabilityTypeLabels,
  availabilityTypeColors,
  availabilityTypeIcons,
} from '../availability'
import { AvailabilityType } from '@prisma/client'

// ============================================================================
// createAvailabilitySchema
// ============================================================================

describe('createAvailabilitySchema', () => {
  const validAvailability = {
    employeeId: 'clxxxxxxxxxxxxxxxxxx1',
    companyId: 'clxxxxxxxxxxxxxxxxxx2',
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-02-05'),
    type: 'VACATION',
  }

  describe('indisponibilites valides', () => {
    it('accepte une indisponibilite minimale valide', () => {
      const result = createAvailabilitySchema.safeParse(validAvailability)
      expect(result.success).toBe(true)
    })

    it('accepte startDate = endDate (journee unique)', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        endDate: new Date('2026-02-01'),
      })
      expect(result.success).toBe(true)
    })

    it('accepte avec raison', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        reason: 'Vacances annuelles',
      })
      expect(result.success).toBe(true)
    })

    it('accepte avec horaires specifiques', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        endDate: new Date('2026-02-01'),
        startTime: '09:00',
        endTime: '12:00',
      })
      expect(result.success).toBe(true)
    })

    it('accepte une indisponibilite recurrente valide', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        isRecurring: true,
        recurrenceRule: {
          frequency: 'WEEKLY',
          daysOfWeek: ['WEDNESDAY'],
          occurrences: 12,
        },
      })
      expect(result.success).toBe(true)
    })

    it('valide tous les types AvailabilityType', () => {
      const types: AvailabilityType[] = [
        'UNAVAILABLE',
        'PREFERRED',
        'VACATION',
        'SICK',
        'TRAINING',
        'OTHER',
      ]
      types.forEach((type) => {
        const result = createAvailabilitySchema.safeParse({
          ...validAvailability,
          type,
        })
        expect(result.success).toBe(true)
      })
    })

    it('applique les valeurs par defaut', () => {
      const result = createAvailabilitySchema.parse({
        employeeId: 'clxxxxxxxxxxxxxxxxxx1',
        companyId: 'clxxxxxxxxxxxxxxxxxx2',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-05'),
      })
      expect(result.type).toBe('UNAVAILABLE')
      expect(result.isRecurring).toBe(false)
    })
  })

  describe('indisponibilites invalides', () => {
    it('rejette si endDate avant startDate', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        startDate: new Date('2026-02-10'),
        endDate: new Date('2026-02-05'),
      })
      expect(result.success).toBe(false)
    })

    it('rejette si recurrente sans regle', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        isRecurring: true,
      })
      expect(result.success).toBe(false)
    })

    it('rejette si seulement startTime (sans endTime)', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        startTime: '09:00',
      })
      expect(result.success).toBe(false)
    })

    it('rejette si seulement endTime (sans startTime)', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        endTime: '12:00',
      })
      expect(result.success).toBe(false)
    })

    it('rejette si heure fin <= heure debut meme jour', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        endDate: new Date('2026-02-01'),
        startTime: '14:00',
        endTime: '09:00',
      })
      expect(result.success).toBe(false)
    })

    it('rejette employeeId invalide', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        employeeId: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('rejette companyId invalide', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        companyId: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('rejette raison trop longue', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        reason: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })

    it('rejette type invalide', () => {
      const result = createAvailabilitySchema.safeParse({
        ...validAvailability,
        type: 'INVALID',
      })
      expect(result.success).toBe(false)
    })
  })
})

// ============================================================================
// updateAvailabilitySchema
// ============================================================================

describe('updateAvailabilitySchema', () => {
  it('accepte une modification partielle', () => {
    const result = updateAvailabilitySchema.safeParse({
      id: 'clxxxxxxxxxxxxxxxxxx1',
      reason: 'Nouvelle raison',
    })
    expect(result.success).toBe(true)
  })

  it('requiert un ID valide', () => {
    const result = updateAvailabilitySchema.safeParse({
      reason: 'Nouvelle raison',
    })
    expect(result.success).toBe(false)
  })

  it('rejette ID invalide', () => {
    const result = updateAvailabilitySchema.safeParse({
      id: 'invalid',
      reason: 'Nouvelle raison',
    })
    expect(result.success).toBe(false)
  })

  it('valide les dates si les deux sont fournies', () => {
    const result = updateAvailabilitySchema.safeParse({
      id: 'clxxxxxxxxxxxxxxxxxx1',
      startDate: new Date('2026-02-10'),
      endDate: new Date('2026-02-05'), // Invalide
    })
    expect(result.success).toBe(false)
  })

  it('accepte dates partielles', () => {
    const result = updateAvailabilitySchema.safeParse({
      id: 'clxxxxxxxxxxxxxxxxxx1',
      startDate: new Date('2026-02-01'),
    })
    expect(result.success).toBe(true)
  })

  it('valide recurrence si isRecurring devient true', () => {
    const result = updateAvailabilitySchema.safeParse({
      id: 'clxxxxxxxxxxxxxxxxxx1',
      isRecurring: true,
    })
    expect(result.success).toBe(false)
  })

  it('accepte changement de type', () => {
    const result = updateAvailabilitySchema.safeParse({
      id: 'clxxxxxxxxxxxxxxxxxx1',
      type: 'SICK',
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// availabilityFiltersSchema
// ============================================================================

describe('availabilityFiltersSchema', () => {
  it('applique les valeurs par defaut', () => {
    const result = availabilityFiltersSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sortBy).toBe('startDate')
    expect(result.sortOrder).toBe('asc')
  })

  it('accepte tous les filtres', () => {
    const result = availabilityFiltersSchema.safeParse({
      companyId: 'clxxxxxxxxxxxxxxxxxx1',
      employeeId: 'clxxxxxxxxxxxxxxxxxx2',
      type: 'VACATION',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      isRecurring: false,
      page: 2,
      limit: 50,
      sortBy: 'type',
      sortOrder: 'desc',
    })
    expect(result.success).toBe(true)
  })

  it('accepte filtres par types multiples', () => {
    const result = availabilityFiltersSchema.safeParse({
      types: ['VACATION', 'SICK'],
    })
    expect(result.success).toBe(true)
  })

  it('accepte filtres par employeeIds multiples', () => {
    const result = availabilityFiltersSchema.safeParse({
      employeeIds: ['clxxxxxxxxxxxxxxxxxx1', 'clxxxxxxxxxxxxxxxxxx2'],
    })
    expect(result.success).toBe(true)
  })

  it('rejette limit > 100', () => {
    const result = availabilityFiltersSchema.safeParse({
      limit: 101,
    })
    expect(result.success).toBe(false)
  })

  it('rejette page < 1', () => {
    const result = availabilityFiltersSchema.safeParse({
      page: 0,
    })
    expect(result.success).toBe(false)
  })

  it('convertit les dates string en Date', () => {
    const result = availabilityFiltersSchema.parse({
      startDate: '2026-02-01',
    })
    expect(result.startDate).toBeInstanceOf(Date)
  })

  it('accepte sortBy valides', () => {
    const sortByValues = ['startDate', 'endDate', 'createdAt', 'type'] as const
    sortByValues.forEach((sortBy) => {
      const result = availabilityFiltersSchema.safeParse({ sortBy })
      expect(result.success).toBe(true)
    })
  })
})

// ============================================================================
// Labels, couleurs et icones
// ============================================================================

describe('Labels francais', () => {
  it('availabilityTypeLabels contient tous les types', () => {
    const types: AvailabilityType[] = [
      'UNAVAILABLE',
      'PREFERRED',
      'VACATION',
      'SICK',
      'TRAINING',
      'OTHER',
    ]
    types.forEach((type) => {
      expect(availabilityTypeLabels[type]).toBeDefined()
      expect(typeof availabilityTypeLabels[type]).toBe('string')
    })
  })
})

describe('Couleurs', () => {
  it('availabilityTypeColors contient tous les types', () => {
    const types: AvailabilityType[] = [
      'UNAVAILABLE',
      'PREFERRED',
      'VACATION',
      'SICK',
      'TRAINING',
      'OTHER',
    ]
    types.forEach((type) => {
      expect(availabilityTypeColors[type]).toBeDefined()
      expect(availabilityTypeColors[type]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})

describe('Icones', () => {
  it('availabilityTypeIcons contient tous les types', () => {
    const types: AvailabilityType[] = [
      'UNAVAILABLE',
      'PREFERRED',
      'VACATION',
      'SICK',
      'TRAINING',
      'OTHER',
    ]
    types.forEach((type) => {
      expect(availabilityTypeIcons[type]).toBeDefined()
      expect(typeof availabilityTypeIcons[type]).toBe('string')
    })
  })
})
