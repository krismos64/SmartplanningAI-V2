/**
 * Liste des conversations (sidebar messagerie)
 *
 * @ticket SP-506
 */

'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, MessageSquare } from 'lucide-react'
import { ConversationItem } from './ConversationItem'
import type { ConversationListItem } from '@/types/messaging'

interface ConversationListProps {
  conversations: ConversationListItem[]
  selectedId: string | null
  currentUserId: string
  isLoading: boolean
  onSelect: (id: string) => void
  onNewConversation: () => void
  onArchive?: (id: string) => void
}

export function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  isLoading,
  onSelect,
  onNewConversation,
  onArchive,
}: ConversationListProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter((conv) => {
      if (conv.name?.toLowerCase().includes(q)) return true
      return conv.members.some((m) => m.user.name?.toLowerCase().includes(q))
    })
  }, [conversations, search])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="space-y-3 border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewConversation}
            aria-label="Nouvelle conversation"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Liste */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium">
                {search ? 'Aucune conversation trouvée' : 'Aucune conversation'}
              </p>
              {!search && (
                <p className="text-xs text-muted-foreground">
                  Cliquez sur + pour envoyer votre premier message
                </p>
              )}
            </div>
          ) : (
            filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedId}
                currentUserId={currentUserId}
                onClick={() => onSelect(conv.id)}
                onArchive={onArchive}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
