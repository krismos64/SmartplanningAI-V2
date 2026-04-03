/**
 * Helpers d'émission SSE pour la messagerie
 *
 * @description Émet les nouveaux messages via le SSE Manager existant.
 * Pattern fire-and-forget identique à emit-notification.ts.
 *
 * @ticket SP-504
 */

import { sseManager } from './sse-emitter'
import type { MessageWithSender } from '@/types/messaging'

/**
 * Émet un nouveau message à tous les membres d'une conversation via SSE
 *
 * @param userIds - IDs des utilisateurs à notifier (exclure l'envoyeur)
 * @param conversationId - ID de la conversation
 * @param message - Message avec les infos du sender
 */
export function emitNewMessage(
  userIds: string[],
  conversationId: string,
  message: MessageWithSender
): void {
  const payload = {
    type: 'new_message' as const,
    data: { conversationId, message },
  }

  for (const userId of userIds) {
    try {
      sseManager.emitRaw(userId, payload)
    } catch (error) {
      console.error(`[emitNewMessage] Failed for user ${userId}:`, error)
    }
  }
}
