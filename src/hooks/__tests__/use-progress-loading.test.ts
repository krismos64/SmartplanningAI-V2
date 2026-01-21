import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProgressLoading } from '../use-progress-loading'

describe('useProgressLoading', () => {
  describe('Initial state', () => {
    it('returns 0 by default', () => {
      const { result } = renderHook(() => useProgressLoading())
      expect(result.current.progress).toBe(0)
    })

    it('uses initial value when provided', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 50 })
      )
      expect(result.current.progress).toBe(50)
    })

    it('normalizes initial value above max', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 150, max: 100 })
      )
      expect(result.current.progress).toBe(100)
    })

    it('normalizes initial value below min', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: -10, min: 0 })
      )
      expect(result.current.progress).toBe(0)
    })
  })

  describe('setProgress', () => {
    it('sets progress to given value', () => {
      const { result } = renderHook(() => useProgressLoading())

      act(() => {
        result.current.setProgress(75)
      })

      expect(result.current.progress).toBe(75)
    })

    it('normalizes value above max', () => {
      const { result } = renderHook(() => useProgressLoading({ max: 100 }))

      act(() => {
        result.current.setProgress(150)
      })

      expect(result.current.progress).toBe(100)
    })

    it('normalizes value below min', () => {
      const { result } = renderHook(() => useProgressLoading({ min: 0 }))

      act(() => {
        result.current.setProgress(-50)
      })

      expect(result.current.progress).toBe(0)
    })

    it('calls onChange callback', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useProgressLoading({ onChange }))

      act(() => {
        result.current.setProgress(50)
      })

      expect(onChange).toHaveBeenCalledWith(50)
    })

    it('calls onComplete when reaching max', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useProgressLoading({ onComplete }))

      act(() => {
        result.current.setProgress(100)
      })

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('does not call onComplete multiple times for same completion', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useProgressLoading({ onComplete }))

      act(() => {
        result.current.setProgress(100)
      })

      act(() => {
        result.current.setProgress(100)
      })

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('calls onComplete again after going below max and back to max', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useProgressLoading({ onComplete }))

      act(() => {
        result.current.setProgress(100)
      })

      act(() => {
        result.current.setProgress(50)
      })

      act(() => {
        result.current.setProgress(100)
      })

      expect(onComplete).toHaveBeenCalledTimes(2)
    })
  })

  describe('increment', () => {
    it('increments by default step (10)', () => {
      const { result } = renderHook(() => useProgressLoading())

      act(() => {
        result.current.increment()
      })

      expect(result.current.progress).toBe(10)
    })

    it('increments by custom step from options', () => {
      const { result } = renderHook(() => useProgressLoading({ step: 25 }))

      act(() => {
        result.current.increment()
      })

      expect(result.current.progress).toBe(25)
    })

    it('increments by specific amount', () => {
      const { result } = renderHook(() => useProgressLoading())

      act(() => {
        result.current.increment(15)
      })

      expect(result.current.progress).toBe(15)
    })

    it('does not exceed max', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 95, max: 100 })
      )

      act(() => {
        result.current.increment(20)
      })

      expect(result.current.progress).toBe(100)
    })
  })

  describe('decrement', () => {
    it('decrements by default step (10)', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 50 })
      )

      act(() => {
        result.current.decrement()
      })

      expect(result.current.progress).toBe(40)
    })

    it('decrements by custom step from options', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 50, step: 25 })
      )

      act(() => {
        result.current.decrement()
      })

      expect(result.current.progress).toBe(25)
    })

    it('decrements by specific amount', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 50 })
      )

      act(() => {
        result.current.decrement(15)
      })

      expect(result.current.progress).toBe(35)
    })

    it('does not go below min', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 5, min: 0 })
      )

      act(() => {
        result.current.decrement(20)
      })

      expect(result.current.progress).toBe(0)
    })
  })

  describe('reset', () => {
    it('resets to initial value', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 25 })
      )

      act(() => {
        result.current.setProgress(75)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.progress).toBe(25)
    })

    it('calls onChange with initial value', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 25, onChange })
      )

      act(() => {
        result.current.setProgress(75)
      })

      onChange.mockClear()

      act(() => {
        result.current.reset()
      })

      expect(onChange).toHaveBeenCalledWith(25)
    })
  })

  describe('complete', () => {
    it('sets progress to max', () => {
      const { result } = renderHook(() => useProgressLoading({ max: 100 }))

      act(() => {
        result.current.complete()
      })

      expect(result.current.progress).toBe(100)
    })

    it('calls onComplete', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useProgressLoading({ onComplete }))

      act(() => {
        result.current.complete()
      })

      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Derived values', () => {
    it('isComplete is true when progress equals max', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 100 })
      )
      expect(result.current.isComplete).toBe(true)
    })

    it('isComplete is false when progress is below max', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 99 })
      )
      expect(result.current.isComplete).toBe(false)
    })

    it('isZero is true when progress equals min', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 0 })
      )
      expect(result.current.isZero).toBe(true)
    })

    it('isZero is false when progress is above min', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 1 })
      )
      expect(result.current.isZero).toBe(false)
    })

    it('percentage is calculated correctly', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 50, min: 0, max: 100 })
      )
      expect(result.current.percentage).toBe(0.5)
    })

    it('percentage works with custom min/max', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 75, min: 50, max: 100 })
      )
      expect(result.current.percentage).toBe(0.5)
    })
  })

  describe('Custom min/max', () => {
    it('works with custom min', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 10, min: 10, max: 100 })
      )

      expect(result.current.isZero).toBe(true)

      act(() => {
        result.current.decrement(20)
      })

      expect(result.current.progress).toBe(10)
    })

    it('works with custom max', () => {
      const { result } = renderHook(() =>
        useProgressLoading({ initialValue: 0, min: 0, max: 50 })
      )

      act(() => {
        result.current.setProgress(50)
      })

      expect(result.current.isComplete).toBe(true)
    })
  })
})
