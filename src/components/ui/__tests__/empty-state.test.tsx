/**
 * Tests unitaires - EmptyState Component
 *
 * @see SP-378 - Empty States
 * Tests des variants, tailles, animations et accessibilité
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { EmptyState, emptyStateVariants } from '../empty-state'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      role,
      'aria-live': ariaLive,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      'aria-live'?: string
    }) => (
      <div
        className={className}
        role={role}
        aria-live={ariaLive}
        data-testid="motion-div"
        {...props}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock useReducedMotion hook
vi.mock('@/lib/animations', async () => {
  const actual = await vi.importActual('@/lib/animations')
  return {
    ...actual,
    useReducedMotion: () => false,
  }
})

describe('EmptyState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders with required title prop', () => {
      render(<EmptyState title="Aucune donnée" />)

      expect(screen.getByText('Aucune donnée')).toBeInTheDocument()
    })

    it('renders title and description', () => {
      render(
        <EmptyState
          title="Aucune donnée"
          description="Ajoutez des éléments pour commencer"
        />
      )

      expect(screen.getByText('Aucune donnée')).toBeInTheDocument()
      expect(
        screen.getByText('Ajoutez des éléments pour commencer')
      ).toBeInTheDocument()
    })

    it('renders without description', () => {
      render(<EmptyState title="Titre seul" />)

      expect(screen.getByText('Titre seul')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <EmptyState
          title="Test"
          className="custom-class"
          data-testid="empty-state"
        />
      )

      const container = screen.getByTestId('empty-state')
      expect(container).toHaveClass('custom-class')
    })
  })

  describe('variants', () => {
    it('renders default variant', () => {
      render(
        <EmptyState
          title="État vide"
          variant="default"
          data-testid="empty-state"
        />
      )

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('renders search variant', () => {
      render(
        <EmptyState
          title="Aucun résultat"
          variant="search"
          data-testid="empty-state"
        />
      )

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('renders error variant', () => {
      render(
        <EmptyState
          title="Une erreur est survenue"
          variant="error"
          data-testid="empty-state"
        />
      )

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('renders no-permission variant', () => {
      render(
        <EmptyState
          title="Accès refusé"
          variant="no-permission"
          data-testid="empty-state"
        />
      )

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it('renders sm size', () => {
      render(<EmptyState title="Small" size="sm" data-testid="empty-state" />)

      const container = screen.getByTestId('empty-state')
      expect(container).toHaveClass('gap-3')
      expect(container).toHaveClass('py-8')
    })

    it('renders default size', () => {
      render(
        <EmptyState title="Default" size="default" data-testid="empty-state" />
      )

      const container = screen.getByTestId('empty-state')
      expect(container).toHaveClass('gap-4')
      expect(container).toHaveClass('py-12')
    })

    it('renders lg size', () => {
      render(<EmptyState title="Large" size="lg" data-testid="empty-state" />)

      const container = screen.getByTestId('empty-state')
      expect(container).toHaveClass('gap-6')
      expect(container).toHaveClass('py-16')
    })
  })

  describe('illustration', () => {
    it('renders default illustration when no custom illustration', () => {
      render(<EmptyState title="Test" />)

      // Illustration container should exist
      const illustrationContainer = screen.getByRole('img', { hidden: true })
      expect(illustrationContainer).toBeInTheDocument()
    })

    it('renders custom illustration when provided', () => {
      const CustomIllustration = () => (
        <svg data-testid="custom-illustration">
          <rect />
        </svg>
      )

      render(<EmptyState title="Test" illustration={<CustomIllustration />} />)

      expect(screen.getByTestId('custom-illustration')).toBeInTheDocument()
    })

    it('hides illustration when hideIllustration is true', () => {
      render(<EmptyState title="Test" hideIllustration />)

      const illustrations = screen.queryAllByRole('img', { hidden: true })
      expect(illustrations.length).toBe(0)
    })
  })

  describe('action button', () => {
    it('renders action button when provided', () => {
      const handleClick = vi.fn()

      render(
        <EmptyState
          title="Test"
          action={{
            label: 'Ajouter',
            onClick: handleClick,
          }}
        />
      )

      expect(
        screen.getByRole('button', { name: 'Ajouter' })
      ).toBeInTheDocument()
    })

    it('calls onClick when action button is clicked', () => {
      const handleClick = vi.fn()

      render(
        <EmptyState
          title="Test"
          action={{
            label: 'Ajouter',
            onClick: handleClick,
          }}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies custom variant to action button', () => {
      render(
        <EmptyState
          title="Test"
          action={{
            label: 'Ajouter',
            onClick: () => {},
            variant: 'secondary',
          }}
        />
      )

      const button = screen.getByRole('button', { name: 'Ajouter' })
      expect(button).toHaveClass('bg-secondary')
    })

    it('applies outline variant to action button', () => {
      render(
        <EmptyState
          title="Test"
          action={{
            label: 'Ajouter',
            onClick: () => {},
            variant: 'outline',
          }}
        />
      )

      const button = screen.getByRole('button', { name: 'Ajouter' })
      expect(button).toHaveClass('border')
    })

    it('does not render button when action is not provided', () => {
      render(<EmptyState title="Test" />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="status" by default', () => {
      render(<EmptyState title="Test" data-testid="empty-state" />)

      expect(screen.getByTestId('empty-state')).toHaveAttribute(
        'role',
        'status'
      )
    })

    it('has aria-live="polite" by default', () => {
      render(<EmptyState title="Test" data-testid="empty-state" />)

      expect(screen.getByTestId('empty-state')).toHaveAttribute(
        'aria-live',
        'polite'
      )
    })

    it('supports custom aria-live value', () => {
      render(
        <EmptyState
          title="Test"
          aria-live="assertive"
          data-testid="empty-state"
        />
      )

      expect(screen.getByTestId('empty-state')).toHaveAttribute(
        'aria-live',
        'assertive'
      )
    })

    it('illustration container has aria-hidden', () => {
      render(<EmptyState title="Test" />)

      // The illustration is inside a div with aria-hidden
      const illustrationParent = screen
        .getByRole('img', { hidden: true })
        .closest('[aria-hidden="true"]')
      expect(illustrationParent).toBeInTheDocument()
    })

    it('title is rendered as h3', () => {
      render(<EmptyState title="Test Title" />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Test Title')
    })
  })

  describe('animation', () => {
    it('renders with animation when animated is true (default)', () => {
      render(<EmptyState title="Test" animated data-testid="empty-state" />)

      // Component renders - animation is handled by framer-motion
      const container = screen.getByTestId('empty-state')
      expect(container).toBeInTheDocument()
      expect(container).toHaveAttribute('role', 'status')
    })

    it('renders non-animated version when animated is false', () => {
      render(
        <EmptyState title="Test" animated={false} data-testid="empty-state" />
      )

      const container = screen.getByTestId('empty-state')
      expect(container).toBeInTheDocument()
      expect(container.tagName.toLowerCase()).toBe('div')
    })
  })

  describe('emptyStateVariants function', () => {
    it('generates default variant classes', () => {
      const classes = emptyStateVariants({ variant: 'default' })
      expect(classes).toContain('flex')
      expect(classes).toContain('flex-col')
      expect(classes).toContain('items-center')
    })

    it('generates sm size classes', () => {
      const classes = emptyStateVariants({ size: 'sm' })
      expect(classes).toContain('gap-3')
      expect(classes).toContain('py-8')
    })

    it('generates lg size classes', () => {
      const classes = emptyStateVariants({ size: 'lg' })
      expect(classes).toContain('gap-6')
      expect(classes).toContain('py-16')
    })
  })

  describe('combined features', () => {
    it('renders with all features enabled', () => {
      const handleClick = vi.fn()

      render(
        <EmptyState
          title="Aucun résultat"
          description="Modifiez vos critères de recherche"
          variant="search"
          size="lg"
          action={{
            label: 'Réinitialiser',
            onClick: handleClick,
            variant: 'secondary',
          }}
          data-testid="empty-state"
        />
      )

      expect(screen.getByText('Aucun résultat')).toBeInTheDocument()
      expect(
        screen.getByText('Modifiez vos critères de recherche')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Réinitialiser' })
      ).toBeInTheDocument()

      const container = screen.getByTestId('empty-state')
      expect(container).toHaveClass('gap-6')
      expect(container).toHaveClass('py-16')
    })

    it('renders error variant with action', () => {
      const handleRetry = vi.fn()

      render(
        <EmptyState
          title="Erreur de chargement"
          description="Impossible de charger les données"
          variant="error"
          action={{
            label: 'Réessayer',
            onClick: handleRetry,
          }}
        />
      )

      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
      expect(handleRetry).toHaveBeenCalledTimes(1)
    })

    it('renders no-permission variant without action', () => {
      render(
        <EmptyState
          title="Accès refusé"
          description="Vous n'avez pas les droits nécessaires"
          variant="no-permission"
        />
      )

      expect(screen.getByText('Accès refusé')).toBeInTheDocument()
      expect(
        screen.getByText("Vous n'avez pas les droits nécessaires")
      ).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
