/**
 * Recent Pages Store - Store externe pour localStorage
 *
 * @ticket SP-264 - Phase 4 - Recent Pages
 * @see Context7 - React useSyncExternalStore documentation
 *
 * OBJECTIF :
 * Fournit un store compatible avec useSyncExternalStore pour gérer
 * l'historique des pages récentes dans localStorage.
 *
 * FONCTIONNALITÉS :
 * - Persistance dans localStorage
 * - Notification des listeners lors des changements
 * - Gestion SSR avec getServerSnapshot
 * - Déduplication par path
 * - Limite configurable (5 pages par défaut)
 *
 * RGPD COMPLIANCE :
 * Ne stocke que des données non sensibles :
 * - Routes (ex: "/employees")
 * - Titres de pages (ex: "Employés")
 * - Noms d'icônes (ex: "Users")
 * - Timestamps
 */

/**
 * Interface d'une page récente
 */
export interface RecentPage {
  /** Chemin de la page (ex: "/app/tableau-de-bord/employes") */
  path: string
  /** Titre affiché (ex: "Collaborateurs") */
  title: string
  /** Nom de l'icône Lucide (ex: "Users") */
  icon?: string
  /** Timestamp de la dernière visite */
  visitedAt: number
}

/** Clé de stockage dans localStorage */
const STORAGE_KEY = 'smartplanning:recent-pages'

/** Nombre maximum de pages récentes */
const MAX_PAGES = 5

/** Set des listeners pour les notifications */
const listeners = new Set<() => void>()

/** Cache mémoire pour éviter de parser JSON à chaque lecture */
let cachedPages: RecentPage[] | null = null

/** Snapshot SSR constant (même référence pour éviter boucle infinie) */
const SERVER_SNAPSHOT: RecentPage[] = []

/**
 * Notifie tous les listeners d'un changement
 */
function emitChange(): void {
  cachedPages = null // Invalide le cache
  listeners.forEach((listener) => listener())
}

/**
 * Lit les pages depuis localStorage
 */
function readFromStorage(): RecentPage[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed: unknown = JSON.parse(stored)

    // Validation basique de la structure
    if (!Array.isArray(parsed)) {
      return []
    }

    // Filtrer les entrées invalides
    return parsed.filter((item): item is RecentPage => {
      if (typeof item !== 'object' || item === null) {
        return false
      }
      const obj = item as Record<string, unknown>
      return (
        typeof obj.path === 'string' &&
        typeof obj.title === 'string' &&
        typeof obj.visitedAt === 'number'
      )
    })
  } catch {
    // JSON parse error ou autre erreur
    return []
  }
}

/**
 * Écrit les pages dans localStorage
 */
function writeToStorage(pages: RecentPage[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages))
  } catch {
    // Quota exceeded ou autre erreur - on ignore silencieusement
    console.warn('[RecentPagesStore] Failed to write to localStorage')
  }
}

/**
 * Store pour les pages récentes
 *
 * Compatible avec React useSyncExternalStore
 */
export const recentPagesStore = {
  /**
   * Retourne le snapshot actuel des pages récentes
   * Utilisé par useSyncExternalStore côté client
   */
  getSnapshot(): RecentPage[] {
    if (cachedPages === null) {
      cachedPages = readFromStorage()
    }
    return cachedPages
  },

  /**
   * Retourne le snapshot côté serveur (toujours vide)
   * Évite les erreurs d'hydratation SSR
   */
  getServerSnapshot(): RecentPage[] {
    return SERVER_SNAPSHOT
  },

  /**
   * S'abonne aux changements du store
   * Retourne une fonction de désabonnement
   */
  subscribe(callback: () => void): () => void {
    listeners.add(callback)

    // Écouter les changements localStorage d'autres onglets
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        emitChange()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }

    return () => {
      listeners.delete(callback)
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  },

  /**
   * Ajoute une page à l'historique
   * - Déduplique par path (la page existante est mise à jour)
   * - Limite à MAX_PAGES entrées
   * - Met la nouvelle page en premier
   */
  addPage(page: Omit<RecentPage, 'visitedAt'>): void {
    const currentPages = readFromStorage()

    // Créer la nouvelle entrée avec timestamp
    const newPage: RecentPage = {
      ...page,
      visitedAt: Date.now(),
    }

    // Filtrer les doublons (même path)
    const filteredPages = currentPages.filter((p) => p.path !== page.path)

    // Ajouter en premier et limiter à MAX_PAGES
    const updatedPages = [newPage, ...filteredPages].slice(0, MAX_PAGES)

    writeToStorage(updatedPages)
    emitChange()
  },

  /**
   * Vide l'historique des pages récentes
   */
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    emitChange()
  },
}

export default recentPagesStore
