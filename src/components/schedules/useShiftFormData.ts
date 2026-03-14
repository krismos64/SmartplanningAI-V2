/**
 * Hook pour charger les données du formulaire ShiftModal
 *
 * @description Charge les employés et équipes accessibles selon les permissions RBAC
 * @ticket SP-397
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { listEmployees } from '@/lib/actions/employees'
import { listTeams } from '@/lib/actions/teams'
import { getCompanySettings } from '@/lib/actions/company-settings'
import type { EmployeeWithCounts } from '@/lib/validations/employee'
import type { TeamWithCounts } from '@/lib/validations/team'
import type { CompanySettings } from '@/types/company'

// ============================================================================
// Types
// ============================================================================

export interface EmployeeOption {
  id: string
  firstName: string
  lastName: string
  teamId?: string | null
}

export interface TeamOption {
  id: string
  name: string
}

export interface ShiftFormData {
  employees: EmployeeOption[]
  teams: TeamOption[]
  companySettings: CompanySettings | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// ============================================================================
// Hook
// ============================================================================

export function useShiftFormData(): ShiftFormData {
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [companySettings, setCompanySettings] =
    useState<CompanySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Charger en parallèle
      const [employeesResult, teamsResult, settingsResult] = await Promise.all([
        listEmployees({ pageSize: 100 }, { isActive: true }),
        listTeams({ pageSize: 100 }),
        getCompanySettings(),
      ])

      if (employeesResult.success && employeesResult.data) {
        setEmployees(
          employeesResult.data.data.map((emp: EmployeeWithCounts) => ({
            id: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            teamId: emp.team?.id ?? null,
          }))
        )
      } else if (!employeesResult.success) {
        setError(employeesResult.error ?? 'Erreur chargement employés')
      }

      if (teamsResult.success && teamsResult.data) {
        setTeams(
          teamsResult.data.data.map((team: TeamWithCounts) => ({
            id: team.id,
            name: team.name,
          }))
        )
      }

      if (settingsResult.success && settingsResult.data) {
        setCompanySettings(settingsResult.data)
      }
    } catch {
      setError('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return {
    employees,
    teams,
    companySettings,
    isLoading,
    error,
    refetch: fetchData,
  }
}
