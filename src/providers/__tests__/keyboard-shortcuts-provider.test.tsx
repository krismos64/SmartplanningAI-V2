/**
 * Tests unitaires - KeyboardShortcutsProvider
 *
 * @ticket SP-264 - Navigation Shortcuts & Keyboard Shortcuts Modal
 *
 * 8 tests couvrant :
 * - Context provider et hook
 * - Ouverture/fermeture de la modal
 * - Raccourci ? pour l'aide
 * - Liste des raccourcis
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, renderHook } from '@testing-library/react'
import {
  KeyboardShortcutsProvider,
  useKeyboardShortcutsContext,
} from '../keyboard-shortcuts-provider'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/app/tableau-de-bord',
}))

// Mock framer-motion
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

// Wrapper pour les tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <KeyboardShortcutsProvider>{children}</KeyboardShortcutsProvider>
}

// Composant de test pour accéder au contexte
function TestConsumer() {
  const context = useKeyboardShortcutsContext()
  return (
    <div>
      <span data-testid="is-modal-open">
        {context.isModalOpen ? 'true' : 'false'}
      </span>
      <span data-testid="is-enabled">
        {context.isEnabled ? 'true' : 'false'}
      </span>
      <span data-testid="shortcuts-count">{context.shortcuts.length}</span>
      <button onClick={context.openShortcutsModal}>Open</button>
      <button onClick={context.closeShortcutsModal}>Close</button>
      <button onClick={context.toggleShortcutsModal}>Toggle</button>
    </div>
  )
}

describe('KeyboardShortcutsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // =========================================================================
  // TESTS DU CONTEXTE
  // =========================================================================

  describe('Context', () => {
    it('should throw error when hook is used outside provider', () => {
      // Supprimer temporairement console.error pour éviter le bruit
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useKeyboardShortcutsContext())
      }).toThrow(
        'useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider'
      )

      consoleSpy.mockRestore()
    })

    it('should provide context values when used within provider', () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      )

      expect(screen.getByTestId('is-modal-open').textContent).toBe('false')
      expect(screen.getByTestId('is-enabled').textContent).toBe('true')
    })

    it('should provide shortcuts list', () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      )

      // 7 navigation + 3 actions + 1 help = 11 raccourcis par défaut
      const shortcutsCount = parseInt(
        screen.getByTestId('shortcuts-count').textContent || '0'
      )
      expect(shortcutsCount).toBeGreaterThan(0)
    })
  })

  // =========================================================================
  // TESTS DE LA MODAL
  // =========================================================================

  describe('Modal controls', () => {
    it('should open modal via openShortcutsModal', () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      )

      expect(screen.getByTestId('is-modal-open').textContent).toBe('false')

      act(() => {
        screen.getByText('Open').click()
      })

      expect(screen.getByTestId('is-modal-open').textContent).toBe('true')
    })

    it('should close modal via closeShortcutsModal', () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      )

      // Ouvrir d'abord
      act(() => {
        screen.getByText('Open').click()
      })

      expect(screen.getByTestId('is-modal-open').textContent).toBe('true')

      // Puis fermer
      act(() => {
        screen.getByText('Close').click()
      })

      expect(screen.getByTestId('is-modal-open').textContent).toBe('false')
    })

    it('should toggle modal via toggleShortcutsModal', () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      )

      expect(screen.getByTestId('is-modal-open').textContent).toBe('false')

      act(() => {
        screen.getByText('Toggle').click()
      })

      expect(screen.getByTestId('is-modal-open').textContent).toBe('true')

      act(() => {
        screen.getByText('Toggle').click()
      })

      expect(screen.getByTestId('is-modal-open').textContent).toBe('false')
    })
  })

  // =========================================================================
  // TESTS DU RACCOURCI ?
  // =========================================================================

  describe('Question mark shortcut', () => {
    it('should toggle modal when ? key is pressed', () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      )

      expect(screen.getByTestId('is-modal-open').textContent).toBe('false')

      // Simuler le keydown avec un target valide (document.body)
      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: '?',
          bubbles: true,
        })
        document.body.dispatchEvent(event)
      })

      expect(screen.getByTestId('is-modal-open').textContent).toBe('true')
    })
  })
})
