/**
 * NotificationsProvider - Provider pour notifications temps réel
 *
 * @ticket SP-327
 * @description Fournit le contexte SSE et gère l'affichage des toasts
 */

'use client'

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'

import { useNotificationsStream } from '@/hooks/useNotificationsStream'
import { useNotificationsCount } from '@/hooks/useNotificationsCount'
import { showNotificationToast } from '@/components/notifications/NotificationToast'
import type { NotificationListItem } from '@/types/notification'

interface NotificationsContextValue {
  /** True si connecté au stream SSE */
  isConnected: boolean
  /** True si en cours de connexion */
  isConnecting: boolean
  /** Erreur de connexion le cas échéant */
  connectionError: string | null
  /** Dernière notification reçue via SSE */
  lastNotification: NotificationListItem | null
  /** Nombre de notifications non lues */
  unreadCount: number
  /** True si le compteur est en chargement */
  isCountLoading: boolean
  /** Forcer un refresh du compteur */
  refreshCount: () => void
  /** Forcer une reconnexion SSE */
  reconnect: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
)

interface NotificationsProviderProps {
  children: ReactNode
  /** Activer la connexion SSE (par défaut: true) */
  enabled?: boolean
}

/**
 * Provider pour les notifications temps réel
 *
 * Responsabilités :
 * - Gérer la connexion SSE
 * - Afficher les toasts pour les nouvelles notifications
 * - Rafraîchir le compteur quand une notification arrive
 * - Fournir l'état de connexion aux composants enfants
 *
 * Note: Le SSE est activé par défaut. L'authentification est vérifiée
 * côté serveur (l'API SSE renvoie 401 si non authentifié).
 *
 * @example
 * // Dans le layout
 * <NotificationsProvider>
 *   <App />
 * </NotificationsProvider>
 *
 * // Dans un composant
 * const { isConnected, unreadCount } = useNotifications()
 */
export function NotificationsProvider({
  children,
  enabled = true,
}: NotificationsProviderProps) {
  const router = useRouter()

  // Hook pour le compteur (SWR)
  const {
    count,
    isLoading: isCountLoading,
    mutate: mutateCount,
  } = useNotificationsCount()

  // Callback quand une notification arrive via SSE
  const handleNotification = useCallback(
    (notification: NotificationListItem) => {
      // Rafraîchir le compteur SWR
      void mutateCount()

      // Afficher le toast avec action de navigation
      showNotificationToast(notification, () => {
        if (notification.actionUrl) {
          router.push(notification.actionUrl)
        }
      })
    },
    [mutateCount, router]
  )

  // Hook pour le stream SSE
  // L'authentification est vérifiée côté serveur (401 si non authentifié)
  const {
    isConnected,
    isConnecting,
    error: connectionError,
    lastNotification,
    reconnect,
  } = useNotificationsStream({
    onNotification: handleNotification,
    enabled,
  })

  // Valeur du contexte mémorisée
  const contextValue = useMemo<NotificationsContextValue>(
    () => ({
      isConnected,
      isConnecting,
      connectionError,
      lastNotification,
      unreadCount: count,
      isCountLoading,
      refreshCount: () => void mutateCount(),
      reconnect,
    }),
    [
      isConnected,
      isConnecting,
      connectionError,
      lastNotification,
      count,
      isCountLoading,
      mutateCount,
      reconnect,
    ]
  )

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  )
}

/**
 * Hook pour accéder au contexte des notifications
 *
 * @throws Si utilisé en dehors d'un NotificationsProvider
 *
 * @example
 * const { isConnected, unreadCount, reconnect } = useNotifications()
 */
export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider'
    )
  }
  return context
}
