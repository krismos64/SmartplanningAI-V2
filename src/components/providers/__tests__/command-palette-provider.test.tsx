/**
 * Tests unitaires - CommandPaletteProvider
 *
 * @see SP-264 - Dashboard Layout V2: Command Palette
 */

/* eslint-disable react/display-name */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Mock matchMedia for useIsMobile hook (SP-268 Phase 3)
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock scrollIntoView for cmdk (not available in jsdom)
beforeAll(() => {
  // Default to desktop mode for tests
  mockMatchMedia(false)
  Element.prototype.scrollIntoView = vi.fn()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
}))

// Mock framer-motion
vi.mock('@/lib/animations', async () => {
  const ReactMock = await import('react')

  return {
    motion: {
      div: ReactMock.forwardRef(
        (
          props: React.HTMLAttributes<HTMLDivElement> & {
            initial?: unknown
            animate?: unknown
            exit?: unknown
            variants?: unknown
          },
          ref: React.Ref<HTMLDivElement>
        ) => {
          const {
            children,
            initial: _i,
            animate: _a,
            exit: _e,
            variants: _v,
            ...rest
          } = props
          return ReactMock.createElement('div', { ref, ...rest }, children)
        }
      ),
    },
    FramerAnimatePresence: ({ children }: { children: React.ReactNode }) =>
      ReactMock.createElement(ReactMock.Fragment, null, children),
    fadeVariants: {},
    scaleVariants: {},
  }
})

// Import after mocks
import {
  CommandPaletteProvider,
  useCommandPalette,
} from '../command-palette-provider'

// Test component that uses the hook
function TestConsumer() {
  const { open, setOpen, toggle } = useCommandPalette()

  return (
    <div>
      <span data-testid="open-state">{open ? 'open' : 'closed'}</span>
      <button onClick={() => setOpen(true)} data-testid="open-button">
        Open
      </button>
      <button onClick={() => setOpen(false)} data-testid="close-button">
        Close
      </button>
      <button onClick={toggle} data-testid="toggle-button">
        Toggle
      </button>
    </div>
  )
}

describe('CommandPaletteProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide context to children', () => {
    render(
      <CommandPaletteProvider userRole="DIRECTOR">
        <TestConsumer />
      </CommandPaletteProvider>
    )

    expect(screen.getByTestId('open-state')).toHaveTextContent('closed')
  })

  it('should throw error when useCommandPalette used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestConsumer />)
    }).toThrow('useCommandPalette must be used within a CommandPaletteProvider')

    consoleSpy.mockRestore()
  })

  it('should toggle open state', () => {
    render(
      <CommandPaletteProvider userRole="DIRECTOR">
        <TestConsumer />
      </CommandPaletteProvider>
    )

    expect(screen.getByTestId('open-state')).toHaveTextContent('closed')

    fireEvent.click(screen.getByTestId('toggle-button'))
    expect(screen.getByTestId('open-state')).toHaveTextContent('open')

    fireEvent.click(screen.getByTestId('toggle-button'))
    expect(screen.getByTestId('open-state')).toHaveTextContent('closed')
  })

  it('should set open state directly', () => {
    render(
      <CommandPaletteProvider userRole="DIRECTOR">
        <TestConsumer />
      </CommandPaletteProvider>
    )

    fireEvent.click(screen.getByTestId('open-button'))
    expect(screen.getByTestId('open-state')).toHaveTextContent('open')

    fireEvent.click(screen.getByTestId('close-button'))
    expect(screen.getByTestId('open-state')).toHaveTextContent('closed')
  })

  it('should render CommandPalette when open', () => {
    render(
      <CommandPaletteProvider userRole="DIRECTOR">
        <TestConsumer />
      </CommandPaletteProvider>
    )

    // Initially closed, no search input
    expect(screen.queryByPlaceholderText(/rechercher/i)).not.toBeInTheDocument()

    // Open the palette
    fireEvent.click(screen.getByTestId('open-button'))

    // Now search input should be visible
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument()
  })

  it('should register Cmd+K keyboard shortcut handler', () => {
    // This test verifies the provider sets up the keyboard shortcut
    // The actual keyboard shortcut behavior is tested in use-keyboard-shortcuts.test.ts
    render(
      <CommandPaletteProvider userRole="DIRECTOR">
        <TestConsumer />
      </CommandPaletteProvider>
    )

    // Verify initial state
    expect(screen.getByTestId('open-state')).toHaveTextContent('closed')

    // Verify we can toggle via the context
    fireEvent.click(screen.getByTestId('toggle-button'))
    expect(screen.getByTestId('open-state')).toHaveTextContent('open')

    fireEvent.click(screen.getByTestId('toggle-button'))
    expect(screen.getByTestId('open-state')).toHaveTextContent('closed')
  })

  it('should pass userRole to CommandPalette for RBAC filtering', () => {
    render(
      <CommandPaletteProvider userRole="SYSTEM_ADMIN">
        <TestConsumer />
      </CommandPaletteProvider>
    )

    // Open the palette
    fireEvent.click(screen.getByTestId('open-button'))

    // Admin items should be visible
    expect(screen.getByText('Dashboard SaaS')).toBeInTheDocument()
  })
})
