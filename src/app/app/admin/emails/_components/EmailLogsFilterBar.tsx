'use client'

/**
 * EmailLogsFilterBar — Filtres du journal des emails
 *
 * Pousse les filtres dans l'URL (searchParams) pour bookmarkability
 * (pattern audit-log-filter-bar SP-445). Le changement d'un filtre
 * réinitialise la page à 1.
 *
 * @ticket SP-545
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getCompanyOptionsAdmin,
  type CompanyOption,
} from '@/lib/actions/admin-users'
import {
  EMAIL_TYPE_META,
  EMAIL_CATEGORY_LABELS,
  type EmailCategory,
} from '@/lib/validations/email-logs'

// ============================================================================
// Constants
// ============================================================================

const ALL = 'ALL'

const STATUS_OPTIONS = [
  { value: ALL, label: 'Tous les statuts' },
  { value: 'SENT', label: 'Envoyé' },
  { value: 'FAILED', label: 'Échoué' },
  { value: 'BOUNCED', label: 'Rejeté (bounce)' },
] as const

/** Types groupés par catégorie pour le Select */
const TYPES_BY_CATEGORY = Object.entries(EMAIL_TYPE_META).reduce<
  Record<EmailCategory, { value: string; label: string }[]>
>(
  (acc, [type, meta]) => {
    acc[meta.category].push({ value: type, label: meta.label })
    return acc
  },
  { BILLING: [], AUTH: [], ADMIN: [] }
)

// ============================================================================
// Component
// ============================================================================

export function EmailLogsFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [companies, setCompanies] = useState<CompanyOption[]>([])

  useEffect(() => {
    getCompanyOptionsAdmin()
      .then(setCompanies)
      .catch(() => setCompanies([]))
  }, [])

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === ALL) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      // Tout changement de filtre repart de la page 1
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const clearFilters = useCallback(() => {
    router.push(pathname)
  }, [pathname, router])

  const hasActiveFilters =
    searchParams.has('emailType') ||
    searchParams.has('companyId') ||
    searchParams.has('status')

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {/* Type d'email (groupé par catégorie) */}
      <Select
        value={searchParams.get('emailType') ?? ALL}
        onValueChange={(value) => setFilter('emailType', value)}
      >
        <SelectTrigger
          className="w-full lg:w-64"
          data-testid="emails-type-filter"
        >
          <SelectValue placeholder="Filtrer par type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les types</SelectItem>
          {(
            Object.entries(TYPES_BY_CATEGORY) as [
              EmailCategory,
              { value: string; label: string }[],
            ][]
          ).map(([category, types]) => (
            <SelectGroup key={category}>
              <SelectLabel>{EMAIL_CATEGORY_LABELS[category]}</SelectLabel>
              {types.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {/* Entreprise */}
      <Select
        value={searchParams.get('companyId') ?? ALL}
        onValueChange={(value) => setFilter('companyId', value)}
      >
        <SelectTrigger
          className="w-full lg:w-56"
          data-testid="emails-company-filter"
        >
          <SelectValue placeholder="Filtrer par entreprise" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toutes les entreprises</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Statut */}
      <Select
        value={searchParams.get('status') ?? ALL}
        onValueChange={(value) => setFilter('status', value)}
      >
        <SelectTrigger
          className="w-full lg:w-48"
          data-testid="emails-status-filter"
        >
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          data-testid="emails-clear-filters"
        >
          <X className="mr-1 h-4 w-4" aria-hidden="true" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
