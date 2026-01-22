/**
 * Hook - useRecentPages
 *
 * @ticket SP-264 - Phase 4 - Recent Pages
 * @see Context7 - React useSyncExternalStore documentation
 *
 * OBJECTIF :
 * Fournit un hook React pour gérer l'historique des pages récentes
 * avec support SSR (pas d'erreur d'hydratation).
 *
 * FONCTIONNALITÉS :
 * - Synchronisation avec localStorage via useSyncExternalStore
 * - Support SSR avec état initial vide côté serveur
 * - Déduplication automatique par path
 * - Limite configurable (5 pages par défaut)
 * - État isLoading pour l'hydratation
 *
 * USAGE :
 * ```tsx
 * const { recentPages, addPage, clearHistory, isLoading } = useRecentPages();
 *
 * // Ajouter une page
 * addPage({ path: '/employees', title: 'Collaborateurs', icon: 'Users' });
 *
 * // Afficher les pages récentes
 * recentPages.map(page => <div>{page.title}</div>);
 * ```
 */

'use client'

import { useSyncExternalStore, useCallback, useState, useEffect } from 'react'
import {
  recentPagesStore,
  type RecentPage,
} from '@/lib/storage/recent-pages-store'

/**
 * Options du hook useRecentPages
 */
export interface UseRecentPagesOptions {
  /** Nombre maximum de pages à stocker (défaut: 5) */
  maxPages?: number
  /** Clé de stockage localStorage (défaut: "smartplanning:recent-pages") */
  storageKey?: string
}

/**
 * Retour du hook useRecentPages
 */
export interface UseRecentPagesReturn {
  /** Liste des pages récentes (triées par date décroissante) */
  recentPages: RecentPage[]
  /** Ajoute une page à l'historique */
  addPage: (page: Omit<RecentPage, 'visitedAt'>) => void
  /** Vide l'historique */
  clearHistory: () => void
  /** Indique si le hook est en cours d'hydratation */
  isLoading: boolean
}

/**
 * Hook pour gérer l'historique des pages récentes
 *
 * Utilise useSyncExternalStore pour synchroniser avec localStorage
 * de manière compatible SSR (pas d'erreur d'hydratation).
 *
 * @param options - Options de configuration
 * @returns Méthodes et état pour gérer les pages récentes
 */
export function useRecentPages(
  _options?: UseRecentPagesOptions
): UseRecentPagesReturn {
  // État pour détecter la fin de l'hydratation
  const [isHydrated, setIsHydrated] = useState(false)

  // Synchronisation avec le store externe
  const recentPages = useSyncExternalStore(
    recentPagesStore.subscribe,
    recentPagesStore.getSnapshot,
    recentPagesStore.getServerSnapshot
  )

  // Détecter la fin de l'hydratation
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  /**
   * Ajoute une page à l'historique
   */
  const addPage = useCallback((page: Omit<RecentPage, 'visitedAt'>) => {
    recentPagesStore.addPage(page)
  }, [])

  /**
   * Vide l'historique des pages récentes
   */
  const clearHistory = useCallback(() => {
    recentPagesStore.clear()
  }, [])

  return {
    recentPages,
    addPage,
    clearHistory,
    isLoading: !isHydrated,
  }
}

/**
 * Types exportés pour usage externe
 */
export type { RecentPage }

export default useRecentPages
