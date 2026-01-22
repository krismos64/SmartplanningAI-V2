/**
 * CommandPaletteProvider
 *
 * Provider React pour gérer l'état global de la Command Palette.
 * Permet d'ouvrir/fermer la palette depuis n'importe où dans l'app.
 *
 * @see SP-264 - Dashboard Layout V2
 *
 * @example
 * ```tsx
 * // Dans un layout
 * <CommandPaletteProvider userRole="DIRECTOR">
 *   {children}
 * </CommandPaletteProvider>
 *
 * // Dans un composant
 * const { open, setOpen, toggle } = useCommandPalette()
 * ```
 */

'use client'

import * as React from 'react'
import { CommandPalette } from '@/components/ui/command-palette'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import type { UserRole } from '@/lib/navigation/menu-items'

export interface CommandPaletteContextValue {
  /** État ouvert/fermé de la palette */
  open: boolean
  /** Définir l'état ouvert/fermé */
  setOpen: (open: boolean) => void
  /** Basculer l'état */
  toggle: () => void
}

const CommandPaletteContext =
  React.createContext<CommandPaletteContextValue | null>(null)

/**
 * Hook pour accéder au context de la Command Palette
 * @throws Error si utilisé en dehors du provider
 */
export function useCommandPalette(): CommandPaletteContextValue {
  const context = React.useContext(CommandPaletteContext)

  if (!context) {
    throw new Error(
      'useCommandPalette must be used within a CommandPaletteProvider'
    )
  }

  return context
}

export interface CommandPaletteProviderProps {
  /** Enfants du provider */
  children: React.ReactNode
  /** Rôle de l'utilisateur pour le filtrage RBAC */
  userRole: UserRole
}

/**
 * Provider pour la Command Palette
 * Gère l'état global et le raccourci Cmd+K
 */
export function CommandPaletteProvider({
  children,
  userRole,
}: CommandPaletteProviderProps) {
  const [open, setOpen] = React.useState(false)

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  // Raccourci Cmd+K / Ctrl+K pour ouvrir la palette
  useKeyboardShortcuts({
    'mod+k': toggle,
  })

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggle,
    }),
    [open, toggle]
  )

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        userRole={userRole}
      />
    </CommandPaletteContext.Provider>
  )
}

export default CommandPaletteProvider
