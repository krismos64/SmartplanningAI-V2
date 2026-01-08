/**
 * Filtres pour la liste des Companies
 *
 * @description Composant de filtrage avec recherche textuelle et filtres dropdown.
 * Utilise les patterns SP-150 pour la gestion d'état et les labels.
 *
 * @ticket SP-151
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
  subscriptionPlanLabels,
  subscriptionStatusLabels,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from '@/lib/validations/company'
import type { CompanyFilters as CompanyFiltersType } from '@/lib/validations/company'

// ============================================================================
// Types
// ============================================================================

interface CompanyFiltersProps {
  /** Filtres actuels */
  filters: CompanyFiltersType
  /** Callback de mise à jour des filtres */
  onFiltersChange: (filters: CompanyFiltersType) => void
  /** Désactiver les filtres pendant le chargement */
  disabled?: boolean
}

// ============================================================================
// Composant
// ============================================================================

export function CompanyFilters({
  filters,
  onFiltersChange,
  disabled = false,
}: CompanyFiltersProps) {
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

  // Handler pour le filtre plan
  const handlePlanChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        subscriptionPlan:
          value === 'all' ? undefined : (value as SubscriptionPlan),
      })
    },
    [filters, onFiltersChange]
  )

  // Handler pour le filtre statut
  const handleStatusChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        subscriptionStatus:
          value === 'all' ? undefined : (value as SubscriptionStatus),
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

  // Reset tous les filtres
  const handleReset = useCallback(() => {
    onFiltersChange({})
  }, [onFiltersChange])

  // Vérifie si des filtres sont actifs
  const hasActiveFilters =
    filters.search ||
    filters.subscriptionPlan ||
    filters.subscriptionStatus ||
    filters.isActive !== undefined

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Recherche textuelle */}
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une entreprise..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      {/* Filtres dropdown */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />

        {/* Filtre par plan */}
        <Select
          value={filters.subscriptionPlan || 'all'}
          onValueChange={handlePlanChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les plans</SelectItem>
            {(Object.keys(subscriptionPlanLabels) as SubscriptionPlan[]).map(
              (plan) => (
                <SelectItem key={plan} value={plan}>
                  {subscriptionPlanLabels[plan]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        {/* Filtre par statut */}
        <Select
          value={filters.subscriptionStatus || 'all'}
          onValueChange={handleStatusChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {(
              Object.keys(subscriptionStatusLabels) as SubscriptionStatus[]
            ).map((status) => (
              <SelectItem key={status} value={status}>
                {subscriptionStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre actif/inactif */}
        <Select
          value={
            filters.isActive === undefined ? 'all' : String(filters.isActive)
          }
          onValueChange={handleActiveChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="État" />
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
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  )
}
