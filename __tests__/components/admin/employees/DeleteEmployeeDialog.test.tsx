/**
 * Tests unitaires pour DeleteEmployeeDialog
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeleteEmployeeDialog } from '@/components/admin/employees/DeleteEmployeeDialog'
import type { EmployeeWithCounts } from '@/lib/validations/employee'

// ============================================================================
// Mocks
// ============================================================================

const mockDeleteEmployee = vi.fn()

vi.mock('@/lib/actions/employees', () => ({
  deleteEmployee: (...args: unknown[]) => mockDeleteEmployee(...args),
}))

vi.mock('@/hooks/use-crud-mutation', () => ({
  useDeleteMutation: (action: (id: string) => unknown, options: Record<string, unknown>) => ({
    mutate: async (id: string) => {
      const result = await action(id)
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        ;(options.onSuccess as () => void)?.()
      }
      return result
    },
    isPending: false,
  }),
}))

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
  hireDate: new Date('2024-01-15'),
  weeklyHours: 35,
  skills: [],
  companyId: 'clcmp0000001',
  teamId: 'clteam000001',
  isActive: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2025-06-01'),
  _count: { schedules: 0, leaveRequests: 0 },
}

const mockEmployeeWithRelations: EmployeeWithCounts = {
  ...mockEmployee,
  id: 'clemp0000002',
  firstName: 'Marie',
  lastName: 'Martin',
  _count: { schedules: 3, leaveRequests: 5 },
}

const mockEmployeeSchedulesOnly: EmployeeWithCounts = {
  ...mockEmployee,
  id: 'clemp0000003',
  firstName: 'Pierre',
  lastName: 'Bernard',
  _count: { schedules: 2, leaveRequests: 0 },
}

// ============================================================================
// Tests
// ============================================================================

describe('DeleteEmployeeDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteEmployee.mockResolvedValue({ success: true })
  })

  describe('Rendu', () => {
    it('ne rend rien quand employee est null', () => {
      const { container } = render(
        <DeleteEmployeeDialog
          employee={null}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(container.innerHTML).toBe('')
    })

    it('affiche le titre du dialog', () => {
      render(
        <DeleteEmployeeDialog
          employee={mockEmployee}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(screen.getByText("Supprimer l'employé")).toBeInTheDocument()
    })

    it('affiche le nom de l employé', () => {
      render(
        <DeleteEmployeeDialog
          employee={mockEmployee}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('affiche le message d action irréversible', () => {
      render(
        <DeleteEmployeeDialog
          employee={mockEmployee}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(
        screen.getByText('Cette action est irréversible.')
      ).toBeInTheDocument()
    })

    it('affiche les boutons Annuler et Supprimer', () => {
      render(
        <DeleteEmployeeDialog
          employee={mockEmployee}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(screen.getByText('Annuler')).toBeInTheDocument()
      expect(screen.getByText('Supprimer')).toBeInTheDocument()
    })
  })

  describe('Données liées', () => {
    it('n affiche pas d avertissement sans données liées', () => {
      render(
        <DeleteEmployeeDialog
          employee={mockEmployee}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(
        screen.queryByText(/Attention/)
      ).not.toBeInTheDocument()
    })

    it('affiche l avertissement avec des plannings liés', () => {
      render(
        <DeleteEmployeeDialog
          employee={mockEmployeeWithRelations}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(
        screen.getByText(/Attention : Cet employé a des données liées/)
      ).toBeInTheDocument()
      expect(screen.getByText('3 plannings')).toBeInTheDocument()
      expect(screen.getByText('5 demandes de congé')).toBeInTheDocument()
    })

    it('désactive le bouton Supprimer quand l employé a des plannings', () => {
      render(
        <DeleteEmployeeDialog
          employee={mockEmployeeSchedulesOnly}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      const deleteButton = screen.getByText('Supprimer')
      expect(deleteButton.closest('button')).toBeDisabled()
    })

    it('affiche le conseil de désactivation', () => {
      render(
        <DeleteEmployeeDialog
          employee={mockEmployeeWithRelations}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(
        screen.getByText(/Désactivez l'employé plutôt/)
      ).toBeInTheDocument()
    })
  })

  describe('Suppression', () => {
    it('appelle deleteEmployee au clic sur Supprimer', async () => {
      render(
        <DeleteEmployeeDialog
          employee={mockEmployee}
          open={true}
          onOpenChange={vi.fn()}
        />
      )

      fireEvent.click(screen.getByText('Supprimer'))

      await waitFor(() => {
        expect(mockDeleteEmployee).toHaveBeenCalledWith('clemp0000001')
      })
    })

    it('ferme le dialog après suppression réussie', async () => {
      const onOpenChange = vi.fn()
      render(
        <DeleteEmployeeDialog
          employee={mockEmployee}
          open={true}
          onOpenChange={onOpenChange}
        />
      )

      fireEvent.click(screen.getByText('Supprimer'))

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('appelle onSuccess après suppression réussie', async () => {
      const onSuccess = vi.fn()
      render(
        <DeleteEmployeeDialog
          employee={mockEmployee}
          open={true}
          onOpenChange={vi.fn()}
          onSuccess={onSuccess}
        />
      )

      fireEvent.click(screen.getByText('Supprimer'))

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('Pluriel/singulier', () => {
    it('affiche "1 planning" au singulier', () => {
      const employee = {
        ...mockEmployee,
        _count: { schedules: 1, leaveRequests: 0 },
      }
      render(
        <DeleteEmployeeDialog
          employee={employee}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(screen.getByText('1 planning')).toBeInTheDocument()
    })

    it('affiche "1 demande de congé" au singulier', () => {
      const employee = {
        ...mockEmployee,
        _count: { schedules: 0, leaveRequests: 1 },
      }
      render(
        <DeleteEmployeeDialog
          employee={employee}
          open={true}
          onOpenChange={vi.fn()}
        />
      )
      expect(screen.getByText(/1 demande de congé/)).toBeInTheDocument()
    })
  })
})
