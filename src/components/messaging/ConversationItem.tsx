/**
 * Item d'une conversation dans la liste
 *
 * @ticket SP-506
 */

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Archive, MoreHorizontal } from 'lucide-react'
import type { ConversationListItem } from '@/types/messaging'
import { getGroupAvatarColor, getGroupInitials } from './utils'

interface ConversationItemProps {
  conversation: ConversationListItem
  isSelected: boolean
  currentUserId: string
  onClick: () => void
  onArchive?: (id: string) => void
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  if (diffH < 24) return `il y a ${diffH}h`
  if (diffD === 1) return 'hier'
  if (diffD < 7) {
    return d.toLocaleDateString('fr-FR', { weekday: 'short' })
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
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

export function ConversationItem({
  conversation,
  isSelected,
  currentUserId,
  onClick,
  onArchive,
}: ConversationItemProps) {
  const name = getConversationName(conversation, currentUserId)
  const avatarImage = getOtherMemberImage(conversation, currentUserId)

  return (
    <div
      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
      }`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      aria-label={`Conversation avec ${name}`}
      aria-current={isSelected ? 'true' : undefined}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0">
        {/* Avatar custom du groupe ou photo de l'interlocuteur */}
        {(conversation.avatarUrl || avatarImage) && (
          <AvatarImage
            src={(conversation.avatarUrl || avatarImage)!}
            alt={name}
          />
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
            : getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium">{name}</p>
          {conversation.lastMessageAt && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-muted-foreground">
            {conversation.lastMessagePreview || 'Aucun message'}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge
              variant="default"
              size="sm"
              className="ml-2 shrink-0 tabular-nums"
            >
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Menu contextuel — visible au hover */}
      {onArchive && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
              aria-label="Options de la conversation"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onArchive(conversation.id)
              }}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archiver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
