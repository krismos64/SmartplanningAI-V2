'use client'

/**
 * ContactMessagesFilterBar - Filtres des messages de contact
 *
 * Pousse les filtres dans l'URL (searchParams) pour bookmarkability
 * (meme pattern que le journal des emails, SP-545). Le changement d'un
 * filtre reinitialise la page a 1.
 *
 * @ticket SP-577
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CONTACT_EMAIL_STATUS_LABELS } from '@/lib/validations/contact-messages'

const ALL = 'ALL'

const READ_OPTIONS = [
  { value: ALL, label: 'Toutes les demandes' },
  { value: 'unread', label: 'À traiter' },
  { value: 'read', label: 'Déjà traitées' },
] as const

export function ContactMessagesFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  // L'URL fait foi : un retour arriere navigateur doit remettre le champ
  // dans l'etat correspondant.
  useEffect(() => {
    setSearch(searchParams.get('search') ?? '')
  }, [searchParams])

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === ALL || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const submitSearch = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      setFilter('search', search.trim())
    },
    [search, setFilter]
  )

  const clearFilters = useCallback(() => {
    setSearch('')
    router.push(pathname)
  }, [pathname, router])

  const hasActiveFilters =
    searchParams.has('search') ||
    searchParams.has('emailStatus') ||
    searchParams.has('readState')

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <form onSubmit={submitSearch} className="w-full lg:w-72">
        <label htmlFor="contact-search" className="sr-only">
          Rechercher par nom, email ou sujet
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="contact-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, email ou sujet"
            className="pl-9"
            data-testid="contact-search-filter"
          />
        </div>
      </form>

      <Select
        value={searchParams.get('readState') ?? ALL}
        onValueChange={(value) => setFilter('readState', value)}
      >
        <SelectTrigger
          className="w-full lg:w-48"
          data-testid="contact-read-filter"
        >
          <SelectValue placeholder="État de traitement" />
        </SelectTrigger>
        <SelectContent>
          {READ_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('emailStatus') ?? ALL}
        onValueChange={(value) => setFilter('emailStatus', value)}
      >
        <SelectTrigger
          className="w-full lg:w-52"
          data-testid="contact-status-filter"
        >
          <SelectValue placeholder="Notification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toutes les notifications</SelectItem>
          {Object.entries(CONTACT_EMAIL_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          data-testid="contact-clear-filters"
        >
          <X className="mr-1 h-4 w-4" aria-hidden="true" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
