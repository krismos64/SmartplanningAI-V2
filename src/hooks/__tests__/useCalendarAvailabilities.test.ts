/**
 * Tests unitaires pour useCalendarAvailabilities
 *
 * @description Tests du hook de chargement des indisponibilités calendrier
 * @ticket SP-402
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCalendarAvailabilities } from '../useCalendarAvailabilities'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('@/lib/actions/availabilities', () => ({
  getAvailabilitiesForCalendar: vi.fn(),
}))

import { getAvailabilitiesForCalendar } from '@/lib/actions/availabilities'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'
import type { AvailabilityType, Prisma } from '@prisma/client'

// ============================================================================
// Données de test
// ============================================================================

const mockAvailability: AvailabilityWithEmployee = {
  id: 'avail-1',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  startTime: null,
  endTime: null,
  type: 'VACATION' as AvailabilityType,
  reason: 'Vacances hiver',
  isRecurring: false,
  recurrenceRule: null as Prisma.JsonValue,
  employeeId: 'emp-1',
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: { id: 'emp-1', firstName: 'Jean', lastName: 'Dupont' },
}

const mockAvailability2: AvailabilityWithEmployee = {
  id: 'avail-2',
  startDate: new Date('2026-02-10'),
  endDate: new Date('2026-02-10'),
  startTime: '09:00',
  endTime: '12:00',
  type: 'TRAINING' as AvailabilityType,
  reason: 'Formation',
  isRecurring: false,
  recurrenceRule: null as Prisma.JsonValue,
  employeeId: 'emp-2',
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: { id: 'emp-2', firstName: 'Marie', lastName: 'Martin' },
}

const mockSuccessResult = {
  success: true as const,
  data: [mockAvailability, mockAvailability2],
}

const mockEmptyResult = {
  success: true as const,
  data: [] as AvailabilityWithEmployee[],
}

const mockErrorResult = {
  success: false as const,
  error: 'Erreur serveur',
}

// Use stable date references to avoid re-render loops
const FEB_01 = new Date('2026-02-01')
const FEB_28 = new Date('2026-02-28')
const MAR_01 = new Date('2026-03-01')

// ============================================================================
// Tests (using real timers with short debounce to avoid infinite loop)
// ============================================================================

describe('useCalendarAvailabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('État initial', () => {
    it('retourne un état initial correct', () => {
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(mockEmptyResult)

      const { result } = renderHook(() =>
        useCalendarAvailabilities({
          companyId: 'company-1',
          startDate: null,
          endDate: null,
        })
      )

      expect(result.current.availabilities).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("ne fait pas d'appel si startDate est null", async () => {
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(
        mockSuccessResult
      )

      renderHook(() =>
        useCalendarAvailabilities({
          companyId: 'company-1',
          startDate: null,
          endDate: FEB_28,
          debounceMs: 10,
        })
      )

      // Wait longer than debounce
      await new Promise((r) => setTimeout(r, 50))

      expect(getAvailabilitiesForCalendar).not.toHaveBeenCalled()
    })

    it("ne fait pas d'appel si endDate est null", async () => {
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(
        mockSuccessResult
      )

      renderHook(() =>
        useCalendarAvailabilities({
          companyId: 'company-1',
          startDate: FEB_01,
          endDate: null,
          debounceMs: 10,
        })
      )

      await new Promise((r) => setTimeout(r, 50))

      expect(getAvailabilitiesForCalendar).not.toHaveBeenCalled()
    })

    it("ne fait pas d'appel si enabled=false", async () => {
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(
        mockSuccessResult
      )

      renderHook(() =>
        useCalendarAvailabilities({
          companyId: 'company-1',
          startDate: FEB_01,
          endDate: FEB_28,
          enabled: false,
          debounceMs: 10,
        })
      )

      await new Promise((r) => setTimeout(r, 50))

      expect(getAvailabilitiesForCalendar).not.toHaveBeenCalled()
    })
  })

  describe('Chargement des indisponibilités', () => {
    it('charge les indisponibilités après le debounce', async () => {
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(
        mockSuccessResult
      )

      const { result } = renderHook(() =>
        useCalendarAvailabilities({
          companyId: 'company-1',
          startDate: FEB_01,
          endDate: FEB_28,
          debounceMs: 10,
        })
      )

      await waitFor(() => {
        expect(result.current.availabilities).toHaveLength(2)
      })

      expect(getAvailabilitiesForCalendar).toHaveBeenCalledWith(
        'company-1',
        FEB_01,
        FEB_28,
        undefined,
        undefined
      )
    })

    it('recharge quand startDate change', async () => {
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(
        mockSuccessResult
      )

      const { result, rerender } = renderHook(
        ({ startDate }) =>
          useCalendarAvailabilities({
            companyId: 'company-1',
            startDate,
            endDate: FEB_28,
            debounceMs: 10,
          }),
        { initialProps: { startDate: FEB_01 } }
      )

      await waitFor(() => {
        expect(result.current.availabilities).toHaveLength(2)
      })

      expect(getAvailabilitiesForCalendar).toHaveBeenCalledTimes(1)

      // Changer la date de début
      rerender({ startDate: MAR_01 })

      await waitFor(() => {
        expect(getAvailabilitiesForCalendar).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Gestion des erreurs', () => {
    it("gère les erreurs de l'API", async () => {
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(mockErrorResult)

      const { result } = renderHook(() =>
        useCalendarAvailabilities({
          companyId: 'company-1',
          startDate: FEB_01,
          endDate: FEB_28,
          debounceMs: 10,
        })
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Erreur serveur')
      })

      expect(result.current.availabilities).toEqual([])
    })
  })

  describe('Refetch', () => {
    it('refetch force une nouvelle requête', async () => {
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(
        mockSuccessResult
      )

      const { result } = renderHook(() =>
        useCalendarAvailabilities({
          companyId: 'company-1',
          startDate: FEB_01,
          endDate: FEB_28,
          debounceMs: 10,
        })
      )

      await waitFor(() => {
        expect(result.current.availabilities).toHaveLength(2)
      })

      expect(getAvailabilitiesForCalendar).toHaveBeenCalledTimes(1)

      // Appeler refetch
      await act(async () => {
        await result.current.refetch()
      })

      expect(getAvailabilitiesForCalendar).toHaveBeenCalledTimes(2)
    })
  })

  describe('Filtres optionnels', () => {
    it("passe le teamId à l'API", async () => {
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(
        mockSuccessResult
      )

      const { result } = renderHook(() =>
        useCalendarAvailabilities({
          companyId: 'company-1',
          startDate: FEB_01,
          endDate: FEB_28,
          teamId: 'team-1',
          debounceMs: 10,
        })
      )

      await waitFor(() => {
        expect(result.current.availabilities).toHaveLength(2)
      })

      expect(getAvailabilitiesForCalendar).toHaveBeenCalledWith(
        'company-1',
        FEB_01,
        FEB_28,
        'team-1',
        undefined
      )
    })

    it("passe les employeeIds à l'API", async () => {
      const empIds = ['emp-1', 'emp-2']
      vi.mocked(getAvailabilitiesForCalendar).mockResolvedValue(
        mockSuccessResult
      )

      const { result } = renderHook(() =>
        useCalendarAvailabilities({
          companyId: 'company-1',
          startDate: FEB_01,
          endDate: FEB_28,
          employeeIds: empIds,
          debounceMs: 10,
        })
      )

      await waitFor(() => {
        expect(result.current.availabilities).toHaveLength(2)
      })

      expect(getAvailabilitiesForCalendar).toHaveBeenCalledWith(
        'company-1',
        FEB_01,
        FEB_28,
        undefined,
        empIds
      )
    })
  })
})
