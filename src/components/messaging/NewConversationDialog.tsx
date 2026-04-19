/**
 * Dialog pour créer une nouvelle conversation
 *
 * - Rôles standards (MANAGER, DIRECTOR, EMPLOYEE) : UI inchangée, filtre client
 * - SYSTEM_ADMIN : filtres server-side (entreprise, rôle, nom), pagination
 *
 * @ticket SP-506, SP-518
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, User, Users, X, Building2 } from 'lucide-react'
import {
  createDirectConversation,
  createGroupConversation,
  getCompanyUsersForMessaging,
  searchAllUsersForAdmin,
  getCompaniesForAdmin,
} from '@/lib/actions/messaging'
import type { ConversationWithDetails, UserForMessagingAdmin } from '@/types/messaging'
import { UserRole } from '@prisma/client'

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (conversation: ConversationWithDetails) => void
}

type Mode = 'direct' | 'group'

interface CompanyUser {
  id: string
  name: string | null
  image: string | null
}

const ROLE_LABELS: Record<UserRole, string> = {
  SYSTEM_ADMIN: 'Admin système',
  DIRECTOR: 'Directeur',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employé',
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onCreated,
}: NewConversationDialogProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'SYSTEM_ADMIN'

  // ── État commun ──────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>('direct')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── État rôles standards ─────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [groupName, setGroupName] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  // ── État admin ───────────────────────────────────────────────────────────
  const [adminSearch, setAdminSearch] = useState('')
  const [adminCompanyFilter, setAdminCompanyFilter] = useState<string>('')
  const [adminRoleFilter, setAdminRoleFilter] = useState<string>('')
  const [adminPage, setAdminPage] = useState(1)
  const [adminUsers, setAdminUsers] = useState<UserForMessagingAdmin[]>([])
  const [adminTotal, setAdminTotal] = useState(0)
  const [adminHasMore, setAdminHasMore] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])

  // Debounce adminSearch via useRef
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(adminSearch)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [adminSearch])

  // ── Reset à l'ouverture ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    setError(null)
    setIsCreating(false)
    setMode('direct')

    if (isAdmin) {
      setAdminSearch('')
      setDebouncedSearch('')
      setAdminCompanyFilter('')
      setAdminRoleFilter('')
      setAdminPage(1)
      setAdminUsers([])
      setAdminTotal(0)
      setAdminHasMore(false)

      // Charger la liste des entreprises une seule fois
      void getCompaniesForAdmin().then((res) => {
        if (res.success) setCompanies(res.data)
      })
    } else {
      setSearch('')
      setGroupName('')
      setSelectedIds(new Set())
      setIsLoadingUsers(true)
      void getCompanyUsersForMessaging().then((result) => {
        if (result.success) setCompanyUsers(result.data)
        setIsLoadingUsers(false)
      })
    }
  }, [open, isAdmin])

  // ── Fetch admin paginé ───────────────────────────────────────────────────
  const fetchAdminUsers = useCallback(
    async (page = 1, reset = false) => {
      setAdminLoading(true)
      const result = await searchAllUsersForAdmin({
        search: debouncedSearch || undefined,
        companyId: adminCompanyFilter || undefined,
        role: (adminRoleFilter as UserRole) || undefined,
        page,
      })
      if (result.success && result.data) {
        const { users, total, hasMore } = result.data
        setAdminUsers((prev) => (reset ? users : [...prev, ...users]))
        setAdminTotal(total)
        setAdminHasMore(hasMore)
        setAdminPage(page)
      }
      setAdminLoading(false)
    },
    [debouncedSearch, adminCompanyFilter, adminRoleFilter]
  )

  // Relancer la recherche quand un filtre change
  useEffect(() => {
    if (!open || !isAdmin) return
    void fetchAdminUsers(1, true)
  }, [open, isAdmin, debouncedSearch, adminCompanyFilter, adminRoleFilter, fetchAdminUsers])

  // ── Handlers communs ─────────────────────────────────────────────────────
  const handleDirectSelect = useCallback(
    async (targetUserId: string) => {
      setIsCreating(true)
      setError(null)
      try {
        const result = await createDirectConversation(targetUserId)
        if (result.success) {
          onCreated(result.data)
          onOpenChange(false)
        } else {
          setError(result.error ?? 'Erreur lors de la création')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la création')
      } finally {
        setIsCreating(false)
      }
    },
    [onCreated, onOpenChange]
  )

  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim() || selectedIds.size === 0) return
    setIsCreating(true)
    setError(null)
    try {
      const result = await createGroupConversation({
        name: groupName.trim(),
        memberUserIds: Array.from(selectedIds),
      })
      if (result.success) {
        onCreated(result.data)
        onOpenChange(false)
      } else {
        setError(result.error ?? 'Erreur lors de la création')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setIsCreating(false)
    }
  }, [groupName, selectedIds, onCreated, onOpenChange])

  const toggleMember = useCallback((userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }, [])

  // ── Helpers avatar ───────────────────────────────────────────────────────
  function initials(name: string | null) {
    return (
      name
        ?.split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? '?'
    )
  }

  // ── UI filtrée (rôles standards) ─────────────────────────────────────────
  const filteredUsers = companyUsers.filter((u) => {
    if (!search.trim()) return true
    return u.name?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isAdmin ? 'sm:max-w-lg' : 'sm:max-w-md'}>
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
        </DialogHeader>

        {/* ── MODE ADMIN ───────────────────────────────────────────────── */}
        {isAdmin ? (
          <div className="space-y-3">
            {/* Ligne 1 : Select entreprise + Select rôle */}
            <div className="flex gap-2">
              <Select
                value={adminCompanyFilter}
                onValueChange={(v) => setAdminCompanyFilter(v === '__all__' ? '' : v)}
              >
                <SelectTrigger className="flex-1">
                  <Building2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="Toutes les entreprises" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Toutes les entreprises</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={adminRoleFilter}
                onValueChange={(v) => setAdminRoleFilter(v === '__all__' ? '' : v)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les rôles</SelectItem>
                  {(
                    [
                      UserRole.DIRECTOR,
                      UserRole.MANAGER,
                      UserRole.EMPLOYEE,
                    ] as UserRole[]
                  ).map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ligne 2 : Input recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Erreur */}
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Compteur */}
            {!adminLoading && adminTotal > 0 && (
              <p className="text-xs text-muted-foreground">
                {adminTotal} utilisateur{adminTotal > 1 ? 's' : ''} trouvé
                {adminTotal > 1 ? 's' : ''}
              </p>
            )}

            {/* Liste résultats */}
            <div className="max-h-[350px] overflow-y-auto space-y-1 pr-1">
              {adminLoading && adminUsers.length === 0 ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : adminUsers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Aucun utilisateur trouvé
                </p>
              ) : (
                <>
                  {adminUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => void handleDirectSelect(user.id)}
                      disabled={isCreating}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        {user.image && (
                          <AvatarImage src={user.image} alt={user.name ?? ''} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name ?? 'Utilisateur'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.companyName ?? '—'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </button>
                  ))}

                  {/* Charger plus */}
                  {adminHasMore && (
                    <button
                      onClick={() => void fetchAdminUsers(adminPage + 1)}
                      disabled={adminLoading}
                      className="w-full py-2 text-center text-xs text-primary hover:underline disabled:opacity-50"
                    >
                      {adminLoading ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        `Charger plus (${adminTotal - adminUsers.length} restants)`
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {isCreating && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : (
          /* ── MODE STANDARDS (UI inchangée) ──────────────────────────── */
          <>
            {/* Sélecteur de mode */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'direct' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('direct')}
                className="flex-1"
              >
                <User className="mr-2 h-4 w-4" />
                Message direct
              </Button>
              <Button
                variant={mode === 'group' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('group')}
                className="flex-1"
              >
                <Users className="mr-2 h-4 w-4" />
                Groupe
              </Button>
            </div>

            {/* Nom du groupe (mode group uniquement) */}
            {mode === 'group' && (
              <div className="space-y-2">
                <Label htmlFor="groupName">Nom du groupe</Label>
                <Input
                  id="groupName"
                  placeholder="Ex : Réunion d'équipe"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}

            {/* Erreur */}
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un collaborateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Membres sélectionnés (mode groupe) */}
            {mode === 'group' && selectedIds.size > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {companyUsers
                  .filter((u) => selectedIds.has(u.id))
                  .map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-1 pr-2 text-xs font-medium text-primary"
                    >
                      <Avatar className="h-5 w-5">
                        {user.image && (
                          <AvatarImage src={user.image} alt={user.name ?? ''} />
                        )}
                        <AvatarFallback className="bg-primary/20 text-[8px] text-primary">
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {user.name?.split(' ')[0] ?? 'Utilisateur'}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleMember(user.id)
                        }}
                        className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
                        aria-label={`Retirer ${user.name ?? 'utilisateur'}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {/* Liste des utilisateurs */}
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-1">
                {isLoadingUsers ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Aucun collaborateur trouvé
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/50"
                      onClick={() => {
                        if (mode === 'direct') {
                          void handleDirectSelect(user.id)
                        } else {
                          toggleMember(user.id)
                        }
                      }}
                      disabled={isCreating}
                    >
                      {mode === 'group' && (
                        <Checkbox
                          checked={selectedIds.has(user.id)}
                          className="shrink-0"
                          aria-hidden
                        />
                      )}
                      <Avatar className="h-8 w-8 shrink-0">
                        {user.image && (
                          <AvatarImage src={user.image} alt={user.name ?? ''} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name ?? 'Utilisateur'}</span>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Bouton créer (mode group) */}
            {mode === 'group' && (
              <Button
                onClick={() => void handleCreateGroup()}
                disabled={isCreating || !groupName.trim() || selectedIds.size === 0}
                className="w-full"
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Créer le groupe ({selectedIds.size} membre
                {selectedIds.size > 1 ? 's' : ''})
              </Button>
            )}

            {isCreating && mode === 'direct' && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
