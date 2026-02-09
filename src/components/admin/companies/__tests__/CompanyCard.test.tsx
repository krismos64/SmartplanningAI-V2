/**
 * Tests unitaires pour CompanyCard
 *
 * @ticket SP-462
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompanyCard } from '../CompanyCard'
import type { CompanyWithCounts } from '@/lib/actions/companies'

// ============================================================================
// Mock Data
// ============================================================================

const mockCompany: CompanyWithCounts = {
  id: 'company-1',
  name: 'Acme Corporation',
  slug: 'acme-corporation',
  email: 'contact@acme.com',
  phone: '+33123456789',
  subscription: { plan: 'PER_SEAT', status: 'ACTIVE', quantity: 10, pricePerEmployee: 290 },
  isActive: true,
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
  _count: {
    users: 12,
    teams: 3,
    employees: 10,
  },
}

const mockInactiveCompany: CompanyWithCounts = {
  ...mockCompany,
  id: 'company-2',
  name: 'Inactive Corp',
  slug: 'inactive-corp',
  subscription: { plan: 'FREE', status: 'TRIAL', quantity: 0, pricePerEmployee: 0 },
  isActive: false,
  _count: {
    users: 2,
    teams: 1,
    employees: 1,
  },
}

// ============================================================================
// Tests
// ============================================================================

describe('CompanyCard', () => {
  it("affiche le nom de l'entreprise", () => {
    render(<CompanyCard company={mockCompany} />)
    expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
  })

  it("affiche le slug de l'entreprise", () => {
    render(<CompanyCard company={mockCompany} />)
    expect(screen.getByText('acme-corporation')).toBeInTheDocument()
  })

  it("affiche le plan d'abonnement", () => {
    render(<CompanyCard company={mockCompany} />)
    expect(screen.getByText('Per-seat (2,90€/employé)')).toBeInTheDocument()
  })

  it("affiche le statut d'abonnement", () => {
    render(<CompanyCard company={mockCompany} />)
    const badges = screen.getAllByText('Actif')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('affiche le badge Actif quand isActive est true', () => {
    render(<CompanyCard company={mockCompany} />)
    const badges = screen.getAllByText('Actif')
    // 2 badges "Actif" : un pour le statut d'abonnement, un pour isActive
    expect(badges.length).toBe(2)
  })

  it('affiche le badge Inactif quand isActive est false', () => {
    render(<CompanyCard company={mockInactiveCompany} />)
    expect(screen.getByText('Inactif')).toBeInTheDocument()
  })

  it("affiche le nombre d'utilisateurs", () => {
    render(<CompanyCard company={mockCompany} />)
    expect(screen.getByText('12 utilisateurs')).toBeInTheDocument()
  })

  it("affiche le nombre d'utilisateurs au singulier", () => {
    const singleUserCompany = {
      ...mockCompany,
      _count: { users: 1, teams: 1, employees: 1 },
    }
    render(<CompanyCard company={singleUserCompany} />)
    expect(screen.getByText('1 utilisateur')).toBeInTheDocument()
  })

  it("affiche le nombre d'équipes", () => {
    render(<CompanyCard company={mockCompany} />)
    expect(screen.getByText('3 équipes')).toBeInTheDocument()
  })

  it("affiche le nombre d'équipes au singulier", () => {
    const singleTeamCompany = {
      ...mockCompany,
      _count: { users: 5, teams: 1, employees: 3 },
    }
    render(<CompanyCard company={singleTeamCompany} />)
    expect(screen.getByText('1 équipe')).toBeInTheDocument()
  })

  it("affiche l'email de l'entreprise", () => {
    render(<CompanyCard company={mockCompany} />)
    expect(screen.getByText('contact@acme.com')).toBeInTheDocument()
  })

  it('affiche la date de création', () => {
    render(<CompanyCard company={mockCompany} />)
    expect(screen.getByText(/Créée le 15 janv\. 2024/)).toBeInTheDocument()
  })

  it("affiche l'icône Building2", () => {
    const { container } = render(<CompanyCard company={mockCompany} />)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('ouvre le menu actions au clic', async () => {
    const user = userEvent.setup()
    render(<CompanyCard company={mockCompany} />)

    const menuButton = screen.getByTestId('company-card-menu')
    await user.click(menuButton)

    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('appelle onView quand on clique sur "Voir détails"', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    render(<CompanyCard company={mockCompany} onView={onView} />)

    const menuButton = screen.getByTestId('company-card-menu')
    await user.click(menuButton)

    const viewButton = screen.getByText('Voir détails')
    await user.click(viewButton)

    expect(onView).toHaveBeenCalledTimes(1)
  })

  it('appelle onEdit quand on clique sur "Modifier"', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<CompanyCard company={mockCompany} onEdit={onEdit} />)

    const menuButton = screen.getByTestId('company-card-menu')
    await user.click(menuButton)

    const editButton = screen.getByText('Modifier')
    await user.click(editButton)

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('appelle onDelete quand on clique sur "Supprimer"', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<CompanyCard company={mockCompany} onDelete={onDelete} />)

    const menuButton = screen.getByTestId('company-card-menu')
    await user.click(menuButton)

    const deleteButton = screen.getByText('Supprimer')
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('appelle onToggleStatus avec "Désactiver" pour entreprise active', async () => {
    const user = userEvent.setup()
    const onToggleStatus = vi.fn()
    render(
      <CompanyCard company={mockCompany} onToggleStatus={onToggleStatus} />
    )

    const menuButton = screen.getByTestId('company-card-menu')
    await user.click(menuButton)

    const toggleButton = screen.getByText('Désactiver')
    await user.click(toggleButton)

    expect(onToggleStatus).toHaveBeenCalledTimes(1)
  })

  it('appelle onToggleStatus avec "Activer" pour entreprise inactive', async () => {
    const user = userEvent.setup()
    const onToggleStatus = vi.fn()
    render(
      <CompanyCard
        company={mockInactiveCompany}
        onToggleStatus={onToggleStatus}
      />
    )

    const menuButton = screen.getByTestId('company-card-menu')
    await user.click(menuButton)

    const toggleButton = screen.getByText('Activer')
    await user.click(toggleButton)

    expect(onToggleStatus).toHaveBeenCalledTimes(1)
  })

  it("n'affiche pas les actions si les callbacks ne sont pas fournis", async () => {
    const user = userEvent.setup()
    render(<CompanyCard company={mockCompany} />)

    const menuButton = screen.getByTestId('company-card-menu')
    await user.click(menuButton)

    expect(screen.queryByText('Voir détails')).not.toBeInTheDocument()
    expect(screen.queryByText('Modifier')).not.toBeInTheDocument()
    expect(screen.queryByText('Supprimer')).not.toBeInTheDocument()
    expect(screen.queryByText('Désactiver')).not.toBeInTheDocument()
  })

  it('gère le cas où _count est undefined', () => {
    const companyWithoutCount = {
      ...mockCompany,
      _count: undefined,
    } as unknown as CompanyWithCounts
    render(<CompanyCard company={companyWithoutCount} />)

    expect(screen.getByText('0 utilisateur')).toBeInTheDocument()
    expect(screen.getByText('0 équipe')).toBeInTheDocument()
  })

  it("n'affiche pas l'email si absent", () => {
    const companyWithoutEmail = {
      ...mockCompany,
      email: null,
    }
    render(<CompanyCard company={companyWithoutEmail} />)

    expect(screen.queryByText('contact@acme.com')).not.toBeInTheDocument()
  })

  it('affiche les différents plans correctement (SP-350)', () => {
    const { rerender } = render(<CompanyCard company={mockCompany} />)

    // PER_SEAT
    expect(screen.getByText('Per-seat (2,90€/employé)')).toBeInTheDocument()

    // FREE
    rerender(
      <CompanyCard company={{ ...mockCompany, subscription: { plan: 'FREE', status: 'TRIAL', quantity: 0, pricePerEmployee: 0 } }} />
    )
    expect(screen.getByText('Gratuit')).toBeInTheDocument()
  })

  it('affiche les différents statuts correctement (SP-350)', () => {
    const { rerender } = render(<CompanyCard company={mockCompany} />)

    // ACTIVE - 2 badges "Actif" (statut + isActive)
    const activesBadges = screen.getAllByText('Actif')
    expect(activesBadges.length).toBeGreaterThanOrEqual(1)

    // TRIAL
    rerender(
      <CompanyCard company={{ ...mockCompany, subscription: { ...mockCompany.subscription!, status: 'TRIAL' } }} />
    )
    expect(screen.getByText("Période d'essai")).toBeInTheDocument()

    // PAST_DUE
    rerender(
      <CompanyCard company={{ ...mockCompany, subscription: { ...mockCompany.subscription!, status: 'PAST_DUE' } }} />
    )
    expect(screen.getByText('Paiement en retard')).toBeInTheDocument()

    // CANCELED
    rerender(
      <CompanyCard company={{ ...mockCompany, subscription: { ...mockCompany.subscription!, status: 'CANCELED' } }} />
    )
    expect(screen.getByText('Annulé')).toBeInTheDocument()

    // EXPIRED
    rerender(
      <CompanyCard company={{ ...mockCompany, subscription: { ...mockCompany.subscription!, status: 'EXPIRED' } }} />
    )
    expect(screen.getByText('Expiré')).toBeInTheDocument()

    // INCOMPLETE (SP-350)
    rerender(
      <CompanyCard company={{ ...mockCompany, subscription: { ...mockCompany.subscription!, status: 'INCOMPLETE' } }} />
    )
    expect(screen.getByText('Paiement incomplet')).toBeInTheDocument()
  })

  it('a le data-testid correct', () => {
    render(<CompanyCard company={mockCompany} />)
    expect(screen.getByTestId('company-card')).toBeInTheDocument()
  })
})
