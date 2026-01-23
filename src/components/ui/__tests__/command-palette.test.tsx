/**
 * Tests unitaires - CommandPalette Component
 *
 * @see SP-264 - Dashboard Layout V2: Command Palette
 */

/* eslint-disable react/display-name */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock next-themes
const mockSetTheme = vi.fn()
let mockTheme = 'light'
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: mockTheme,
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
import { CommandPalette } from '../command-palette'

describe('CommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTheme = 'light'
  })

  describe('rendering', () => {
    it('should not render when closed', () => {
      render(
        <CommandPalette
          open={false}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText(/rechercher/i)
      ).not.toBeInTheDocument()
    })

    it('should render when open', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument()
    })

    it('should render search input', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      const input = screen.getByPlaceholderText(/rechercher/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render navigation group', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should render theme group', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      expect(screen.getByText('Thème')).toBeInTheDocument()
      expect(screen.getByText('Mode clair')).toBeInTheDocument()
      expect(screen.getByText('Mode sombre')).toBeInTheDocument()
      expect(screen.getByText('Thème système')).toBeInTheDocument()
    })

    it('should render help group', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      // There are two "Aide" texts: the group heading and the help item
      expect(screen.getAllByText('Aide').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Raccourcis clavier')).toBeInTheDocument()
    })
  })

  describe('search functionality', () => {
    it('should filter items based on search query', async () => {
      const user = userEvent.setup()
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      const input = screen.getByPlaceholderText(/rechercher/i)
      await user.type(input, 'planning')

      // Planning should be visible
      expect(screen.getByText('Plannings')).toBeInTheDocument()
    })

    it('should show empty state when no results', async () => {
      const user = userEvent.setup()
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      const input = screen.getByPlaceholderText(/rechercher/i)
      await user.type(input, 'xyznonexistent123456')

      await waitFor(() => {
        expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
      })
    })

    it('should be case insensitive', async () => {
      const user = userEvent.setup()
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      const input = screen.getByPlaceholderText(/rechercher/i)
      await user.type(input, 'DASHBOARD')

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should close on Escape key', () => {
      const onOpenChange = vi.fn()
      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          userRole="DIRECTOR"
        />
      )

      // Fire on the cmdk root element
      const cmdkRoot = document.querySelector('[cmdk-root]')
      if (cmdkRoot) {
        fireEvent.keyDown(cmdkRoot, { key: 'Escape' })
      }

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should close on backdrop click', () => {
      const onOpenChange = vi.fn()
      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          userRole="DIRECTOR"
        />
      )

      // Click on backdrop (first div with onClick)
      const backdrop = document.querySelector('[aria-hidden="true"]')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should navigate to correct route on item select', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          userRole="DIRECTOR"
        />
      )

      // Click on Dashboard
      await user.click(screen.getByText('Dashboard'))

      expect(mockPush).toHaveBeenCalledWith('/app/dashboard')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('actions', () => {
    it('should change theme to light', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      mockTheme = 'dark'

      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          userRole="DIRECTOR"
        />
      )

      await user.click(screen.getByText('Mode clair'))

      expect(mockSetTheme).toHaveBeenCalledWith('light')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should change theme to dark', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          userRole="DIRECTOR"
        />
      )

      await user.click(screen.getByText('Mode sombre'))

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should change theme to system', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      render(
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          userRole="DIRECTOR"
        />
      )

      await user.click(screen.getByText('Thème système'))

      expect(mockSetTheme).toHaveBeenCalledWith('system')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('RBAC filtering', () => {
    it('should show admin items for SYSTEM_ADMIN role', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="SYSTEM_ADMIN"
        />
      )

      expect(screen.getByText('Dashboard SaaS')).toBeInTheDocument()
      expect(screen.getByText('Entreprises')).toBeInTheDocument()
      expect(screen.getByText('Monitoring')).toBeInTheDocument()
    })

    it('should hide admin items for EMPLOYEE role', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="EMPLOYEE"
        />
      )

      expect(screen.queryByText('Dashboard SaaS')).not.toBeInTheDocument()
      expect(screen.queryByText('Entreprises')).not.toBeInTheDocument()
      expect(screen.queryByText('Monitoring')).not.toBeInTheDocument()
    })

    it('should show common items for EMPLOYEE role', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="EMPLOYEE"
        />
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Plannings')).toBeInTheDocument()
      expect(screen.getByText('Congés')).toBeInTheDocument()
    })

    it('should show director items for DIRECTOR role', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      expect(screen.getByText('Équipes')).toBeInTheDocument()
      expect(screen.getByText('Statistiques')).toBeInTheDocument()
      expect(screen.getByText('Paramètres')).toBeInTheDocument()
    })

    it('should hide director-only items for MANAGER role', () => {
      render(
        <CommandPalette open={true} onOpenChange={vi.fn()} userRole="MANAGER" />
      )

      expect(screen.queryByText('Équipes')).not.toBeInTheDocument()
      expect(screen.queryByText('Paramètres')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have correct aria attributes', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      // Check for aria-hidden on backdrop
      const backdrop = document.querySelector('[aria-hidden="true"]')
      expect(backdrop).toBeInTheDocument()
    })

    it('should have keyboard instructions in footer', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      expect(screen.getByText('naviguer')).toBeInTheDocument()
      expect(screen.getByText('sélectionner')).toBeInTheDocument()
    })
  })

  describe('shortcuts display', () => {
    it('should show keyboard shortcuts for navigation items', () => {
      render(
        <CommandPalette
          open={true}
          onOpenChange={vi.fn()}
          userRole="DIRECTOR"
        />
      )

      // Dashboard should have G H shortcut (multiple G keys exist for different shortcuts)
      expect(screen.getAllByText('G').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('H').length).toBeGreaterThanOrEqual(1)
    })
  })
})
