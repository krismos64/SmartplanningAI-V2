/**
 * Tests unitaires - ThemeProvider Component
 *
 * @see SP-265 - Dark/Light Mode
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({
    children,
    attribute,
    defaultTheme,
    enableSystem,
    disableTransitionOnChange,
  }: {
    children: React.ReactNode
    attribute?: string
    defaultTheme?: string
    enableSystem?: boolean
    disableTransitionOnChange?: boolean
  }) => (
    <div
      data-testid="next-themes-provider"
      data-attribute={attribute}
      data-default-theme={defaultTheme}
      data-enable-system={enableSystem?.toString()}
      data-disable-transition={disableTransitionOnChange?.toString()}
    >
      {children}
    </div>
  ),
}))

import { ThemeProvider } from '../ThemeProvider'

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Child content</div>
      </ThemeProvider>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('passes correct default props to NextThemesProvider', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    )

    const provider = screen.getByTestId('next-themes-provider')

    expect(provider).toHaveAttribute('data-attribute', 'class')
    expect(provider).toHaveAttribute('data-default-theme', 'dark')
    expect(provider).toHaveAttribute('data-enable-system', 'true')
    expect(provider).toHaveAttribute('data-disable-transition', 'false')
  })

  it('allows overriding default props', () => {
    render(
      <ThemeProvider defaultTheme="dark" enableSystem={false}>
        <div>Content</div>
      </ThemeProvider>
    )

    const provider = screen.getByTestId('next-themes-provider')

    expect(provider).toHaveAttribute('data-default-theme', 'dark')
    expect(provider).toHaveAttribute('data-enable-system', 'false')
  })

  it('renders multiple children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
      </ThemeProvider>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })
})
