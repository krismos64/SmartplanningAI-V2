/**
 * Tests for useKeyboardShortcuts hook
 *
 * @see SP-264 - Command Palette
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useKeyboardShortcuts,
  useKeyboardShortcut,
} from '../use-keyboard-shortcuts'

// Mock navigator.platform
const mockPlatform = (platform: string) => {
  Object.defineProperty(navigator, 'platform', {
    value: platform,
    configurable: true,
  })
}

// Helper to create keyboard events
const createKeyboardEvent = (
  key: string,
  options: Partial<KeyboardEvent> = {}
): KeyboardEvent => {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    ...options,
  })
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    mockPlatform('MacIntel')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should call handler when simple key is pressed', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ escape: handler }))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('Escape'))
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should call handler for mod+k on Mac (metaKey)', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'mod+k': handler }))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { metaKey: true }))
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should call handler for mod+k on Windows (ctrlKey)', () => {
      mockPlatform('Win32')
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'mod+k': handler }))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { ctrlKey: true }))
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple shortcuts', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({
          'mod+k': handler1,
          escape: handler2,
        })
      )

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { metaKey: true }))
        window.dispatchEvent(createKeyboardEvent('Escape'))
      })

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should cleanup listeners on unmount', () => {
      const handler = vi.fn()
      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({ escape: handler })
      )

      unmount()

      act(() => {
        window.dispatchEvent(createKeyboardEvent('Escape'))
      })

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('modifier keys', () => {
    it('should handle ctrl+k explicitly', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+k': handler }))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { ctrlKey: true }))
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle shift+mod+k', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'shift+mod+k': handler }))

      act(() => {
        window.dispatchEvent(
          createKeyboardEvent('k', { metaKey: true, shiftKey: true })
        )
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not trigger without required modifier', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'mod+k': handler }))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k'))
      })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle alt/option modifier', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'alt+k': handler }))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { altKey: true }))
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('input handling', () => {
    it('should ignore shortcuts in input elements by default', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'mod+k': handler }))

      // Create an input element and focus it
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { metaKey: true }))
      })

      expect(handler).not.toHaveBeenCalled()

      // Cleanup
      document.body.removeChild(input)
    })

    it('should ignore shortcuts in textarea elements', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'mod+k': handler }))

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { metaKey: true }))
      })

      expect(handler).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('should ignore shortcuts in contenteditable elements', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'mod+k': handler }))

      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      document.body.appendChild(div)
      div.focus()

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { metaKey: true }))
      })

      expect(handler).not.toHaveBeenCalled()

      document.body.removeChild(div)
    })

    it('should work in inputs when enableInInputs is true', () => {
      const handler = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({
          'mod+k': [handler, { enableInInputs: true }],
        })
      )

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { metaKey: true }))
      })

      expect(handler).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it('should allow Escape in inputs to close modals', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ escape: handler }))

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      act(() => {
        window.dispatchEvent(createKeyboardEvent('Escape'))
      })

      expect(handler).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })
  })

  describe('options', () => {
    it('should not register shortcuts when enabled is false', () => {
      const handler = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({ escape: handler }, { enabled: false })
      )

      act(() => {
        window.dispatchEvent(createKeyboardEvent('Escape'))
      })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should re-enable shortcuts when enabled changes to true', () => {
      const handler = vi.fn()
      const { rerender } = renderHook(
        ({ enabled }) => useKeyboardShortcuts({ escape: handler }, { enabled }),
        { initialProps: { enabled: false } }
      )

      act(() => {
        window.dispatchEvent(createKeyboardEvent('Escape'))
      })
      expect(handler).not.toHaveBeenCalled()

      rerender({ enabled: true })

      act(() => {
        window.dispatchEvent(createKeyboardEvent('Escape'))
      })
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should prevent default behavior by default', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'mod+k': handler }))

      const event = createKeyboardEvent('k', { metaKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      act(() => {
        window.dispatchEvent(event)
      })

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('sequences', () => {
    it('should handle key sequences like g+h', () => {
      vi.useFakeTimers()
      const handler = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({ 'g h': handler }, { sequenceTimeout: 1000 })
      )

      act(() => {
        window.dispatchEvent(createKeyboardEvent('g'))
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      act(() => {
        window.dispatchEvent(createKeyboardEvent('h'))
      })

      expect(handler).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })

    it('should reset sequence on timeout', () => {
      vi.useFakeTimers()
      const handler = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({ 'g h': handler }, { sequenceTimeout: 500 })
      )

      act(() => {
        window.dispatchEvent(createKeyboardEvent('g'))
      })

      act(() => {
        vi.advanceTimersByTime(600)
      })

      act(() => {
        window.dispatchEvent(createKeyboardEvent('h'))
      })

      expect(handler).not.toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('should reset sequence on non-matching key', () => {
      vi.useFakeTimers()
      const handler = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({ 'g h': handler }, { sequenceTimeout: 1000 })
      )

      act(() => {
        window.dispatchEvent(createKeyboardEvent('g'))
        window.dispatchEvent(createKeyboardEvent('x'))
        window.dispatchEvent(createKeyboardEvent('h'))
      })

      expect(handler).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('edge cases', () => {
    it('should handle rapid key presses', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ escape: handler }))

      act(() => {
        for (let i = 0; i < 5; i++) {
          window.dispatchEvent(createKeyboardEvent('Escape'))
        }
      })

      expect(handler).toHaveBeenCalledTimes(5)
    })

    it('should normalize special keys', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ space: handler }))

      act(() => {
        window.dispatchEvent(createKeyboardEvent(' '))
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should be case insensitive for shortcut keys', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'mod+K': handler }))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('k', { metaKey: true }))
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})

describe('useKeyboardShortcut', () => {
  beforeEach(() => {
    mockPlatform('MacIntel')
  })

  it('should work with single shortcut', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboardShortcut('mod+k', handler))

    act(() => {
      window.dispatchEvent(createKeyboardEvent('k', { metaKey: true }))
    })

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should pass options correctly', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboardShortcut('mod+k', handler, { enabled: false }))

    act(() => {
      window.dispatchEvent(createKeyboardEvent('k', { metaKey: true }))
    })

    expect(handler).not.toHaveBeenCalled()
  })
})
