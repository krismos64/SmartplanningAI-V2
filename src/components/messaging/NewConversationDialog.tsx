/**
 * Dialog pour créer une nouvelle conversation
 *
 * @ticket SP-506
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Loader2, Search, User, Users, X } from 'lucide-react'
import {
  createDirectConversation,
  createGroupConversation,
  getCompanyUsersForMessaging,
} from '@/lib/actions/messaging'
import type { ConversationWithDetails } from '@/types/messaging'

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

export function NewConversationDialog({
  open,
  onOpenChange,
  onCreated,
}: NewConversationDialogProps) {
  const [mode, setMode] = useState<Mode>('direct')
  const [search, setSearch] = useState('')
  const [groupName, setGroupName] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger les utilisateurs à l'ouverture du dialog
  useEffect(() => {
    if (!open) return

    setSearch('')
    setGroupName('')
    setSelectedIds(new Set())
    setIsCreating(false)
    setIsLoadingUsers(true)

    void getCompanyUsersForMessaging().then((result) => {
      if (result.success) {
        setCompanyUsers(result.data)
      }
      setIsLoadingUsers(false)
    })
  }, [open])

  // Filtrer les utilisateurs
  const filteredUsers = companyUsers.filter((u) => {
    if (!search.trim()) return true
    return u.name?.toLowerCase().includes(search.toLowerCase())
  })

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
          setError(result.error)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erreur lors de la création'
        )
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
        setError(result.error)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la création'
      )
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
        </DialogHeader>

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
                      {user.name
                        ?.split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) ?? '?'}
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
                      {user.name
                        ?.split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) ?? '?'}
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
            disabled={
              isCreating || !groupName.trim() || selectedIds.size === 0
            }
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
      </DialogContent>
    </Dialog>
  )
}
