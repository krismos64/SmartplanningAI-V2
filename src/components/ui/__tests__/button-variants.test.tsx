/**
 * Tests unitaires - Button Variants
 *
 * @see SP-260 - Extension composants UI
 * Tests des nouveaux variants success, warning, info
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button, buttonVariants } from '../button'

describe('Button Variants', () => {
  describe('renders without crashing', () => {
    it('renders default variant', () => {
      render(<Button>Default</Button>)
      expect(
        screen.getByRole('button', { name: 'Default' })
      ).toBeInTheDocument()
    })

    it('renders success variant', () => {
      render(<Button variant="success">Success</Button>)
      expect(
        screen.getByRole('button', { name: 'Success' })
      ).toBeInTheDocument()
    })

    it('renders warning variant', () => {
      render(<Button variant="warning">Warning</Button>)
      expect(
        screen.getByRole('button', { name: 'Warning' })
      ).toBeInTheDocument()
    })

    it('renders info variant', () => {
      render(<Button variant="info">Info</Button>)
      expect(screen.getByRole('button', { name: 'Info' })).toBeInTheDocument()
    })
  })

  describe('applies correct CSS classes', () => {
    it('applies success variant classes', () => {
      render(<Button variant="success">Success</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-success')
      expect(button).toHaveClass('text-success-foreground')
    })

    it('applies warning variant classes', () => {
      render(<Button variant="warning">Warning</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-warning')
      expect(button).toHaveClass('text-warning-foreground')
    })

    it('applies info variant classes', () => {
      render(<Button variant="info">Info</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-info')
      expect(button).toHaveClass('text-info-foreground')
    })
  })

  describe('buttonVariants function', () => {
    it('generates success variant classes', () => {
      const classes = buttonVariants({ variant: 'success' })
      expect(classes).toContain('bg-success')
      expect(classes).toContain('text-success-foreground')
    })

    it('generates warning variant classes', () => {
      const classes = buttonVariants({ variant: 'warning' })
      expect(classes).toContain('bg-warning')
      expect(classes).toContain('text-warning-foreground')
    })

    it('generates info variant classes', () => {
      const classes = buttonVariants({ variant: 'info' })
      expect(classes).toContain('bg-info')
      expect(classes).toContain('text-info-foreground')
    })
  })

  describe('size variants work with semantic variants', () => {
    it('applies sm size to success variant', () => {
      render(
        <Button variant="success" size="sm">
          Small Success
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-success')
      expect(button).toHaveClass('h-8')
    })

    it('applies lg size to warning variant', () => {
      render(
        <Button variant="warning" size="lg">
          Large Warning
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-warning')
      expect(button).toHaveClass('h-10')
    })

    it('applies icon size to info variant', () => {
      render(
        <Button variant="info" size="icon">
          <span>Icon</span>
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-info')
      expect(button).toHaveClass('h-9')
      expect(button).toHaveClass('w-9')
    })
  })

  describe('preserves existing variants', () => {
    it('default variant still works', () => {
      render(<Button variant="default">Default</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-primary')
    })

    it('destructive variant still works', () => {
      render(<Button variant="destructive">Destructive</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-destructive')
    })

    it('outline variant still works', () => {
      render(<Button variant="outline">Outline</Button>)
      expect(screen.getByRole('button')).toHaveClass('border')
    })

    it('secondary variant still works', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-secondary')
    })

    it('ghost variant still works', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
    })

    it('link variant still works', () => {
      render(<Button variant="link">Link</Button>)
      expect(screen.getByRole('button')).toHaveClass('underline-offset-4')
    })
  })
})
