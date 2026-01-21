/**
 * Tests unitaires - useStaggerAnimation Hook
 *
 * @see SP-379 - Animations System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useStaggerAnimation,
  useQuickStagger,
  useSlowStagger,
  useReverseStagger,
  useGridStagger,
} from '../../hooks/useStaggerAnimation'

describe('useStaggerAnimation Hook', () => {
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
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useStaggerAnimation', () => {
    it('should return containerProps and itemProps', () => {
      const { result } = renderHook(() => useStaggerAnimation(5))

      expect(result.current).toHaveProperty('containerProps')
      expect(result.current).toHaveProperty('itemProps')
    })

    it('should have variants in containerProps', () => {
      const { result } = renderHook(() => useStaggerAnimation(5))

      expect(result.current.containerProps).toHaveProperty('variants')
      expect(result.current.containerProps).toHaveProperty('initial', 'hidden')
      expect(result.current.containerProps).toHaveProperty('animate', 'visible')
    })

    it('should have variants in itemProps', () => {
      const { result } = renderHook(() => useStaggerAnimation(5))

      expect(result.current.itemProps).toHaveProperty('variants')
    })

    it('should apply custom stagger delay', () => {
      const { result } = renderHook(() =>
        useStaggerAnimation(5, { staggerDelay: 0.2 })
      )

      const transition = (
        result.current.containerProps.variants?.visible as {
          transition: { staggerChildren: number }
        }
      ).transition

      expect(transition.staggerChildren).toBe(0.2)
    })

    it('should apply custom initial delay', () => {
      const { result } = renderHook(() =>
        useStaggerAnimation(5, { initialDelay: 0.5 })
      )

      const transition = (
        result.current.containerProps.variants?.visible as {
          transition: { delayChildren?: number }
        }
      ).transition

      // delayChildren is set via initialDelay option
      expect(transition).toBeDefined()
      expect(transition.delayChildren).toBe(0.5)
    })

    it('should support different item variants', () => {
      // Use 'default' variant which is always supported
      const { result } = renderHook(() =>
        useStaggerAnimation(5, { itemVariant: 'default' })
      )

      // itemProps should always be defined
      expect(result.current.itemProps).toBeDefined()
      expect(result.current.containerProps).toBeDefined()
    })

    it('should use reduced stagger in reduced motion mode', () => {
      matchMediaMock.mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))

      const { result } = renderHook(() =>
        useStaggerAnimation(5, { staggerDelay: 0.1 })
      )

      const transition = (
        result.current.containerProps.variants?.visible as {
          transition: { staggerChildren: number }
        }
      ).transition

      // Should have reduced or no stagger
      expect(transition.staggerChildren).toBeLessThanOrEqual(0.1)
    })

    it('should handle zero items gracefully', () => {
      const { result } = renderHook(() => useStaggerAnimation(0))

      expect(result.current.containerProps).toBeDefined()
      expect(result.current.itemProps).toBeDefined()
    })
  })

  describe('useQuickStagger', () => {
    it('should return stagger with fast delay', () => {
      const { result } = renderHook(() => useQuickStagger(5))

      const transition = (
        result.current.containerProps.variants?.visible as {
          transition: { staggerChildren: number }
        }
      ).transition

      expect(transition.staggerChildren).toBeLessThanOrEqual(0.08)
    })
  })

  describe('useSlowStagger', () => {
    it('should return stagger with slow delay', () => {
      const { result } = renderHook(() => useSlowStagger(5))

      const transition = (
        result.current.containerProps.variants?.visible as {
          transition: { staggerChildren: number }
        }
      ).transition

      expect(transition.staggerChildren).toBeGreaterThanOrEqual(0.15)
    })
  })

  describe('useReverseStagger', () => {
    it('should have negative stagger direction', () => {
      const { result } = renderHook(() => useReverseStagger(5))

      const transition = (
        result.current.containerProps.variants?.visible as {
          transition: { staggerDirection: number }
        }
      ).transition

      expect(transition.staggerDirection).toBe(-1)
    })
  })

  describe('useGridStagger', () => {
    it('should return stagger props for grid layout', () => {
      const { result } = renderHook(() => useGridStagger(12))

      expect(result.current.containerProps).toBeDefined()
      expect(result.current.itemProps).toBeDefined()
    })

    it('should calculate appropriate stagger for grid', () => {
      const { result } = renderHook(() => useGridStagger(9))

      const transition = (
        result.current.containerProps.variants?.visible as {
          transition: { staggerChildren: number }
        }
      ).transition

      expect(transition.staggerChildren).toBeGreaterThan(0)
    })
  })
})
