/**
 * Hook pour recevoir les événements SSE de messagerie
 *
 * @description Dispatch les événements new_message via custom events sur window.
 * Les hooks use-conversations et use-messages écoutent ces événements.
 * Ce hook est instancié dans le NotificationsProvider (un seul endroit).
 *
 * @ticket SP-505
 */

'use client'

import type { MessageWithSender } from '@/types/messaging'

/** Nom de l'événement custom pour les nouveaux messages */
export const NEW_MESSAGE_EVENT = 'smartplanning:new_message'

export interface NewMessageEventDetail {
  conversationId: string
  message: MessageWithSender
}

/**
 * Dispatch un événement SSE new_message à tous les hooks qui écoutent
 */
export function dispatchNewMessageEvent(data: NewMessageEventDetail): void {
  window.dispatchEvent(new CustomEvent(NEW_MESSAGE_EVENT, { detail: data }))
}

/**
 * Helper pour écouter les événements new_message (utilisé dans les hooks)
 */
export function onNewMessage(
  callback: (data: NewMessageEventDetail) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<NewMessageEventDetail>
    callback(customEvent.detail)
  }
  window.addEventListener(NEW_MESSAGE_EVENT, handler)
  return () => window.removeEventListener(NEW_MESSAGE_EVENT, handler)
}
