'use client'

/**
 * UsersDataTable — Liste admin cross-company des utilisateurs
 *
 * Fonctionnalités : recherche debounce, filtres rôle/entreprise/vérification,
 * pagination, badges colorés, lien entreprise, export CSV, renvoi email de
 * vérification (SP-543), impersonation directe (SP-543).
 * Vue responsive : Table desktop (md+) / Cards mobile (<md).
 *
 * @ticket SP-472, SP-543
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
  MailPlus,
  Eye,
  BadgeCheck,
  BadgeX,
} from 'lucide-react'

import { useIsImpersonating, useImpersonate } from '@/hooks'
import { useToast } from '@/components/toast/use-toast'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  getAllUsersAdmin,
  getCompanyOptionsAdmin,
  resendVerificationEmailAdmin,
  type AdminUserRow,
  type CompanyOption,
  type VerifiedFilter,
} from '@/lib/actions/admin-users'

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

const VERIFIED_OPTIONS: { value: VerifiedFilter; label: string }[] = [
  { value: 'ALL', label: 'Vérifiés et non vérifiés' },
  { value: 'VERIFIED', label: 'Email vérifié' },
  { value: 'UNVERIFIED', label: 'Email non vérifié' },
]

const ALL_COMPANIES = 'ALL'

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

interface Filters {
  search: string
  role: RoleFilter
  companyId: string
  verified: VerifiedFilter
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  role: 'ALL',
  companyId: ALL_COMPANIES,
  verified: 'ALL',
}

// ============================================================================
// CSV Export
// ============================================================================

function exportCsv(users: AdminUserRow[]) {
  const headers = [
    'ID',
    'Email',
    'Nom',
    'Rôle',
    'Entreprise',
    'Email vérifié',
    'Inscription',
  ]
  const rows = users.map((u) => [
    u.id,
    u.email,
    u.name ?? '',
    u.role,
    u.companyName ?? '',
    u.emailVerified ? 'Oui' : 'Non',
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
// VerifiedBadge
// ============================================================================

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge variant="success" size="sm" className="gap-1">
      <BadgeCheck className="h-3 w-3" aria-hidden="true" />
      Vérifié
    </Badge>
  ) : (
    <Badge variant="warning" size="sm" className="gap-1">
      <BadgeX className="h-3 w-3" aria-hidden="true" />
      Non vérifié
    </Badge>
  )
}

// ============================================================================
// RowActions — Renvoi vérification + impersonation (SP-543)
// ============================================================================

interface RowActionsProps {
  user: AdminUserRow
  isImpersonating: boolean
  resendingId: string | null
  onResend: (user: AdminUserRow) => void
  onImpersonate: (user: AdminUserRow) => void
}

function RowActions({
  user,
  isImpersonating,
  resendingId,
  onResend,
  onImpersonate,
}: RowActionsProps) {
  const canResend = !user.emailVerified && user.isActive
  const canImpersonate = Boolean(user.companyId) && user.role !== 'SYSTEM_ADMIN'

  if (!canResend && !canImpersonate) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {canResend && (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* touch-icon : cible 44px (WCAG 2.5.5) pour les boutons icône */}
            <Button
              variant="ghost"
              size="touch-icon"
              onClick={() => onResend(user)}
              disabled={resendingId === user.id}
              data-testid="resend-verification-btn"
              aria-label={`Renvoyer l'email de vérification à ${user.email}`}
            >
              <MailPlus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Renvoyer l&apos;email de vérification</TooltipContent>
        </Tooltip>
      )}
      {canImpersonate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="touch-icon"
              onClick={() => onImpersonate(user)}
              disabled={isImpersonating}
              data-testid="impersonate-user-btn"
              aria-label={`Voir l'espace client de ${user.companyName ?? ''}`}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isImpersonating
              ? 'Non disponible en mode support'
              : 'Voir espace client'}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// ============================================================================
// UserCard — Vue mobile
// ============================================================================

interface UserCardProps extends RowActionsProps {
  user: AdminUserRow
}

