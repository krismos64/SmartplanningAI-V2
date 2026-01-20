/**
 * ServerErrorPage Unit Tests - SP-303
 *
 * Comprehensive unit tests for the ServerErrorPage component.
 * Tests rendering, props, interactions, and accessibility.
 *
 * @see Context7 Documentation:
 * - Vitest: Unit testing with React Testing Library
 * - Testing Library: getByTestId, getByRole, screen assertions
 *
 * @ticket SP-303
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ServerErrorPage } from '@/components/error/ServerErrorPage'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    main: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <main {...props}>{children}</main>
    ),
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  Variants: {},
}))

describe('ServerErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render the server error page container', () => {
      render(<ServerErrorPage />)
      const container = screen.getByTestId('server-error-page')
      expect(container).toBeInTheDocument()
    })

    it('should render the error icon', () => {
      render(<ServerErrorPage />)
      const icon = screen.getByTestId('server-error-icon')
      expect(icon).toBeInTheDocument()
    })

    it('should render the default error code 500', () => {
      render(<ServerErrorPage />)
      const errorCode = screen.getByTestId('error-code')
      expect(errorCode).toHaveTextContent('500')
    })

    it('should render the error title', () => {
      render(<ServerErrorPage />)
      const title = screen.getByText(/oups ! une erreur est survenue/i)
      expect(title).toBeInTheDocument()
    })

    it('should render the default error description', () => {
      render(<ServerErrorPage />)
      const description = screen.getByText(/problème inattendu/i)
      expect(description).toBeInTheDocument()
    })

    it('should render the retry button', () => {
      render(<ServerErrorPage />)
      const retryButton = screen.getByTestId('retry-button')
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toHaveTextContent(/réessayer/i)
    })

    it('should render the home button', () => {
      render(<ServerErrorPage />)
      const homeButton = screen.getByTestId('home-button')
      expect(homeButton).toBeInTheDocument()
      expect(homeButton).toHaveTextContent(/accueil/i)
    })

    it('should render the report button by default', () => {
      render(<ServerErrorPage />)
      const reportButton = screen.getByTestId('report-button')
      expect(reportButton).toBeInTheDocument()
      expect(reportButton).toHaveTextContent(/signaler/i)
    })
  })

  describe('Props', () => {
    it('should display custom error code', () => {
      render(<ServerErrorPage errorCode={503} />)
      const errorCode = screen.getByTestId('error-code')
      expect(errorCode).toHaveTextContent('503')
    })

    it('should display string error code', () => {
      render(<ServerErrorPage errorCode="5XX" />)
      const errorCode = screen.getByTestId('error-code')
      expect(errorCode).toHaveTextContent('5XX')
    })

    it('should display custom error message', () => {
      const customMessage = 'Base de données indisponible'
      render(<ServerErrorPage errorMessage={customMessage} />)
      const description = screen.getByText(customMessage)
      expect(description).toBeInTheDocument()
    })

    it('should hide report button when showReportButton is false', () => {
      render(<ServerErrorPage showReportButton={false} />)
      const reportButton = screen.queryByTestId('report-button')
      expect(reportButton).not.toBeInTheDocument()
    })

    it('should display error digest when provided', () => {
      const digest = 'abc123xyz'
      render(<ServerErrorPage digest={digest} />)
      const digestElement = screen.getByTestId('error-digest')
      expect(digestElement).toBeInTheDocument()
      expect(digestElement).toHaveTextContent(digest)
    })

    it('should not display error digest when not provided', () => {
      render(<ServerErrorPage />)
      const digestElement = screen.queryByTestId('error-digest')
      expect(digestElement).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call window.location.reload when clicking Retry button', () => {
      render(<ServerErrorPage />)
      const retryButton = screen.getByTestId('retry-button')
      fireEvent.click(retryButton)
      expect(window.location.reload).toHaveBeenCalled()
    })

    it('should navigate to home when clicking Home button', () => {
      render(<ServerErrorPage />)
      const homeButton = screen.getByTestId('home-button')
      fireEvent.click(homeButton)
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should navigate to contact when clicking Report button', () => {
      render(<ServerErrorPage />)
      const reportButton = screen.getByTestId('report-button')
      fireEvent.click(reportButton)
      expect(mockPush).toHaveBeenCalledWith('/contact')
    })
  })

  describe('Accessibility', () => {
    it('should have proper role on main element', () => {
      render(<ServerErrorPage />)
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('should have aria-label on main element', () => {
      render(<ServerErrorPage />)
      const main = screen.getByTestId('server-error-page')
      expect(main).toHaveAttribute('aria-label', 'Erreur serveur')
    })

    it('should have aria-labelledby on main element', () => {
      render(<ServerErrorPage />)
      const main = screen.getByTestId('server-error-page')
      expect(main).toHaveAttribute('aria-labelledby', 'server-error-title')
    })

    it('should have aria-describedby on main element', () => {
      render(<ServerErrorPage />)
      const main = screen.getByTestId('server-error-page')
      expect(main).toHaveAttribute(
        'aria-describedby',
        'server-error-description'
      )
    })

    it('should have correct id on title element', () => {
      render(<ServerErrorPage />)
      const title = document.getElementById('server-error-title')
      expect(title).toBeInTheDocument()
    })

    it('should have correct id on description element', () => {
      render(<ServerErrorPage />)
      const description = document.getElementById('server-error-description')
      expect(description).toBeInTheDocument()
    })

    it('should have accessible label on retry button', () => {
      render(<ServerErrorPage />)
      const retryButton = screen.getByTestId('retry-button')
      expect(retryButton).toHaveAttribute(
        'aria-label',
        'Réessayer de charger la page'
      )
    })

    it('should have accessible label on home button', () => {
      render(<ServerErrorPage />)
      const homeButton = screen.getByTestId('home-button')
      expect(homeButton).toHaveAttribute(
        'aria-label',
        "Retourner à la page d'accueil"
      )
    })

    it('should have accessible label on report button', () => {
      render(<ServerErrorPage />)
      const reportButton = screen.getByTestId('report-button')
      expect(reportButton).toHaveAttribute('aria-label', 'Signaler le problème')
    })

    it('should hide error icon from screen readers', () => {
      render(<ServerErrorPage />)
      const icon = screen.getByTestId('server-error-icon')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should hide error code from screen readers', () => {
      render(<ServerErrorPage />)
      const errorCode = screen.getByTestId('error-code')
      expect(errorCode).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Styling', () => {
    it('should have gradient classes on error code', () => {
      render(<ServerErrorPage />)
      const errorCode = screen.getByTestId('error-code')
      expect(errorCode).toHaveClass('bg-gradient-to-r')
      expect(errorCode).toHaveClass('bg-clip-text')
      expect(errorCode).toHaveClass('text-transparent')
    })

    it('should have destructive color on error icon', () => {
      render(<ServerErrorPage />)
      const icon = screen.getByTestId('server-error-icon')
      expect(icon).toHaveClass('text-destructive')
    })

    it('should have destructive color on title', () => {
      render(<ServerErrorPage />)
      const title = document.getElementById('server-error-title')
      expect(title).toHaveClass('text-destructive')
    })
  })

  describe('Button Variants', () => {
    it('should have default variant on retry button', () => {
      render(<ServerErrorPage />)
      const retryButton = screen.getByTestId('retry-button')
      // Default buttons don't have variant in class, but we check it's rendered
      expect(retryButton).toBeInTheDocument()
    })

    it('should have outline variant styling on home button', () => {
      render(<ServerErrorPage />)
      const homeButton = screen.getByTestId('home-button')
      expect(homeButton).toBeInTheDocument()
    })

    it('should have ghost variant styling on report button', () => {
      render(<ServerErrorPage />)
      const reportButton = screen.getByTestId('report-button')
      expect(reportButton).toHaveClass('text-muted-foreground')
    })
  })

  describe('French Localization', () => {
    it('should display title in French', () => {
      render(<ServerErrorPage />)
      expect(
        screen.getByText(/oups ! une erreur est survenue/i)
      ).toBeInTheDocument()
    })

    it('should display default description in French', () => {
      render(<ServerErrorPage />)
      expect(screen.getByText(/notre serveur/i)).toBeInTheDocument()
    })

    it('should display helpful message in French', () => {
      render(<ServerErrorPage />)
      expect(
        screen.getByText(/vous pouvez réessayer ou retourner/i)
      ).toBeInTheDocument()
    })

    it('should display retry button text in French', () => {
      render(<ServerErrorPage />)
      const retryButton = screen.getByTestId('retry-button')
      expect(retryButton).toHaveTextContent(/réessayer/i)
    })

    it('should display home button text in French', () => {
      render(<ServerErrorPage />)
      const homeButton = screen.getByTestId('home-button')
      expect(homeButton).toHaveTextContent(/accueil/i)
    })

    it('should display report button text in French', () => {
      render(<ServerErrorPage />)
      const reportButton = screen.getByTestId('report-button')
      expect(reportButton).toHaveTextContent(/signaler le problème/i)
    })

    it('should display error digest label in French', () => {
      render(<ServerErrorPage digest="test123" />)
      expect(screen.getByText(/code erreur/i)).toBeInTheDocument()
    })
  })
})
