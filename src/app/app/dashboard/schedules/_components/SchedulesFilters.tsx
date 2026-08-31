/**
 * Filtres pour la liste des Schedules
 *
 * @description Composant de filtrage avec recherche, statut et type
 * @ticket SP-395
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ============================================================================
// Types
// ============================================================================

interface SchedulesFiltersProps {
  onFiltersChange: (filters: Record<string, unknown>) => void
  teams?: { id: string; name: string }[]
  employees?: { id: string; firstName: string; lastName: string }[]
  /** Masquer le filtre statut (ex: EMPLOYEE ne voit que les confirmés) */
  showStatusFilter?: boolean
}

// ============================================================================
// Constantes
// ============================================================================

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'CONFIRMED', label: 'Confirmé' },
]

/**
 * Statut selectionne au montage et au reset.
 *
 * SP-578 : valait 'CONFIRMED', ce qui rendait invisibles les creneaux que
 * l'utilisateur venait lui-meme de creer en brouillon. Le filtre n'est de
 * toute facon pas un controle d'acces : pour un EMPLOYEE, la restriction aux
 * creneaux confirmes est imposee cote serveur.
 */
const DEFAULT_STATUS = 'all'

const typeOptions = [
  { value: 'all', label: 'Tous les types' },
  { value: 'WORK', label: 'Travail' },
  { value: 'REST', label: 'Repos' },
  { value: 'BREAK', label: 'Pause' },
  { value: 'MEETING', label: 'Réunion' },
  { value: 'TRAINING', label: 'Formation' },
  { value: 'REMOTE', label: 'Télétravail' },
  { value: 'ON_CALL', label: 'Astreinte' },
  { value: 'OVERTIME', label: 'Heures sup.' },
]

// ============================================================================
// Composant
// ============================================================================

export function SchedulesFilters({
  onFiltersChange,
  teams = [],
  employees = [],
  showStatusFilter = true,
}: SchedulesFiltersProps) {
  const [search, setSearch] = useState('')
  // SP-578 : defaut « tous les statuts ». Un defaut CONFIRMED masquait les
  // brouillons a leur propre auteur, y compris dans les exports PDF et Excel
  // qui reprennent les filtres actifs de la vue.
  const [status, setStatus] = useState<string>(DEFAULT_STATUS)
  const [type, setType] = useState<string>('all')
  const [teamId, setTeamId] = useState<string>('all')
  const [employeeId, setEmployeeId] = useState<string>('all')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Construit et applique les filtres à partir de l'état courant
  const applyFilters = useCallback(
    (
      overrides: Partial<{
        search: string
        status: string
        type: string
        teamId: string
        employeeId: string
      }> = {}
    ) => {
      const s = overrides.search ?? search
      const st = overrides.status ?? status
      const t = overrides.type ?? type
      const ti = overrides.teamId ?? teamId
      const ei = overrides.employeeId ?? employeeId
      const filters: Record<string, unknown> = {}
      if (s.trim()) filters.search = s.trim()
      if (st !== 'all') filters.status = st
      if (t !== 'all') filters.type = t
      if (ti !== 'all') filters.teamId = ti
      if (ei !== 'all') filters.employeeId = ei
      onFiltersChange(filters)
    },
    [search, status, type, teamId, employeeId, onFiltersChange]
  )

  // Recherche avec debounce 300ms
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        applyFilters({ search: value })
      }, 300)
    },
    [applyFilters]
  )

  // SP-578 : plus de filtre applique au montage. Le defaut est « tous les
  // statuts », donc il n'y a aucun critere a pousser au parent.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Les selects appliquent immédiatement
  const handleStatusChange = useCallback(
    (value: string) => {
      setStatus(value)
      applyFilters({ status: value })
    },
    [applyFilters]
  )

  const handleTypeChange = useCallback(
    (value: string) => {
      setType(value)
      applyFilters({ type: value })
    },
    [applyFilters]
  )

  const handleTeamChange = useCallback(
    (value: string) => {
      setTeamId(value)
      applyFilters({ teamId: value })
    },
    [applyFilters]
  )

  const handleEmployeeChange = useCallback(
    (value: string) => {
      setEmployeeId(value)
      applyFilters({ employeeId: value })
    },
    [applyFilters]
  )

  const handleReset = useCallback(() => {
    setSearch('')
    setStatus(DEFAULT_STATUS)
    setType('all')
    setTeamId('all')
    setEmployeeId('all')
    onFiltersChange({})
  }, [onFiltersChange])

  const defaultStatus = DEFAULT_STATUS
  const hasFilters =
    search.trim() ||
    status !== defaultStatus ||
    type !== 'all' ||
    teamId !== 'all' ||
    employeeId !== 'all'

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Recherche */}
      <div className="min-w-[200px] flex-1">
        <label className="mb-1.5 block text-sm font-medium">Recherche</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nom, prénom, titre..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Statut (masqué pour EMPLOYEE qui ne voit que les confirmés) */}
      {showStatusFilter && (
        <div className="w-[160px]">
          <label className="mb-1.5 block text-sm font-medium">Statut</label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Type */}
      <div className="w-[160px]">
        <label className="mb-1.5 block text-sm font-medium">Type</label>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Équipe */}
      {teams.length > 0 && (
        <div className="w-[160px]">
          <label className="mb-1.5 block text-sm font-medium">Équipe</label>
          <Select value={teamId} onValueChange={handleTeamChange}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les équipes</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Employé */}
      {employees.length > 0 && (
        <div className="w-[200px]">
          <label className="mb-1.5 block text-sm font-medium">Employé</label>
          <Select value={employeeId} onValueChange={handleEmployeeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les employés</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Réinitialiser */}
      {hasFilters && (
        <Button variant="outline" onClick={handleReset}>
          <X className="mr-2 h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
