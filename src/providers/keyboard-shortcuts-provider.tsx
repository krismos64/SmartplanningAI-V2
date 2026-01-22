/**
 * KeyboardShortcutsProvider - Context Provider pour les raccourcis clavier
 *
 * @ticket SP-264 - Navigation Shortcuts & Keyboard Shortcuts Modal
 *
 * OBJECTIF :
 * Centralise la gestion de tous les raccourcis clavier de l'application
 * et fournit un contexte pour ouvrir la modal d'aide.
 *
 * FONCTIONNALITÉS :
 * - Gestion centralisée des raccourcis
 * - Raccourci ? pour ouvrir la modal d'aide
 * - API pour ajouter/retirer des raccourcis dynamiquement
 * - État partagé entre tous les composants
 */

'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import {
  useNavigationShortcuts,
  DEFAULT_NAVIGATION_SHORTCUTS,
  type NavigationShortcut,
} from '@/hooks/use-navigation-shortcuts'
import {
  KeyboardShortcutsModal,
  type KeyboardShortcut,
} from '@/components/ui/keyboard-shortcuts-modal'

/**
 * Contexte des raccourcis clavier
 */
interface KeyboardShortcutsContextValue {
  /** Ouvrir la modal des raccourcis */
  openShortcutsModal: () => void
  /** Fermer la modal des raccourcis */
  closeShortcutsModal: () => void
  /** Basculer la modal des raccourcis */
  toggleShortcutsModal: () => void
  /** État de la modal */
  isModalOpen: boolean
  /** Tous les raccourcis disponibles */
  shortcuts: KeyboardShortcut[]
  /** Activer/désactiver les raccourcis */
  setEnabled: (enabled: boolean) => void
  /** État d'activation */
  isEnabled: boolean
}

const KeyboardShortcutsContext =
  createContext<KeyboardShortcutsContextValue | null>(null)

/**
 * Hook pour utiliser le contexte des raccourcis
 */
export function useKeyboardShortcutsContext(): KeyboardShortcutsContextValue {
  const context = useContext(KeyboardShortcutsContext)

  if (!context) {
    throw new Error(
      'useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider'
    )
  }

  return context
}

/**
 * Convertit les raccourcis de navigation en format modal
 */
function convertNavigationShortcuts(
  shortcuts: NavigationShortcut[]
): KeyboardShortcut[] {
  return shortcuts.map((shortcut) => ({
    keys: shortcut.sequence.split(' '),
    label: shortcut.label,
    description: shortcut.description,
    category: shortcut.category,
  }))
}

/**
 * Raccourcis d'actions par défaut
 */
const DEFAULT_ACTION_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ['mod', 'k'],
    label: 'Palette de commandes',
    description: 'Ouvrir la palette de commandes',
    category: 'actions',
  },
  {
    keys: ['mod', 'b'],
    label: 'Sidebar',
    description: 'Basculer la barre latérale',
    category: 'actions',
  },
  {
    keys: ['escape'],
    label: 'Fermer',
    description: 'Fermer les modales et menus',
    category: 'actions',
  },
]

/**
 * Raccourcis d'aide par défaut
 */
const DEFAULT_HELP_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ['?'],
    label: 'Aide raccourcis',
    description: 'Afficher cette aide',
    category: 'help',
  },
]

/**
 * Props du provider
 */
interface KeyboardShortcutsProviderProps {
  children: ReactNode
  /** Désactiver les raccourcis (utile pour les formulaires) */
  disabled?: boolean
}

/**
 * Provider pour les raccourcis clavier
 */
export function KeyboardShortcutsProvider({
  children,
  disabled = false,
}: KeyboardShortcutsProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEnabled, setIsEnabled] = useState(!disabled)

  // Hook de navigation
  useNavigationShortcuts({
    enabled: isEnabled && !isModalOpen,
  })

  // Ouvrir la modal
  const openShortcutsModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  // Fermer la modal
  const closeShortcutsModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // Basculer la modal
  const toggleShortcutsModal = useCallback(() => {
    setIsModalOpen((prev) => !prev)
  }, [])

  // Gérer le raccourci ?
  useEffect(() => {
    if (!isEnabled) return

    function handleKeyDown(event: KeyboardEvent) {
      // Ignorer si dans un champ de saisie
      const target = event.target as Element | null
      if (!target) return

      const tagName = target.tagName?.toLowerCase() ?? ''
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.getAttribute?.('contenteditable') === 'true'
      ) {
        return
      }

      // Ignorer si des modificateurs sont pressés
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      // Raccourci ? pour ouvrir l'aide
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault()
        toggleShortcutsModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isEnabled, toggleShortcutsModal])

  // Construire la liste complète des raccourcis
  const allShortcuts = useMemo<KeyboardShortcut[]>(() => {
    const navigationShortcuts = convertNavigationShortcuts(
      DEFAULT_NAVIGATION_SHORTCUTS
    )
    return [
      ...navigationShortcuts,
      ...DEFAULT_ACTION_SHORTCUTS,
      ...DEFAULT_HELP_SHORTCUTS,
    ]
  }, [])

  // Valeur du contexte
  const contextValue = useMemo<KeyboardShortcutsContextValue>(
    () => ({
      openShortcutsModal,
      closeShortcutsModal,
      toggleShortcutsModal,
      isModalOpen,
      shortcuts: allShortcuts,
      setEnabled: setIsEnabled,
      isEnabled,
    }),
    [
      openShortcutsModal,
      closeShortcutsModal,
      toggleShortcutsModal,
      isModalOpen,
      allShortcuts,
      isEnabled,
    ]
  )

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      <KeyboardShortcutsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        shortcuts={allShortcuts}
      />
    </KeyboardShortcutsContext.Provider>
  )
}

export default KeyboardShortcutsProvider
