/**
 * Hook - useNavigationShortcuts
 *
 * @ticket SP-264 - Navigation Shortcuts & Keyboard Shortcuts Modal
 * @see Context7 - Radix Primitives Accessibility Guidelines
 *
 * OBJECTIF :
 * Fournit des raccourcis clavier Vim-style pour la navigation rapide
 * dans l'application. Utilise des séquences de touches (g puis h = go home).
 *
 * SÉQUENCES SUPPORTÉES :
 * - g → h : Accueil (Dashboard)
 * - g → e : Employés
 * - g → t : Équipes
 * - g → p : Plannings
 * - g → l : Congés (Leaves)
 * - g → s : Paramètres (Settings)
 * - g → c : Entreprise (Company)
 *
 * COMPORTEMENT :
 * - Désactivé quand un input/textarea/contenteditable a le focus
 * - Timeout de 1000ms entre les touches de la séquence
 * - Compatible avec le système de raccourcis existant
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Configuration d'un raccourci de navigation
 */
export interface NavigationShortcut {
  /** Séquence de touches (ex: 'g h') */
  sequence: string
  /** Chemin de navigation */
  path: string
  /** Label affiché dans la modal */
  label: string
  /** Description pour l'accessibilité */
  description: string
  /** Icône optionnelle (nom Lucide) */
  icon?: string
  /** Catégorie pour le groupement */
  category: 'navigation' | 'actions' | 'help'
}

/**
 * Raccourcis de navigation par défaut
 */
export const DEFAULT_NAVIGATION_SHORTCUTS: NavigationShortcut[] = [
  {
    sequence: 'g h',
    path: '/app/tableau-de-bord',
    label: 'Accueil',
    description: 'Aller au tableau de bord',
    icon: 'Home',
    category: 'navigation',
  },
  {
    sequence: 'g e',
    path: '/app/tableau-de-bord/employes',
    label: 'Employés',
    description: 'Aller à la liste des employés',
    icon: 'Users',
    category: 'navigation',
  },
  {
    sequence: 'g t',
    path: '/app/dashboard/teams',
    label: 'Équipes',
    description: 'Aller à la gestion des équipes',
    icon: 'UsersRound',
    category: 'navigation',
  },
  {
    sequence: 'g p',
    path: '/app/dashboard/plannings',
    label: 'Plannings',
    description: 'Aller aux plannings',
    icon: 'Calendar',
    category: 'navigation',
  },
  {
    sequence: 'g l',
    path: '/app/tableau-de-bord/conges',
    label: 'Congés',
    description: 'Aller aux demandes de congés',
    icon: 'CalendarOff',
    category: 'navigation',
  },
  {
    sequence: 'g s',
    path: '/app/dashboard/settings',
    label: 'Paramètres',
    description: 'Aller aux paramètres',
    icon: 'Settings',
    category: 'navigation',
  },
  {
    sequence: 'g c',
    path: '/app/dashboard/company',
    label: 'Entreprise',
    description: "Aller aux informations de l'entreprise",
    icon: 'Building2',
    category: 'navigation',
  },
]

/**
 * Options du hook
 */
export interface UseNavigationShortcutsOptions {
  /** Activer/désactiver les raccourcis */
  enabled?: boolean
  /** Timeout entre les touches de la séquence (ms) */
  sequenceTimeout?: number
  /** Raccourcis personnalisés (remplacent les défauts) */
  shortcuts?: NavigationShortcut[]
  /** Callback après navigation */
  onNavigate?: (shortcut: NavigationShortcut) => void
}

/**
 * Résultat du hook
 */
export interface UseNavigationShortcutsResult {
  /** Buffer de séquence actuel */
  sequenceBuffer: string[]
  /** Indique si une séquence est en cours */
  isSequenceActive: boolean
  /** Réinitialise le buffer de séquence */
  resetSequence: () => void
  /** Liste des raccourcis disponibles */
  shortcuts: NavigationShortcut[]
  /** Chemin actuel */
  currentPath: string
}

/**
 * Vérifie si l'élément actif est un champ de saisie
 */
function isInputElement(element: Element | null): boolean {
  if (!element) return false

  const tagName = element.tagName.toLowerCase()
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true
  }

  // Vérifier contenteditable
  if (element.getAttribute('contenteditable') === 'true') {
    return true
  }

  // Vérifier le rôle ARIA pour les éditeurs riches
  const role = element.getAttribute('role')
  if (role === 'textbox' || role === 'searchbox') {
    return true
  }

  return false
}

/**
 * Normalise une touche pour la comparaison
 */
function normalizeKey(key: string): string {
  return key.toLowerCase()
}

/**
 * Hook pour les raccourcis de navigation Vim-style
 */
export function useNavigationShortcuts(
  options: UseNavigationShortcutsOptions = {}
): UseNavigationShortcutsResult {
  const {
    enabled = true,
    sequenceTimeout = 1000,
    shortcuts = DEFAULT_NAVIGATION_SHORTCUTS,
    onNavigate,
  } = options

  const router = useRouter()
  const pathname = usePathname()

  const [sequenceBuffer, setSequenceBuffer] = useState<string[]>([])
  const [isSequenceActive, setIsSequenceActive] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Réinitialise le buffer de séquence
   */
  const resetSequence = useCallback(() => {
    setSequenceBuffer([])
    setIsSequenceActive(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  /**
   * Gère les événements clavier
   */
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      // Ignorer si dans un champ de saisie
      if (isInputElement(document.activeElement)) {
        return
      }

      // Ignorer les touches de modification seules
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
        return
      }

      // Ignorer si des modificateurs sont pressés (sauf Shift pour les majuscules)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        resetSequence()
        return
      }

      const key = normalizeKey(event.key)

      // Ajouter au buffer
      const newBuffer = [...sequenceBuffer, key]
      setSequenceBuffer(newBuffer)
      setIsSequenceActive(true)

      // Réinitialiser le timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        resetSequence()
      }, sequenceTimeout)

      // Vérifier si la séquence correspond à un raccourci
      const currentSequence = newBuffer.join(' ')

      const matchedShortcut = shortcuts.find(
        (shortcut) => shortcut.sequence === currentSequence
      )

      if (matchedShortcut) {
        event.preventDefault()
        resetSequence()

        // Naviguer vers le chemin
        router.push(matchedShortcut.path)

        // Callback optionnel
        onNavigate?.(matchedShortcut)
        return
      }

      // Vérifier si c'est un préfixe valide
      const isValidPrefix = shortcuts.some((shortcut) =>
        shortcut.sequence.startsWith(currentSequence)
      )

      if (!isValidPrefix) {
        resetSequence()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [
    enabled,
    sequenceBuffer,
    sequenceTimeout,
    shortcuts,
    router,
    onNavigate,
    resetSequence,
  ])

  return {
    sequenceBuffer,
    isSequenceActive,
    resetSequence,
    shortcuts,
    currentPath: pathname,
  }
}

/**
 * Types exportés pour usage externe
 */
export type { NavigationShortcut as ShortcutConfig }

export default useNavigationShortcuts
