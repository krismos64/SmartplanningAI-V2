'use client'

/**
 * Barre de filtres pour les logs d'audit
 *
 * Pousse les filtres dans l'URL (searchParams) pour bookmarkability.
 *
 * @ticket SP-445
 */

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X, Search } from 'lucide-react'
import type { AuditAction, AuditEntityType } from '@prisma/client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ENTITY_TYPE_LABELS } from './audit-action-badge'

// ============================================================================
// CONSTANTES
// ============================================================================

const ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: 'CREATE', label: 'Création' },
  { value: 'UPDATE', label: 'Modification' },
  { value: 'DELETE', label: 'Suppression' },
  { value: 'STATUS_CHANGE', label: 'Changement statut' },
  { value: 'LOGIN', label: 'Connexion' },
  { value: 'LOGOUT', label: 'Déconnexion' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'IMPERSONATE', label: 'Impersonation' },
  { value: 'PASSWORD_CHANGE', label: 'Mot de passe' },
]

const ENTITY_TYPE_OPTIONS: { value: AuditEntityType; label: string }[] = [
  { value: 'COMPANY', label: 'Entreprise' },
  { value: 'EMPLOYEE', label: 'Employé' },
  { value: 'TEAM', label: 'Équipe' },
  { value: 'SCHEDULE', label: 'Planning' },
  { value: 'LEAVE', label: 'Congé' },
  { value: 'SUBSCRIPTION', label: 'Abonnement' },
  { value: 'USER', label: 'Utilisateur' },
  { value: 'SETTINGS', label: 'Paramètres' },
  { value: 'INCIDENT_NOTE', label: 'Incident' },
  { value: 'AVAILABILITY', label: 'Disponibilité' },
]

// ============================================================================
// COMPOSANT
// ============================================================================

interface AuditLogFilterBarProps {
  disabled?: boolean
}

export function AuditLogFilterBar({
  disabled = false,
}: AuditLogFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 on filter change
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [pathname, router])

  // companyId : filtre posé par deep-link depuis la fiche entreprise
  // (SP-546) — pas de contrôle UI dédié, mais il doit être VISIBLE et
  // retirable, sinon l'admin prend le journal filtré pour le journal
  // complet (review PR #54)
  const companyFilter = searchParams.get('companyId')

  const hasActiveFilters =
    searchParams.has('action') ||
    searchParams.has('entityType') ||
    searchParams.has('search') ||
    searchParams.has('dateFrom') ||
    searchParams.has('dateTo') ||
    companyFilter !== null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Indicateur filtre entreprise (deep-link fiche entreprise SP-546) */}
      {companyFilter && (
        <Badge
          variant="info"
          className="gap-1.5"
          data-testid="audit-company-filter-badge"
        >
          Filtré : une seule entreprise
          <button
            type="button"
            onClick={() => updateFilter('companyId', '')}
            aria-label="Retirer le filtre entreprise"
            className="rounded-full hover:bg-foreground/10"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      )}

      {/* Recherche email/nom */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par email ou nom..."
          defaultValue={searchParams.get('search') ?? ''}
          className="pl-9"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilter('search', e.currentTarget.value)
            }
          }}
          onBlur={(e) => {
            if (e.target.value !== (searchParams.get('search') ?? '')) {
              updateFilter('search', e.target.value)
            }
          }}
        />
      </div>

      {/* Filtre Action */}
      <Select
        value={searchParams.get('action') ?? 'all'}
        onValueChange={(v) => updateFilter('action', v)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les actions</SelectItem>
          {ACTION_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre Type d'entité */}
      <Select
        value={searchParams.get('entityType') ?? 'all'}
        onValueChange={(v) => updateFilter('entityType', v)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          {ENTITY_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date de début */}
      <Input
        type="date"
        className="w-full sm:w-40"
        value={searchParams.get('dateFrom') ?? ''}
        onChange={(e) => updateFilter('dateFrom', e.target.value)}
        disabled={disabled}
        aria-label="Date de début"
      />

      {/* Date de fin */}
      <Input
        type="date"
        className="w-full sm:w-40"
        value={searchParams.get('dateTo') ?? ''}
        onChange={(e) => updateFilter('dateTo', e.target.value)}
        disabled={disabled}
        aria-label="Date de fin"
      />

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          disabled={disabled}
        >
          <X className="mr-1 h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}

export { ACTION_OPTIONS, ENTITY_TYPE_OPTIONS, ENTITY_TYPE_LABELS }
