/**
 * useKeyboardShortcuts Hook
 *
 * Hook générique pour gérer les raccourcis clavier globalement.
 * Supporte les combinaisons simples (Cmd+K) et les séquences (g+h).
 *
 * @see SP-264 - Command Palette
 *
 * @example
 * ```tsx
 * // Raccourci simple
 * useKeyboardShortcuts({
 *   'mod+k': () => setOpen(true),
 *   'escape': () => setOpen(false),
 * })
 *
 * // Avec séquences
 * useKeyboardShortcuts({
 *   'g h': () => router.push('/dashboard'),
 *   'g e': () => router.push('/teams'),
 * })
 * ```
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'

export type ShortcutHandler = () => void

export interface ShortcutOptions {
  /** Si true, le raccourci fonctionne même dans les inputs */
  enableInInputs?: boolean
  /** Si true, empêche le comportement par défaut du navigateur */
  preventDefault?: boolean
}

export interface UseKeyboardShortcutsOptions {
  /** Si false, désactive tous les raccourcis */
  enabled?: boolean
  /** Timeout pour les séquences en ms (défaut: 1000) */
  sequenceTimeout?: number
}

type ShortcutMap = Record<string, ShortcutHandler | [ShortcutHandler, ShortcutOptions]>

interface ParsedShortcut {
  keys: string[]
  isSequence: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  altKey: boolean
  modKey: boolean // 'mod' = Cmd sur Mac, Ctrl sur Windows
}

/**
 * Parse un raccourci clavier en ses composants
 * Formats supportés:
 * - 'k' - touche simple
 * - 'mod+k' - Cmd+K (Mac) ou Ctrl+K (Windows)
 * - 'ctrl+k' - Ctrl+K explicite
 * - 'shift+mod+k' - Shift+Cmd+K
 * - 'g h' - séquence g puis h
 */
function parseShortcut(shortcut: string): ParsedShortcut {
  const isSequence = shortcut.includes(' ')
  const parts = shortcut.toLowerCase().split('+').map((s) => s.trim())

  if (isSequence) {
    return {
      keys: shortcut.toLowerCase().split(' ').map((s) => s.trim()),
      isSequence: true,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      modKey: false,
    }
  }

  const modifiers = {
    ctrlKey: parts.includes('ctrl'),
    metaKey: parts.includes('meta') || parts.includes('cmd'),
    shiftKey: parts.includes('shift'),
    altKey: parts.includes('alt') || parts.includes('option'),
    modKey: parts.includes('mod'),
  }

  const key = parts.filter(
    (p) => !['ctrl', 'meta', 'cmd', 'shift', 'alt', 'option', 'mod'].includes(p)
  )

  return {
    keys: key,
    isSequence: false,
    ...modifiers,
  }
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

  if (element.getAttribute('contenteditable') === 'true') {
    return true
  }

  return false
}

/**
 * Détecte si l'utilisateur est sur Mac
 */
function isMac(): boolean {
  if (typeof window === 'undefined') return false
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
}

/**
 * Normalise le nom de la touche pour la comparaison
 */
function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'space',
    escape: 'escape',
    esc: 'escape',
    enter: 'enter',
    return: 'enter',
    arrowup: 'arrowup',
    arrowdown: 'arrowdown',
    arrowleft: 'arrowleft',
    arrowright: 'arrowright',
  }

  const normalized = key.toLowerCase()
  return keyMap[normalized] || normalized
}

/**
 * Hook pour gérer les raccourcis clavier
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true, sequenceTimeout = 1000 } = options

  // Buffer pour les séquences de touches
  const sequenceBuffer = useRef<string[]>([])
  const sequenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSequence = useCallback(() => {
    sequenceBuffer.current = []
    if (sequenceTimer.current) {
      clearTimeout(sequenceTimer.current)
      sequenceTimer.current = null
    }
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const key = normalizeKey(event.key)
      const isMacOS = isMac()

      // Parcourir tous les raccourcis définis
      for (const [shortcutKey, handlerOrTuple] of Object.entries(shortcuts)) {
        const handler = Array.isArray(handlerOrTuple)
          ? handlerOrTuple[0]
          : handlerOrTuple
        const shortcutOptions = Array.isArray(handlerOrTuple)
          ? handlerOrTuple[1]
          : { preventDefault: true, enableInInputs: false }

        const parsed = parseShortcut(shortcutKey)

        // Vérifier si on est dans un input et si c'est autorisé
        if (!shortcutOptions.enableInInputs && isInputElement(document.activeElement)) {
          // Permettre Escape même dans les inputs pour fermer les modals
          if (key !== 'escape') {
            continue
          }
        }

        // Gérer les séquences (ex: "g h")
        if (parsed.isSequence) {
          sequenceBuffer.current.push(key)

          // Reset le timer
          if (sequenceTimer.current) {
            clearTimeout(sequenceTimer.current)
          }
          sequenceTimer.current = setTimeout(clearSequence, sequenceTimeout)

          // Vérifier si la séquence correspond
          const bufferStr = sequenceBuffer.current.join(' ')
          const shortcutStr = parsed.keys.join(' ')

          if (bufferStr === shortcutStr) {
            if (shortcutOptions.preventDefault !== false) {
              event.preventDefault()
            }
            handler()
            clearSequence()
            return
          }

          // Si le buffer ne peut plus correspondre, reset
          if (!shortcutStr.startsWith(bufferStr)) {
            clearSequence()
          }

          continue
        }

        // Gérer les raccourcis avec modificateurs
        const expectedKey = parsed.keys[0]
        if (!expectedKey || key !== expectedKey) {
          continue
        }

        // Vérifier les modificateurs
        const modKeyPressed = isMacOS ? event.metaKey : event.ctrlKey

        const modifiersMatch =
          (parsed.modKey ? modKeyPressed : true) &&
          (parsed.ctrlKey ? event.ctrlKey : !event.ctrlKey || parsed.modKey) &&
          (parsed.metaKey ? event.metaKey : !event.metaKey || parsed.modKey) &&
          (parsed.shiftKey ? event.shiftKey : !event.shiftKey) &&
          (parsed.altKey ? event.altKey : !event.altKey)

        // Pour 'mod+k', on vérifie que mod est pressé ET que c'est la bonne combinaison
        if (parsed.modKey) {
          if (!modKeyPressed) continue
          // S'assurer qu'on n'a pas d'autres modificateurs non demandés
          if (event.shiftKey && !parsed.shiftKey) continue
          if (event.altKey && !parsed.altKey) continue
        } else if (!modifiersMatch) {
          continue
        }

        // Raccourci trouvé !
        if (shortcutOptions.preventDefault !== false) {
          event.preventDefault()
        }
        handler()
        clearSequence()
        return
      }
    },
    [shortcuts, enabled, sequenceTimeout, clearSequence]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearSequence()
    }
  }, [enabled, handleKeyDown, clearSequence])
}

/**
 * Hook simplifié pour un seul raccourci
 */
export function useKeyboardShortcut(
  shortcut: string,
  handler: ShortcutHandler,
  options?: UseKeyboardShortcutsOptions & ShortcutOptions
): void {
  const { enabled, sequenceTimeout, ...shortcutOptions } = options || {}

  useKeyboardShortcuts(
    { [shortcut]: [handler, shortcutOptions] },
    { enabled, sequenceTimeout }
  )
}

export type { ShortcutMap }
