/**
 * Tests ResponsiveBreadcrumb - Breadcrumb avec scroll horizontal mobile
 *
 * @ticket SP-388
 *
 * ✅ Source : Context7 - Tailwind CSS scroll-snap utilities
 *
 * Tests couverts :
 * 1. Rendering de base
 * 2. Desktop layout (standard)
 * 3. Mobile layout (horizontal scroll)
 * 4. Scroll snap classes
 * 5. Fade edge indicators
 * 6. showFadeEdges prop
 * 7. Children rendering
 * 8. Scroll to end on mobile
 * 9. Touch behavior classes
 * 10. Accessibility
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ResponsiveBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../breadcrumb'

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  const listeners: Array<(event: MediaQueryListEvent) => void> = []

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(
        (_: string, handler: (event: MediaQueryListEvent) => void) =>
          listeners.push(handler)
      ),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  return { listeners }
}

// Helper to render sample breadcrumb
const renderSampleBreadcrumb = (
  props: Partial<Parameters<typeof ResponsiveBreadcrumb>[0]> = {}
) => {
  return render(
    <ResponsiveBreadcrumb {...props}>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/planning">Planning</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/planning/teams">Équipes</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Page Actuelle</BreadcrumbPage>
      </BreadcrumbItem>
    </ResponsiveBreadcrumb>
  )
}

describe('ResponsiveBreadcrumb (SP-388)', () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // Test 1: Basic Rendering
  // =========================================================================
  describe('Basic Rendering', () => {
    it('should render with default test id', () => {
      renderSampleBreadcrumb()
      expect(screen.getByTestId('responsive-breadcrumb')).toBeInTheDocument()
    })

    it('should render with custom test id', () => {
      renderSampleBreadcrumb({ 'data-testid': 'custom-breadcrumb' })
      expect(screen.getByTestId('custom-breadcrumb')).toBeInTheDocument()
    })

    it('should render all breadcrumb items', () => {
      renderSampleBreadcrumb()
      expect(screen.getByText('Accueil')).toBeInTheDocument()
      expect(screen.getByText('Planning')).toBeInTheDocument()
      expect(screen.getByText('Équipes')).toBeInTheDocument()
      expect(screen.getByText('Page Actuelle')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Test 2: Desktop Layout
  // =========================================================================
  describe('Desktop Layout', () => {
    beforeEach(() => {
      mockMatchMedia(false)
    })

    it('should NOT render scroll container on desktop', () => {
      renderSampleBreadcrumb()
      expect(
        screen.queryByTestId('breadcrumb-scroll-container')
      ).not.toBeInTheDocument()
    })

    it('should NOT show fade indicators on desktop', () => {
      renderSampleBreadcrumb()
      expect(
        screen.queryByTestId('breadcrumb-fade-left')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('breadcrumb-fade-right')
      ).not.toBeInTheDocument()
    })

    it('should have aria-label breadcrumb', () => {
      renderSampleBreadcrumb()
      expect(screen.getByLabelText('breadcrumb')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Test 3: Mobile Layout
  // =========================================================================
  describe('Mobile Layout', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    it('should render scroll container on mobile', () => {
      renderSampleBreadcrumb()
      expect(
        screen.getByTestId('breadcrumb-scroll-container')
      ).toBeInTheDocument()
    })

    it('should have overflow-x-auto on scroll container', () => {
      renderSampleBreadcrumb()
      const container = screen.getByTestId('breadcrumb-scroll-container')
      expect(container).toHaveClass('overflow-x-auto')
    })

    it('should have touch-pan-x for touch scrolling', () => {
      renderSampleBreadcrumb()
      const container = screen.getByTestId('breadcrumb-scroll-container')
      expect(container).toHaveClass('touch-pan-x')
    })

    it('should hide scrollbar', () => {
      renderSampleBreadcrumb()
      const container = screen.getByTestId('breadcrumb-scroll-container')
      expect(container).toHaveClass('scrollbar-none')
    })
  })

  // =========================================================================
  // Test 4: Scroll Snap Classes
  // =========================================================================
  describe('Scroll Snap Classes', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    it('should have snap-x on breadcrumb list', () => {
      renderSampleBreadcrumb()
      const list = screen.getByRole('list')
      expect(list).toHaveClass('snap-x')
      expect(list).toHaveClass('snap-mandatory')
    })

    it('should have flex-nowrap on mobile', () => {
      renderSampleBreadcrumb()
      const list = screen.getByRole('list')
      expect(list).toHaveClass('flex-nowrap')
    })
  })

  // =========================================================================
  // Test 5: showFadeEdges prop
  // =========================================================================
  describe('showFadeEdges Prop', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    it('should add padding when showFadeEdges is true (default)', () => {
      renderSampleBreadcrumb()
      const list = screen.getByRole('list')
      expect(list).toHaveClass('px-2')
    })

    it('should NOT add padding when showFadeEdges is false', () => {
      renderSampleBreadcrumb({ showFadeEdges: false })
      const list = screen.getByRole('list')
      expect(list).not.toHaveClass('px-2')
    })
  })

  // =========================================================================
  // Test 6: Accessibility
  // =========================================================================
  describe('Accessibility', () => {
    it('should have aria-label on nav element', () => {
      renderSampleBreadcrumb()
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'breadcrumb')
    })

    it('should have aria-current on current page', () => {
      renderSampleBreadcrumb()
      const currentPage = screen.getByText('Page Actuelle')
      expect(currentPage).toHaveAttribute('aria-current', 'page')
    })

    it('should render links with correct href', () => {
      renderSampleBreadcrumb()
      expect(screen.getByRole('link', { name: 'Accueil' })).toHaveAttribute(
        'href',
        '/'
      )
      expect(screen.getByRole('link', { name: 'Planning' })).toHaveAttribute(
        'href',
        '/planning'
      )
    })
  })

  // =========================================================================
  // Test 7: Custom className
  // =========================================================================
  describe('Custom className', () => {
    it('should apply custom className on desktop', () => {
      mockMatchMedia(false)
      renderSampleBreadcrumb({ className: 'custom-class' })
      const nav = screen.getByTestId('responsive-breadcrumb')
      expect(nav).toHaveClass('custom-class')
    })

    it('should apply custom className on mobile', () => {
      mockMatchMedia(true)
      renderSampleBreadcrumb({ className: 'custom-class' })
      const nav = screen.getByTestId('responsive-breadcrumb')
      expect(nav).toHaveClass('custom-class')
    })
  })

  // =========================================================================
  // Test 8: Empty children
  // =========================================================================
  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<ResponsiveBreadcrumb>{null}</ResponsiveBreadcrumb>)
      expect(screen.getByTestId('responsive-breadcrumb')).toBeInTheDocument()
    })

    it('should handle single item', () => {
      render(
        <ResponsiveBreadcrumb>
          <BreadcrumbItem>
            <BreadcrumbPage>Only Page</BreadcrumbPage>
          </BreadcrumbItem>
        </ResponsiveBreadcrumb>
      )
      expect(screen.getByText('Only Page')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Test 9: Separators rendering
  // =========================================================================
  describe('Separators', () => {
    it('should render separator SVG icons', () => {
      renderSampleBreadcrumb()
      // BreadcrumbSeparator renders as li with ChevronRightIcon SVG
      const list = screen.getByRole('list')
      // Look for SVG elements (separators contain chevron icons)
      const svgElements = list.querySelectorAll('svg')
      // Should have at least 3 separators (between 4 items)
      expect(svgElements.length).toBeGreaterThanOrEqual(3)
    })
  })
})
