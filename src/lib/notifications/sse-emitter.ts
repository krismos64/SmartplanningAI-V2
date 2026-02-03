/**
 * SSE Emitter - Gestionnaire de connexions Server-Sent Events
 *
 * @ticket SP-327
 * @description Singleton pour gérer les connexions SSE et émettre des notifications en temps réel
 */

import type { NotificationListItem } from '@/types/notification'

/**
 * Type pour les contrôleurs de connexion SSE
 */
interface SSEConnection {
  controller: ReadableStreamDefaultController<Uint8Array>
  userId: string
  connectedAt: Date
}

/**
 * Payload d'une notification SSE
 */
export interface SSENotificationPayload {
  type: 'notification'
  data: NotificationListItem
}

/**
 * Payload de ping pour keep-alive
 */
export interface SSEPingPayload {
  type: 'ping'
  timestamp: number
}

export type SSEPayload = SSENotificationPayload | SSEPingPayload

/**
 * Classe singleton pour gérer les connexions SSE
 *
 * Responsabilités :
 * - Maintenir la liste des connexions actives par utilisateur
 * - Émettre des notifications à des utilisateurs spécifiques
 * - Gérer le heartbeat pour garder les connexions actives
 * - Nettoyer les connexions fermées
 */
class NotificationSSEManager {
  private static instance: NotificationSSEManager
  private connections: Map<string, SSEConnection[]> = new Map()
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null

  private constructor() {
    // Démarrer le heartbeat
    this.startHeartbeat()
  }

  /**
   * Obtenir l'instance singleton
   */
  static getInstance(): NotificationSSEManager {
    if (!NotificationSSEManager.instance) {
      NotificationSSEManager.instance = new NotificationSSEManager()
    }
    return NotificationSSEManager.instance
  }

  /**
   * Ajouter une nouvelle connexion SSE pour un utilisateur
   */
  addConnection(
    userId: string,
    controller: ReadableStreamDefaultController<Uint8Array>
  ): void {
    const connection: SSEConnection = {
      controller,
      userId,
      connectedAt: new Date(),
    }

    const userConnections = this.connections.get(userId) || []
    userConnections.push(connection)
    this.connections.set(userId, userConnections)
  }

  /**
   * Retirer une connexion SSE
   */
  removeConnection(
    userId: string,
    controller: ReadableStreamDefaultController<Uint8Array>
  ): void {
    const userConnections = this.connections.get(userId)
    if (!userConnections) return

    const filtered = userConnections.filter((c) => c.controller !== controller)

    if (filtered.length === 0) {
      this.connections.delete(userId)
    } else {
      this.connections.set(userId, filtered)
    }
  }

  /**
   * Émettre une notification à un utilisateur spécifique
   */
  emitToUser(userId: string, notification: NotificationListItem): void {
    const userConnections = this.connections.get(userId)
    if (!userConnections || userConnections.length === 0) {
      return
    }

    const payload: SSENotificationPayload = {
      type: 'notification',
      data: notification,
    }

    const data = `data: ${JSON.stringify(payload)}\n\n`
    const encoder = new TextEncoder()
    const encoded = encoder.encode(data)

    const toRemove: ReadableStreamDefaultController<Uint8Array>[] = []

    for (const connection of userConnections) {
      try {
        connection.controller.enqueue(encoded)
      } catch {
        // Connexion fermée, marquer pour suppression
        toRemove.push(connection.controller)
      }
    }

    // Nettoyer les connexions mortes
    for (const controller of toRemove) {
      this.removeConnection(userId, controller)
    }
  }

  /**
   * Émettre à plusieurs utilisateurs
   */
  emitToUsers(userIds: string[], notification: NotificationListItem): void {
    for (const userId of userIds) {
      this.emitToUser(userId, notification)
    }
  }

  /**
   * Démarrer le heartbeat pour garder les connexions actives
   */
  private startHeartbeat(): void {
    // Heartbeat toutes les 30 secondes
    this.heartbeatInterval = setInterval(() => {
      this.sendPingToAll()
    }, 30000)
  }

  /**
   * Envoyer un ping à toutes les connexions
   */
  private sendPingToAll(): void {
    const payload: SSEPingPayload = {
      type: 'ping',
      timestamp: Date.now(),
    }

    const data = `data: ${JSON.stringify(payload)}\n\n`
    const encoder = new TextEncoder()
    const encoded = encoder.encode(data)

    for (const [userId, connections] of this.connections.entries()) {
      const toRemove: ReadableStreamDefaultController<Uint8Array>[] = []

      for (const connection of connections) {
        try {
          connection.controller.enqueue(encoded)
        } catch {
          toRemove.push(connection.controller)
        }
      }

      // Nettoyer les connexions mortes
      for (const controller of toRemove) {
        this.removeConnection(userId, controller)
      }
    }
  }

  /**
   * Obtenir le nombre de connexions actives
   */
  getConnectionCount(): number {
    let count = 0
    for (const connections of this.connections.values()) {
      count += connections.length
    }
    return count
  }

  /**
   * Obtenir le nombre de connexions pour un utilisateur
   */
  getUserConnectionCount(userId: string): number {
    return this.connections.get(userId)?.length || 0
  }

  /**
   * Arrêter le manager (pour les tests ou le shutdown)
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    this.connections.clear()
  }
}

/**
 * Instance singleton du manager SSE
 */
export const sseManager = NotificationSSEManager.getInstance()
