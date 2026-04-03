/**
 * Panneau principal des messages d'une conversation
 *
 * @description Header + zone messages (scroll inversé) + input.
 * Infinite scroll ascendant via IntersectionObserver.
 *
 * @ticket SP-506
 */

'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Loader2,
  Lock,
  Camera,
  Star,
  Pencil,
  UserPlus,
  X,
} from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { getGroupAvatarColor, getGroupInitials } from './utils'
import {
  renameGroupConversation,
  addGroupMember,
  removeGroupMember,
  getCompanyUsersForMessaging,
} from '@/lib/actions/messaging'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type {
  ConversationListItem,
  MessageWithSender,
  AttachmentData,
} from '@/types/messaging'

interface MessagePanelProps {
  conversation: ConversationListItem
  messages: MessageWithSender[]
  isLoading: boolean
  hasMore: boolean
  isSending: boolean
  currentUserId: string
  loadMore: () => void
  sendMessage: (
    content?: string,
    attachments?: AttachmentData[]
  ) => Promise<void>
  onBack: () => void
  onConversationUpdated?: () => void
}

function getConversationName(
  conv: ConversationListItem,
  currentUserId: string
): string {
  if (conv.name) return conv.name
  if (conv.type === 'DIRECT') {
    const other = conv.members.find((m) => m.userId !== currentUserId)
    return other?.user.name ?? 'Utilisateur supprimé'
  }
  return 'Conversation'
}

function getOtherMemberImage(
  conv: ConversationListItem,
  currentUserId: string
): string | null {
  if (conv.type !== 'DIRECT') return null
  const other = conv.members.find((m) => m.userId !== currentUserId)
  return other?.user.image ?? null
}

function getMemberCountText(conv: ConversationListItem): string {
  const count = conv.members.length
  return `${count} membre${count > 1 ? 's' : ''}`
}

