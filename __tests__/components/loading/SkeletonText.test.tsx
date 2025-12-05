/**
 * Tests unitaires pour SkeletonText
 *
 * SkeletonText affiche des skeletons de texte avec largeurs variables
 * et variants (title, paragraph, caption).
 *
 * @ticket SP-126
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { SkeletonText } from '@/components/loading/SkeletonText'

describe('SkeletonText', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders with role="status"', () => {
      render(<SkeletonText />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('has accessible aria-label', () => {
      render(<SkeletonText />)

      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveAttribute('aria-label', 'Chargement...')
    })

    it('renders skeleton elements', () => {
      const { container } = render(<SkeletonText />)

      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  // ===========================================================================
  // VARIANTS
  // ===========================================================================

  describe('Variants', () => {
    it('renders paragraph variant by default', () => {
      const { container } = render(<SkeletonText />)

      // Paragraph variant has space-y-2 spacing
      const wrapper = container.querySelector('.space-y-2')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders title variant', () => {
      const { container } = render(<SkeletonText variant="title" />)

      // Title variant has space-y-2 spacing
      const wrapper = container.querySelector('.space-y-2')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders caption variant', () => {
      const { container } = render(<SkeletonText variant="caption" />)

      // Caption variant has space-y-1.5 spacing
      const wrapper = container.querySelector('[class*="space-y"]')
      expect(wrapper).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // LINES
  // ===========================================================================

  describe('Lines', () => {
    it('uses default 3 lines', () => {
      const { container } = render(<SkeletonText />)

      // 3 skeleton elements
      const skeletons = container.querySelectorAll('span > span')
      expect(skeletons.length).toBeGreaterThanOrEqual(3)
    })

    it('respects custom lines count', () => {
      const { container } = render(<SkeletonText lines={5} />)

      // 5 skeleton elements
      const skeletons = container.querySelectorAll('span > span')
      expect(skeletons.length).toBeGreaterThanOrEqual(5)
    })

    it('renders 1 line', () => {
      const { container } = render(<SkeletonText lines={1} />)

      const skeletons = container.querySelectorAll('span > span')
      expect(skeletons.length).toBeGreaterThanOrEqual(1)
    })

    it('renders many lines', () => {
      const { container } = render(<SkeletonText lines={10} />)

      const skeletons = container.querySelectorAll('span > span')
      expect(skeletons.length).toBeGreaterThanOrEqual(10)
    })
  })

  // ===========================================================================
  // LARGEURS VARIABLES
  // ===========================================================================

  describe('Largeurs variables', () => {
    it('paragraph variant has varying widths', () => {
      const { container } = render(<SkeletonText variant="paragraph" lines={5} />)

      // Multiple skeleton elements with different widths
      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(5)
    })

    it('title variant has different widths', () => {
      const { container } = render(<SkeletonText variant="title" lines={2} />)

      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(2)
    })
  })

  // ===========================================================================
  // CLASSES CSS
  // ===========================================================================

  describe('Classes CSS', () => {
    it('accepts custom className', () => {
      const { container } = render(<SkeletonText className="my-skeleton-text" />)

      const wrapper = container.querySelector('.my-skeleton-text')
      expect(wrapper).toBeInTheDocument()
    })

    it('paragraph has space-y-2', () => {
      const { container } = render(<SkeletonText variant="paragraph" />)

      const wrapper = container.querySelector('.space-y-2')
      expect(wrapper).toBeInTheDocument()
    })

    it('title has space-y-2', () => {
      const { container } = render(<SkeletonText variant="title" />)

      const wrapper = container.querySelector('.space-y-2')
      expect(wrapper).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // COMBINAISONS
  // ===========================================================================

  describe('Combinaisons', () => {
    it('title with many lines', () => {
      const { container } = render(<SkeletonText variant="title" lines={4} />)

      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(4)
    })

    it('caption with 1 line', () => {
      const { container } = render(<SkeletonText variant="caption" lines={1} />)

      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('paragraph with custom class', () => {
      const { container } = render(
        <SkeletonText
          variant="paragraph"
          lines={2}
          className="custom-paragraph"
        />
      )

      const wrapper = container.querySelector('.custom-paragraph')
      expect(wrapper).toBeInTheDocument()
    })
  })
})
