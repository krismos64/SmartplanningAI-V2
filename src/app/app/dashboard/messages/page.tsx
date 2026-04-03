/**
 * Page principale de la messagerie interne
 *
 * @description Split-panel : ConversationList (gauche) + MessagePanel (droite).
 * Mobile : affiche la liste OU le panneau, pas les deux.
 *
 * @route /app/dashboard/messages
 * @ticket SP-505, SP-506
 */

'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageSquare, Lock } from 'lucide-react'
import { ConversationList } from '@/components/messaging/ConversationList'
import { MessagePanel } from '@/components/messaging/MessagePanel'
import { NewConversationDialog } from '@/components/messaging/NewConversationDialog'
import { useConversations } from '@/hooks/use-conversations'
import { useMessages } from '@/hooks/use-messages'
import type { ConversationWithDetails } from '@/types/messaging'

export default function MessagesPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? ''

  // Bloquer le scroll du layout parent quand la messagerie est montée
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const {
    conversations,
    isLoading: isLoadingConversations,
    archiveConversation,
    mutate: mutateConversations,
  } = useConversations()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  )

  const {
    messages,
    isLoading: isLoadingMessages,
    hasMore,
    loadMore,
    sendMessage,
    isSending,
  } = useMessages(selectedId)

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handleConversationCreated = useCallback(
    (conversation: ConversationWithDetails) => {
      // Injecter la conversation dans le cache SWR immédiatement
      // puis revalider en arrière-plan
      void mutateConversations(
        (current) => {
          const item = {
            id: conversation.id,
            type: conversation.type,
            name: conversation.name,
            teamId: conversation.teamId,
            avatarUrl: conversation.avatarUrl ?? null,
            lastMessageAt: conversation.lastMessageAt,
            lastMessagePreview: conversation.lastMessagePreview,
            members: conversation.members,
            unreadCount: 0,
            createdAt: conversation.createdAt,
          }
          return current ? [item, ...current] : [item]
        },
        { revalidate: true }
      )
      setSelectedId(conversation.id)
    },
    [mutateConversations]
  )

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-30 flex bg-background lg:left-[var(--sidebar-width)]">
      {/* Sidebar conversations */}
      <div
        className={`h-full w-full border-r lg:block lg:w-80 xl:w-96 ${
          selectedId ? 'hidden' : 'block'
        }`}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          currentUserId={userId}
          isLoading={isLoadingConversations}
          onSelect={handleSelect}
          onNewConversation={() => setShowNewDialog(true)}
          onArchive={(id) => {
            void archiveConversation(id)
            if (selectedId === id) setSelectedId(null)
          }}
        />
      </div>

      {/* Panneau messages */}
      <div
        className={`h-full flex-1 lg:block ${selectedId ? 'block' : 'hidden'}`}
      >
        {selectedConversation ? (
          <MessagePanel
            conversation={selectedConversation}
            messages={messages}
            isLoading={isLoadingMessages}
            hasMore={hasMore}
            isSending={isSending}
            currentUserId={userId}
            loadMore={loadMore}
            sendMessage={sendMessage}
            onBack={handleBack}
            onConversationUpdated={() => void mutateConversations()}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="rounded-full bg-primary/10 p-6">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">
              Bienvenue dans la messagerie
            </h2>
            <p className="max-w-sm text-muted-foreground">
              Échangez en toute confidentialité avec vos collègues. Sélectionnez
              une conversation ou créez-en une nouvelle.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground/70">
              <Lock className="h-3 w-3" />
              <span>Vos conversations sont privées</span>
            </div>
          </div>
        )}
      </div>

      {/* Dialog nouvelle conversation */}
      <NewConversationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onCreated={handleConversationCreated}
      />
    </div>
  )
}
