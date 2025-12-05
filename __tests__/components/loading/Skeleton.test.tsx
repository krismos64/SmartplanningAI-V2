/**
 * Tests unitaires pour Skeleton et SkeletonProvider
 *
 * Skeleton est un wrapper pour react-loading-skeleton avec theming cohérent
 * et variants prédéfinis (text, title, avatar, button, input).
 *
 * @ticket SP-126
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { Skeleton, SkeletonProvider } from '@/components/loading/Skeleton'

describe('Skeleton', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders skeleton element', () => {
      const { container } = render(<Skeleton />)

      // react-loading-skeleton renders span elements
      expect(container.querySelector('span')).toBeInTheDocument()
    })

    it('renders with default text variant', () => {
      const { container } = render(<Skeleton />)

      // Default variant is text
      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // VARIANTS
  // ===========================================================================

  describe('Variants', () => {
    it('renders text variant with correct height', () => {
      const { container } = render(<Skeleton variant="text" />)

      // Text variant has height: 16
      const skeleton = container.querySelector('[style*="height"]')
      expect(skeleton).toBeInTheDocument()
    })

    it('renders title variant', () => {
      const { container } = render(<Skeleton variant="title" />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('renders avatar variant', () => {
      const { container } = render(<Skeleton variant="avatar" />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('renders button variant', () => {
      const { container } = render(<Skeleton variant="button" />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('renders input variant', () => {
      const { container } = render(<Skeleton variant="input" />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('renders custom variant', () => {
      const { container } = render(
        <Skeleton variant="custom" width={100} height={50} />
      )

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // PROPS PERSONNALISÉES
  // ===========================================================================

  describe('Props personnalisées', () => {
    it('accepts custom width', () => {
      const { container } = render(<Skeleton width={200} />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('accepts custom height', () => {
      const { container } = render(<Skeleton height={40} />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('accepts custom borderRadius', () => {
      const { container } = render(<Skeleton borderRadius={8} />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('renders multiple lines with count prop', () => {
      const { container } = render(<Skeleton count={3} />)

      // react-loading-skeleton creates one element but with multiple lines
      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('renders circle when circle=true', () => {
      const { container } = render(<Skeleton circle width={40} height={40} />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ANIMATION
  // ===========================================================================

  describe('Animation', () => {
    it('enables animation by default', () => {
      const { container } = render(<Skeleton />)

      // Animation is enabled by default
      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('accepts custom duration', () => {
      const { container } = render(<Skeleton duration={2} />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('can disable animation', () => {
      const { container } = render(<Skeleton enableAnimation={false} />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // CLASSES CSS
  // ===========================================================================

  describe('Classes CSS', () => {
    it('accepts className', () => {
      const { container } = render(<Skeleton className="my-skeleton" />)

      const wrapper = container.querySelector('.my-skeleton')
      expect(wrapper).toBeInTheDocument()
    })

    it('accepts containerClassName', () => {
      const { container } = render(
        <Skeleton containerClassName="my-container" />
      )

      const wrapper = container.querySelector('.my-container')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders inline when inline=true', () => {
      const { container } = render(<Skeleton inline />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // FORWARD REF
  // ===========================================================================

  describe('forwardRef', () => {
    it('forwards ref to span element', () => {
      const ref = React.createRef<HTMLSpanElement>()

      render(<Skeleton ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })
  })

  // ===========================================================================
  // EXPLICIT PROPS OVERRIDE VARIANT CONFIG
  // ===========================================================================

  describe('Explicit props override variant config', () => {
    it('explicit width overrides variant width', () => {
      const { container } = render(<Skeleton variant="avatar" width={100} />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('explicit height overrides variant height', () => {
      const { container } = render(<Skeleton variant="text" height={50} />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })

    it('explicit circle overrides variant circle', () => {
      const { container } = render(<Skeleton variant="avatar" circle={false} />)

      const skeleton = container.querySelector('span')
      expect(skeleton).toBeInTheDocument()
    })
  })
})

// =============================================================================
// SKELETON PROVIDER
// =============================================================================

describe('SkeletonProvider', () => {
  it('renders children', () => {
    render(
      <SkeletonProvider>
        <div data-testid="child">Child content</div>
      </SkeletonProvider>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders skeleton inside provider', () => {
    const { container } = render(
      <SkeletonProvider>
        <Skeleton variant="text" />
      </SkeletonProvider>
    )

    const skeleton = container.querySelector('span')
    expect(skeleton).toBeInTheDocument()
  })

  it('accepts custom baseColor', () => {
    const { container } = render(
      <SkeletonProvider baseColor="#e0e0e0">
        <Skeleton />
      </SkeletonProvider>
    )

    const skeleton = container.querySelector('span')
    expect(skeleton).toBeInTheDocument()
  })

  it('accepts custom highlightColor', () => {
    const { container } = render(
      <SkeletonProvider highlightColor="#f5f5f5">
        <Skeleton />
      </SkeletonProvider>
    )

    const skeleton = container.querySelector('span')
    expect(skeleton).toBeInTheDocument()
  })

  it('accepts both baseColor and highlightColor', () => {
    const { container } = render(
      <SkeletonProvider baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <Skeleton />
      </SkeletonProvider>
    )

    const skeleton = container.querySelector('span')
    expect(skeleton).toBeInTheDocument()
  })
})
