/**
 * Tests unitaires - DynamicBreadcrumbs Component
 *
 * @ticket SP-264 - Dynamic Breadcrumbs
 *
 * 10 tests couvrant :
 * - Rendu des segments statiques
 * - Skeleton loading pour les IDs
 * - Résolution dynamique des noms
 * - Accessibilité (ARIA)
 * - Schema.org SEO
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Type pour le retour de useSWR dans les tests
interface MockSWRResponse<T> {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
  isValidating: boolean
  mutate: () => void
}

// Variable pour stocker la valeur de retour du mock
let mockSWRReturnValue: MockSWRResponse<string> = {
  data: undefined,
  error: undefined,
  isLoading: false,
  isValidating: false,
  mutate: () => {},
}

// Mock SWR
vi.mock('swr', () => ({
  default: () => mockSWRReturnValue,
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/app/dashboard/employees',
}))

import { DynamicBreadcrumbs } from '../dynamic-breadcrumbs'

describe('DynamicBreadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock value
    mockSWRReturnValue = {
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: () => {},
    }
  })

  // =========================================================================
  // RENDU DE BASE
  // =========================================================================

  describe('Basic Rendering', () => {
    it('should render home link', () => {
      render(<DynamicBreadcrumbs pathname="/app/dashboard/employees" />)

      expect(screen.getByRole('link', { name: /accueil/i })).toBeInTheDocument()
    })

    it('should render static segment labels', () => {
      render(<DynamicBreadcrumbs pathname="/app/dashboard/employees" />)

      expect(screen.getByText('Employés')).toBeInTheDocument()
    })

    it('should render multiple segments', () => {
      render(
        <DynamicBreadcrumbs pathname="/app/dashboard/super-admin/organizations" />
      )

      expect(screen.getByText('Administration')).toBeInTheDocument()
      expect(screen.getByText('Organisations')).toBeInTheDocument()
    })

    it('should not render when no segments after filtering', () => {
      const { container } = render(
        <DynamicBreadcrumbs pathname="/app/dashboard" />
      )

      // Should not render any breadcrumb nav
      expect(
        container.querySelector('[data-testid="dynamic-breadcrumbs"]')
      ).not.toBeInTheDocument()
    })

    it('should render separators between segments', () => {
      render(
        <DynamicBreadcrumbs pathname="/app/dashboard/employees/settings" />
      )

      // Check for chevron separators (lucide-react icons)
      const separators = screen.getAllByRole('presentation', { hidden: true })
      expect(separators.length).toBeGreaterThan(0)
    })
  })

  // =========================================================================
  // RÉSOLUTION DYNAMIQUE
  // =========================================================================

  describe('Dynamic Resolution', () => {
    it('should show skeleton while loading ID', () => {
      mockSWRReturnValue = {
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: () => {},
      }

      render(
        <DynamicBreadcrumbs pathname="/app/dashboard/employees/123e4567-e89b-12d3-a456-426614174000" />
      )

      expect(screen.getByTestId('breadcrumb-skeleton')).toBeInTheDocument()
    })

    it('should show resolved name when loaded', () => {
      mockSWRReturnValue = {
        data: 'Jean Dupont',
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: () => {},
      }

      render(
        <DynamicBreadcrumbs pathname="/app/dashboard/employees/123e4567-e89b-12d3-a456-426614174000" />
      )

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('should show truncated ID when resolution fails', () => {
      mockSWRReturnValue = {
        data: undefined,
        error: new Error('Not found'),
        isLoading: false,
        isValidating: false,
        mutate: () => {},
      }

      render(
        <DynamicBreadcrumbs pathname="/app/dashboard/employees/123e4567-e89b-12d3-a456-426614174000" />
      )

      // Should show truncated ID
      expect(screen.getByText(/123e4567/)).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ACCESSIBILITÉ
  // =========================================================================

  describe('Accessibility', () => {
    it('should have aria-label on nav element', () => {
      render(<DynamicBreadcrumbs pathname="/app/dashboard/employees" />)

      expect(
        screen.getByRole('navigation', { name: /fil d'ariane/i })
      ).toBeInTheDocument()
    })

    it('should mark last segment as current page', () => {
      render(<DynamicBreadcrumbs pathname="/app/dashboard/employees" />)

      // Last segment should not be a link
      const lastText = screen.getByText('Employés')

      // The last segment text should not be wrapped in a link
      expect(lastText.closest('a')).toBeNull()
    })
  })

  // =========================================================================
  // PROPS PERSONNALISÉES
  // =========================================================================

  describe('Custom Props', () => {
    it('should use custom home label', () => {
      render(
        <DynamicBreadcrumbs
          pathname="/app/dashboard/employees"
          homeLabel="Dashboard"
        />
      )

      expect(
        screen.getByRole('link', { name: /dashboard/i })
      ).toBeInTheDocument()
    })

    it('should use custom home href', () => {
      render(
        <DynamicBreadcrumbs
          pathname="/app/dashboard/employees"
          homeHref="/custom-home"
        />
      )

      const homeLink = screen.getByRole('link', { name: /accueil/i })
      expect(homeLink).toHaveAttribute('href', '/custom-home')
    })

    it('should hide home icon when showHomeIcon is false', () => {
      render(
        <DynamicBreadcrumbs
          pathname="/app/dashboard/employees"
          showHomeIcon={false}
        />
      )

      // Home icon should not be present (no svg with home-related class)
      const homeLink = screen.getByRole('link', { name: /accueil/i })
      expect(homeLink.querySelector('svg')).toBeNull()
    })
  })
})
