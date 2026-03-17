/**
 * IncidentNotesFilters - Filtres pour la liste des notes d'incident
 *
 * @description Recherche textuelle et filtrage par dates
 * @ticket SP-426
 */

'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { IncidentNotesFiltersState } from './IncidentNotesPageContent'

interface IncidentNotesFiltersProps {
  filters: IncidentNotesFiltersState
  onFiltersChange: (filters: Partial<IncidentNotesFiltersState>) => void
  onResetFilters: () => void
}

export function IncidentNotesFilters({
  filters,
  onFiltersChange,
  onResetFilters,
}: IncidentNotesFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.startDate || filters.endDate

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      data-testid="incidents-filters"
    >
      {/* Search */}
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="search" className="text-sm text-muted-foreground">
          Rechercher
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Titre, contenu ou employé..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Date range */}
      <div className="flex gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-sm text-muted-foreground">
            Du
          </Label>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => onFiltersChange({ startDate: e.target.value })}
            className="w-40"
            data-testid="start-date-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-sm text-muted-foreground">
            Au
          </Label>
          <Input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => onFiltersChange({ endDate: e.target.value })}
            className="w-40"
            data-testid="end-date-input"
          />
        </div>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onResetFilters}
          aria-label="Réinitialiser les filtres"
          data-testid="reset-filters-button"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