export function MessagePanel({
  conversation,
  messages,
  isLoading,
  hasMore,
  isSending,
  currentUserId,
  loadMore,
  sendMessage,
  onBack,
  onConversationUpdated,
}: MessagePanelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const name = getConversationName(conversation, currentUserId)
  const avatarImage = getOtherMemberImage(conversation, currentUserId)
  const [groupAvatar, setGroupAvatar] = useState(conversation.avatarUrl)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Admin check
  const isAdmin =
    conversation.type === 'GROUP' &&
    conversation.members.some(
      (m) => m.userId === currentUserId && m.role === 'ADMIN'
    )

  // Gestion des membres (ADMIN uniquement)
  const [showAddMember, setShowAddMember] = useState(false)
  const [addMemberSearch, setAddMemberSearch] = useState('')
  const [availableUsers, setAvailableUsers] = useState<
    { id: string; name: string | null; image: string | null }[]
  >([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const openAddMemberDialog = useCallback(() => {
    setShowAddMember(true)
    setAddMemberSearch('')
    setIsLoadingUsers(true)
    void getCompanyUsersForMessaging().then((result) => {
      if (result.success) {
        // Exclure les membres déjà dans le groupe
        const existingIds = new Set(conversation.members.map((m) => m.userId))
        setAvailableUsers(result.data.filter((u) => !existingIds.has(u.id)))
      }
      setIsLoadingUsers(false)
    })
  }, [conversation.members])

  const handleAddMember = useCallback(
    async (userId: string) => {
      const result = await addGroupMember(conversation.id, userId)
      if (result.success) {
        setShowAddMember(false)
        onConversationUpdated?.()
      }
    },
    [conversation.id, onConversationUpdated]
  )

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      const result = await removeGroupMember(conversation.id, userId)
      if (result.success) {
        onConversationUpdated?.()
      }
    },
    [conversation.id, onConversationUpdated]
  )

  // Inline rename state
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(name)
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Reset group avatar quand la conversation change
  useEffect(() => {
    setGroupAvatar(conversation.avatarUrl)
  }, [conversation.avatarUrl, conversation.id])

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversationId', conversation.id)

      try {
        const res = await fetch('/api/messages/group-avatar', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = (await res.json()) as { url: string }
          setGroupAvatar(data.url)
          // Rafraîchir la liste des conversations pour mettre à jour l'avatar dans la sidebar
          onConversationUpdated?.()
        } else {
          const err = (await res.json()) as { error: string }
          console.error('[group-avatar] Upload error:', err.error)
        }
      } catch (err) {
        console.error('[group-avatar] Upload failed:', err)
      }

      if (avatarInputRef.current) avatarInputRef.current.value = ''
    },
    [conversation.id, onConversationUpdated]
  )

  const handleRenameSubmit = useCallback(async () => {
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === name || trimmed.length < 2) {
      setIsRenaming(false)
      setRenameValue(name)
      return
    }

    setIsRenaming(false)
    const result = await renameGroupConversation(conversation.id, trimmed)
    if (result.success) {
      onConversationUpdated?.()
    } else {
      setRenameValue(name) // Rollback
    }
  }, [renameValue, name, conversation.id, onConversationUpdated])

  // Focus l'input de rename quand il apparaît
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [isRenaming])

  // IntersectionObserver pour l'infinite scroll ascendant
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  // Scroll vers le bas au chargement initial
  const initialScrollDoneRef = useRef(false)
  useEffect(() => {
    if (messages.length > 0 && !isLoading && !initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true
      requestAnimationFrame(() => {
        const container = scrollContainerRef.current
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  }, [messages.length, isLoading])

  // Reset le flag quand la conversation change
  useEffect(() => {
    initialScrollDoneRef.current = false
  }, [conversation.id])

  // Auto-scroll vers le bas quand un nouveau message arrive (si déjà en bas)
  const prevMessageCountRef = useRef(messages.length)
  useEffect(() => {
    if (
      messages.length > prevMessageCountRef.current &&
      initialScrollDoneRef.current
    ) {
      const container = scrollContainerRef.current
      if (container) {
        const isAtBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          150
        if (isAtBottom) {
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight
          })
        }
      }
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length])

  const handleSend = useCallback(
    async (content?: string, attachments?: AttachmentData[]) => {
      await sendMessage(content, attachments)
      // Scroll vers le bas après envoi
      requestAnimationFrame(() => {
        const container = scrollContainerRef.current
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },
    [sendMessage]
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onBack}
            aria-label="Retour à la liste"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative shrink-0">
            <Avatar
              className={`h-9 w-9 ${isAdmin ? 'cursor-pointer' : ''}`}
              onClick={
                isAdmin ? () => avatarInputRef.current?.click() : undefined
              }
            >
              {(groupAvatar || avatarImage) && (
                <AvatarImage src={(groupAvatar || avatarImage)!} alt={name} />
              )}
              <AvatarFallback
                className={
                  conversation.type !== 'DIRECT'
                    ? `${getGroupAvatarColor(name)} text-xs font-bold text-white`
                    : 'bg-primary/10 text-xs text-primary'
                }
              >
                {conversation.type !== 'DIRECT'
                  ? getGroupInitials(name)
                  : name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {isAdmin && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
                aria-label="Modifier l'avatar du groupe"
              >
                <Camera className="h-3 w-3" />
              </button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              onChange={(e) => void handleAvatarUpload(e)}
              className="hidden"
            />
          </div>
          <div className="min-w-0 flex-1">
            {/* Nom du groupe — inline rename pour ADMIN */}
            {isRenaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleRenameSubmit()
                  if (e.key === 'Escape') {
                    setIsRenaming(false)
                    setRenameValue(name)
                  }
                }}
                onBlur={() => void handleRenameSubmit()}
                className="w-full rounded border bg-muted/50 px-2 py-0.5 text-sm font-medium outline-none focus:border-primary"
                maxLength={100}
              />
            ) : (
              <div className="flex items-center gap-1">
                <p className="truncate text-sm font-medium">{name}</p>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setRenameValue(name)
                      setIsRenaming(true)
                    }}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Renommer le groupe"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
            {conversation.type !== 'DIRECT' && (
              <p className="text-xs text-muted-foreground">
                {getMemberCountText(conversation)}
              </p>
            )}
          </div>
        </div>

        {/* Avatars des membres pour GROUP et TEAM */}
        {conversation.type !== 'DIRECT' && (
          <TooltipProvider>
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 pl-12 lg:pl-0">
              {conversation.members.map((member) => (
                <Tooltip key={member.userId}>
                  <TooltipTrigger asChild>
                    <div className="group/member flex shrink-0 flex-col items-center gap-0.5">
                      <div className="relative">
                        <Avatar className="h-7 w-7">
                          {member.user.image && (
                            <AvatarImage
                              src={member.user.image}
                              alt={member.user.name ?? ''}
                            />
                          )}
                          <AvatarFallback className="bg-muted text-[9px]">
                            {member.user.name
                              ?.split(' ')
                              .map((w) => w[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) ?? '?'}
                          </AvatarFallback>
                        </Avatar>
                        {member.role === 'ADMIN' && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 shadow-sm">
                            <Star className="h-2 w-2 fill-white text-white" />
                          </span>
                        )}
                        {/* Bouton retirer (ADMIN seulement, pas sur soi-même) */}
                        {isAdmin &&
                          member.userId !== currentUserId &&
                          member.role !== 'ADMIN' && (
                            <button
                              onClick={() =>
                                void handleRemoveMember(member.userId)
                              }
                              className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm group-hover/member:flex"
                              aria-label={`Retirer ${member.user.name ?? 'membre'}`}
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          )}
                      </div>
                      <span className="max-w-[48px] truncate text-[9px] text-muted-foreground">
                        {member.user.name?.split(' ')[0] ?? '?'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {member.user.name ?? 'Utilisateur'}
                    {member.role === 'ADMIN' && ' — Admin'}
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Bouton ajouter un membre (ADMIN seulement) */}
              {isAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={openAddMemberDialog}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      aria-label="Ajouter un membre"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Ajouter un membre
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        )}
      </div>

      {/* Zone de messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        {/* Sentinelle pour l'infinite scroll (en haut) */}
        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Bandeau confidentialité */}
        <div className="mx-auto my-4 flex max-w-md items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
          <Lock className="h-3 w-3 shrink-0" />
          <span>
            Les messages sont privés et visibles uniquement par les participants
            de cette conversation
          </span>
        </div>

        {/* Loading initial */}
        {isLoading && messages.length === 0 ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <Skeleton
                  className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-36'}`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              Envoyez le premier message !
            </p>
          </div>
        ) : (
          <div>
            {messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : null
              const nextMsg =
                index < messages.length - 1 ? messages[index + 1] : null

              // Séparateur de date
              const showDateSep =
                prevMsg &&
                new Date(msg.createdAt).toDateString() !==
                  new Date(prevMsg.createdAt).toDateString()

              // Groupement : même auteur + écart < 5 min
              const isSameSenderAsPrev =
                prevMsg &&
                !showDateSep &&
                prevMsg.senderId === msg.senderId &&
                Math.abs(
                  new Date(msg.createdAt).getTime() -
                    new Date(prevMsg.createdAt).getTime()
                ) < 300000
              const isSameSenderAsNext =
                nextMsg &&
                nextMsg.senderId === msg.senderId &&
                new Date(nextMsg.createdAt).toDateString() ===
                  new Date(msg.createdAt).toDateString() &&
                Math.abs(
                  new Date(nextMsg.createdAt).getTime() -
                    new Date(msg.createdAt).getTime()
                ) < 300000

              const isFirstInGroup = !isSameSenderAsPrev
              const isLastInGroup = !isSameSenderAsNext
              const isGrouped = !!isSameSenderAsPrev

              // Espacement dynamique
              const spacingClass = showDateSep
                ? 'mt-6'
                : isGrouped
                  ? 'mt-0.5'
                  : index === 0
                    ? ''
                    : 'mt-4'

              return (
                <div key={msg.id} className={spacingClass}>
                  {showDateSep && (
                    <div className="mb-4 flex items-center gap-3 py-2">
                      <Separator className="flex-1" />
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                      <Separator className="flex-1" />
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isOwn={
                      msg.senderId === currentUserId || msg.senderId === 'self'
                    }
                    isFirstInGroup={isFirstInGroup}
                    isGrouped={isGrouped}
                    isLastInGroup={isLastInGroup}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        conversationId={conversation.id}
        disabled={isSending}
      />

      {/* Dialog ajout de membre */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un membre</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Input
              placeholder="Rechercher un collaborateur..."
              value={addMemberSearch}
              onChange={(e) => setAddMemberSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="max-h-[300px]">
            <div className="space-y-1">
              {isLoadingUsers ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                availableUsers
                  .filter(
                    (u) =>
                      !addMemberSearch.trim() ||
                      u.name
                        ?.toLowerCase()
                        .includes(addMemberSearch.toLowerCase())
                  )
                  .map((user) => (
                    <button
                      key={user.id}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/50"
                      onClick={() => void handleAddMember(user.id)}
                    >
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
                      <span className="text-sm">
                        {user.name ?? 'Utilisateur'}
                      </span>
                    </button>
                  ))
              )}
              {!isLoadingUsers &&
                availableUsers.filter(
                  (u) =>
                    !addMemberSearch.trim() ||
                    u.name
                      ?.toLowerCase()
                      .includes(addMemberSearch.toLowerCase())
                ).length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Aucun collaborateur disponible
                  </p>
                )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
