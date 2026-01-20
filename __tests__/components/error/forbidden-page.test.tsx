/**
 * ForbiddenPage Unit Tests - SP-305
 *
 * Comprehensive unit tests for the ForbiddenPage component.
 * Tests rendering, props, interactions, and accessibility.
 *
 * @see Context7 Documentation:
 * - Vitest: Unit testing with React Testing Library
 * - Testing Library: getByTestId, getByRole, screen assertions
 *
 * @ticket SP-305
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ForbiddenPage } from '@/components/error/ForbiddenPage'

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

describe('ForbiddenPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the forbidden page container', () => {
      render(<ForbiddenPage />)
      const container = screen.getByTestId('forbidden-page')
      expect(container).toBeInTheDocument()
    })

    it('should render the shield icon', () => {
      render(<ForbiddenPage />)
      const icon = screen.getByTestId('forbidden-icon')
      expect(icon).toBeInTheDocument()
    })

    it('should render the error code 403', () => {
      render(<ForbiddenPage />)
      const errorCode = screen.getByTestId('error-code')
      expect(errorCode).toHaveTextContent('403')
    })

    it('should render the error title', () => {
      render(<ForbiddenPage />)
      const title = screen.getByText(/accès non autorisé/i)
      expect(title).toBeInTheDocument()
    })

    it('should render the default error description', () => {
      render(<ForbiddenPage />)
      const description = screen.getByText(/permissions nécessaires/i)
      expect(description).toBeInTheDocument()
    })

    it('should render the dashboard button', () => {
      render(<ForbiddenPage />)
      const dashboardButton = screen.getByTestId('dashboard-button')
      expect(dashboardButton).toBeInTheDocument()
      expect(dashboardButton).toHaveTextContent(/dashboard/i)
    })

    it('should render the home button', () => {
      render(<ForbiddenPage />)
      const homeButton = screen.getByTestId('home-button')
      expect(homeButton).toBeInTheDocument()
      expect(homeButton).toHaveTextContent(/accueil/i)
    })

    it('should render the contact admin button by default', () => {
      render(<ForbiddenPage />)
      const contactButton = screen.getByTestId('contact-admin-button')
      expect(contactButton).toBeInTheDocument()
      expect(contactButton).toHaveTextContent(/contacter l'administrateur/i)
    })

    it('should render helpful message', () => {
      render(<ForbiddenPage />)
      const message = screen.getByText(/tableau de bord ou à l'accueil/i)
      expect(message).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should display custom reason when provided', () => {
      const customReason = 'Vous devez être manager pour voir cette page'
      render(<ForbiddenPage reason={customReason} />)
      const description = screen.getByText(customReason)
      expect(description).toBeInTheDocument()
    })

    it('should display required role when provided', () => {
      render(<ForbiddenPage requiredRole="MANAGER" />)
      const description = screen.getByText(/nécessite le rôle "MANAGER"/i)
      expect(description).toBeInTheDocument()
    })

    it('should display current role when provided', () => {
      render(<ForbiddenPage currentRole="EMPLOYEE" />)
      const roleInfo = screen.getByTestId('role-info')
      expect(roleInfo).toHaveTextContent(/EMPLOYEE/i)
    })

    it('should display both roles when both are provided', () => {
      render(<ForbiddenPage requiredRole="DIRECTOR" currentRole="MANAGER" />)
      const description = screen.getByText(
        /nécessite le rôle "DIRECTOR".*rôle actuel est "MANAGER"/i
      )
      expect(description).toBeInTheDocument()
    })

    it('should display role info box when requiredRole is provided', () => {
      render(<ForbiddenPage requiredRole="ADMIN" />)
      const roleInfo = screen.getByTestId('role-info')
      expect(roleInfo).toBeInTheDocument()
      expect(roleInfo).toHaveTextContent(/Rôle requis.*ADMIN/i)
    })

    it('should display role info box when currentRole is provided', () => {
      render(<ForbiddenPage currentRole="EMPLOYEE" />)
      const roleInfo = screen.getByTestId('role-info')
      expect(roleInfo).toBeInTheDocument()
      expect(roleInfo).toHaveTextContent(/Votre rôle.*EMPLOYEE/i)
    })

    it('should not display role info when custom reason is provided', () => {
      render(
        <ForbiddenPage
          reason="Custom reason"
          requiredRole="ADMIN"
          currentRole="USER"
        />
      )
      const roleInfo = screen.queryByTestId('role-info')
      expect(roleInfo).not.toBeInTheDocument()
    })

    it('should hide contact admin button when showContactAdmin is false', () => {
      render(<ForbiddenPage showContactAdmin={false} />)
      const contactButton = screen.queryByTestId('contact-admin-button')
      expect(contactButton).not.toBeInTheDocument()
    })

    it('should show contact admin button by default', () => {
      render(<ForbiddenPage />)
      const contactButton = screen.getByTestId('contact-admin-button')
      expect(contactButton).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should navigate to dashboard when clicking Dashboard button', () => {
      render(<ForbiddenPage />)
      const dashboardButton = screen.getByTestId('dashboard-button')
      fireEvent.click(dashboardButton)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should navigate to home when clicking Home button', () => {
      render(<ForbiddenPage />)
      const homeButton = screen.getByTestId('home-button')
      fireEvent.click(homeButton)
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should navigate to contact when clicking Contact admin button', () => {
      render(<ForbiddenPage />)
      const contactButton = screen.getByTestId('contact-admin-button')
      fireEvent.click(contactButton)
      expect(mockPush).toHaveBeenCalledWith('/contact')
    })
  })

  describe('Accessibility', () => {
    it('should have proper role on main element', () => {
      render(<ForbiddenPage />)
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('should have aria-label on main element', () => {
      render(<ForbiddenPage />)
      const main = screen.getByTestId('forbidden-page')
      expect(main).toHaveAttribute('aria-label', 'Accès refusé')
    })

    it('should have aria-labelledby on main element', () => {
      render(<ForbiddenPage />)
      const main = screen.getByTestId('forbidden-page')
      expect(main).toHaveAttribute('aria-labelledby', 'forbidden-title')
    })

    it('should have aria-describedby on main element', () => {
      render(<ForbiddenPage />)
      const main = screen.getByTestId('forbidden-page')
      expect(main).toHaveAttribute('aria-describedby', 'forbidden-description')
    })

    it('should have correct id on title element', () => {
      render(<ForbiddenPage />)
      const title = document.getElementById('forbidden-title')
      expect(title).toBeInTheDocument()
    })

    it('should have correct id on description element', () => {
      render(<ForbiddenPage />)
      const description = document.getElementById('forbidden-description')
      expect(description).toBeInTheDocument()
    })

    it('should have accessible label on dashboard button', () => {
      render(<ForbiddenPage />)
      const dashboardButton = screen.getByTestId('dashboard-button')
      expect(dashboardButton).toHaveAttribute(
        'aria-label',
        'Retourner au tableau de bord'
      )
    })

    it('should have accessible label on home button', () => {
      render(<ForbiddenPage />)
      const homeButton = screen.getByTestId('home-button')
      expect(homeButton).toHaveAttribute(
        'aria-label',
        "Retourner à la page d'accueil"
      )
    })

    it('should have accessible label on contact admin button', () => {
      render(<ForbiddenPage />)
      const contactButton = screen.getByTestId('contact-admin-button')
      expect(contactButton).toHaveAttribute(
        'aria-label',
        "Contacter l'administrateur"
      )
    })

    it('should hide shield icon from screen readers', () => {
      render(<ForbiddenPage />)
      const icon = screen.getByTestId('forbidden-icon')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should hide error code from screen readers', () => {
      render(<ForbiddenPage />)
      const errorCode = screen.getByTestId('error-code')
      expect(errorCode).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Styling', () => {
    it('should have gradient classes on error code', () => {
      render(<ForbiddenPage />)
      const errorCode = screen.getByTestId('error-code')
      expect(errorCode).toHaveClass('bg-gradient-to-r')
      expect(errorCode).toHaveClass('bg-clip-text')
      expect(errorCode).toHaveClass('text-transparent')
    })

    it('should have orange color on error icon', () => {
      render(<ForbiddenPage />)
      const icon = screen.getByTestId('forbidden-icon')
      expect(icon).toHaveClass('text-orange-500')
    })

    it('should have orange styling on dashboard button', () => {
      render(<ForbiddenPage />)
      const dashboardButton = screen.getByTestId('dashboard-button')
      expect(dashboardButton).toHaveClass('bg-orange-500')
    })
  })

  describe('French Localization', () => {
    it('should display title in French', () => {
      render(<ForbiddenPage />)
      expect(screen.getByText(/accès non autorisé/i)).toBeInTheDocument()
    })

    it('should display default description in French', () => {
      render(<ForbiddenPage />)
      expect(screen.getByText(/permissions nécessaires/i)).toBeInTheDocument()
    })

    it('should display helpful message in French', () => {
      render(<ForbiddenPage />)
      expect(
        screen.getByText(/retourner à votre tableau de bord/i)
      ).toBeInTheDocument()
    })

    it('should display dashboard button text in French', () => {
      render(<ForbiddenPage />)
      const dashboardButton = screen.getByTestId('dashboard-button')
      expect(dashboardButton).toHaveTextContent(/dashboard/i)
    })

    it('should display home button text in French', () => {
      render(<ForbiddenPage />)
      const homeButton = screen.getByTestId('home-button')
      expect(homeButton).toHaveTextContent(/accueil/i)
    })

    it('should display contact admin button text in French', () => {
      render(<ForbiddenPage />)
      const contactButton = screen.getByTestId('contact-admin-button')
      expect(contactButton).toHaveTextContent(/contacter l'administrateur/i)
    })

    it('should display role labels in French', () => {
      render(<ForbiddenPage requiredRole="ADMIN" currentRole="USER" />)
      const roleInfo = screen.getByTestId('role-info')
      expect(roleInfo).toHaveTextContent(/rôle requis/i)
      expect(roleInfo).toHaveTextContent(/votre rôle/i)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string reason', () => {
      render(<ForbiddenPage reason="" />)
      // Empty reason should show default message
      expect(screen.getByText(/permissions nécessaires/i)).toBeInTheDocument()
    })

    it('should handle very long reason text', () => {
      const longReason = 'A'.repeat(500)
      render(<ForbiddenPage reason={longReason} />)
      expect(screen.getByText(longReason)).toBeInTheDocument()
    })

    it('should handle special characters in role names', () => {
      render(
        <ForbiddenPage requiredRole="SUPER_ADMIN" currentRole="BASIC-USER" />
      )
      const roleInfo = screen.getByTestId('role-info')
      expect(roleInfo).toHaveTextContent(/SUPER_ADMIN/)
      expect(roleInfo).toHaveTextContent(/BASIC-USER/)
    })

    it('should render correctly with all props', () => {
      render(
        <ForbiddenPage
          reason="Custom reason"
          requiredRole="ADMIN"
          currentRole="USER"
          showContactAdmin={true}
        />
      )
      expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
      expect(screen.getByText('Custom reason')).toBeInTheDocument()
    })

    it('should render correctly with no props', () => {
      render(<ForbiddenPage />)
      expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
      expect(screen.getByTestId('error-code')).toHaveTextContent('403')
    })
  })
})
