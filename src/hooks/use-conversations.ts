/**
 * Hook pour la liste des conversations
 *
 * @ticket SP-505
 */

'use client'

import { useEffect, useCallback } from 'react'
import useSWR from 'swr'
import {
  getConversations,
  archiveConversation as archiveAction,
} from '@/lib/actions/messaging'
import {
  onNewMessage,
  type NewMessageEventDetail,
} from '@/hooks/use-message-stream'
import type { ConversationListItem } from '@/types/messaging'

const SWR_KEY = 'messaging-conversations'
const REFRESH_INTERVAL = 60000

async function fetchConversations(): Promise<ConversationListItem[]> {
  const result = await getConversations()
  if (result.success) return result.data
  throw new Error(result.error)
}

export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR<
    ConversationListItem[],
    Error
  >(SWR_KEY, fetchConversations, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: true,
    fallbackData: [],
  })

  // Écouter les nouveaux messages SSE pour mettre à jour la liste
  useEffect(() => {
    const unsubscribe = onNewMessage((event: NewMessageEventDetail) => {
      void mutate(
        (current) => {
          if (!current) return current

          const convIndex = current.findIndex(
            (c) => c.id === event.conversationId
          )

          if (convIndex === -1) {
            // Conversation inconnue → on retourne current tel quel
            // et on déclenche un refetch séparé (voir revalidate: true)
            return current
          }

          // Remonter la conversation en tête et mettre à jour preview
          const updated = [...current]
          const conv = { ...updated[convIndex]! }
          const senderName =
            event.message.sender?.name ?? 'Utilisateur supprimé'
          conv.lastMessageAt = event.message.createdAt
          conv.lastMessagePreview = event.message.content
            ? `${senderName}: ${event.message.content.slice(0, 150)}`
            : `${senderName} a envoyé une pièce jointe`
          conv.unreadCount = (conv.unreadCount || 0) + 1

          updated.splice(convIndex, 1)
          updated.unshift(conv)
          return updated
        },
        { revalidate: true } // Toujours revalider pour récupérer les nouvelles conversations
      )
    })

    return unsubscribe
  }, [mutate])

  const refresh = useCallback(() => {
    void mutate()
  }, [mutate])

  const archiveConversation = useCallback(
    async (conversationId: string) => {
      // Optimistic : retirer de la liste immédiatement
      void mutate(
        (current) => current?.filter((c) => c.id !== conversationId),
        false
      )

      const result = await archiveAction(conversationId)

      if (!result.success) {
        // Rollback : remettre la conversation
        void mutate()
      }
    },
    [mutate]
  )

  return {
    conversations: data ?? [],
    isLoading,
    error: error?.message ?? null,
    refresh,
    archiveConversation,
    mutate,
  }
}
