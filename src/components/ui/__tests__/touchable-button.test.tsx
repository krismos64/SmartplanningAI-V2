/**
 * Tests TouchableButton - Composant bouton adaptatif mobile
 *
 * @ticket SP-385
 *
 * ✅ Source : Context7 - WCAG 2.5.5 Target Size (44px minimum)
 *
 * Tests couverts :
 * 1. Rendering de base
 * 2. Touch size variants (touch, touch-sm, touch-icon, touch-lg)
 * 3. Automatic size adaptation on mobile
 * 4. forceTouchMode prop
 * 5. Size mapping (default → touch, sm → touch-sm, etc.)
 * 6. Active state feedback
 * 7. All button variants with touch sizes
 * 8. Accessibility attributes
 * 9. Ref forwarding
 * 10. useIsMobile hook
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Button, TouchableButton, useIsMobile, buttonVariants } from '../button'
import { renderHook, act } from '@testing-library/react'

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
      removeEventListener: vi.fn(
        (_: string, handler: (event: MediaQueryListEvent) => void) => {
          const index = listeners.indexOf(handler)
          if (index > -1) listeners.splice(index, 1)
        }
      ),
      dispatchEvent: vi.fn(),
    })),
  })

  return {
    simulateChange: (newMatches: boolean) => {
      listeners.forEach((listener) =>
        listener({ matches: newMatches } as MediaQueryListEvent)
      )
    },
  }
}

describe('Button Touch Size Variants (SP-385)', () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // Test 1: Touch size variant classes
  // =========================================================================
  describe('Touch Size Variants', () => {
    it('should apply touch size classes', () => {
      render(
        <Button size="touch" data-testid="touch-btn">
          Touch Button
        </Button>
      )

      const btn = screen.getByTestId('touch-btn')
      expect(btn).toHaveClass('h-11')
      expect(btn).toHaveClass('min-h-[44px]')
      expect(btn).toHaveClass('min-w-[44px]')
    })

    it('should apply touch-sm size classes', () => {
      render(
        <Button size="touch-sm" data-testid="touch-sm-btn">
          Touch Small
        </Button>
      )

      const btn = screen.getByTestId('touch-sm-btn')
      expect(btn).toHaveClass('min-h-[44px]')
      expect(btn).toHaveClass('min-w-[44px]')
      expect(btn).toHaveClass('text-sm')
    })

    it('should apply touch-icon size classes', () => {
      render(
        <Button size="touch-icon" data-testid="touch-icon-btn">
          <span>Icon</span>
        </Button>
      )

      const btn = screen.getByTestId('touch-icon-btn')
      expect(btn).toHaveClass('h-11')
      expect(btn).toHaveClass('w-11')
      expect(btn).toHaveClass('min-h-[44px]')
      expect(btn).toHaveClass('min-w-[44px]')
    })

    it('should apply touch-lg size classes', () => {
      render(
        <Button size="touch-lg" data-testid="touch-lg-btn">
          Large Touch
        </Button>
      )

      const btn = screen.getByTestId('touch-lg-btn')
      expect(btn).toHaveClass('h-12')
      expect(btn).toHaveClass('min-h-[48px]')
      expect(btn).toHaveClass('min-w-[48px]')
    })
  })

  // =========================================================================
  // Test 2: buttonVariants includes touch sizes
  // =========================================================================
  describe('buttonVariants CVA', () => {
    it('should generate correct classes for touch variant', () => {
      const classes = buttonVariants({ size: 'touch' })
      expect(classes).toContain('min-h-[44px]')
      expect(classes).toContain('min-w-[44px]')
    })

    it('should combine touch size with variant', () => {
      const classes = buttonVariants({ size: 'touch', variant: 'destructive' })
      expect(classes).toContain('min-h-[44px]')
      expect(classes).toContain('bg-destructive')
    })
  })
})

describe('TouchableButton Component (SP-385)', () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // Test 3: Basic rendering
  // =========================================================================
  describe('Basic Rendering', () => {
    it('should render with default size on desktop', () => {
      mockMatchMedia(false)
      render(<TouchableButton data-testid="btn">Click me</TouchableButton>)

      const btn = screen.getByTestId('btn')
      expect(btn).toBeInTheDocument()
      expect(btn).toHaveClass('h-9') // default size
    })

    it('should render children correctly', () => {
      render(<TouchableButton>Test Label</TouchableButton>)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Test 4: Mobile detection and size adaptation
  // =========================================================================
  describe('Mobile Size Adaptation', () => {
    it('should use touch size on mobile', () => {
      mockMatchMedia(true) // Mobile
      render(<TouchableButton data-testid="btn">Mobile Button</TouchableButton>)

      const btn = screen.getByTestId('btn')
      expect(btn).toHaveClass('min-h-[44px]')
      expect(btn).toHaveClass('min-w-[44px]')
    })

    it('should map sm to touch-sm on mobile', () => {
      mockMatchMedia(true)
      render(
        <TouchableButton size="sm" data-testid="btn">
          Small
        </TouchableButton>
      )

      const btn = screen.getByTestId('btn')
      expect(btn).toHaveClass('min-h-[44px]')
      expect(btn).toHaveClass('text-sm')
    })

    it('should map icon to touch-icon on mobile', () => {
      mockMatchMedia(true)
      render(
        <TouchableButton size="icon" data-testid="btn">
          <span>I</span>
        </TouchableButton>
      )

      const btn = screen.getByTestId('btn')
      expect(btn).toHaveClass('h-11')
      expect(btn).toHaveClass('w-11')
    })

    it('should map lg to touch-lg on mobile', () => {
      mockMatchMedia(true)
      render(
        <TouchableButton size="lg" data-testid="btn">
          Large
        </TouchableButton>
      )

      const btn = screen.getByTestId('btn')
      expect(btn).toHaveClass('min-h-[48px]')
    })
  })

  // =========================================================================
  // Test 5: forceTouchMode prop
  // =========================================================================
  describe('forceTouchMode Prop', () => {
    it('should force touch size on desktop when forceTouchMode is true', () => {
      mockMatchMedia(false) // Desktop
      render(
        <TouchableButton forceTouchMode data-testid="btn">
          Forced Touch
        </TouchableButton>
      )

      const btn = screen.getByTestId('btn')
      expect(btn).toHaveClass('min-h-[44px]')
      expect(btn).toHaveClass('min-w-[44px]')
    })

    it('should apply active state classes when forceTouchMode is true', () => {
      mockMatchMedia(false)
      render(
        <TouchableButton forceTouchMode data-testid="btn">
          Forced
        </TouchableButton>
      )

      const btn = screen.getByTestId('btn')
      expect(btn).toHaveClass('active:scale-95')
      expect(btn).toHaveClass('active:opacity-90')
    })
  })

  // =========================================================================
  // Test 6: Active state feedback
  // =========================================================================
  describe('Active State Feedback', () => {
    it('should have active state classes on mobile', () => {
      mockMatchMedia(true)
      render(<TouchableButton data-testid="btn">Touch</TouchableButton>)

      const btn = screen.getByTestId('btn')
      expect(btn).toHaveClass('active:scale-95')
      expect(btn).toHaveClass('active:opacity-90')
    })

    it('should NOT have active state classes on desktop without forceTouchMode', () => {
      mockMatchMedia(false)
      render(<TouchableButton data-testid="btn">Desktop</TouchableButton>)

      const btn = screen.getByTestId('btn')
      expect(btn).not.toHaveClass('active:scale-95')
    })
  })

  // =========================================================================
  // Test 7: Variants compatibility
  // =========================================================================
  describe('Variant Compatibility', () => {
    const variants = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'success',
      'warning',
      'info',
    ] as const

    variants.forEach((variant) => {
      it(`should work with ${variant} variant on mobile`, () => {
        mockMatchMedia(true)
        render(
          <TouchableButton variant={variant} data-testid="btn">
            {variant}
          </TouchableButton>
        )

        const btn = screen.getByTestId('btn')
        expect(btn).toBeInTheDocument()
        expect(btn).toHaveClass('min-h-[44px]')
      })
    })
  })

  // =========================================================================
  // Test 8: Preserve existing touch sizes
  // =========================================================================
  describe('Preserve Touch Sizes', () => {
    it('should not change already touch-sized buttons on mobile', () => {
      mockMatchMedia(true)
      render(
        <TouchableButton size="touch-lg" data-testid="btn">
          Already Touch LG
        </TouchableButton>
      )

      const btn = screen.getByTestId('btn')
      expect(btn).toHaveClass('min-h-[48px]') // touch-lg, not touch
    })
  })

  // =========================================================================
  // Test 9: Ref forwarding
  // =========================================================================
  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = { current: null as HTMLButtonElement | null }
      render(
        <TouchableButton ref={ref} data-testid="btn">
          Ref Test
        </TouchableButton>
      )

      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  // =========================================================================
  // Test 10: Accessibility
  // =========================================================================
  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(
        <TouchableButton aria-label="Close menu" data-testid="btn">
          X
        </TouchableButton>
      )

      const btn = screen.getByTestId('btn')
      expect(btn).toHaveAttribute('aria-label', 'Close menu')
    })

    it('should support disabled state', () => {
      render(
        <TouchableButton disabled data-testid="btn">
          Disabled
        </TouchableButton>
      )

      const btn = screen.getByTestId('btn')
      expect(btn).toBeDisabled()
    })
  })
})

describe('useIsMobile Hook (SP-385)', () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // Test 11: Hook behavior
  // =========================================================================
  describe('Hook Behavior', () => {
    it('should return false on desktop', () => {
      mockMatchMedia(false)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    })

    it('should return true on mobile', () => {
      mockMatchMedia(true)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)
    })

    it('should react to media query changes', () => {
      const { simulateChange } = mockMatchMedia(false)
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)

      act(() => {
        simulateChange(true)
      })

      expect(result.current).toBe(true)
    })
  })
})
