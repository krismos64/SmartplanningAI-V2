/**
 * Tests unitaires pour Spinner et SpinnerDots
 *
 * Spinner est un composant de chargement avec animation CSS pure.
 * SpinnerDots est une variante avec 3 points animés.
 *
 * @ticket SP-126
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { Spinner, SpinnerDots } from '@/components/loading/Spinner'

// =============================================================================
// SPINNER
// =============================================================================

describe('Spinner', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders with role="status"', () => {
      render(<Spinner />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders default label "Chargement..."', () => {
      render(<Spinner />)

      expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })

    it('has aria-label for accessibility', () => {
      render(<Spinner />)

      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Chargement...'
      )
    })

    it('has aria-live="polite"', () => {
      render(<Spinner />)

      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    })
  })

  // ===========================================================================
  // TAILLES
  // ===========================================================================

  describe('Tailles', () => {
    it('renders with default size (md)', () => {
      const { container } = render(<Spinner />)

      const spinnerCircle = container.querySelector('.animate-spin')
      expect(spinnerCircle).toHaveClass('w-8', 'h-8')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<Spinner size="sm" />)

      const spinnerCircle = container.querySelector('.animate-spin')
      expect(spinnerCircle).toHaveClass('w-4', 'h-4')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<Spinner size="lg" />)

      const spinnerCircle = container.querySelector('.animate-spin')
      expect(spinnerCircle).toHaveClass('w-12', 'h-12')
    })

    it('renders with size="xl"', () => {
      const { container } = render(<Spinner size="xl" />)

      const spinnerCircle = container.querySelector('.animate-spin')
      expect(spinnerCircle).toHaveClass('w-16', 'h-16')
    })
  })

  // ===========================================================================
  // VARIANTS
  // ===========================================================================

  describe('Variants', () => {
    it('renders with default variant (primary)', () => {
      const { container } = render(<Spinner />)

      const spinnerCircle = container.querySelector('.animate-spin')
      expect(spinnerCircle).toHaveClass('border-blue-200', 'border-t-blue-600')
    })

    it('renders with variant="white"', () => {
      const { container } = render(<Spinner variant="white" />)

      const spinnerCircle = container.querySelector('.animate-spin')
      expect(spinnerCircle).toHaveClass('border-white/30', 'border-t-white')
    })

    it('renders with variant="current"', () => {
      const { container } = render(<Spinner variant="current" />)

      const spinnerCircle = container.querySelector('.animate-spin')
      expect(spinnerCircle).toHaveClass('border-current/30', 'border-t-current')
    })
  })

  // ===========================================================================
  // LABEL
  // ===========================================================================

  describe('Label', () => {
    it('renders custom label', () => {
      render(<Spinner label="Chargement des données..." />)

      expect(screen.getByText('Chargement des données...')).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Chargement des données...'
      )
    })

    it('label is sr-only by default', () => {
      render(<Spinner label="Loading" />)

      const labelElement = screen.getByText('Loading')
      expect(labelElement).toHaveClass('sr-only')
    })

    it('shows label visually when showLabel=true', () => {
      render(<Spinner label="Chargement..." showLabel />)

      const labelElement = screen.getByText('Chargement...')
      expect(labelElement).not.toHaveClass('sr-only')
      expect(labelElement).toHaveClass('text-sm', 'text-gray-600')
    })
  })

  // ===========================================================================
  // CLASSES CSS CUSTOM
  // ===========================================================================

  describe('Classes CSS custom', () => {
    it('accepts custom className', () => {
      render(<Spinner className="my-custom-class" />)

      expect(screen.getByRole('status')).toHaveClass('my-custom-class')
    })

    it('merges with default classes', () => {
      render(<Spinner className="mt-4" />)

      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('flex', 'items-center', 'justify-center', 'mt-4')
    })
  })

  // ===========================================================================
  // FORWARD REF
  // ===========================================================================

  describe('forwardRef', () => {
    it('forwards ref to wrapper div', () => {
      const ref = React.createRef<HTMLDivElement>()

      render(<Spinner ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveAttribute('role', 'status')
    })
  })

  // ===========================================================================
  // ANIMATION
  // ===========================================================================

  describe('Animation', () => {
    it('spinner circle has animate-spin class', () => {
      const { container } = render(<Spinner />)

      const spinnerCircle = container.querySelector('.animate-spin')
      expect(spinnerCircle).toBeInTheDocument()
      expect(spinnerCircle).toHaveClass('rounded-full')
    })

    it('spinner circle has aria-hidden="true"', () => {
      const { container } = render(<Spinner />)

      const spinnerCircle = container.querySelector('.animate-spin')
      expect(spinnerCircle).toHaveAttribute('aria-hidden', 'true')
    })
  })
})

// =============================================================================
// SPINNER DOTS
// =============================================================================

describe('SpinnerDots', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders with role="status"', () => {
      render(<SpinnerDots />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders 3 dots', () => {
      const { container } = render(<SpinnerDots />)

      const dots = container.querySelectorAll('.animate-pulse')
      expect(dots).toHaveLength(3)
    })

    it('has aria-label "Chargement..."', () => {
      render(<SpinnerDots />)

      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Chargement...'
      )
    })

    it('has sr-only label text', () => {
      render(<SpinnerDots />)

      expect(screen.getByText('Chargement...')).toHaveClass('sr-only')
    })
  })

  // ===========================================================================
  // TAILLES
  // ===========================================================================

  describe('Tailles', () => {
    it('renders with default size (md)', () => {
      const { container } = render(<SpinnerDots />)

      const dots = container.querySelectorAll('.animate-pulse')
      dots.forEach((dot) => {
        expect(dot).toHaveClass('w-2', 'h-2')
      })
    })

    it('renders with size="sm"', () => {
      const { container } = render(<SpinnerDots size="sm" />)

      const dots = container.querySelectorAll('.animate-pulse')
      dots.forEach((dot) => {
        expect(dot).toHaveClass('w-1.5', 'h-1.5')
      })
    })

    it('renders with size="lg"', () => {
      const { container } = render(<SpinnerDots size="lg" />)

      const dots = container.querySelectorAll('.animate-pulse')
      dots.forEach((dot) => {
        expect(dot).toHaveClass('w-3', 'h-3')
      })
    })
  })

  // ===========================================================================
  // VARIANTS
  // ===========================================================================

  describe('Variants', () => {
    it('renders with default variant (primary)', () => {
      const { container } = render(<SpinnerDots />)

      const dots = container.querySelectorAll('.animate-pulse')
      dots.forEach((dot) => {
        expect(dot).toHaveClass('bg-blue-600')
      })
    })

    it('renders with variant="white"', () => {
      const { container } = render(<SpinnerDots variant="white" />)

      const dots = container.querySelectorAll('.animate-pulse')
      dots.forEach((dot) => {
        expect(dot).toHaveClass('bg-white')
      })
    })

    it('renders with variant="current"', () => {
      const { container } = render(<SpinnerDots variant="current" />)

      const dots = container.querySelectorAll('.animate-pulse')
      dots.forEach((dot) => {
        expect(dot).toHaveClass('bg-current')
      })
    })
  })

  // ===========================================================================
  // ANIMATION
  // ===========================================================================

  describe('Animation', () => {
    it('dots have staggered animation delays', () => {
      const { container } = render(<SpinnerDots />)

      const dots = container.querySelectorAll('.animate-pulse')

      expect(dots[0]).toHaveStyle({ animationDelay: '0s' })
      expect(dots[1]).toHaveStyle({ animationDelay: '0.15s' })
      expect(dots[2]).toHaveStyle({ animationDelay: '0.3s' })
    })

    it('dots have 1s animation duration', () => {
      const { container } = render(<SpinnerDots />)

      const dots = container.querySelectorAll('.animate-pulse')
      dots.forEach((dot) => {
        expect(dot).toHaveStyle({ animationDuration: '1s' })
      })
    })

    it('dots have aria-hidden="true"', () => {
      const { container } = render(<SpinnerDots />)

      const dots = container.querySelectorAll('.animate-pulse')
      dots.forEach((dot) => {
        expect(dot).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  // ===========================================================================
  // CLASSES CSS CUSTOM
  // ===========================================================================

  describe('Classes CSS custom', () => {
    it('accepts custom className', () => {
      render(<SpinnerDots className="my-dots-class" />)

      expect(screen.getByRole('status')).toHaveClass('my-dots-class')
    })
  })

  // ===========================================================================
  // FORWARD REF
  // ===========================================================================

  describe('forwardRef', () => {
    it('forwards ref to wrapper div', () => {
      const ref = React.createRef<HTMLDivElement>()

      render(<SpinnerDots ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveAttribute('role', 'status')
    })
  })
})
