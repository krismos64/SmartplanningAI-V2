/**
 * Tests unitaires - Badge Extensions
 *
 * @see SP-260 - Extension composants UI
 * Tests des extensions : icon, dot, pulse, success/warning/info variants
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { Badge, badgeVariants } from '../badge'

// Icône mock pour les tests
const MockIcon = () => <svg data-testid="mock-icon" />

describe('Badge Extensions', () => {
  describe('semantic variants', () => {
    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>)
      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('bg-success')
      expect(badge).toHaveClass('text-success-foreground')
    })

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>)
      const badge = screen.getByText('Warning')
      expect(badge).toHaveClass('bg-warning')
      expect(badge).toHaveClass('text-warning-foreground')
    })

    it('renders info variant', () => {
      render(<Badge variant="info">Info</Badge>)
      const badge = screen.getByText('Info')
      expect(badge).toHaveClass('bg-info')
      expect(badge).toHaveClass('text-info-foreground')
    })
  })

  describe('icon prop', () => {
    it('renders icon before text', () => {
      render(<Badge icon={<MockIcon />}>With Icon</Badge>)
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      expect(screen.getByText('With Icon')).toBeInTheDocument()
    })

    it('applies gap class when icon is present', () => {
      render(<Badge icon={<MockIcon />}>With Icon</Badge>)
      const badge = screen.getByText('With Icon').closest('div')
      expect(badge).toHaveClass('gap-1')
    })

    it('icon container has aria-hidden', () => {
      render(<Badge icon={<MockIcon />}>With Icon</Badge>)
      const iconContainer = screen.getByTestId('mock-icon').parentElement
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('dot variant', () => {
    it('renders as a dot (no children)', () => {
      render(<Badge variant="dot" data-testid="dot-badge" />)
      const dot = screen.getByTestId('dot-badge')
      expect(dot).toHaveClass('h-2')
      expect(dot).toHaveClass('w-2')
      expect(dot).toHaveClass('rounded-full')
    })

    it('has role="status" for accessibility', () => {
      render(<Badge variant="dot" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('has aria-label for accessibility', () => {
      render(<Badge variant="dot" />)
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Notification indicator'
      )
    })

    it('applies dotColor for custom colors', () => {
      render(<Badge variant="dot" dotColor="success" data-testid="dot" />)
      const dot = screen.getByTestId('dot')
      expect(dot).toHaveClass('bg-success')
    })

    it('uses default color when dotColor not specified', () => {
      render(<Badge variant="dot" data-testid="dot" />)
      const dot = screen.getByTestId('dot')
      expect(dot).toHaveClass('bg-primary')
    })

    it('supports different dot colors', () => {
      const { rerender } = render(
        <Badge variant="dot" dotColor="warning" data-testid="dot" />
      )
      expect(screen.getByTestId('dot')).toHaveClass('bg-warning')

      rerender(<Badge variant="dot" dotColor="destructive" data-testid="dot" />)
      expect(screen.getByTestId('dot')).toHaveClass('bg-destructive')

      rerender(<Badge variant="dot" dotColor="info" data-testid="dot" />)
      expect(screen.getByTestId('dot')).toHaveClass('bg-info')
    })
  })

  describe('pulse animation', () => {
    it('applies animate-pulse class when pulse is true', () => {
      render(
        <Badge pulse data-testid="pulse-badge">
          Pulsing
        </Badge>
      )
      const badge = screen.getByTestId('pulse-badge')
      expect(badge).toHaveClass('animate-pulse')
    })

    it('does not apply animate-pulse when pulse is false', () => {
      render(
        <Badge pulse={false} data-testid="no-pulse">
          Not Pulsing
        </Badge>
      )
      const badge = screen.getByTestId('no-pulse')
      expect(badge).not.toHaveClass('animate-pulse')
    })

    it('pulse works with dot variant', () => {
      render(<Badge variant="dot" pulse data-testid="pulsing-dot" />)
      const dot = screen.getByTestId('pulsing-dot')
      expect(dot).toHaveClass('animate-pulse')
    })
  })

  describe('size variants', () => {
    it('applies default size classes', () => {
      render(<Badge data-testid="badge">Default</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('px-2.5')
      expect(badge).toHaveClass('py-0.5')
    })

    it('applies sm size classes', () => {
      render(
        <Badge size="sm" data-testid="badge">
          Small
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('px-2')
      expect(badge).toHaveClass('text-[10px]')
    })

    it('applies lg size classes', () => {
      render(
        <Badge size="lg" data-testid="badge">
          Large
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('px-3')
      expect(badge).toHaveClass('py-1')
      expect(badge).toHaveClass('text-sm')
    })

    it('dot variant respects size through compound variants', () => {
      render(<Badge variant="dot" size="sm" data-testid="sm-dot" />)
      const dot = screen.getByTestId('sm-dot')
      expect(dot).toHaveClass('h-1.5')
      expect(dot).toHaveClass('w-1.5')
    })

    it('dot variant lg size', () => {
      render(<Badge variant="dot" size="lg" data-testid="lg-dot" />)
      const dot = screen.getByTestId('lg-dot')
      expect(dot).toHaveClass('h-2.5')
      expect(dot).toHaveClass('w-2.5')
    })
  })

  describe('badgeVariants function', () => {
    it('generates success variant classes', () => {
      const classes = badgeVariants({ variant: 'success' })
      expect(classes).toContain('bg-success')
      expect(classes).toContain('text-success-foreground')
    })

    it('generates dot variant classes', () => {
      const classes = badgeVariants({ variant: 'dot' })
      expect(classes).toContain('h-2')
      expect(classes).toContain('w-2')
      expect(classes).toContain('rounded-full')
    })

    it('generates size classes', () => {
      const smClasses = badgeVariants({ size: 'sm' })
      expect(smClasses).toContain('px-2')

      const lgClasses = badgeVariants({ size: 'lg' })
      expect(lgClasses).toContain('px-3')
    })
  })

  describe('preserves existing functionality', () => {
    it('default variant still works', () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-primary')
    })

    it('destructive variant still works', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      const badge = screen.getByText('Destructive')
      expect(badge).toHaveClass('bg-destructive')
    })

    it('outline variant still works', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('text-foreground')
    })

    it('secondary variant still works', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('bg-secondary')
    })
  })

  describe('combined features', () => {
    it('icon + success variant + pulse', () => {
      render(
        <Badge variant="success" icon={<MockIcon />} pulse data-testid="combo">
          Combo
        </Badge>
      )
      const badge = screen.getByTestId('combo')
      expect(badge).toHaveClass('bg-success')
      expect(badge).toHaveClass('animate-pulse')
      expect(badge).toHaveClass('gap-1')
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })

    it('lg size + warning variant + icon', () => {
      render(
        <Badge variant="warning" size="lg" icon={<MockIcon />}>
          Large Warning
        </Badge>
      )
      const badge = screen.getByText('Large Warning').closest('div')
      expect(badge).toHaveClass('bg-warning')
      expect(badge).toHaveClass('px-3')
    })
  })
})
