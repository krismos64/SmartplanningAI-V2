/**
 * Tests unitaires pour SkipLink
 *
 * @ticket SP-269
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SkipLink } from '../skip-link'

describe('SkipLink', () => {
  describe('Rendering', () => {
    it('renders with default label', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toBeInTheDocument()
    })

    it('renders with custom label', () => {
      render(<SkipLink label="Skip to content" />)
      const link = screen.getByText('Skip to content')
      expect(link).toBeInTheDocument()
    })

    it('has correct default href', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveAttribute('href', '#main-content')
    })

    it('has correct custom href', () => {
      render(<SkipLink targetId="content" />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveAttribute('href', '#content')
    })

    it('has data-testid attribute', () => {
      render(<SkipLink />)
      const link = screen.getByTestId('skip-link')
      expect(link).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('is visually hidden by default (sr-only)', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveClass('sr-only')
    })

    it('becomes visible on focus (focus:not-sr-only)', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveClass('focus:not-sr-only')
    })

    it('has focus styles for visibility', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveClass('focus:absolute')
      expect(link).toHaveClass('focus:top-4')
      expect(link).toHaveClass('focus:left-4')
      expect(link).toHaveClass('focus:z-[100]')
    })

    it('has focus ring for keyboard users', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveClass('focus:ring-2')
      expect(link).toHaveClass('focus:ring-ring')
      expect(link).toHaveClass('focus:ring-offset-2')
    })

    it('is an anchor element for semantic HTML', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link.tagName).toBe('A')
    })
  })

  describe('Styling', () => {
    it('has primary background on focus', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveClass('focus:bg-primary')
      expect(link).toHaveClass('focus:text-primary-foreground')
    })

    it('has rounded corners', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveClass('focus:rounded-md')
    })

    it('has padding for touch target', () => {
      render(<SkipLink />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveClass('focus:px-4')
      expect(link).toHaveClass('focus:py-2')
    })

    it('accepts custom className', () => {
      render(<SkipLink className="custom-class" />)
      const link = screen.getByText('Aller au contenu principal')
      expect(link).toHaveClass('custom-class')
    })
  })
})
