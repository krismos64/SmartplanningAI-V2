/**
 * KeyboardShortcutsModal - Modal des raccourcis clavier
 *
 * @ticket SP-264 - Navigation Shortcuts & Keyboard Shortcuts Modal
 * @see Context7 - Radix Dialog (WAI-ARIA compliant, focus trap, Escape to close)
 * @see Context7 - Framer Motion AnimatePresence (exit animations)
 *
 * OBJECTIF :
 * Affiche une modal accessible listant tous les raccourcis clavier
 * disponibles dans l'application, groupés par catégorie.
 *
 * ACCESSIBILITÉ :
 * - WAI-ARIA compliant via Radix Dialog
 * - Focus trap automatique
 * - Fermeture via Escape
 * - Navigation Tab entre les éléments
 * - Annonces screen reader
 *
 * DESIGN :
 * - Animations fluides via Framer Motion
 * - Affichage adaptatif macOS/Windows (⌘ vs Ctrl)
 * - Thème dark/light supporté
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard, Navigation, Zap, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Type pour un raccourci clavier
 */
export interface KeyboardShortcut {
  /** Touches du raccourci (ex: ['⌘', 'K'] ou ['g', 'h']) */
  keys: string[]
  /** Label descriptif */
  label: string
  /** Description détaillée */
  description?: string
  /** Catégorie pour le groupement */
  category: 'navigation' | 'actions' | 'help'
}

/**
 * Catégories avec leurs métadonnées
 */
const CATEGORIES = {
  navigation: {
    label: 'Navigation',
    icon: Navigation,
    description: "Raccourcis pour naviguer dans l'application",
  },
  actions: {
    label: 'Actions',
    icon: Zap,
    description: 'Actions rapides',
  },
  help: {
    label: 'Aide',
    icon: HelpCircle,
    description: 'Aide et documentation',
  },
} as const

/**
 * Détecte si l'utilisateur est sur macOS
 */
function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    // Utiliser userAgentData si disponible (API moderne)
    const nav = navigator as Navigator & {
      userAgentData?: { platform: string }
    }

    if (nav.userAgentData?.platform) {
      setIsMac(nav.userAgentData.platform.toLowerCase().includes('mac'))
    } else {
      // Fallback vers userAgent
      setIsMac(navigator.userAgent.toLowerCase().includes('mac'))
    }
  }, [])

  return isMac
}

/**
 * Formate les touches pour l'affichage
 */
function formatKey(key: string, isMac: boolean): string {
  const keyMap: Record<string, { mac: string; windows: string }> = {
    mod: { mac: '⌘', windows: 'Ctrl' },
    ctrl: { mac: '⌃', windows: 'Ctrl' },
    alt: { mac: '⌥', windows: 'Alt' },
    shift: { mac: '⇧', windows: 'Shift' },
    enter: { mac: '↵', windows: 'Enter' },
    escape: { mac: 'Esc', windows: 'Esc' },
    space: { mac: 'Space', windows: 'Space' },
    tab: { mac: '⇥', windows: 'Tab' },
    backspace: { mac: '⌫', windows: 'Backspace' },
    delete: { mac: '⌦', windows: 'Delete' },
    up: { mac: '↑', windows: '↑' },
    down: { mac: '↓', windows: '↓' },
    left: { mac: '←', windows: '←' },
    right: { mac: '→', windows: '→' },
  }

  const normalized = key.toLowerCase()
  const mapped = keyMap[normalized]

  if (mapped) {
    return isMac ? mapped.mac : mapped.windows
  }

  // Capitaliser la première lettre pour les lettres simples
  return key.length === 1 ? key.toUpperCase() : key
}

/**
 * Composant pour afficher une touche
 */
function KeyBadge({ keyName, isMac }: { keyName: string; isMac: boolean }) {
  const formattedKey = formatKey(keyName, isMac)

  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 items-center justify-center rounded-md',
        'border border-border bg-muted px-1.5',
        'font-mono text-xs font-medium text-muted-foreground',
        'shadow-sm'
      )}
    >
      {formattedKey}
    </kbd>
  )
}

