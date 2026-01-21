import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLoading } from '../use-loading'

describe('useLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('returns false by default', () => {
      const { result } = renderHook(() => useLoading())
      expect(result.current.isLoading).toBe(false)
    })

    it('uses initial state when provided', () => {
      const { result } = renderHook(() => useLoading({ initialState: true }))
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('startLoading', () => {
    it('sets isLoading to true', () => {
      const { result } = renderHook(() => useLoading())

      act(() => {
        result.current.startLoading()
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('calls onStart callback', () => {
      const onStart = vi.fn()
      const { result } = renderHook(() => useLoading({ onStart }))

      act(() => {
        result.current.startLoading()
      })

      expect(onStart).toHaveBeenCalledTimes(1)
    })
  })

  describe('stopLoading', () => {
    it('sets isLoading to false', () => {
      const { result } = renderHook(() => useLoading({ initialState: true }))

      act(() => {
        result.current.stopLoading()
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('calls onEnd callback', () => {
      const onEnd = vi.fn()
      const { result } = renderHook(() =>
        useLoading({ initialState: true, onEnd })
      )

      act(() => {
        result.current.stopLoading()
      })

      expect(onEnd).toHaveBeenCalledTimes(1)
    })
  })

  describe('minDuration', () => {
    it('respects minDuration before stopping', () => {
      const onEnd = vi.fn()
      const { result } = renderHook(() =>
        useLoading({ minDuration: 500, onEnd })
      )

      act(() => {
        result.current.startLoading()
      })

      // Immediately stop
      act(() => {
        result.current.stopLoading()
      })

      // Should still be loading
      expect(result.current.isLoading).toBe(true)
      expect(onEnd).not.toHaveBeenCalled()

      // Advance time
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Now should be stopped
      expect(result.current.isLoading).toBe(false)
      expect(onEnd).toHaveBeenCalledTimes(1)
    })

    it('stops immediately if minDuration is already elapsed', () => {
      const { result } = renderHook(() => useLoading({ minDuration: 100 }))

      act(() => {
        result.current.startLoading()
      })

      // Wait longer than minDuration
      act(() => {
        vi.advanceTimersByTime(200)
      })

      act(() => {
        result.current.stopLoading()
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('toggleLoading', () => {
    it('toggles from false to true', () => {
      const { result } = renderHook(() => useLoading())

      act(() => {
        result.current.toggleLoading()
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('toggles from true to false', () => {
      const { result } = renderHook(() => useLoading({ initialState: true }))

      act(() => {
        result.current.toggleLoading()
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('withLoading', () => {
    it('sets loading state during async function execution', async () => {
      const { result } = renderHook(() => useLoading())

      const asyncFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return 'result'
      })

      const wrappedFn = result.current.withLoading(asyncFn)

      let promise: Promise<unknown>
      act(() => {
        promise = wrappedFn()
      })

      // Should be loading
      expect(result.current.isLoading).toBe(true)

      // Resolve the promise
      await act(async () => {
        vi.advanceTimersByTime(100)
        await promise
      })

      // Should no longer be loading
      expect(result.current.isLoading).toBe(false)
      expect(asyncFn).toHaveBeenCalledTimes(1)
    })

    it('passes arguments to wrapped function', async () => {
      const { result } = renderHook(() => useLoading())

      const asyncFn = vi.fn().mockResolvedValue('done')
      const wrappedFn = result.current.withLoading(asyncFn)

      await act(async () => {
        await wrappedFn('arg1', 'arg2')
      })

      expect(asyncFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('returns the result of the wrapped function', async () => {
      const { result } = renderHook(() => useLoading())

      const asyncFn = vi.fn().mockResolvedValue('expected-result')
      const wrappedFn = result.current.withLoading(asyncFn)

      let returnValue: unknown
      await act(async () => {
        returnValue = await wrappedFn()
      })

      expect(returnValue).toBe('expected-result')
    })

    it('stops loading even when function throws', async () => {
      const { result } = renderHook(() => useLoading())

      const asyncFn = vi.fn().mockRejectedValue(new Error('Test error'))
      const wrappedFn = result.current.withLoading(asyncFn)

      await act(async () => {
        try {
          await wrappedFn()
        } catch {
          // Expected error
        }
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('reset', () => {
    it('resets to initial state (false by default)', () => {
      const { result } = renderHook(() => useLoading())

      act(() => {
        result.current.startLoading()
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('resets to provided initial state', () => {
      const { result } = renderHook(() => useLoading({ initialState: true }))

      act(() => {
        result.current.stopLoading()
      })

      expect(result.current.isLoading).toBe(false)

      act(() => {
        result.current.reset()
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('Callback stability', () => {
    it('maintains stable function references', () => {
      const { result, rerender } = renderHook(() => useLoading())

      const firstStartLoading = result.current.startLoading
      const firstStopLoading = result.current.stopLoading
      const firstWithLoading = result.current.withLoading

      rerender()

      expect(result.current.startLoading).toBe(firstStartLoading)
      expect(result.current.stopLoading).toBe(firstStopLoading)
      expect(result.current.withLoading).toBe(firstWithLoading)
    })
  })
})
