/**
 * NotificationsFilters - Filtres type et statut
 *
 * @ticket SP-324
 * @description Filtres pour la page notifications
 */

'use client'

import type { NotificationType } from '@prisma/client'
import { X } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { NOTIFICATION_TYPE_LABELS } from '@/types/notification'

interface NotificationsFiltersProps {
  filters: {
    type: NotificationType | 'ALL'
    isRead: boolean | 'ALL'
  }
  onTypeChange: (type: NotificationType | 'ALL') => void
  onReadChange: (isRead: boolean | 'ALL') => void
  onClear: () => void
  hasActiveFilters: boolean
}

export function NotificationsFilters({
  filters,
  onTypeChange,
  onReadChange,
  onClear,
  hasActiveFilters,
}: NotificationsFiltersProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-3"
      data-testid="notifications-filters"
    >
      {/* Filtre par type */}
      <Select
        value={filters.type}
        onValueChange={(value) => {
          onTypeChange(value as NotificationType | 'ALL')
        }}
      >
        <SelectTrigger
          className="w-[180px]"
          aria-label="Filtrer par type"
          data-testid="filter-type"
        >
          <SelectValue placeholder="Tous les types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous les types</SelectItem>
          {Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre par statut lu/non-lu */}
      <Select
        value={
          filters.isRead === 'ALL' ? 'ALL' : filters.isRead ? 'read' : 'unread'
        }
        onValueChange={(value) => {
          if (value === 'ALL') onReadChange('ALL')
          else if (value === 'read') onReadChange(true)
          else onReadChange(false)
        }}
      >
        <SelectTrigger
          className="w-[140px]"
          aria-label="Filtrer par statut"
          data-testid="filter-status"
        >
          <SelectValue placeholder="Tous" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous</SelectItem>
          <SelectItem value="unread">Non lues</SelectItem>
          <SelectItem value="read">Lues</SelectItem>
        </SelectContent>
      </Select>

      {/* Bouton reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-10 gap-1.5 text-muted-foreground hover:text-foreground"
          data-testid="filter-reset"
        >
          <X className="h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
