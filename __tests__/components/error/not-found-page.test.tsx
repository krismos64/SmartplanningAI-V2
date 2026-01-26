/**
 * Tests unitaires pour NotFoundPage et NotFoundIllustration - SP-302
 *
 * Tests de la page 404 personnalisée avec animations Framer Motion,
 * composants Shadcn/ui et conformité WCAG 2.1 AA.
 *
 * @ticket SP-302
 * @see Context7: Framer Motion testing, Next.js App Router, Accessibility
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { NotFoundPage } from '@/components/error/NotFoundPage'
import { NotFoundIllustration } from '@/components/error/NotFoundIllustration'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    main: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLElement>) => (
      <main className={className} {...props}>
        {children}
      </main>
    ),
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    h1: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className={className} {...props}>
        {children}
      </h1>
    ),
    p: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
    nav: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLElement>) => (
      <nav className={className} {...props}>
        {children}
      </nav>
    ),
  },
}))

// ===========================================================================
// NOT FOUND ILLUSTRATION TESTS
// ===========================================================================

describe('NotFoundIllustration', () => {
  // -------------------------------------------------------------------------
  // Rendu du composant
  // -------------------------------------------------------------------------

  describe('Rendu du composant', () => {
    it('renders illustration container with correct test id', () => {
      render(<NotFoundIllustration />)

      expect(screen.getByTestId('not-found-illustration')).toBeInTheDocument()
    })

    it('renders main icon container', () => {
      render(<NotFoundIllustration />)

      expect(screen.getByTestId('main-icon')).toBeInTheDocument()
    })

    it('renders search icon decoration', () => {
      render(<NotFoundIllustration />)

      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('renders arrow icon decoration', () => {
      render(<NotFoundIllustration />)

      expect(screen.getByTestId('arrow-icon')).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
      render(<NotFoundIllustration className="custom-class" />)

      const container = screen.getByTestId('not-found-illustration')
      expect(container).toHaveClass('custom-class')
    })

    it('has responsive height classes', () => {
      render(<NotFoundIllustration />)

      const container = screen.getByTestId('not-found-illustration')
      expect(container).toHaveClass('h-32', 'sm:h-40', 'md:h-48')
    })
  })

  // -------------------------------------------------------------------------
  // Accessibilité
  // -------------------------------------------------------------------------

  describe('Accessibilité', () => {
    it('has aria-hidden for decorative illustration', () => {
      render(<NotFoundIllustration />)

      const container = screen.getByTestId('not-found-illustration')
      expect(container).toHaveAttribute('aria-hidden', 'true')
    })

    it('is not accessible to screen readers (decorative)', () => {
      render(<NotFoundIllustration />)

      // The illustration should be hidden from accessibility tree
      const container = screen.getByTestId('not-found-illustration')
      expect(container.getAttribute('aria-hidden')).toBe('true')
    })
  })
})

// ===========================================================================
// NOT FOUND PAGE TESTS
// ===========================================================================

describe('NotFoundPage', () => {
  // -------------------------------------------------------------------------
  // Rendu du composant
  // -------------------------------------------------------------------------

  describe('Rendu du composant', () => {
    it('renders 404 page with correct test id', () => {
      render(<NotFoundPage />)

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    })

    it('renders 404 number', () => {
      render(<NotFoundPage />)

      expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('renders page title in French', () => {
      render(<NotFoundPage />)

      expect(screen.getByText('Page non trouvée')).toBeInTheDocument()
    })

    it('renders description text in French', () => {
      render(<NotFoundPage />)

      expect(
        screen.getByText(/désolé, la page que vous recherchez/i)
      ).toBeInTheDocument()
    })

    it('renders illustration component', () => {
      render(<NotFoundPage />)

      expect(screen.getByTestId('not-found-illustration')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Boutons de navigation
  // -------------------------------------------------------------------------

  describe('Boutons de navigation', () => {
    it('renders Home button with correct link', () => {
      render(<NotFoundPage />)

      const homeLink = screen.getByRole('link', { name: /accueil/i })
      expect(homeLink).toBeInTheDocument()
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('renders Dashboard button with correct link', () => {
      render(<NotFoundPage />)

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toBeInTheDocument()
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    })

    it('Home button has correct styling (primary variant)', () => {
      render(<NotFoundPage />)

      const homeLink = screen.getByRole('link', { name: /accueil/i })
      // Primary button should not have 'outline' class
      expect(homeLink).not.toHaveClass('border-input')
    })

    it('Dashboard button has outline variant styling', () => {
      render(<NotFoundPage />)

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      // Outline variant has border styling
      expect(dashboardLink.className).toMatch(/border/)
    })
  })

  // -------------------------------------------------------------------------
  // Liens rapides
  // -------------------------------------------------------------------------

  describe('Liens rapides', () => {
    it('renders quick links navigation', () => {
      render(<NotFoundPage />)

      const nav = screen.getByRole('navigation', { name: /liens rapides/i })
      expect(nav).toBeInTheDocument()
    })

    it('renders Fonctionnalités quick link', () => {
      render(<NotFoundPage />)

      const link = screen.getByRole('link', { name: /fonctionnalités/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/#features')
    })

    it('renders Tarifs quick link', () => {
      render(<NotFoundPage />)

      const link = screen.getByRole('link', { name: /tarifs/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/#pricing')
    })

    it('renders Contact quick link', () => {
      render(<NotFoundPage />)

      const link = screen.getByRole('link', { name: /contact/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/#contact')
    })

    it('renders all three quick links', () => {
      render(<NotFoundPage />)

      const nav = screen.getByRole('navigation', { name: /liens rapides/i })
      const links = nav.querySelectorAll('a')
      expect(links).toHaveLength(3)
    })
  })

  // -------------------------------------------------------------------------
  // Accessibilité WCAG 2.1 AA
  // -------------------------------------------------------------------------

  describe('Accessibilité WCAG 2.1 AA', () => {
    it('has region landmark with correct role', () => {
      render(<NotFoundPage />)

      const region = screen.getByRole('region')
      expect(region).toBeInTheDocument()
    })

    it('has aria-label for page description', () => {
      render(<NotFoundPage />)

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-label', 'Page non trouvée')
    })

    it('has aria-labelledby pointing to title', () => {
      render(<NotFoundPage />)

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-labelledby', 'not-found-title')
    })

    it('has aria-describedby pointing to description', () => {
      render(<NotFoundPage />)

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute(
        'aria-describedby',
        'not-found-description'
      )
    })

    it('title has correct id for aria reference', () => {
      render(<NotFoundPage />)

      const title = screen.getByText('Page non trouvée')
      expect(title).toHaveAttribute('id', 'not-found-title')
    })

    it('description has correct id for aria reference', () => {
      render(<NotFoundPage />)

      const description = screen.getByText(
        /désolé, la page que vous recherchez/i
      )
      expect(description).toHaveAttribute('id', 'not-found-description')
    })

    it('404 number is hidden from screen readers', () => {
      render(<NotFoundPage />)

      const number = screen.getByText('404')
      expect(number).toHaveAttribute('aria-hidden', 'true')
    })

    it('navigation has accessible label', () => {
      render(<NotFoundPage />)

      const nav = screen.getByRole('navigation', { name: /liens rapides/i })
      expect(nav).toHaveAttribute('aria-label', 'Liens rapides')
    })

    it('quick links have proper focus styling classes', () => {
      render(<NotFoundPage />)

      const link = screen.getByRole('link', { name: /fonctionnalités/i })
      expect(link.className).toMatch(/focus-visible/)
    })
  })

  // -------------------------------------------------------------------------
  // Responsive design
  // -------------------------------------------------------------------------

  describe('Responsive design', () => {
    it('has responsive text sizing for 404 number', () => {
      render(<NotFoundPage />)

      const number = screen.getByText('404')
      expect(number).toHaveClass('text-6xl', 'sm:text-7xl', 'md:text-8xl')
    })

    it('has responsive text sizing for title', () => {
      render(<NotFoundPage />)

      const title = screen.getByText('Page non trouvée')
      expect(title).toHaveClass('text-xl', 'sm:text-2xl', 'md:text-3xl')
    })

    it('has responsive button layout', () => {
      render(<NotFoundPage />)

      const homeLink = screen.getByRole('link', { name: /accueil/i })
      const parent = homeLink.closest('div')
      expect(parent).toHaveClass('flex-col', 'sm:flex-row')
    })

    it('page has full viewport height', () => {
      render(<NotFoundPage />)

      const region = screen.getByRole('region')
      expect(region).toHaveClass('min-h-screen')
    })

    it('content is centered', () => {
      render(<NotFoundPage />)

      const region = screen.getByRole('region')
      expect(region).toHaveClass('items-center', 'justify-center')
    })
  })

  // -------------------------------------------------------------------------
  // Dark mode support
  // -------------------------------------------------------------------------

  describe('Dark mode support', () => {
    it('uses bg-background for theme compatibility', () => {
      render(<NotFoundPage />)

      const region = screen.getByRole('region')
      expect(region).toHaveClass('bg-background')
    })

    it('uses text-foreground for title', () => {
      render(<NotFoundPage />)

      const title = screen.getByText('Page non trouvée')
      expect(title).toHaveClass('text-foreground')
    })

    it('uses text-muted-foreground for description', () => {
      render(<NotFoundPage />)

      const description = screen.getByText(
        /désolé, la page que vous recherchez/i
      )
      expect(description).toHaveClass('text-muted-foreground')
    })
  })

  // -------------------------------------------------------------------------
  // Gradient styling
  // -------------------------------------------------------------------------

  describe('Gradient styling', () => {
    it('404 number has gradient text styling', () => {
      render(<NotFoundPage />)

      const number = screen.getByText('404')
      expect(number).toHaveClass('bg-gradient-to-r')
      expect(number).toHaveClass('from-primary')
      expect(number).toHaveClass('bg-clip-text')
      expect(number).toHaveClass('text-transparent')
    })
  })
})
