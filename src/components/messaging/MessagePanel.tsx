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
import { ArrowLeft, Loader2, Lock, Camera } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { getGroupAvatarColor, getGroupInitials } from './utils'
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
              className={`h-9 w-9 ${conversation.type === 'GROUP' ? 'cursor-pointer' : ''}`}
              onClick={
                conversation.type === 'GROUP'
                  ? () => avatarInputRef.current?.click()
                  : undefined
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
            {conversation.type === 'GROUP' && (
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
            <p className="truncate text-sm font-medium">{name}</p>
            {conversation.type !== 'DIRECT' && (
              <p className="text-xs text-muted-foreground">
                {getMemberCountText(conversation)}
              </p>
            )}
          </div>
        </div>

        {/* Avatars des membres pour GROUP et TEAM */}
        {conversation.type !== 'DIRECT' && (
          <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-1 pl-12 lg:pl-0">
            {conversation.members.map((member) => (
              <div
                key={member.userId}
                className="flex shrink-0 flex-col items-center gap-0.5"
                title={member.user.name ?? 'Utilisateur'}
              >
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
                <span className="max-w-[48px] truncate text-[9px] text-muted-foreground">
                  {member.user.name?.split(' ')[0] ?? '?'}
                </span>
              </div>
            ))}
          </div>
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
    </div>
  )
}
