/**
 * Hook pour les messages d'une conversation
 *
 * @description Gère le chargement paginé (cursor), l'envoi optimistic,
 * le markAsRead et la réception temps réel via SSE.
 *
 * @ticket SP-505
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getMessages,
  sendMessage as sendMessageAction,
  markAsRead as markAsReadAction,
} from '@/lib/actions/messaging'
import {
  onNewMessage,
  type NewMessageEventDetail,
} from '@/hooks/use-message-stream'
import type { MessageWithSender, AttachmentData } from '@/types/messaging'

interface UseMessagesReturn {
  messages: MessageWithSender[]
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
  sendMessage: (
    content?: string,
    attachments?: AttachmentData[]
  ) => Promise<void>
  isSending: boolean
}

export function useMessages(conversationId: string | null): UseMessagesReturn {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const markedAsReadRef = useRef<string | null>(null)

  // Chargement initial quand la conversation change
  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setHasMore(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void getMessages(conversationId, { take: 30 }).then((result) => {
      if (cancelled) return
      if (result.success) {
        // L'API retourne DESC (récent en premier), on reverse pour affichage chronologique
        setMessages([...result.data.messages].reverse())
        setHasMore(result.data.hasMore)
      }
      setIsLoading(false)
    })

    // Mark as read (une seule fois par conversation)
    if (markedAsReadRef.current !== conversationId) {
      markedAsReadRef.current = conversationId
      void markAsReadAction(conversationId)
    }

    return () => {
      cancelled = true
    }
  }, [conversationId])

  // Écouter les nouveaux messages SSE pour CETTE conversation
  useEffect(() => {
    if (!conversationId) return

    const unsubscribe = onNewMessage((event: NewMessageEventDetail) => {
      if (event.conversationId === conversationId) {
        setMessages((prev) => [...prev, event.message])
        // Re-marquer comme lu puisqu'on est sur la conversation
        void markAsReadAction(conversationId)
      }
    })

    return unsubscribe
  }, [conversationId])

  // Charger les messages plus anciens (infinite scroll vers le haut)
  const loadMore = useCallback(() => {
    if (!conversationId || isLoading || !hasMore || messages.length === 0)
      return

    const oldestMessage = messages[0]
    if (!oldestMessage) return

    setIsLoading(true)

    void getMessages(conversationId, {
      cursor: oldestMessage.id,
      take: 30,
    }).then((result) => {
      if (result.success) {
        // Reverse les anciens messages (API retourne DESC) et les ajouter en tête
        setMessages((prev) => [...[...result.data.messages].reverse(), ...prev])
        setHasMore(result.data.hasMore)
      }
      setIsLoading(false)
    })
  }, [conversationId, isLoading, hasMore, messages])

  // Envoyer un message avec optimistic update
  const sendMessage = useCallback(
    async (content?: string, attachments?: AttachmentData[]) => {
      if (!conversationId) return

      setIsSending(true)

      // Optimistic : ajouter le message localement
      const tempId = `temp-${Date.now()}`
      const optimisticMessage: MessageWithSender = {
        id: tempId,
        conversationId,
        senderId: 'self',
        sender: null,
        content: content?.trim() || null,
        attachments: attachments ?? null,
        isDeleted: false,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      try {
        const result = await sendMessageAction({
          conversationId,
          content: content?.trim() || null,
          attachments,
        })

        if (result.success) {
          // Remplacer le message optimistic par le vrai
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? result.data : m))
          )
        } else {
          // Rollback
          setMessages((prev) => prev.filter((m) => m.id !== tempId))
        }
      } catch {
        // Rollback
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
      } finally {
        setIsSending(false)
      }
    },
    [conversationId]
  )

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
    sendMessage,
    isSending,
  }
}
