/**
 * Tests unitaires pour AvailabilityOverlay
 *
 * @description Tests du composant overlay et du hook useAvailabilityOverlayEvents
 * @ticket SP-402
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useAvailabilityOverlayEvents,
  AVAILABILITY_CALENDAR_CONFIG,
} from '../AvailabilityOverlay'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'
import type { AvailabilityType, Prisma } from '@prisma/client'

// ============================================================================
// Données de test
// ============================================================================

const createMockAvailability = (
  id: string,
  type: AvailabilityType,
  startDate: string,
  endDate: string,
  startTime: string | null = null,
  endTime: string | null = null
): AvailabilityWithEmployee => ({
  id,
  startDate: new Date(startDate),
  endDate: new Date(endDate),
  startTime,
  endTime,
  type,
  reason: 'Test',
  isRecurring: false,
  recurrenceRule: null as Prisma.JsonValue,
  employeeId: 'emp-1',
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: { id: 'emp-1', firstName: 'Jean', lastName: 'Dupont' },
})

// ============================================================================
// Tests
// ============================================================================

describe('useAvailabilityOverlayEvents', () => {
  describe('Transformation des indisponibilités', () => {
    it('transforme une indisponibilité en event Schedule-X', () => {
      const availability = createMockAvailability(
        'avail-1',
        'VACATION',
        '2026-02-01',
        '2026-02-05'
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current).toHaveLength(1)
      expect(result.current[0]!.id).toBe('avail-avail-1')
      expect(result.current[0]!.title).toContain('Jean Dupont')
      expect(result.current[0]!.title).toContain('Vacances')
      expect(result.current[0]!.calendarId).toBe('availability-vacation')
    })

    it('transforme plusieurs indisponibilités', () => {
      const availabilities = [
        createMockAvailability(
          'avail-1',
          'VACATION',
          '2026-02-01',
          '2026-02-05'
        ),
        createMockAvailability('avail-2', 'SICK', '2026-02-10', '2026-02-10'),
        createMockAvailability(
          'avail-3',
          'TRAINING',
          '2026-02-15',
          '2026-02-16'
        ),
      ]

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents(availabilities)
      )

      expect(result.current).toHaveLength(3)
      expect(result.current[0]!.calendarId).toBe('availability-vacation')
      expect(result.current[1]!.calendarId).toBe('availability-sick')
      expect(result.current[2]!.calendarId).toBe('availability-training')
    })

    it("retourne un tableau vide si pas d'indisponibilités", () => {
      const { result } = renderHook(() => useAvailabilityOverlayEvents([]))

      expect(result.current).toEqual([])
    })

    it('utilise 00:00 si startTime est null', () => {
      const availability = createMockAvailability(
        'avail-1',
        'VACATION',
        '2026-02-01',
        '2026-02-01',
        null,
        null
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      // Le format Temporal contient l'heure
      expect(result.current[0]!.start).toContain('T00:00')
    })

    it('utilise 23:59 si endTime est null', () => {
      const availability = createMockAvailability(
        'avail-1',
        'VACATION',
        '2026-02-01',
        '2026-02-01',
        null,
        null
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      // Le format Temporal contient l'heure
      expect(result.current[0]!.end).toContain('T23:59')
    })

    it('utilise les heures spécifiées si fournies', () => {
      const availability = createMockAvailability(
        'avail-1',
        'TRAINING',
        '2026-02-01',
        '2026-02-01',
        '09:00',
        '12:00'
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current[0]!.start).toContain('T09:00')
      expect(result.current[0]!.end).toContain('T12:00')
    })
  })

  describe('Format du calendarId', () => {
    it('génère le bon calendarId pour VACATION', () => {
      const availability = createMockAvailability(
        'avail-1',
        'VACATION',
        '2026-02-01',
        '2026-02-01'
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current[0]!.calendarId).toBe('availability-vacation')
    })

    it('génère le bon calendarId pour SICK', () => {
      const availability = createMockAvailability(
        'avail-1',
        'SICK',
        '2026-02-01',
        '2026-02-01'
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current[0]!.calendarId).toBe('availability-sick')
    })

    it('génère le bon calendarId pour TRAINING', () => {
      const availability = createMockAvailability(
        'avail-1',
        'TRAINING',
        '2026-02-01',
        '2026-02-01'
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current[0]!.calendarId).toBe('availability-training')
    })

    it('génère le bon calendarId pour UNAVAILABLE', () => {
      const availability = createMockAvailability(
        'avail-1',
        'UNAVAILABLE',
        '2026-02-01',
        '2026-02-01'
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current[0]!.calendarId).toBe('availability-unavailable')
    })

    it('génère le bon calendarId pour PREFERRED', () => {
      const availability = createMockAvailability(
        'avail-1',
        'PREFERRED',
        '2026-02-01',
        '2026-02-01'
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current[0]!.calendarId).toBe('availability-preferred')
    })

    it('génère le bon calendarId pour OTHER', () => {
      const availability = createMockAvailability(
        'avail-1',
        'OTHER',
        '2026-02-01',
        '2026-02-01'
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current[0]!.calendarId).toBe('availability-other')
    })
  })

  describe("Titre de l'event", () => {
    it("inclut le nom complet de l'employé", () => {
      const availability: AvailabilityWithEmployee = {
        ...createMockAvailability(
          'avail-1',
          'VACATION',
          '2026-02-01',
          '2026-02-01'
        ),
        employee: { id: 'emp-1', firstName: 'Marie', lastName: 'Martin' },
      }

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current[0]!.title).toContain('Marie Martin')
    })

    it('inclut le label du type avec emoji', () => {
      const availability = createMockAvailability(
        'avail-1',
        'SICK',
        '2026-02-01',
        '2026-02-01'
      )

      const { result } = renderHook(() =>
        useAvailabilityOverlayEvents([availability])
      )

      expect(result.current[0]!.title).toContain('🤒')
      expect(result.current[0]!.title).toContain('Maladie')
    })
  })
})

describe('AVAILABILITY_CALENDAR_CONFIG', () => {
  it('définit les couleurs pour tous les types', () => {
    const types: Array<keyof typeof AVAILABILITY_CALENDAR_CONFIG> = [
      'VACATION',
      'SICK',
      'TRAINING',
      'UNAVAILABLE',
      'PREFERRED',
      'OTHER',
    ]

    types.forEach((type) => {
      expect(AVAILABILITY_CALENDAR_CONFIG[type]).toBeDefined()
    })
  })

  it('a des couleurs light et dark pour chaque type', () => {
    Object.values(AVAILABILITY_CALENDAR_CONFIG).forEach((config) => {
      expect(config.lightColors).toBeDefined()
      expect(config.lightColors.main).toBeDefined()
      expect(config.lightColors.container).toBeDefined()
      expect(config.lightColors.onContainer).toBeDefined()

      expect(config.darkColors).toBeDefined()
      expect(config.darkColors.main).toBeDefined()
      expect(config.darkColors.container).toBeDefined()
      expect(config.darkColors.onContainer).toBeDefined()
    })
  })

  it('utilise des couleurs RGBA avec opacité pour le container', () => {
    // Les containers doivent avoir une opacité pour l'effet overlay
    Object.values(AVAILABILITY_CALENDAR_CONFIG).forEach((config) => {
      expect(config.lightColors.container).toMatch(/rgba\(/)
      expect(config.darkColors.container).toMatch(/rgba\(/)
    })
  })
})
