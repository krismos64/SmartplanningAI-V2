'use client'

/**
 * Barre de filtres simplifiée pour l'activité utilisateur
 *
 * Uniquement le filtre par type d'action (pas de recherche, pas de filtre entreprise).
 * Pousse le filtre dans l'URL pour bookmarkability.
 *
 * @ticket SP-463
 */

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import type { AuditAction } from '@prisma/client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: 'CREATE', label: 'Création' },
  { value: 'UPDATE', label: 'Modification' },
  { value: 'DELETE', label: 'Suppression' },
  { value: 'STATUS_CHANGE', label: 'Changement de statut' },
  { value: 'LOGIN', label: 'Connexion' },
  { value: 'LOGOUT', label: 'Déconnexion' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'PASSWORD_CHANGE', label: 'Mot de passe' },
]

export function UserActivityFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set('action', value)
      } else {
        params.delete('action')
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [pathname, router])

  const hasActiveFilter = searchParams.has('action')

  return (
    <div className="flex items-center gap-3">
      <Select
        value={searchParams.get('action') ?? 'all'}
        onValueChange={updateFilter}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Type d'action" />
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

      {hasActiveFilter && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="mr-1 h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
