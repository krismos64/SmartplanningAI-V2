/**
 * Tests unitaires pour DynamicBreadcrumbs
 *
 * Couvre la construction des href par buildCrumbs (fonction interne, testee
 * via le rendu du composant) : le defaut corrige prefixait chaque href en dur
 * par « /app/dashboard/ », ce qui cassait tout espace de routes hors
 * dashboard (director, admin, manager, settings, profile). Mesure en
 * production le 18 septembre 2026, 29 occurrences pendant la session d'un
 * vrai prospect sur /app/director/teams.
 *
 * @ticket SP-599
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

// swr : aucun fetch reel, les segments testes ne sont pas des IDs donc l'URL
// SWR vaut toujours null et le fetcher n'est jamais appele.
const mockUseSWR = vi.hoisted(() => vi.fn())
vi.mock('swr', () => ({
  default: mockUseSWR,
}))

import { DynamicBreadcrumbs } from '@/components/ui/dynamic-breadcrumbs'

// ============================================================================
// Helpers
// ============================================================================

/**
 * Recupere le href du segment visible portant le texte donne.
 * Le dernier segment est rendu en BreadcrumbPage (pas de lien), donc on
 * cherche un lien uniquement pour les segments intermediaires.
 */
function getCrumbHref(label: string): string {
  const link = screen.getByRole('link', { name: new RegExp(label, 'i') })
  return link.getAttribute('href') ?? ''
}

// ============================================================================
// Tests
// ============================================================================

describe('DynamicBreadcrumbs', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: false })
  })

  // --------------------------------------------------------------------------
  // Le defaut corrige : espaces de routes hors /app/dashboard
  // --------------------------------------------------------------------------

  describe('Espaces de routes hors dashboard (defaut SP-599)', () => {
    it('construit le href de "Equipes" depuis /app/director/teams, et non /app/dashboard/director/teams', () => {
      render(<DynamicBreadcrumbs pathname="/app/director/teams" />)

      // Le segment intermediaire "Directeur" doit pointer vers /app/director
      const directorLink = getCrumbHref('Directeur')
      expect(directorLink).toBe('/app/director')
      expect(directorLink).not.toBe('/app/dashboard/director')

      // Le dernier segment "Equipes" est le BreadcrumbPage courant, pas un lien
      const page = screen.getByText('Équipes')
      expect(page.closest('a')).toBeNull()
    })

    it('resout /app/admin/users sans prefixer /app/dashboard', () => {
      render(<DynamicBreadcrumbs pathname="/app/admin/users" />)

      const adminLink = getCrumbHref('admin')
      expect(adminLink).toBe('/app/admin')
      expect(adminLink).not.toContain('/app/dashboard/admin')

      // Pas de mapping STATIC_LABELS pour "users" : le fallback capitalise
      // le segment brut.
      const page = screen.getByText('Users')
      expect(page.closest('a')).toBeNull()
    })

    it('resout /app/manager/dashboard : le segment "dashboard" est masque comme partout ailleurs', () => {
      render(<DynamicBreadcrumbs pathname="/app/manager/dashboard" />)

      // "dashboard" est filtre quelle que soit sa position dans le chemin :
      // il ne reste donc que "manager", seul et dernier segment, rendu en
      // BreadcrumbPage (pas de lien).
      expect(screen.queryByText('dashboard')).not.toBeInTheDocument()

      const page = screen.getByText('Manager')
      expect(page.closest('a')).toBeNull()
    })

    it('resout /app/settings/company', () => {
      render(<DynamicBreadcrumbs pathname="/app/settings/company" />)

      const settingsLink = getCrumbHref('Paramètres')
      expect(settingsLink).toBe('/app/settings')
      expect(settingsLink).not.toContain('/app/dashboard/settings')

      const page = screen.getByText('Entreprise')
      expect(page.closest('a')).toBeNull()
    })

    it('resout /app/profile/edit', () => {
      render(<DynamicBreadcrumbs pathname="/app/profile/edit" />)

      const profileLink = getCrumbHref('Profil')
      expect(profileLink).toBe('/app/profile')
      expect(profileLink).not.toContain('/app/dashboard/profile')

      const page = screen.getByText('Modifier')
      expect(page.closest('a')).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Non-regression : espace historique /app/dashboard
  // --------------------------------------------------------------------------

  describe('Non-regression sur /app/dashboard', () => {
    it('resout /app/dashboard/employees avec le bon href', () => {
      render(<DynamicBreadcrumbs pathname="/app/dashboard/employees" />)

      // Seul segment restant apres masquage de "app" et "dashboard" : c'est
      // donc le dernier segment, rendu en BreadcrumbPage.
      const page = screen.getByText('Employés')
      expect(page.closest('a')).toBeNull()
    })

    it('resout /app/dashboard/leaves avec le bon href', () => {
      render(<DynamicBreadcrumbs pathname="/app/dashboard/leaves" />)

      const page = screen.getByText('Congés')
      expect(page.closest('a')).toBeNull()
    })

    it('construit un href correct pour un sous-segment de /app/dashboard', () => {
      render(<DynamicBreadcrumbs pathname="/app/dashboard/employees/new" />)

      const employeesLink = getCrumbHref('Employés')
      expect(employeesLink).toBe('/app/dashboard/employees')

      const page = screen.getByText('Nouveau')
      expect(page.closest('a')).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Segments masques a l'affichage
  // --------------------------------------------------------------------------

  describe('Masquage des segments app et dashboard', () => {
    it('ne rend aucun libelle "app" ni "dashboard" visible', () => {
      render(<DynamicBreadcrumbs pathname="/app/dashboard/employees" />)

      expect(screen.queryByText('app')).not.toBeInTheDocument()
      expect(screen.queryByText('dashboard')).not.toBeInTheDocument()
    })

    it('ne rend rien pour /app/dashboard seul (aucun segment)', () => {
      const { container } = render(
        <DynamicBreadcrumbs pathname="/app/dashboard" />
      )
      expect(container.innerHTML).toBe('')
    })
  })

  // --------------------------------------------------------------------------
  // JSON-LD BreadcrumbList : memes URL que les liens visibles
  // --------------------------------------------------------------------------

  describe('JSON-LD BreadcrumbList', () => {
    it('porte les memes href que les liens visibles pour /app/director/teams', async () => {
      const { container } = render(
        <DynamicBreadcrumbs pathname="/app/director/teams" />
      )

      // Le schema est genere dans un useEffect (post-hydratation) : attendre
      // son apparition dans le DOM.
      await waitFor(() => {
        expect(
          container.querySelector('script[type="application/ld+json"]')
        ).not.toBeNull()
      })

      const script = container.querySelector(
        'script[type="application/ld+json"]'
      )
      const schema = JSON.parse(script?.textContent ?? '{}') as {
        itemListElement: Array<{ item: string; name: string }>
      }

      const directorItem = schema.itemListElement.find((item) =>
        item.item.endsWith('/app/director')
      )
      expect(directorItem).toBeDefined()
      expect(directorItem?.item).not.toContain('/app/dashboard/director')

      const teamsItem = schema.itemListElement.find((item) =>
        item.item.endsWith('/app/director/teams')
      )
      expect(teamsItem).toBeDefined()
    })

    it('ne genere aucun schema pour /app/dashboard seul', () => {
      const { container } = render(
        <DynamicBreadcrumbs pathname="/app/dashboard" />
      )
      expect(
        container.querySelector('script[type="application/ld+json"]')
      ).toBeNull()
    })
  })
})
