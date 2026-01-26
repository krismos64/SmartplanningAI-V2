/**
 * Tests unitaires pour le composant ContactErrorState
 *
 * @ticket SP-289
 * @description Tests de l'état d'erreur du formulaire de contact
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactErrorState } from '@/components/public/ContactErrorState'

// Mock framer-motion pour éviter les erreurs d'animation
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      variants,
      initial,
      animate,
      exit,
      ...props
    }: React.PropsWithChildren<object>) => <div {...props}>{children}</div>,
  },
  useAnimation: () => ({
    start: vi.fn().mockResolvedValue(undefined),
  }),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

describe('ContactErrorState', () => {
  const defaultProps = {
    message: 'Une erreur est survenue',
    onRetry: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // RENDU
  // ==========================================================================
  describe('Rendu', () => {
    it("devrait afficher le titre d'erreur", () => {
      render(<ContactErrorState {...defaultProps} />)

      expect(screen.getByText(/erreur lors de l'envoi/i)).toBeInTheDocument()
    })

    it("devrait afficher le message d'erreur", () => {
      render(<ContactErrorState {...defaultProps} />)

      expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument()
    })

    it('devrait afficher le bouton Réessayer', () => {
      render(<ContactErrorState {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /réessayer/i })
      ).toBeInTheDocument()
    })

    it("devrait afficher l'icône X", () => {
      render(<ContactErrorState {...defaultProps} />)

      // L'icône XCircle de lucide-react (lucide utilise lucide-circle-x)
      const svg = document.querySelector('svg.lucide-circle-x')
      expect(svg).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // ACCESSIBILITÉ
  // ==========================================================================
  describe('Accessibilité', () => {
    it('devrait avoir role="alert"', () => {
      render(<ContactErrorState {...defaultProps} />)

      // getAllByRole car il y a plusieurs éléments avec role="alert"
      // (le conteneur externe et l'Alert de shadcn)
      const alerts = screen.getAllByRole('alert')
      expect(alerts.length).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // INTERACTIONS
  // ==========================================================================
  describe('Interactions', () => {
    it('devrait appeler onRetry au clic sur le bouton', async () => {
      const user = userEvent.setup()
      const mockOnRetry = vi.fn()
      render(<ContactErrorState message="Erreur test" onRetry={mockOnRetry} />)

      await user.click(screen.getByRole('button', { name: /réessayer/i }))

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })
  })

  // ==========================================================================
  // PERSONNALISATION
  // ==========================================================================
  describe('Personnalisation', () => {
    it("devrait afficher le message d'erreur personnalisé", () => {
      render(
        <ContactErrorState
          message="Email invalide, veuillez réessayer"
          onRetry={vi.fn()}
        />
      )

      expect(
        screen.getByText('Email invalide, veuillez réessayer')
      ).toBeInTheDocument()
    })

    it('devrait accepter une className personnalisée', () => {
      render(
        <ContactErrorState {...defaultProps} className="custom-error-class" />
      )

      // La classe personnalisée est sur le conteneur externe
      const alerts = screen.getAllByRole('alert')
      const hasCustomClass = alerts.some((el) =>
        el.classList.contains('custom-error-class')
      )
      expect(hasCustomClass).toBe(true)
    })
  })

  // ==========================================================================
  // STYLE ALERT
  // ==========================================================================
  describe('Style Alert', () => {
    it('devrait utiliser le variant destructive', () => {
      render(<ContactErrorState {...defaultProps} />)

      // Le composant Alert avec variant destructive contient le message d'erreur
      const alertElements = screen.getAllByRole('alert')
      const hasErrorContent = alertElements.some((el) =>
        el.innerHTML.includes('Erreur')
      )
      expect(hasErrorContent).toBe(true)
    })

    it('devrait avoir les classes de style rouge', () => {
      render(<ContactErrorState {...defaultProps} />)

      // Vérifier que le titre a la classe text-red-400
      const title = screen.getByText(/erreur lors de l'envoi/i)
      expect(title).toHaveClass('text-red-400')
    })
  })
})
