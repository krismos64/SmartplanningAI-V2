/**
 * Tests unitaires pour EmployeeCard
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeCard } from '@/components/admin/employees/EmployeeCard'
import type { EmployeeWithCounts } from '@/lib/validations/employee'

// ============================================================================
// Fixtures
// ============================================================================

const mockEmployee: EmployeeWithCounts = {
  id: 'clemp0000001',
  userId: 'clusr0000001',
  firstName: 'Jean',
  lastName: 'Dupont',
  jobTitle: 'Développeur',
  department: null,
  phone: '0612345678',
  email: 'jean@test.com',
  hireDate: new Date('2024-03-15'),
  weeklyHours: 35,
  skills: [],
  companyId: 'clcmp0000001',
  teamId: 'clteam000001',
  isActive: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2025-06-01'),
  user: {
    id: 'clusr0000001',
    name: 'Jean Dupont',
    email: 'jean.dupont@company.com',
    image: null,
  },
  team: { id: 'clteam000001', name: 'Équipe Frontend' },
}

const mockEmployeeInactive: EmployeeWithCounts = {
  ...mockEmployee,
  id: 'clemp0000002',
  firstName: 'Marie',
  lastName: 'Martin',
  isActive: false,
  phone: null,
  hireDate: null,
  team: null,
  teamId: null,
}

const mockEmployeeMinimal: EmployeeWithCounts = {
  ...mockEmployee,
  id: 'clemp0000003',
  phone: null,
  email: null,
  hireDate: null,
  team: null,
  teamId: null,
  user: null,
}

// ============================================================================
// Tests
// ============================================================================

describe('EmployeeCard', () => {
  const defaultProps = {
    employee: mockEmployee,
    selected: false,
    onSelectChange: vi.fn(),
  }

  describe('Affichage de base', () => {
    it('affiche le nom de l employé', () => {
      render(<EmployeeCard {...defaultProps} />)
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('affiche le badge Actif', () => {
      render(<EmployeeCard {...defaultProps} />)
      expect(screen.getByText('Actif')).toBeInTheDocument()
    })

    it('affiche le badge Inactif', () => {
      render(
        <EmployeeCard
          {...defaultProps}
          employee={mockEmployeeInactive}
        />
      )
      expect(screen.getByText('Inactif')).toBeInTheDocument()
    })

    it('affiche l équipe', () => {
      render(<EmployeeCard {...defaultProps} />)
      expect(screen.getByText('Équipe Frontend')).toBeInTheDocument()
    })

    it('n affiche pas l équipe si absente', () => {
      render(
        <EmployeeCard
          {...defaultProps}
          employee={mockEmployeeMinimal}
        />
      )
      expect(
        screen.queryByText('Équipe Frontend')
      ).not.toBeInTheDocument()
    })

    it('affiche l email', () => {
      render(<EmployeeCard {...defaultProps} />)
      expect(screen.getByText('jean@test.com')).toBeInTheDocument()
    })

    it('affiche l email du user si pas d email employee', () => {
      const employee = { ...mockEmployee, email: null }
      render(
        <EmployeeCard {...defaultProps} employee={employee} />
      )
      expect(screen.getByText('jean.dupont@company.com')).toBeInTheDocument()
    })

    it('affiche le téléphone', () => {
      render(<EmployeeCard {...defaultProps} />)
      expect(screen.getByText('0612345678')).toBeInTheDocument()
    })

    it('n affiche pas le téléphone si absent', () => {
      render(
        <EmployeeCard
          {...defaultProps}
          employee={mockEmployeeInactive}
        />
      )
      expect(screen.queryByText('0612345678')).not.toBeInTheDocument()
    })

    it('affiche les heures hebdomadaires', () => {
      render(<EmployeeCard {...defaultProps} />)
      expect(screen.getByText('35h/sem')).toBeInTheDocument()
    })

    it('affiche la date d embauche formatée', () => {
      render(<EmployeeCard {...defaultProps} />)
      expect(screen.getByText(/Depuis/)).toBeInTheDocument()
      expect(screen.getByText(/mars 2024/)).toBeInTheDocument()
    })

    it('n affiche pas la date d embauche si absente', () => {
      render(
        <EmployeeCard
          {...defaultProps}
          employee={mockEmployeeInactive}
        />
      )
      expect(screen.queryByText(/Depuis/)).not.toBeInTheDocument()
    })
  })

  describe('Checkbox', () => {
    it('affiche la checkbox avec le bon aria-label', () => {
      render(<EmployeeCard {...defaultProps} />)
      expect(
        screen.getByRole('checkbox', {
          name: 'Selectionner Jean Dupont',
        })
      ).toBeInTheDocument()
    })

    it('la checkbox est non cochée par défaut', () => {
      render(<EmployeeCard {...defaultProps} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('la checkbox reflète l état selected', () => {
      render(<EmployeeCard {...defaultProps} selected={true} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('appelle onSelectChange au clic', async () => {
      const onSelectChange = vi.fn()
      const user = userEvent.setup()
      render(
        <EmployeeCard {...defaultProps} onSelectChange={onSelectChange} />
      )
      await user.click(screen.getByRole('checkbox'))
      expect(onSelectChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Actions dropdown', () => {
    it('affiche le bouton menu', () => {
      render(<EmployeeCard {...defaultProps} />)
      expect(screen.getByText('Menu actions')).toBeInTheDocument()
    })

    it('affiche Voir details quand onView est fourni', async () => {
      const user = userEvent.setup()
      render(
        <EmployeeCard {...defaultProps} onView={vi.fn()} />
      )
      await user.click(screen.getByText('Menu actions'))
      expect(screen.getByText('Voir details')).toBeInTheDocument()
    })

    it('affiche Modifier quand onEdit est fourni', async () => {
      const user = userEvent.setup()
      render(
        <EmployeeCard {...defaultProps} onEdit={vi.fn()} />
      )
      await user.click(screen.getByText('Menu actions'))
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })

    it('affiche Desactiver pour un employé actif', async () => {
      const user = userEvent.setup()
      render(
        <EmployeeCard {...defaultProps} onToggleStatus={vi.fn()} />
      )
      await user.click(screen.getByText('Menu actions'))
      expect(screen.getByText('Desactiver')).toBeInTheDocument()
    })

    it('affiche Activer pour un employé inactif', async () => {
      const user = userEvent.setup()
      render(
        <EmployeeCard
          {...defaultProps}
          employee={mockEmployeeInactive}
          onToggleStatus={vi.fn()}
        />
      )
      await user.click(screen.getByText('Menu actions'))
      expect(screen.getByText('Activer')).toBeInTheDocument()
    })

    it('affiche Supprimer quand onDelete et canDelete', async () => {
      const user = userEvent.setup()
      render(
        <EmployeeCard
          {...defaultProps}
          onDelete={vi.fn()}
          canDelete={true}
        />
      )
      await user.click(screen.getByText('Menu actions'))
      expect(screen.getByText('Supprimer')).toBeInTheDocument()
    })

    it('masque Supprimer quand canDelete=false', async () => {
      const user = userEvent.setup()
      render(
        <EmployeeCard
          {...defaultProps}
          onDelete={vi.fn()}
          canDelete={false}
        />
      )
      await user.click(screen.getByText('Menu actions'))
      expect(screen.queryByText('Supprimer')).not.toBeInTheDocument()
    })

    it('appelle les callbacks d action', async () => {
      const onView = vi.fn()
      const onEdit = vi.fn()
      const user = userEvent.setup()
      render(
        <EmployeeCard
          {...defaultProps}
          onView={onView}
          onEdit={onEdit}
        />
      )
      await user.click(screen.getByText('Menu actions'))
      await user.click(screen.getByText('Voir details'))
      expect(onView).toHaveBeenCalled()
    })
  })

  describe('Style sélection', () => {
    it('applique le style de sélection quand selected=true', () => {
      const { container } = render(
        <EmployeeCard {...defaultProps} selected={true} />
      )
      const card = container.querySelector('[class*="border-primary"]')
      expect(card).toBeTruthy()
    })
  })
})
