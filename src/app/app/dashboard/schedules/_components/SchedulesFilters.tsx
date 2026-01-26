/**
 * Filtres pour la liste des Schedules
 *
 * @description Composant de filtrage avec recherche, statut et type
 * @ticket SP-395
 */

'use client'

import { useState, useCallback } from 'react'
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
}

// ============================================================================
// Constantes
// ============================================================================

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'CANCELLED', label: 'Annulé' },
  { value: 'COMPLETED', label: 'Terminé' },
]

const typeOptions = [
  { value: 'all', label: 'Tous les types' },
  { value: 'WORK', label: 'Travail' },
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

export function SchedulesFilters({ onFiltersChange }: SchedulesFiltersProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [type, setType] = useState<string>('all')

  const handleReset = useCallback(() => {
    setSearch('')
    setStatus('all')
    setType('all')
    onFiltersChange({})
  }, [onFiltersChange])

  const handleApply = useCallback(() => {
    const filters: Record<string, unknown> = {}
    if (search.trim()) filters.search = search.trim()
    if (status !== 'all') filters.status = status
    if (type !== 'all') filters.type = type
    onFiltersChange(filters)
  }, [search, status, type, onFiltersChange])

  const hasFilters = search.trim() || status !== 'all' || type !== 'all'

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
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApply()
              }
            }}
          />
        </div>
      </div>

      {/* Statut */}
      <div className="w-[160px]">
        <label className="mb-1.5 block text-sm font-medium">Statut</label>
        <Select value={status} onValueChange={setStatus}>
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

      {/* Type */}
      <div className="w-[160px]">
        <label className="mb-1.5 block text-sm font-medium">Type</label>
        <Select value={type} onValueChange={setType}>
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

      {/* Actions */}
      <div className="flex gap-2">
        {hasFilters && (
          <Button variant="outline" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        )}
        <Button onClick={handleApply}>Appliquer</Button>
      </div>
    </div>
  )
}