function UserCard({
  user,
  isImpersonating,
  resendingId,
  onResend,
  onImpersonate,
}: UserCardProps) {
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

            {/* Badges: Role + vérification */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={ROLE_BADGE_VARIANT[user.role] ?? 'secondary'}>
                {ROLE_LABELS[user.role] ?? user.role}
              </Badge>
              <VerifiedBadge verified={Boolean(user.emailVerified)} />
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

            {/* Actions (SP-543) */}
            <RowActions
              user={user}
              isImpersonating={isImpersonating}
              resendingId={resendingId}
              onResend={onResend}
              onImpersonate={onImpersonate}
            />
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
  const isImpersonating = useIsImpersonating()
  const { impersonate } = useImpersonate()
  const { success: toastSuccess, error: toastError } = useToast()

  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // --------------------------------------------------
  // Fetch
  // --------------------------------------------------
  const fetchUsers = useCallback(async (p: number, f: Filters) => {
    setIsLoading(true)
    setHasError(false)
    try {
      const result = await getAllUsersAdmin({
        page: p,
        pageSize: PAGE_SIZE,
        search: f.search || undefined,
        role: f.role === 'ALL' ? undefined : f.role,
        companyId: f.companyId === ALL_COMPANIES ? undefined : f.companyId,
        verified: f.verified === 'ALL' ? undefined : f.verified,
      })
      setUsers(result.users)
      setTotal(result.total)
    } catch (error) {
      // Sans catch, une erreur serveur (session expirée, DB down) serait
      // maquillée en « Aucun utilisateur trouvé » — on affiche un état d'erreur
      console.error('[UsersDataTable] Erreur chargement:', error)
      setHasError(true)
      setUsers([])
      setTotal(0)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [])

  // Initial load : utilisateurs + options entreprises pour le filtre
  useEffect(() => {
    void fetchUsers(1, DEFAULT_FILTERS)
    getCompanyOptionsAdmin()
      .then(setCompanies)
      .catch(() => setCompanies([]))
  }, [fetchUsers])

  // --------------------------------------------------
  // Handlers filtres
  // --------------------------------------------------
  const applyFilters = useCallback(
    (next: Filters) => {
      // Annuler un fetch de recherche débouncé en attente : il capturait un
      // snapshot de filtres périmé et écraserait ce résultat 300 ms plus tard
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setFilters(next)
      setPage(1)
      void fetchUsers(1, next)
    },
    [fetchUsers]
  )

  const handleSearchChange = (value: string) => {
    const next = { ...filters, search: value }
    setFilters(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      void fetchUsers(1, next)
    }, 300)
  }

  const handlePrev = () => {
    if (page <= 1) return
    const newPage = page - 1
    setPage(newPage)
    void fetchUsers(newPage, filters)
  }

  const handleNext = () => {
    if (page >= totalPages) return
    const newPage = page + 1
    setPage(newPage)
    void fetchUsers(newPage, filters)
  }

  // --------------------------------------------------
  // Renvoi email de vérification (SP-543)
  // --------------------------------------------------
  const handleResend = useCallback(
    (user: AdminUserRow) => {
      void (async () => {
        setResendingId(user.id)
        try {
          const result = await resendVerificationEmailAdmin(user.id)
          if (result.success) {
            toastSuccess(`Email de vérification renvoyé à ${user.email}`)
          } else {
            toastError(result.error ?? "Échec de l'envoi")
          }
        } catch {
          toastError("Échec de l'envoi de l'email de vérification")
        } finally {
          setResendingId(null)
        }
      })()
    },
    [toastSuccess, toastError]
  )

  // --------------------------------------------------
  // Impersonation directe (SP-543) — flux partagé useImpersonate
  // --------------------------------------------------
  const handleImpersonate = useCallback(
    (user: AdminUserRow) => {
      if (!user.companyId) return
      void (async () => {
        const result = await impersonate(user.companyId as string)
        if (!result.success && result.error) {
          toastError(result.error)
        }
      })()
    },
    [impersonate, toastError]
  )

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  if (isInitialLoad) {
    return <UsersTableSkeleton />
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Utilisateurs
              </h1>
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
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              data-testid="users-search"
            />
          </div>
          <Select
            value={filters.role}
            onValueChange={(value) =>
              applyFilters({ ...filters, role: value as RoleFilter })
            }
          >
            <SelectTrigger
              className="w-full lg:w-44"
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
          <Select
            value={filters.companyId}
            onValueChange={(value) =>
              applyFilters({ ...filters, companyId: value })
            }
          >
            <SelectTrigger
              className="w-full lg:w-52"
              data-testid="users-company-filter"
            >
              <SelectValue placeholder="Filtrer par entreprise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_COMPANIES}>
                Toutes les entreprises
              </SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.verified}
            onValueChange={(value) =>
              applyFilters({ ...filters, verified: value as VerifiedFilter })
            }
          >
            <SelectTrigger
              className="w-full lg:w-56"
              data-testid="users-verified-filter"
            >
              <SelectValue placeholder="Filtrer par vérification" />
            </SelectTrigger>
            <SelectContent>
              {VERIFIED_OPTIONS.map((opt) => (
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
                <TableHead>Vérifié</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Chargement...
                    </div>
                  </TableCell>
                </TableRow>
              ) : hasError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-destructive"
                  >
                    Erreur de chargement des utilisateurs — modifiez un filtre
                    pour réessayer
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
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
                    <TableCell>
                      <VerifiedBadge verified={Boolean(user.emailVerified)} />
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
                      <RowActions
                        user={user}
                        isImpersonating={isImpersonating}
                        resendingId={resendingId}
                        onResend={handleResend}
                        onImpersonate={handleImpersonate}
                      />
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
          ) : hasError ? (
            <p className="py-12 text-center text-destructive">
              Erreur de chargement des utilisateurs — modifiez un filtre pour
              réessayer
            </p>
          ) : users.length > 0 ? (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isImpersonating={isImpersonating}
                resendingId={resendingId}
                onResend={handleResend}
                onImpersonate={handleImpersonate}
              />
            ))
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
    </TooltipProvider>
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
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-10 w-56" />
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
