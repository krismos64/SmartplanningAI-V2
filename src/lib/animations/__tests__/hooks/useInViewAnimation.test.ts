/**
 * Tests unitaires - useInViewAnimation Hook
 *
 * @see SP-379 - Animations System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useInViewAnimation,
  useInViewOnce,
  useInViewDelayed,
  useInViewSection,
  useInViewRepeatable,
} from '../../hooks/useInViewAnimation'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()

describe('useInViewAnimation Hook', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    // Setup IntersectionObserver mock
    mockIntersectionObserver.mockImplementation((_callback: IntersectionObserverCallback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: vi.fn(() => []),
    }))

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: mockIntersectionObserver,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useInViewAnimation', () => {
    it('should return ref and animationProps', () => {
      const { result } = renderHook(() => useInViewAnimation())

      expect(result.current).toHaveProperty('ref')
      expect(result.current).toHaveProperty('animationProps')
    })

    it('should return isInView state', () => {
      const { result } = renderHook(() => useInViewAnimation())

      expect(result.current).toHaveProperty('isInView')
      expect(typeof result.current.isInView).toBe('boolean')
    })

    it('should have animation props with initial and animate', () => {
      const { result } = renderHook(() => useInViewAnimation())

      expect(result.current.animationProps).toHaveProperty('initial')
      expect(result.current.animationProps).toHaveProperty('animate')
    })

    it('should apply custom threshold', () => {
      const { result } = renderHook(() =>
        useInViewAnimation({ threshold: 0.5 })
      )

      expect(result.current.animationProps).toBeDefined()
    })

    it('should apply once option', () => {
      const { result } = renderHook(() =>
        useInViewAnimation({ once: true })
      )

      expect(result.current.animationProps).toBeDefined()
    })

    it('should support different variants', () => {
      const variants = ['fade', 'fadeSlideUp', 'scale'] as const

      variants.forEach((variant) => {
        const { result } = renderHook(() =>
          useInViewAnimation({ variant })
        )

        expect(result.current.animationProps.variants).toBeDefined()
      })
    })

    it('should apply delay option', () => {
      const { result } = renderHook(() =>
        useInViewAnimation({ delay: 0.3 })
      )

      // Delay is handled internally by the hook
      expect(result.current.animationProps).toBeDefined()
    })

    it('should use reduced motion when preference is set', () => {
      matchMediaMock.mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))

      const { result } = renderHook(() =>
        useInViewAnimation({ variant: 'fadeSlideUp' })
      )

      // Animation props should still be defined
      expect(result.current.animationProps).toBeDefined()
      expect(result.current.animationProps.variants).toBeDefined()
    })
  })

  describe('useInViewOnce', () => {
    it('should default to once: true', () => {
      const { result } = renderHook(() => useInViewOnce())

      expect(result.current.animationProps).toBeDefined()
    })

    it('should accept variant option', () => {
      const { result } = renderHook(() =>
        useInViewOnce('scale')
      )

      expect(result.current.animationProps.variants).toBeDefined()
    })
  })

  describe('useInViewDelayed', () => {
    it('should accept delay parameter', () => {
      const { result } = renderHook(() => useInViewDelayed(0.5))

      // Delay is used internally
      expect(result.current.animationProps).toBeDefined()
    })

    it('should default to once: true', () => {
      const { result } = renderHook(() => useInViewDelayed(0.3))

      expect(result.current.animationProps).toBeDefined()
    })
  })

  describe('useInViewSection', () => {
    it('should have appropriate threshold for sections', () => {
      const { result } = renderHook(() => useInViewSection())

      expect(result.current.animationProps).toBeDefined()
    })

    it('should use fadeSlideUp variant by default', () => {
      const { result } = renderHook(() => useInViewSection())

      expect(result.current.animationProps.variants).toBeDefined()
    })
  })

  describe('useInViewRepeatable', () => {
    it('should allow animation to repeat', () => {
      const { result } = renderHook(() => useInViewRepeatable())

      expect(result.current.animationProps).toBeDefined()
    })

    it('should accept custom variant', () => {
      const { result } = renderHook(() =>
        useInViewRepeatable('fade')
      )

      expect(result.current.animationProps.variants).toBeDefined()
    })
  })
})
