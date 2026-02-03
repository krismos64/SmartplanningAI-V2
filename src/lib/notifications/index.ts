/**
 * Export barrel pour les utilitaires de notifications
 *
 * @ticket SP-327
 */

export {
  sseManager,
  type SSEPayload,
  type SSENotificationPayload,
  type SSEPingPayload,
} from './sse-emitter'
export {
  emitNotification,
  emitNotificationToUsers,
  emitNotificationItem,
} from './emit-notification'
