'use client'

/**
 * UsersDataTable — Liste admin cross-company des utilisateurs
 *
 * Fonctionnalités : recherche debounce, filtre rôle, pagination,
 * badges colorés, lien entreprise, export CSV, toggle statut.
 * Vue responsive : Table desktop (md+) / Cards mobile (<md).
 *
 * @ticket SP-472
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  Mail,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getAllUsersAdmin, type AdminUserRow } from '@/lib/actions/admin-users'

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 50

const ROLE_OPTIONS = [
  { value: 'ALL', label: 'Tous les rôles' },
  { value: 'SYSTEM_ADMIN', label: 'System Admin' },
  { value: 'DIRECTOR', label: 'Directeur' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'EMPLOYEE', label: 'Employé' },
] as const

type RoleFilter = (typeof ROLE_OPTIONS)[number]['value']

const ROLE_BADGE_VARIANT: Record<
  string,
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
> = {
  SYSTEM_ADMIN: 'destructive',
  DIRECTOR: 'default',
  MANAGER: 'info',
  EMPLOYEE: 'secondary',
}

const ROLE_LABELS: Record<string, string> = {
  SYSTEM_ADMIN: 'Admin',
  DIRECTOR: 'Directeur',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employé',
}

// ============================================================================
// CSV Export
// ============================================================================

function exportCsv(users: AdminUserRow[]) {
  const headers = ['ID', 'Email', 'Nom', 'Rôle', 'Entreprise', 'Inscription']
  const rows = users.map((u) => [
    u.id,
    u.email,
    u.name ?? '',
    u.role,
    u.companyName ?? '',
    new Date(u.createdAt).toISOString().split('T')[0],
  ])
  const csv = [headers, ...rows]
    .map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')
  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `smartplanning-users-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ============================================================================
// UserCard — Vue mobile
// ============================================================================

function UserCard({ user }: { user: AdminUserRow }) {
  return (
    <Card
      className="transition-all hover:border-primary/50"
      data-testid="user-card"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Name + status */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold">
                  {user.name ?? '—'}
                </h3>
              </div>
              {user.isActive ? (
                <Badge variant="success" size="sm">
                  Actif
                </Badge>
              ) : (
                <Badge variant="destructive" size="sm">
                  Inactif
                </Badge>
              )}
            </div>

            {/* Badges: Role */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={ROLE_BADGE_VARIANT[user.role] ?? 'secondary'}>
                {ROLE_LABELS[user.role] ?? user.role}
              </Badge>
              {user.companyName && (
                <Link
                  href="/app/admin/companies"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Building2 className="h-3 w-3" />
                  {user.companyName}
                </Link>
              )}
            </div>

            {/* Info: Email + Date */}
            <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>
                  Inscrit le{' '}
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Component
// ============================================================================

export function UsersDataTable() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // --------------------------------------------------
  // Fetch
  // --------------------------------------------------
  const fetchUsers = useCallback(
    async (p: number, s: string, role: RoleFilter) => {
      setIsLoading(true)
      try {
        const result = await getAllUsersAdmin({
          page: p,
          pageSize: PAGE_SIZE,
          search: s || undefined,
          role: role === 'ALL' ? undefined : role,
        })
        setUsers(result.users)
        setTotal(result.total)
      } finally {
        setIsLoading(false)
        setIsInitialLoad(false)
      }
    },
    []
  )

  // Initial load
  useEffect(() => {
    void fetchUsers(1, '', 'ALL')
  }, [fetchUsers])

  // --------------------------------------------------
  // Handlers
  // --------------------------------------------------
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      void fetchUsers(1, value, roleFilter)
    }, 300)
  }

  const handleRoleChange = (value: string) => {
    const role = value as RoleFilter
    setRoleFilter(role)
    setPage(1)
    void fetchUsers(1, search, role)
  }

  const handlePrev = () => {
    if (page <= 1) return
    const newPage = page - 1
    setPage(newPage)
    void fetchUsers(newPage, search, roleFilter)
  }

  const handleNext = () => {
    if (page >= totalPages) return
    const newPage = page + 1
    setPage(newPage)
    void fetchUsers(newPage, search, roleFilter)
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  if (isInitialLoad) {
    return <UsersTableSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Users className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
            <p className="text-sm text-muted-foreground">
              {total} utilisateur{total > 1 ? 's' : ''} sur la plateforme
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportCsv(users)}
          disabled={users.length === 0}
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            data-testid="users-search"
          />
        </div>
        <Select value={roleFilter} onValueChange={handleRoleChange}>
          <SelectTrigger
            className="w-full sm:w-48"
            data-testid="users-role-filter"
          >
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table desktop (md+) */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Chargement...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name ?? '—'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ROLE_BADGE_VARIANT[user.role] ?? 'secondary'}
                    >
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.companyId ? (
                      <Link
                        href="/app/admin/companies"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Building2 className="h-3 w-3" aria-hidden="true" />
                        {user.companyName ?? '—'}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="success" size="sm">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="destructive" size="sm">
                        Inactif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.companyId && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/app/admin/companies">Voir entreprise</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards mobile (<md) */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Chargement...
          </div>
        ) : users.length > 0 ? (
          users.map((user) => <UserCard key={user.id} user={user} />)
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            Aucun utilisateur trouvé
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Page {page} sur {totalPages} ({total} résultat
            {total > 1 ? 's' : ''})
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={page >= totalPages || isLoading}
            >
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Skeleton
// ============================================================================

function UsersTableSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label="Chargement des utilisateurs"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-48" />
      </div>
      {/* Desktop skeleton */}
      <div className="hidden md:block">
        <Skeleton className="h-96 w-full rounded-md" />
      </div>
      {/* Mobile skeleton */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
