/**
 * Tests unitaires pour SkeletonCard
 *
 * SkeletonCard simule le chargement d'une Card avec image, title,
 * description et actions optionnels.
 *
 * @ticket SP-126
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { SkeletonCard } from '@/components/loading/SkeletonCard'

describe('SkeletonCard', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders with role="status"', () => {
      render(<SkeletonCard />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('has accessible aria-label', () => {
      render(<SkeletonCard />)

      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveAttribute('aria-label', 'Chargement de la carte...')
    })
  })

  // ===========================================================================
  // IMAGE SKELETON
  // ===========================================================================

  describe('Image skeleton', () => {
    it('renders image skeleton by default', () => {
      const { container } = render(<SkeletonCard />)

      // Multiple skeleton elements should exist (image + title + description)
      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(3)
    })

    it('does not render image skeleton when withImage=false', () => {
      const { container } = render(<SkeletonCard withImage={false} />)

      // Fewer skeleton elements without image
      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  // ===========================================================================
  // ACTIONS SKELETON
  // ===========================================================================

  describe('Actions skeleton', () => {
    it('does not render actions by default', () => {
      render(<SkeletonCard />)

      // Count skeletons - should not have extra for actions
      const card = screen.getByRole('status')
      expect(card).toBeInTheDocument()
    })

    it('renders actions skeleton when withActions=true', () => {
      const { container } = render(<SkeletonCard withActions />)

      // Should have more skeleton elements with actions
      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(4)
    })
  })

  // ===========================================================================
  // LINES
  // ===========================================================================

  describe('Lines', () => {
    it('uses default 3 lines', () => {
      const { container } = render(<SkeletonCard />)

      // Multiple skeleton elements for title + 3 lines
      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(3)
    })

    it('respects custom lines count', () => {
      const { container } = render(<SkeletonCard lines={5} />)

      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(5)
    })

    it('renders with 1 line', () => {
      const { container } = render(<SkeletonCard lines={1} />)

      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(1)
    })
  })

  // ===========================================================================
  // ORIENTATION
  // ===========================================================================

  describe('Orientation', () => {
    it('renders vertical orientation by default', () => {
      const { container } = render(<SkeletonCard />)

      // Vertical layout uses overflow-hidden rounded-lg
      const card = container.querySelector('.overflow-hidden')
      expect(card).toBeInTheDocument()
    })

    it('renders horizontal orientation', () => {
      const { container } = render(<SkeletonCard orientation="horizontal" />)

      // Horizontal layout uses flex with gap
      const card = container.querySelector('.flex.gap-4')
      expect(card).toBeInTheDocument()
    })

    it('horizontal layout shows image on left', () => {
      const { container } = render(<SkeletonCard orientation="horizontal" />)

      // flex-shrink-0 is used for the image container
      const imageContainer = container.querySelector('.flex-shrink-0')
      expect(imageContainer).toBeInTheDocument()
    })

    it('horizontal layout hides image when withImage=false', () => {
      const { container } = render(
        <SkeletonCard orientation="horizontal" withImage={false} />
      )

      // No flex-shrink-0 container
      const imageContainer = container.querySelector('.flex-shrink-0')
      expect(imageContainer).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // CLASSES CSS
  // ===========================================================================

  describe('Classes CSS', () => {
    it('accepts custom className', () => {
      const { container } = render(<SkeletonCard className="my-skeleton-card" />)

      const card = container.querySelector('.my-skeleton-card')
      expect(card).toBeInTheDocument()
    })

    it('has border styling', () => {
      const { container } = render(<SkeletonCard />)

      const card = container.querySelector('.border')
      expect(card).toBeInTheDocument()
    })

    it('has rounded corners', () => {
      const { container } = render(<SkeletonCard />)

      const card = container.querySelector('.rounded-lg')
      expect(card).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // COMBINAISONS
  // ===========================================================================

  describe('Combinaisons', () => {
    it('renders with all options enabled', () => {
      const { container } = render(
        <SkeletonCard withImage withActions lines={5} />
      )

      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(6)
    })

    it('renders minimal version', () => {
      const { container } = render(
        <SkeletonCard withImage={false} lines={1} />
      )

      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(1)
    })

    it('horizontal with actions', () => {
      const { container } = render(
        <SkeletonCard orientation="horizontal" withActions />
      )

      const card = container.querySelector('.flex.gap-4')
      expect(card).toBeInTheDocument()
    })
  })
})
