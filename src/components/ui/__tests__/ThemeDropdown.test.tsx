/**
 * Tests unitaires - ThemeDropdown Component
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

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}))

// Mock framer-motion
vi.mock('@/lib/animations', async () => {
  const ReactMock = await import('react')

  const AnimatePresenceComponent = ({
    children,
  }: {
    children: React.ReactNode
  }) => children

  return {
    motion: {
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
    AnimatePresence: AnimatePresenceComponent,
    FramerAnimatePresence: AnimatePresenceComponent,
  }
})

import { ThemeDropdown } from '../ThemeDropdown'

describe('ThemeDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTheme = 'system'
  })

  it('renders without crashing', () => {
    render(<ThemeDropdown />)
    expect(document.querySelector('button')).toBeDefined()
  })

  it('shows trigger button after mount', async () => {
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button', { expanded: false })
      expect(button).toBeInTheDocument()
    })
  })

  it('has correct aria-expanded attribute', async () => {
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('opens dropdown on click', async () => {
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })
  })

  it('shows all three theme options when open', async () => {
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(screen.getByText('Clair')).toBeInTheDocument()
      expect(screen.getByText('Sombre')).toBeInTheDocument()
      expect(screen.getByText('Système')).toBeInTheDocument()
    })
  })

  it('shows descriptions for each option', async () => {
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(screen.getByText('Thème clair')).toBeInTheDocument()
      expect(screen.getByText('Thème sombre')).toBeInTheDocument()
      expect(
        screen.getByText('Suit les préférences système')
      ).toBeInTheDocument()
    })
  })

  it('calls setTheme with "light" when light option is clicked', async () => {
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      const lightOption = screen.getByText('Clair')
      fireEvent.click(lightOption.closest('button')!)
    })

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('calls setTheme with "dark" when dark option is clicked', async () => {
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      const darkOption = screen.getByText('Sombre')
      fireEvent.click(darkOption.closest('button')!)
    })

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme with "system" when system option is clicked', async () => {
    mockTheme = 'light'
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      const systemOption = screen.getByText('Système')
      fireEvent.click(systemOption.closest('button')!)
    })

    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })

  it('closes dropdown after selecting an option', async () => {
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      const lightOption = screen.getByText('Clair')
      fireEvent.click(lightOption.closest('button')!)
    })

    await waitFor(() => {
      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('marks current theme as selected', async () => {
    mockTheme = 'dark'
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      const darkOption = screen.getByText('Sombre').closest('button')
      expect(darkOption).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('applies custom className', async () => {
    render(<ThemeDropdown className="custom-class" />)

    await waitFor(() => {
      const container = document.querySelector('[data-theme-dropdown]')
      expect(container).toHaveClass('custom-class')
    })
  })

  it('aligns dropdown to the right by default', async () => {
    render(<ThemeDropdown />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      const dropdown = screen.getByRole('listbox')
      expect(dropdown).toHaveClass('right-0')
    })
  })

  it('aligns dropdown to the left when align="left"', async () => {
    render(<ThemeDropdown align="left" />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    await waitFor(() => {
      const dropdown = screen.getByRole('listbox')
      expect(dropdown).toHaveClass('left-0')
    })
  })
})
