/**
 * Tests unitaires pour useShiftFormData
 *
 * @description Tests du hook de chargement des données pour ShiftModal
 * @ticket SP-397
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useShiftFormData } from '../useShiftFormData'

// ============================================================================
// Mocks
// ============================================================================

const mockGetEmployeesForSelect = vi.fn()
const mockListTeams = vi.fn()
const mockGetCompanySettings = vi.fn()

vi.mock('@/lib/actions/employees', () => ({
  getEmployeesForSelect: () => mockGetEmployeesForSelect() as Promise<unknown>,
}))

vi.mock('@/lib/actions/teams', () => ({
  listTeams: (params: unknown) => mockListTeams(params) as Promise<unknown>,
}))

vi.mock('@/lib/actions/company-settings', () => ({
  getCompanySettings: () => mockGetCompanySettings() as Promise<unknown>,
}))

// ============================================================================
// Données de test
// ============================================================================

/** Forme de getEmployeesForSelect : liste à plat, sans pagination */
const mockEmployeesData = {
  success: true,
  data: [
    {
      id: 'emp-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      weeklyHours: 35,
      teamId: 'team-1',
      image: null,
    },
    {
      id: 'emp-2',
      firstName: 'Marie',
      lastName: 'Martin',
      weeklyHours: 24,
      teamId: 'team-2',
      image: null,
    },
  ],
}

const mockTeamsData = {
  success: true,
  data: {
    data: [
      { id: 'team-1', name: 'Équipe A' },
      { id: 'team-2', name: 'Équipe B' },
    ],
    total: 2,
    page: 1,
    pageSize: 100,
    totalPages: 1,
  },
}

// ============================================================================
// Tests
// ============================================================================

describe('useShiftFormData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetEmployeesForSelect.mockResolvedValue(mockEmployeesData)
    mockListTeams.mockResolvedValue(mockTeamsData)
    mockGetCompanySettings.mockResolvedValue({
      success: true,
      data: {
        name: 'Test Company',
        address: null,
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        workingHoursStart: '08:30',
        workingHoursEnd: '17:30',
        lunchBreak: { enabled: true, start: '12:00', end: '13:00' },
      },
    })
  })

  describe('Initial state', () => {
    it('retourne isLoading=true initialement', () => {
      const { result } = renderHook(() => useShiftFormData())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.employees).toEqual([])
      expect(result.current.teams).toEqual([])
      expect(result.current.companySettings).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('Data loading', () => {
    it('charge les employés, équipes et paramètres entreprise', async () => {
      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.employees).toHaveLength(2)
      expect(result.current.teams).toHaveLength(2)
      expect(result.current.companySettings).not.toBeNull()
      expect(result.current.companySettings?.workingHoursStart).toBe('08:30')
      expect(result.current.companySettings?.workingHoursEnd).toBe('17:30')
      expect(result.current.error).toBeNull()
    })

    it('formate correctement les employés', async () => {
      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.employees[0]).toEqual({
        id: 'emp-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        teamId: 'team-1',
        weeklyHours: 35,
      })
    })

    it('formate correctement les équipes', async () => {
      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.teams[0]).toEqual({
        id: 'team-1',
        name: 'Équipe A',
      })
    })

    it('charge tous les employés, au-delà de 100 (SP-616)', async () => {
      // TechCorp compte 113 employés actifs : avec une page de 100, le 108e
      // était absent du formulaire et sa case ne présélectionnait personne.
      mockGetEmployeesForSelect.mockResolvedValue({
        success: true,
        data: Array.from({ length: 150 }, (_, i) => ({
          id: `emp-${i}`,
          firstName: 'Prénom',
          lastName: `Nom${i}`,
          weeklyHours: 35,
          teamId: null,
          image: null,
        })),
      })

      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.employees).toHaveLength(150)
      expect(result.current.employees.some((e) => e.id === 'emp-107')).toBe(
        true
      )
    })

    it('appelle listTeams avec les bons paramètres', async () => {
      renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(mockListTeams).toHaveBeenCalledWith({ pageSize: 100 })
      })
    })
  })

  describe('Error handling', () => {
    it('gère les erreurs de chargement des employés', async () => {
      mockGetEmployeesForSelect.mockResolvedValue({
        success: false,
        error: 'Erreur employés',
      })

      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Erreur employés')
      expect(result.current.employees).toEqual([])
    })

    it('gère les erreurs de Promise.all', async () => {
      mockGetEmployeesForSelect.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Erreur lors du chargement des données')
    })

    it('continue de charger les équipes même si employés échouent', async () => {
      mockGetEmployeesForSelect.mockResolvedValue({
        success: false,
        error: 'Erreur employés',
      })

      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Les équipes devraient quand même être chargées
      expect(result.current.teams).toHaveLength(2)
    })
  })

  describe('Refetch', () => {
    it('permet de recharger les données', async () => {
      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Premier appel au montage
      expect(mockGetEmployeesForSelect).toHaveBeenCalledTimes(1)
      expect(mockListTeams).toHaveBeenCalledTimes(1)

      // Déclencher le refetch
      await result.current.refetch()

      // Deuxième appel après refetch
      expect(mockGetEmployeesForSelect).toHaveBeenCalledTimes(2)
      expect(mockListTeams).toHaveBeenCalledTimes(2)
    })

    it('refetch remet isLoading à false après completion', async () => {
      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Déclencher le refetch et attendre la completion
      await result.current.refetch()

      // isLoading devrait être false après le refetch
      expect(result.current.isLoading).toBe(false)
    })

    it('réinitialise les erreurs lors du refetch', async () => {
      mockGetEmployeesForSelect.mockResolvedValue({
        success: false,
        error: 'Erreur',
      })

      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.error).toBe('Erreur')
      })

      // Préparer un succès pour le refetch
      mockGetEmployeesForSelect.mockResolvedValue(mockEmployeesData)

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Employee without team', () => {
    it('gère les employés sans équipe', async () => {
      mockGetEmployeesForSelect.mockResolvedValue({
        success: true,
        data: [
          {
            id: 'emp-1',
            firstName: 'Jean',
            lastName: 'Dupont',
            weeklyHours: 35,
            teamId: null,
            image: null,
          },
        ],
      })

      const { result } = renderHook(() => useShiftFormData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.employees[0]).toEqual({
        id: 'emp-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        teamId: null,
        weeklyHours: 35,
      })
    })
  })
})
