/**
 * Filtres pour la liste des Employees
 *
 * @description Composant de filtrage avec recherche textuelle, departement, equipe et statut.
 * Adapte au RBAC : affiche seulement les equipes accessibles selon le role.
 *
 * @ticket SP-152
 */

'use client'

import { useCallback } from 'react'
import { Search, X, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  departmentLabels,
  type Department,
  type EmployeeFilters as EmployeeFiltersType,
} from '@/lib/validations/employee'

// ============================================================================
// Types
// ============================================================================

interface TeamOption {
  id: string
  name: string
}

interface EmployeeFiltersProps {
  /** Filtres actuels */
  filters: EmployeeFiltersType
  /** Callback de mise a jour des filtres */
  onFiltersChange: (filters: EmployeeFiltersType) => void
  /** Liste des equipes disponibles (filtrees selon RBAC) */
  teams?: TeamOption[]
  /** Desactiver les filtres pendant le chargement */
  disabled?: boolean
  /** Afficher le filtre entreprise (SYSTEM_ADMIN uniquement) */
  showCompanyFilter?: boolean
  /** Liste des entreprises (SYSTEM_ADMIN uniquement) */
  companies?: { id: string; name: string }[]
}

// ============================================================================
// Composant
// ============================================================================

export function EmployeeFilters({
  filters,
  onFiltersChange,
  teams = [],
  disabled = false,
  showCompanyFilter = false,
  companies = [],
}: EmployeeFiltersProps) {
  // Handler pour la recherche textuelle
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        search: value || undefined,
      })
    },
    [filters, onFiltersChange]
  )

  // Handler pour le filtre departement
  const handleDepartmentChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        department: value === 'all' ? undefined : (value as Department),
      })
    },
    [filters, onFiltersChange]
  )

  // Handler pour le filtre equipe
  const handleTeamChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        teamId: value === 'all' ? undefined : value,
      })
    },
    [filters, onFiltersChange]
  )

  // Handler pour le filtre actif/inactif
  const handleActiveChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        isActive: value === 'all' ? undefined : value === 'true',
      })
    },
    [filters, onFiltersChange]
  )

  // Handler pour le filtre entreprise (SYSTEM_ADMIN)
  const handleCompanyChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        companyId: value === 'all' ? undefined : value,
      })
    },
    [filters, onFiltersChange]
  )

  // Reset tous les filtres
  const handleReset = useCallback(() => {
    onFiltersChange({})
  }, [onFiltersChange])

  // Verifie si des filtres sont actifs
  const hasActiveFilters =
    filters.search ||
    filters.department ||
    filters.teamId ||
    filters.companyId ||
    filters.isActive !== undefined

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Recherche textuelle */}
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un employe..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      {/* Filtres dropdown */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />

        {/* Filtre par entreprise (SYSTEM_ADMIN uniquement) */}
        {showCompanyFilter && companies.length > 0 && (
          <Select
            value={filters.companyId || 'all'}
            onValueChange={handleCompanyChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Entreprise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entreprises</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Filtre par departement */}
        <Select
          value={filters.department || 'all'}
          onValueChange={handleDepartmentChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Departement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous departements</SelectItem>
            {(Object.keys(departmentLabels) as Department[]).map((dept) => (
              <SelectItem key={dept} value={dept}>
                {departmentLabels[dept]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre par equipe */}
        {teams.length > 0 && (
          <Select
            value={filters.teamId || 'all'}
            onValueChange={handleTeamChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes equipes</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Filtre actif/inactif */}
        <Select
          value={
            filters.isActive === undefined ? 'all' : String(filters.isActive)
          }
          onValueChange={handleActiveChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Actifs</SelectItem>
            <SelectItem value="false">Inactifs</SelectItem>
          </SelectContent>
        </Select>

        {/* Bouton reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="h-9 px-2"
          >
            <X className="mr-1 h-4 w-4" />
            Reinitialiser
          </Button>
        )}
      </div>
    </div>
  )
}
