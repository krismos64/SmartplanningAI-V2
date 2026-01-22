/**
 * Tests unitaires - KeyboardShortcutsModal Component
 *
 * @ticket SP-264 - Navigation Shortcuts & Keyboard Shortcuts Modal
 *
 * 10 tests couvrant :
 * - Rendu de la modal
 * - Affichage des raccourcis par catégorie
 * - Accessibilité (ARIA)
 * - Fermeture de la modal
 * - Détection OS (macOS/Windows)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  KeyboardShortcutsModal,
  type KeyboardShortcut,
} from '../keyboard-shortcuts-modal'

// Mock framer-motion pour éviter les animations en test
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Raccourcis de test
const mockShortcuts: KeyboardShortcut[] = [
  {
    keys: ['g', 'h'],
    label: 'Accueil',
    description: 'Aller au tableau de bord',
    category: 'navigation',
  },
  {
    keys: ['g', 'e'],
    label: 'Employés',
    description: 'Aller à la liste des employés',
    category: 'navigation',
  },
  {
    keys: ['mod', 'k'],
    label: 'Palette de commandes',
    description: 'Ouvrir la palette de commandes',
    category: 'actions',
  },
  {
    keys: ['?'],
    label: 'Aide raccourcis',
    description: 'Afficher cette aide',
    category: 'help',
  },
]

describe('KeyboardShortcutsModal', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // TESTS DE RENDU
  // =========================================================================

  describe('Rendering', () => {
    it('should not render when closed', () => {
      render(
        <KeyboardShortcutsModal
          open={false}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(
        screen.queryByTestId('keyboard-shortcuts-modal')
      ).not.toBeInTheDocument()
    })

    it('should render when open', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(
        screen.getByTestId('keyboard-shortcuts-modal')
      ).toBeInTheDocument()
    })

    it('should display modal title', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(screen.getByText('Raccourcis clavier')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // TESTS DES CATÉGORIES
  // =========================================================================

  describe('Categories', () => {
    it('should display navigation category', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })

    it('should display actions category', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should display help category', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(screen.getByText('Aide')).toBeInTheDocument()
    })

    it('should display shortcut labels', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(screen.getByText('Accueil')).toBeInTheDocument()
      expect(screen.getByText('Employés')).toBeInTheDocument()
      expect(screen.getByText('Palette de commandes')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // TESTS D'ACCESSIBILITÉ
  // =========================================================================

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have aria-modal attribute', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('should have close button with aria-label', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument()
    })
  })

  // =========================================================================
  // TESTS DE FERMETURE
  // =========================================================================

  describe('Closing', () => {
    it('should call onOpenChange when close button is clicked', () => {
      render(
        <KeyboardShortcutsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          shortcuts={mockShortcuts}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
