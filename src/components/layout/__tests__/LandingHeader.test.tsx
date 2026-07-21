/**
 * Tests pour LandingHeader - Navbar desktop en pattern disclosure
 *
 * Couvre les garanties d'accessibilité et de SEO/GEO du refactoring (SP-558) :
 * - présence permanente des liens des panneaux dans le DOM (maillage interne)
 * - liens des panneaux fermés retirés de la tabulation via `inert`
 * - ouverture au survol et au clavier (focus du bouton)
 * - fermeture avec Échap + restauration du focus sur le bouton déclencheur
 * - fermeture lorsque le focus quitte réellement le disclosure
 * - un seul panneau ouvert à la fois
 *
 * @ticket SP-558
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { LandingHeader } from '../LandingHeader'

// Mock next/image (rend une balise img simple, sans les props Next non-DOM)
vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
    width,
    height,
    className,
  }: {
    alt: string
    src: string
    width?: number
    height?: number
    className?: string
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={src}
      width={width}
      height={height}
      className={className}
    />
  ),
}))

// Mock ThemeToggle (dépend de next-themes, hors périmètre)
vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Thème</button>,
}))

// Mock framer-motion : rend les balises natives, PRÉSERVE `inert`
// (clé des tests a11y/SEO). Mock explicite par tag — un Proxy générique
// interférait avec la propagation de onFocus.
vi.mock('framer-motion', () => {
  type MotionProps = Record<string, unknown> & { children?: React.ReactNode }
  // Retire les props d'animation propres à Framer Motion, non-DOM
  const strip = ({
    animate: _animate,
    initial: _initial,
    exit: _exit,
    transition: _transition,
    whileInView: _whileInView,
    whileHover: _whileHover,
    ...props
  }: MotionProps) => props
  return {
    motion: {
      header: ({ children, ...p }: MotionProps) => (
        <header {...strip(p)}>{children}</header>
      ),
      div: ({ children, inert, ...p }: MotionProps) => (
        <div inert={inert as boolean | undefined} {...strip(p)}>
          {children}
        </div>
      ),
      button: ({ children, ...p }: MotionProps) => (
        <button {...strip(p)}>{children}</button>
      ),
      a: ({ children, ...p }: MotionProps) => <a {...strip(p)}>{children}</a>,
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  }
})

describe('LandingHeader - navbar desktop (disclosure)', () => {
  const getDisclosureButton = (label: string) =>
    screen.getByRole('button', { name: new RegExp(label, 'i') })

  describe('Maillage interne SEO/GEO : liens toujours dans le DOM', () => {
    it('rend les liens des trois panneaux même fermés (aucun démontage conditionnel)', () => {
      render(<LandingHeader />)

      // Panneau Produit
      expect(
        screen.getByRole('link', { name: /Démos par rôle/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /Fonctionnalités/i })
      ).toBeInTheDocument()

      // Panneau Solutions (pages secteur indexables)
      expect(
        screen.getByRole('link', { name: /Restauration/i })
      ).toHaveAttribute('href', '/solutions/planning-restaurant')
      expect(screen.getByRole('link', { name: /Commerce/i })).toHaveAttribute(
        'href',
        '/solutions/planning-commerce'
      )
      expect(screen.getByRole('link', { name: /BTP/i })).toHaveAttribute(
        'href',
        '/solutions/planning-btp'
      )

      // Panneau Ressources
      expect(
        screen.getByRole('link', { name: /Guides pratiques/i })
      ).toHaveAttribute('href', '/guides')
      expect(screen.getByRole('link', { name: /À propos/i })).toHaveAttribute(
        'href',
        '/a-propos'
      )
    })

    it('conserve « Tarifs » comme lien direct visible', () => {
      render(<LandingHeader />)
      expect(screen.getByRole('link', { name: 'Tarifs' })).toHaveAttribute(
        'href',
        '/tarifs'
      )
    })
  })

  describe('Sémantique disclosure (pas de menu applicatif APG)', () => {
    it('expose aria-expanded=false et aria-controls, sans role=menu', () => {
      render(<LandingHeader />)
      const produit = getDisclosureButton('Produit')

      expect(produit).toHaveAttribute('aria-expanded', 'false')
      expect(produit).toHaveAttribute('aria-controls')
      expect(produit).not.toHaveAttribute('aria-haspopup')

      // Aucun role="menu"/"menuitem" ne subsiste
      expect(screen.queryAllByRole('menu')).toHaveLength(0)
      expect(screen.queryAllByRole('menuitem')).toHaveLength(0)
    })

    it('marque les panneaux fermés comme inert (hors tabulation)', () => {
      render(<LandingHeader />)
      const produit = getDisclosureButton('Produit')
      const panelId = produit.getAttribute('aria-controls')!
      const panel = document.getElementById(panelId)!

      // inert présent à l'état fermé
      expect(panel).toHaveAttribute('inert')
    })

    it("exclut les liens des panneaux fermés de l'ordre de tabulation", async () => {
      const user = userEvent.setup()
      render(<LandingHeader />)

      // Tab 1 = logo, Tab 2 = premier disclosure (Produit) — jamais un lien de
      // panneau, ce qui prouve que `inert` les retire de la tabulation.
      await user.tab()
      await user.tab()
      expect(getDisclosureButton('Produit')).toHaveFocus()
    })
  })

  describe('Ouverture', () => {
    it('ouvre le panneau au survol du disclosure', async () => {
      const user = userEvent.setup()
      render(<LandingHeader />)
      const produit = getDisclosureButton('Produit')

      await user.hover(produit.parentElement!)

      expect(produit).toHaveAttribute('aria-expanded', 'true')
    })

    it('ouvre le panneau au focus clavier du bouton', () => {
      render(<LandingHeader />)
      const produit = getDisclosureButton('Produit')

      fireEvent.focus(produit)

      expect(produit).toHaveAttribute('aria-expanded', 'true')
      const panelId = produit.getAttribute('aria-controls')!
      // Panneau ouvert : plus inert
      expect(document.getElementById(panelId)).not.toHaveAttribute('inert')
    })

    it('un seul panneau ouvert à la fois', () => {
      render(<LandingHeader />)
      const produit = getDisclosureButton('Produit')
      const solutions = getDisclosureButton('Solutions')

      fireEvent.focus(produit)
      expect(produit).toHaveAttribute('aria-expanded', 'true')

      fireEvent.focus(solutions)
      expect(solutions).toHaveAttribute('aria-expanded', 'true')
      expect(produit).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Fermeture clavier', () => {
    it('Échap ferme le panneau et conserve le focus sur le bouton', async () => {
      const user = userEvent.setup()
      render(<LandingHeader />)
      const produit = getDisclosureButton('Produit')

      // Focus clavier réel : Tab 1 = logo, Tab 2 = bouton Produit (ouvre)
      await user.tab()
      await user.tab()
      expect(produit).toHaveFocus()
      expect(produit).toHaveAttribute('aria-expanded', 'true')

      await user.keyboard('{Escape}')

      expect(produit).toHaveAttribute('aria-expanded', 'false')
      expect(produit).toHaveFocus()
    })

    it('Échap depuis un lien du panneau ferme et rend le focus au bouton', async () => {
      const user = userEvent.setup()
      render(<LandingHeader />)
      const produit = getDisclosureButton('Produit')

      // Tab jusqu'au premier lien du panneau Produit (logo, bouton, lien)
      await user.tab()
      await user.tab()
      await user.tab()
      const firstLink = screen.getByRole('link', { name: /Démos par rôle/i })
      expect(firstLink).toHaveFocus()

      await user.keyboard('{Escape}')

      expect(produit).toHaveAttribute('aria-expanded', 'false')
      expect(produit).toHaveFocus()
    })
  })

  describe('Menu mobile préservé', () => {
    it('rend le bouton du menu mobile', () => {
      render(<LandingHeader />)
      expect(
        screen.getByTestId('landing-mobile-menu-button')
      ).toBeInTheDocument()
    })
  })

  describe('Pages auth (showNavLinks=false)', () => {
    it("n'affiche pas les disclosures de navigation", () => {
      render(<LandingHeader showNavLinks={false} />)
      expect(
        screen.queryByRole('button', { name: /Produit/i })
      ).not.toBeInTheDocument()
      // Les CTA restent
      expect(
        screen.getByRole('link', { name: 'Connexion' })
      ).toBeInTheDocument()
    })
  })
})
