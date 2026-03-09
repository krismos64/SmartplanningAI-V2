/**
 * Hook useNotificationsStream - Connexion SSE pour notifications temps réel
 *
 * @ticket SP-327
 * @description Gère la connexion SSE et les callbacks pour les nouvelles notifications
 */

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { NotificationListItem } from '@/types/notification'
import type { SSEPayload } from '@/lib/notifications/sse-emitter'

/** Délai avant reconnexion après erreur (en ms) */
const RECONNECT_DELAY = 5000

/** Nombre maximum de tentatives de reconnexion */
const MAX_RECONNECT_ATTEMPTS = 5

interface UseNotificationsStreamOptions {
  /** Callback appelé à chaque nouvelle notification */
  onNotification?: (notification: NotificationListItem) => void
  /** Activer/désactiver la connexion SSE */
  enabled?: boolean
}

interface UseNotificationsStreamReturn {
  /** True si connecté au stream SSE */
  isConnected: boolean
  /** True si en cours de connexion */
  isConnecting: boolean
  /** Erreur de connexion le cas échéant */
  error: string | null
  /** Dernière notification reçue */
  lastNotification: NotificationListItem | null
  /** Nombre de reconnexions effectuées */
  reconnectCount: number
  /** Forcer une reconnexion */
  reconnect: () => void
}

/**
 * Hook pour se connecter au stream SSE de notifications
 *
 * @param options - Options de configuration
 * @returns État de la connexion et dernière notification
 *
 * @example
 * const { isConnected, lastNotification } = useNotificationsStream({
 *   onNotification: (notif) => {
 *     toast.info(notif.title)
 *     mutateCount() // Rafraîchir le compteur SWR
 *   }
 * })
 */
export function useNotificationsStream(
  options: UseNotificationsStreamOptions = {}
): UseNotificationsStreamReturn {
  const { onNotification, enabled = true } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastNotification, setLastNotification] =
    useState<NotificationListItem | null>(null)
  const [reconnectCount, setReconnectCount] = useState(0)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const onNotificationRef = useRef(onNotification)

  // Garder la référence du callback à jour
  useEffect(() => {
    onNotificationRef.current = onNotification
  }, [onNotification])

  /**
   * Fermer la connexion existante
   */
  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  /**
   * Établir la connexion SSE
   */
  const connect = useCallback(() => {
    // Ne pas connecter si désactivé ou déjà connecté
    if (!enabled || eventSourceRef.current) return

    setIsConnecting(true)
    setError(null)

    try {
      const eventSource = new EventSource('/api/notifications/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        reconnectAttemptsRef.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as SSEPayload

          if (payload.type === 'notification') {
            const notification = payload.data
            setLastNotification(notification)

            // Appeler le callback si fourni
            if (onNotificationRef.current) {
              onNotificationRef.current(notification)
            }
          }
          // Les pings sont ignorés côté client (juste du keep-alive)
        } catch {
          // Erreur de parsing silencieuse
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        setIsConnecting(false)

        // Fermer la connexion en erreur
        eventSource.close()
        eventSourceRef.current = null

        // Tenter une reconnexion si pas trop de tentatives
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++
          setReconnectCount((c) => c + 1)
          setError(
            `Connexion perdue. Reconnexion dans ${RECONNECT_DELAY / 1000}s...`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, RECONNECT_DELAY)
        } else {
          setError(
            'Impossible de se connecter au serveur. Veuillez rafraîchir la page.'
          )
        }
      }
    } catch {
      setIsConnecting(false)
      setError('Erreur de connexion au stream de notifications')
    }
  }, [enabled])

  /**
   * Forcer une reconnexion manuelle
   */
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    closeConnection()
    connect()
  }, [closeConnection, connect])

  // Connexion/déconnexion selon l'état enabled
  useEffect(() => {
    if (enabled) {
      connect()
    } else {
      closeConnection()
    }

    return () => {
      closeConnection()
    }
  }, [enabled, connect, closeConnection])

  // Reconnexion au focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      if (enabled && !isConnected && !isConnecting) {
        reconnectAttemptsRef.current = 0
        connect()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [enabled, isConnected, isConnecting, connect])

  // Reconnexion au retour online
  useEffect(() => {
    const handleOnline = () => {
      if (enabled && !isConnected && !isConnecting) {
        reconnectAttemptsRef.current = 0
        connect()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [enabled, isConnected, isConnecting, connect])

  return {
    isConnected,
    isConnecting,
    error,
    lastNotification,
    reconnectCount,
    reconnect,
  }
}
