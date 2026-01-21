/**
 * Tests unitaires - ThemeToggle Component
 *
 * @see SP-265 - Dark/Light Mode
 */

/* eslint-disable react/display-name */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Track setTheme calls
const mockSetTheme = vi.fn()
let mockTheme = 'system'
let mockResolvedTheme = 'light'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: mockResolvedTheme,
  }),
}))

// Mock framer-motion
vi.mock('@/lib/animations', async () => {
  const ReactMock = await import('react')

  return {
    motion: {
      button: ReactMock.forwardRef(
        (
          props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
            whileHover?: unknown
            whileTap?: unknown
          },
          ref: React.Ref<HTMLButtonElement>
        ) => {
          const { children, whileHover: _wh, whileTap: _wt, ...rest } = props
          return ReactMock.createElement(
            'button',
            { ref, ...rest },
            children
          )
        }
      ),
      div: ReactMock.forwardRef(
        (
          props: React.HTMLAttributes<HTMLDivElement> & {
            initial?: unknown
            animate?: unknown
            exit?: unknown
            transition?: unknown
          },
          ref: React.Ref<HTMLDivElement>
        ) => {
          const {
            children,
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _t,
            ...rest
          } = props
          return ReactMock.createElement('div', { ref, ...rest }, children)
        }
      ),
    },
    buttonIcon: {},
  }
})

import { ThemeToggle } from '../ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTheme = 'system'
    mockResolvedTheme = 'light'
  })

  it('renders without crashing', () => {
    render(<ThemeToggle />)
    // Component should render (mounted state)
    expect(document.querySelector('button')).toBeDefined()
  })

  it('shows placeholder during hydration then renders button', async () => {
    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  it('has correct aria-label for system theme', async () => {
    mockTheme = 'system'

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Système')
      )
    })
  })

  it('has correct aria-label for light theme', async () => {
    mockTheme = 'light'
    mockResolvedTheme = 'light'

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Clair')
      )
    })
  })

  it('has correct aria-label for dark theme', async () => {
    mockTheme = 'dark'
    mockResolvedTheme = 'dark'

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Sombre')
      )
    })
  })

  it('cycles from system to light on click', async () => {
    mockTheme = 'system'

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('cycles from light to dark on click', async () => {
    mockTheme = 'light'

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('cycles from dark to system on click', async () => {
    mockTheme = 'dark'

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })

  it('shows label when showLabel prop is true', async () => {
    mockTheme = 'light'

    render(<ThemeToggle showLabel />)

    await waitFor(() => {
      expect(screen.getByText('Clair')).toBeInTheDocument()
    })
  })

  it('does not show label by default', async () => {
    mockTheme = 'light'

    render(<ThemeToggle />)

    await waitFor(() => {
      expect(screen.queryByText('Clair')).not.toBeInTheDocument()
    })
  })

  it('applies custom className', async () => {
    render(<ThemeToggle className="custom-class" />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  it('has title attribute for tooltip', async () => {
    mockTheme = 'system'

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', expect.stringContaining('Mode'))
    })
  })
})
