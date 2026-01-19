/**
 * Tests unitaires pour le composant ContactSuccessState
 *
 * @ticket SP-289
 * @description Tests de l'état de succès du formulaire de contact
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactSuccessState } from '@/components/public/ContactSuccessState'

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
    svg: ({
      children,
      initial,
      animate,
      ...props
    }: React.PropsWithChildren<object>) => <svg {...props}>{children}</svg>,
    circle: ({
      variants,
      style,
      ...props
    }: React.PropsWithChildren<object>) => <circle {...props} />,
    path: ({ variants, style, ...props }: React.PropsWithChildren<object>) => (
      <path {...props} />
    ),
    p: ({
      children,
      variants,
      ...props
    }: React.PropsWithChildren<object>) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

describe('ContactSuccessState', () => {
  const defaultProps = {
    name: 'Jean Dupont',
    onReset: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // RENDU
  // ==========================================================================
  describe('Rendu', () => {
    it('devrait afficher le message de remerciement avec le nom', () => {
      render(<ContactSuccessState {...defaultProps} />)

      expect(screen.getByText(/merci jean dupont/i)).toBeInTheDocument()
    })

    it('devrait afficher le message de confirmation', () => {
      render(<ContactSuccessState {...defaultProps} />)

      expect(
        screen.getByText(/votre message a bien été envoyé/i)
      ).toBeInTheDocument()
    })

    it('devrait afficher le sous-message de délai de réponse', () => {
      render(<ContactSuccessState {...defaultProps} />)

      expect(
        screen.getByText(/nous vous répondrons dans les 24-48h/i)
      ).toBeInTheDocument()
    })

    it('devrait afficher le bouton pour envoyer un autre message', () => {
      render(<ContactSuccessState {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /envoyer un autre message/i })
      ).toBeInTheDocument()
    })

    it('devrait afficher le checkmark SVG', () => {
      render(<ContactSuccessState {...defaultProps} />)

      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('viewBox', '0 0 80 80')
    })
  })

  // ==========================================================================
  // ACCESSIBILITÉ
  // ==========================================================================
  describe('Accessibilité', () => {
    it('devrait avoir role="status"', () => {
      render(<ContactSuccessState {...defaultProps} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('devrait avoir aria-live="polite"', () => {
      render(<ContactSuccessState {...defaultProps} />)

      const statusElement = screen.getByRole('status')
      expect(statusElement).toHaveAttribute('aria-live', 'polite')
    })
  })

  // ==========================================================================
  // INTERACTIONS
  // ==========================================================================
  describe('Interactions', () => {
    it('devrait appeler onReset au clic sur le bouton', async () => {
      const user = userEvent.setup()
      const mockOnReset = vi.fn()
      render(<ContactSuccessState name="Test" onReset={mockOnReset} />)

      await user.click(
        screen.getByRole('button', { name: /envoyer un autre message/i })
      )

      expect(mockOnReset).toHaveBeenCalledTimes(1)
    })
  })

  // ==========================================================================
  // PERSONNALISATION
  // ==========================================================================
  describe('Personnalisation', () => {
    it('devrait utiliser le nom fourni dans le message', () => {
      render(<ContactSuccessState name="Marie Martin" onReset={vi.fn()} />)

      expect(screen.getByText(/merci marie martin/i)).toBeInTheDocument()
    })

    it('devrait accepter une className personnalisée', () => {
      render(
        <ContactSuccessState
          {...defaultProps}
          className="custom-class"
        />
      )

      const statusElement = screen.getByRole('status')
      expect(statusElement).toHaveClass('custom-class')
    })
  })

  // ==========================================================================
  // CHECKMARK SVG
  // ==========================================================================
  describe('Checkmark SVG', () => {
    it('devrait avoir un cercle avec les bonnes dimensions', () => {
      render(<ContactSuccessState {...defaultProps} />)

      const circle = document.querySelector('circle')
      expect(circle).toBeInTheDocument()
      expect(circle).toHaveAttribute('cx', '40')
      expect(circle).toHaveAttribute('cy', '40')
      expect(circle).toHaveAttribute('r', '36')
    })

    it('devrait avoir un path pour la coche', () => {
      render(<ContactSuccessState {...defaultProps} />)

      const path = document.querySelector('path')
      expect(path).toBeInTheDocument()
      expect(path).toHaveAttribute('d', 'M24 42 L34 52 L56 30')
    })
  })
})