/**
 * Composant pour afficher un raccourci
 */
function ShortcutRow({
  shortcut,
  isMac,
}: {
  shortcut: KeyboardShortcut
  isMac: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-2',
        'border-b border-border/50 last:border-0'
      )}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {shortcut.label}
        </span>
        {shortcut.description && (
          <span className="text-xs text-muted-foreground">
            {shortcut.description}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, index) => (
          <span key={`${key}-${index}`} className="flex items-center gap-1">
            <KeyBadge keyName={key} isMac={isMac} />
            {index < shortcut.keys.length - 1 && (
              <span className="text-xs text-muted-foreground">puis</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Composant pour afficher une catégorie
 */
function CategorySection({
  category,
  shortcuts,
  isMac,
}: {
  category: keyof typeof CATEGORIES
  shortcuts: KeyboardShortcut[]
  isMac: boolean
}) {
  const { label, icon: Icon, description } = CATEGORIES[category]

  if (shortcuts.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="rounded-lg border border-border bg-card/50 p-3">
        {shortcuts.map((shortcut, index) => (
          <ShortcutRow
            key={`${shortcut.label}-${index}`}
            shortcut={shortcut}
            isMac={isMac}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Props du composant
 */
export interface KeyboardShortcutsModalProps {
  /** État d'ouverture de la modal */
  open: boolean
  /** Callback de changement d'état */
  onOpenChange: (open: boolean) => void
  /** Raccourcis à afficher */
  shortcuts: KeyboardShortcut[]
  /** Classe CSS additionnelle */
  className?: string
}

/**
 * Animations Framer Motion
 */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const contentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.15,
    },
  },
}

/**
 * Modal des raccourcis clavier
 */
export function KeyboardShortcutsModal({
  open,
  onOpenChange,
  shortcuts,
  className,
}: KeyboardShortcutsModalProps) {
  const isMac = useIsMac()

  // Grouper les raccourcis par catégorie
  const groupedShortcuts = useMemo(() => {
    return {
      navigation: shortcuts.filter((s) => s.category === 'navigation'),
      actions: shortcuts.filter((s) => s.category === 'actions'),
      help: shortcuts.filter((s) => s.category === 'help'),
    }
  }, [shortcuts])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence mode="wait">
        {open && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  'fixed left-1/2 top-1/2 z-50 w-full max-w-lg',
                  '-translate-x-1/2 -translate-y-1/2',
                  'rounded-xl border border-border bg-background p-6 shadow-2xl',
                  'focus:outline-none',
                  className
                )}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="dialog"
                aria-modal="true"
                aria-labelledby="keyboard-shortcuts-title"
                aria-describedby="keyboard-shortcuts-description"
                data-testid="keyboard-shortcuts-modal"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Keyboard
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <Dialog.Title
                        id="keyboard-shortcuts-title"
                        className="text-lg font-semibold text-foreground"
                      >
                        Raccourcis clavier
                      </Dialog.Title>
                      <Dialog.Description
                        id="keyboard-shortcuts-description"
                        className="text-sm text-muted-foreground"
                      >
                        {isMac ? 'macOS' : 'Windows/Linux'}
                      </Dialog.Description>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-md',
                        'text-muted-foreground transition-colors',
                        'hover:bg-muted hover:text-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                      )}
                      aria-label="Fermer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Body */}
                <div
                  className="max-h-[60vh] space-y-6 overflow-y-auto pr-2"
                  role="list"
                  aria-label="Liste des raccourcis clavier"
                >
                  <CategorySection
                    category="navigation"
                    shortcuts={groupedShortcuts.navigation}
                    isMac={isMac}
                  />
                  <CategorySection
                    category="actions"
                    shortcuts={groupedShortcuts.actions}
                    isMac={isMac}
                  />
                  <CategorySection
                    category="help"
                    shortcuts={groupedShortcuts.help}
                    isMac={isMac}
                  />
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Appuyez sur <KeyBadge keyName="escape" isMac={isMac} /> pour
                    fermer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <KeyBadge keyName="?" isMac={isMac} /> pour réouvrir
                  </p>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default KeyboardShortcutsModal
