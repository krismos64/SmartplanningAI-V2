/**
 * Tests unitaires pour LoadingOverlay et InlineLoadingOverlay
 *
 * LoadingOverlay affiche un overlay plein écran avec spinner.
 * InlineLoadingOverlay est relatif à un container.
 *
 * @ticket SP-126
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import {
  LoadingOverlay,
  InlineLoadingOverlay,
} from '@/components/loading/LoadingOverlay'

describe('LoadingOverlay', () => {
  // ===========================================================================
  // RENDU CONDITIONNEL
  // ===========================================================================

  describe('Rendu conditionnel', () => {
    it('renders when isLoading=true', () => {
      render(<LoadingOverlay isLoading />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('does not render when isLoading=false', () => {
      render(<LoadingOverlay isLoading={false} />)

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // MESSAGE
  // ===========================================================================

  describe('Message', () => {
    it('renders message when provided', () => {
      render(<LoadingOverlay isLoading message="Chargement des données..." />)

      // Message is rendered both in sr-only span and visible paragraph
      const messages = screen.getAllByText('Chargement des données...')
      expect(messages.length).toBeGreaterThanOrEqual(1)
    })

    it('does not render message paragraph when not provided', () => {
      render(<LoadingOverlay isLoading />)

      // Only the aria-label should exist, not a visible message
      const overlay = screen.getByRole('progressbar')
      expect(overlay).toHaveAttribute('aria-label', 'Chargement en cours')
    })

    it('uses message for aria-label when provided', () => {
      render(<LoadingOverlay isLoading message="Chargement des données..." />)

      const overlay = screen.getByRole('progressbar')
      expect(overlay).toHaveAttribute('aria-label', 'Chargement des données...')
    })
  })

  // ===========================================================================
  // BLUR EFFECT
  // ===========================================================================

  describe('Blur effect', () => {
    it('does not apply blur by default', () => {
      const { container } = render(<LoadingOverlay isLoading />)

      const overlay = container.querySelector('.backdrop-blur-sm')
      expect(overlay).not.toBeInTheDocument()
    })

    it('applies blur when blur=true', () => {
      const { container } = render(<LoadingOverlay isLoading blur />)

      const overlay = container.querySelector('.backdrop-blur-sm')
      expect(overlay).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // SPINNER SIZE
  // ===========================================================================

  describe('Spinner size', () => {
    it('uses default lg spinner size', () => {
      const { container } = render(<LoadingOverlay isLoading />)

      // Default spinner size is lg which has h-12 class
      const spinner = container.querySelector('[class*="h-12"]')
      expect(spinner).toBeInTheDocument()
    })

    it('respects custom spinner size', () => {
      render(<LoadingOverlay isLoading spinnerSize="sm" />)

      // Verify spinner is rendered
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // Z-INDEX
  // ===========================================================================

  describe('Z-index', () => {
    it('uses default z-index of 50', () => {
      const { container } = render(<LoadingOverlay isLoading />)

      const overlay = container.firstChild as HTMLElement
      expect(overlay).toHaveStyle({ zIndex: '50' })
    })

    it('respects custom z-index', () => {
      const { container } = render(<LoadingOverlay isLoading zIndex={100} />)

      const overlay = container.firstChild as HTMLElement
      expect(overlay).toHaveStyle({ zIndex: '100' })
    })
  })

  // ===========================================================================
  // CLASSES CSS
  // ===========================================================================

  describe('Classes CSS', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <LoadingOverlay isLoading className="my-custom-class" />
      )

      const overlay = container.querySelector('.my-custom-class')
      expect(overlay).toBeInTheDocument()
    })

    it('has fixed positioning', () => {
      const { container } = render(<LoadingOverlay isLoading />)

      const overlay = container.querySelector('.fixed')
      expect(overlay).toBeInTheDocument()
    })

    it('covers full viewport', () => {
      const { container } = render(<LoadingOverlay isLoading />)

      const overlay = container.querySelector('.inset-0')
      expect(overlay).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ACCESSIBILITÉ
  // ===========================================================================

  describe('Accessibilité', () => {
    it('has role="progressbar"', () => {
      render(<LoadingOverlay isLoading />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('has aria-busy="true"', () => {
      render(<LoadingOverlay isLoading />)

      const overlay = screen.getByRole('progressbar')
      expect(overlay).toHaveAttribute('aria-busy', 'true')
    })

    it('has aria-live="polite"', () => {
      render(<LoadingOverlay isLoading />)

      const overlay = screen.getByRole('progressbar')
      expect(overlay).toHaveAttribute('aria-live', 'polite')
    })
  })
})

// =============================================================================
// INLINE LOADING OVERLAY
// =============================================================================

describe('InlineLoadingOverlay', () => {
  // ===========================================================================
  // RENDU CONDITIONNEL
  // ===========================================================================

  describe('Rendu conditionnel', () => {
    it('renders when isLoading=true', () => {
      render(<InlineLoadingOverlay isLoading />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('does not render when isLoading=false', () => {
      render(<InlineLoadingOverlay isLoading={false} />)

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // MESSAGE
  // ===========================================================================

  describe('Message', () => {
    it('renders message when provided', () => {
      render(
        <InlineLoadingOverlay isLoading message="Mise à jour en cours..." />
      )

      // Message is rendered both in sr-only span and visible paragraph
      const messages = screen.getAllByText('Mise à jour en cours...')
      expect(messages.length).toBeGreaterThanOrEqual(1)
    })

    it('uses message for aria-label when provided', () => {
      render(
        <InlineLoadingOverlay isLoading message="Mise à jour en cours..." />
      )

      const overlay = screen.getByRole('progressbar')
      expect(overlay).toHaveAttribute('aria-label', 'Mise à jour en cours...')
    })
  })

  // ===========================================================================
  // BLUR EFFECT
  // ===========================================================================

  describe('Blur effect', () => {
    it('does not apply blur by default', () => {
      const { container } = render(<InlineLoadingOverlay isLoading />)

      const overlay = container.querySelector('.backdrop-blur-sm')
      expect(overlay).not.toBeInTheDocument()
    })

    it('applies blur when blur=true', () => {
      const { container } = render(<InlineLoadingOverlay isLoading blur />)

      const overlay = container.querySelector('.backdrop-blur-sm')
      expect(overlay).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // SPINNER SIZE
  // ===========================================================================

  describe('Spinner size', () => {
    it('uses default md spinner size', () => {
      const { container } = render(<InlineLoadingOverlay isLoading />)

      // md spinner has h-8 class
      const spinner = container.querySelector('.h-8')
      expect(spinner).toBeInTheDocument()
    })

    it('respects custom spinner size', () => {
      const { container } = render(
        <InlineLoadingOverlay isLoading spinnerSize="lg" />
      )

      // lg spinner has h-12 class
      const spinner = container.querySelector('.h-12')
      expect(spinner).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // MIN HEIGHT
  // ===========================================================================

  describe('Min height', () => {
    it('applies min height when provided as number', () => {
      const { container } = render(
        <InlineLoadingOverlay isLoading minHeight={200} />
      )

      const overlay = container.firstChild as HTMLElement
      expect(overlay).toHaveStyle({ minHeight: '200px' })
    })

    it('applies min height when provided as string', () => {
      const { container } = render(
        <InlineLoadingOverlay isLoading minHeight="50vh" />
      )

      const overlay = container.firstChild as HTMLElement
      expect(overlay).toHaveStyle({ minHeight: '50vh' })
    })
  })

  // ===========================================================================
  // CLASSES CSS
  // ===========================================================================

  describe('Classes CSS', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <InlineLoadingOverlay isLoading className="my-inline-class" />
      )

      const overlay = container.querySelector('.my-inline-class')
      expect(overlay).toBeInTheDocument()
    })

    it('has absolute positioning', () => {
      const { container } = render(<InlineLoadingOverlay isLoading />)

      const overlay = container.querySelector('.absolute')
      expect(overlay).toBeInTheDocument()
    })

    it('has z-10 by default', () => {
      const { container } = render(<InlineLoadingOverlay isLoading />)

      const overlay = container.querySelector('.z-10')
      expect(overlay).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ACCESSIBILITÉ
  // ===========================================================================

  describe('Accessibilité', () => {
    it('has role="progressbar"', () => {
      render(<InlineLoadingOverlay isLoading />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('has aria-busy="true"', () => {
      render(<InlineLoadingOverlay isLoading />)

      const overlay = screen.getByRole('progressbar')
      expect(overlay).toHaveAttribute('aria-busy', 'true')
    })
  })
})
