/**
 * Tests unitaires pour useConflictDetection
 *
 * @description Tests du hook de détection de conflits horaires
 * @ticket SP-400
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConflictDetection } from '../use-conflict-detection'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('@/lib/actions/availabilities', () => ({
  checkAvailabilityConflicts: vi.fn(),
}))

import {
  checkAvailabilityConflicts,
  type AvailabilityConflict,
} from '@/lib/actions/availabilities'

// ============================================================================
// Données de test
// ============================================================================

const mockHardConflict: AvailabilityConflict = {
  id: 'conflict-1',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  startTime: null,
  endTime: null,
  type: 'VACATION',
  reason: 'Vacances',
  isRecurring: false,
  recurrenceRule: null,
  employeeId: 'emp-1',
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: { id: 'emp-1', firstName: 'Jean', lastName: 'Dupont' },
  isHardConflict: true,
}

const mockSoftConflict: AvailabilityConflict = {
  id: 'conflict-2',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  startTime: null,
  endTime: null,
  type: 'TRAINING',
  reason: 'Formation',
  isRecurring: false,
  recurrenceRule: null,
  employeeId: 'emp-2',
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: { id: 'emp-2', firstName: 'Marie', lastName: 'Martin' },
  isHardConflict: false,
}

const mockNoConflictResult = {
  success: true as const,
  data: {
    hasConflict: false,
    hasHardConflict: false,
    hasSoftConflict: false,
    conflicts: [] as AvailabilityConflict[],
    hardConflicts: [] as AvailabilityConflict[],
    softConflicts: [] as AvailabilityConflict[],
  },
}

const mockHardConflictResult = {
  success: true as const,
  data: {
    hasConflict: true,
    hasHardConflict: true,
    hasSoftConflict: false,
    conflicts: [mockHardConflict] as AvailabilityConflict[],
    hardConflicts: [mockHardConflict] as AvailabilityConflict[],
    softConflicts: [] as AvailabilityConflict[],
  },
}

const mockSoftConflictResult = {
  success: true as const,
  data: {
    hasConflict: true,
    hasHardConflict: false,
    hasSoftConflict: true,
    conflicts: [mockSoftConflict] as AvailabilityConflict[],
    hardConflicts: [] as AvailabilityConflict[],
    softConflicts: [mockSoftConflict] as AvailabilityConflict[],
  },
}

const mockMixedConflictResult = {
  success: true as const,
  data: {
    hasConflict: true,
    hasHardConflict: true,
    hasSoftConflict: true,
    conflicts: [mockHardConflict, mockSoftConflict] as AvailabilityConflict[],
    hardConflicts: [mockHardConflict] as AvailabilityConflict[],
    softConflicts: [mockSoftConflict] as AvailabilityConflict[],
  },
}

// ============================================================================
// Tests
// ============================================================================

describe('useConflictDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('État initial', () => {
    it('retourne un état initial correct', () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockNoConflictResult
      )

      const { result } = renderHook(() =>
        useConflictDetection({
          employeeIds: [],
          startDate: null,
          endDate: null,
        })
      )

      expect(result.current.isChecking).toBe(false)
      expect(result.current.hasConflict).toBe(false)
      expect(result.current.hasHardConflict).toBe(false)
      expect(result.current.hasSoftConflict).toBe(false)
      expect(result.current.conflicts).toEqual([])
      expect(result.current.hardConflicts).toEqual([])
      expect(result.current.softConflicts).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it("ne fait pas d'appel si enabled=false", async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockNoConflictResult
      )

      renderHook(() =>
        useConflictDetection({
          employeeIds: ['emp-1'],
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-01'),
          enabled: false,
        })
      )

      // Avancer le timer au-delà du debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500)
      })

      expect(checkAvailabilityConflicts).not.toHaveBeenCalled()
    })

    it("ne fait pas d'appel si employeeIds est vide", async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockNoConflictResult
      )

      renderHook(() =>
        useConflictDetection({
          employeeIds: [],
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-01'),
          enabled: true,
        })
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500)
      })

      expect(checkAvailabilityConflicts).not.toHaveBeenCalled()
    })

    it("ne fait pas d'appel si dates invalides", async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockNoConflictResult
      )

      renderHook(() =>
        useConflictDetection({
          employeeIds: ['emp-1'],
          startDate: null,
          endDate: new Date('2026-02-01'),
          enabled: true,
        })
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500)
      })

      expect(checkAvailabilityConflicts).not.toHaveBeenCalled()
    })
  })

  describe('Détection de conflits', () => {
    it('détecte correctement un hard conflict', async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockHardConflictResult
      )

      const { result } = renderHook(() =>
        useConflictDetection({
          employeeIds: ['emp-1'],
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-01'),
          enabled: true,
          debounceMs: 100,
        })
      )

      // Avancer le timer pour déclencher le debounce et flush les promises
      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(result.current.hasConflict).toBe(true)
      expect(result.current.hasHardConflict).toBe(true)
      expect(result.current.hasSoftConflict).toBe(false)
      expect(result.current.hardConflicts).toHaveLength(1)
      expect(result.current.softConflicts).toHaveLength(0)
    })

    it('détecte correctement un soft conflict', async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockSoftConflictResult
      )

      const { result } = renderHook(() =>
        useConflictDetection({
          employeeIds: ['emp-2'],
          startDate: new Date('2026-02-10'),
          endDate: new Date('2026-02-10'),
          enabled: true,
          debounceMs: 100,
        })
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(result.current.hasConflict).toBe(true)
      expect(result.current.hasHardConflict).toBe(false)
      expect(result.current.hasSoftConflict).toBe(true)
      expect(result.current.hardConflicts).toHaveLength(0)
      expect(result.current.softConflicts).toHaveLength(1)
    })

    it('retourne hasConflict=false si aucun conflit', async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockNoConflictResult
      )

      const { result } = renderHook(() =>
        useConflictDetection({
          employeeIds: ['emp-1'],
          startDate: new Date('2026-03-01'),
          endDate: new Date('2026-03-01'),
          enabled: true,
          debounceMs: 100,
        })
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(result.current.hasConflict).toBe(false)
      expect(result.current.conflicts).toHaveLength(0)
    })

    it('fonctionne avec plusieurs employés', async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockMixedConflictResult
      )

      const { result } = renderHook(() =>
        useConflictDetection({
          employeeIds: ['emp-1', 'emp-2'],
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-10'),
          enabled: true,
          debounceMs: 100,
        })
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(checkAvailabilityConflicts).toHaveBeenCalledWith(
        ['emp-1', 'emp-2'],
        expect.any(Date),
        expect.any(Date),
        undefined,
        undefined,
        undefined
      )
      expect(result.current.conflicts).toHaveLength(2)
      expect(result.current.hardConflicts).toHaveLength(1)
      expect(result.current.softConflicts).toHaveLength(1)
    })
  })

  describe('Debounce', () => {
    it('debounce les appels successifs', async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockNoConflictResult
      )

      const { rerender } = renderHook(
        ({ employeeIds }) =>
          useConflictDetection({
            employeeIds,
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-02-01'),
            enabled: true,
            debounceMs: 300,
          }),
        { initialProps: { employeeIds: ['emp-1'] } }
      )

      // Plusieurs changements rapides
      rerender({ employeeIds: ['emp-2'] })
      rerender({ employeeIds: ['emp-3'] })
      rerender({ employeeIds: ['emp-4'] })

      // Pas encore d'appel car debounce pas terminé
      expect(checkAvailabilityConflicts).not.toHaveBeenCalled()

      // Attendre le debounce complet
      await act(async () => {
        await vi.runAllTimersAsync()
      })

      // Un seul appel avec la dernière valeur
      expect(checkAvailabilityConflicts).toHaveBeenCalledTimes(1)
      expect(checkAvailabilityConflicts).toHaveBeenCalledWith(
        ['emp-4'],
        expect.any(Date),
        expect.any(Date),
        undefined,
        undefined,
        undefined
      )
    })
  })

  describe('Gestion des erreurs', () => {
    it("gère les erreurs de l'API", async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue({
        success: false,
        error: 'Erreur serveur',
      })

      const { result } = renderHook(() =>
        useConflictDetection({
          employeeIds: ['emp-1'],
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-01'),
          enabled: true,
          debounceMs: 100,
        })
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(result.current.error).toBe('Erreur serveur')
      expect(result.current.hasConflict).toBe(false)
    })
  })

  describe('Refetch et Reset', () => {
    it('refetch force une nouvelle vérification', async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockNoConflictResult
      )

      const { result } = renderHook(() =>
        useConflictDetection({
          employeeIds: ['emp-1'],
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-01'),
          enabled: true,
          debounceMs: 100,
        })
      )

      // Premier appel via debounce
      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(checkAvailabilityConflicts).toHaveBeenCalledTimes(1)

      // Refetch manuel
      await act(async () => {
        await result.current.refetch()
      })

      expect(checkAvailabilityConflicts).toHaveBeenCalledTimes(2)
    })

    it("reset réinitialise l'état", async () => {
      vi.mocked(checkAvailabilityConflicts).mockResolvedValue(
        mockHardConflictResult
      )

      const { result } = renderHook(() =>
        useConflictDetection({
          employeeIds: ['emp-1'],
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-02-01'),
          enabled: true,
          debounceMs: 100,
        })
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(result.current.hasConflict).toBe(true)

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.hasConflict).toBe(false)
      expect(result.current.conflicts).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })
})
