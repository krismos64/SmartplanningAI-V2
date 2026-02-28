/**
 * Tests unitaires pour les colonnes DataTable Employees
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  createEmployeeColumns,
  type EmployeeActionsProps,
} from '@/components/admin/employees/columns'
import type { EmployeeWithCounts } from '@/lib/validations/employee'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { TooltipProvider } from '@/components/ui/tooltip'

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
  email: null,
  hireDate: null,
  team: null,
  teamId: null,
  user: {
    id: 'clusr0000002',
    name: 'Marie Martin',
    email: 'marie@company.com',
    image: 'https://example.com/avatar.jpg',
  },
}

// ============================================================================
// Composant utilitaire pour tester les colonnes
// ============================================================================

function ColumnsTestTable({
  data,
  actions = {},
}: {
  data: EmployeeWithCounts[]
  actions?: EmployeeActionsProps
}) {
  const columns = createEmployeeColumns(actions)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <TooltipProvider>
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </TooltipProvider>
  )
}

// ============================================================================
// Tests
// ============================================================================

describe('createEmployeeColumns', () => {
  describe('Structure', () => {
    it('retourne les 9 colonnes', () => {
      const columns = createEmployeeColumns()
      expect(columns).toHaveLength(9)
    })
  })

  describe('Rendu des cellules', () => {
    it('affiche le nom complet', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('affiche l email', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(screen.getByText('jean@test.com')).toBeInTheDocument()
    })

    it('affiche l email du user quand pas d email employee', () => {
      render(<ColumnsTestTable data={[mockEmployeeInactive]} />)
      expect(screen.getByText('marie@company.com')).toBeInTheDocument()
    })

    it('affiche le tiret quand pas d email du tout', () => {
      const noEmail = {
        ...mockEmployeeInactive,
        user: { ...mockEmployeeInactive.user!, email: null },
      }
      render(<ColumnsTestTable data={[noEmail as EmployeeWithCounts]} />)
      // Le tiret est rendu dans un span muted
      const dashes = screen.getAllByText('-')
      expect(dashes.length).toBeGreaterThanOrEqual(1)
    })

    it('affiche le nom de l equipe', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(screen.getByText('Équipe Frontend')).toBeInTheDocument()
    })

    it('affiche le telephone', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(screen.getByText('0612345678')).toBeInTheDocument()
    })

    it('affiche les heures hebdomadaires', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(screen.getByText('35h')).toBeInTheDocument()
    })

    it('affiche la date d embauche formatee', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(screen.getByText('15 mars 2024')).toBeInTheDocument()
    })

    it('affiche le badge Actif', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(screen.getByText('Actif')).toBeInTheDocument()
    })

    it('affiche le badge Inactif', () => {
      render(<ColumnsTestTable data={[mockEmployeeInactive]} />)
      expect(screen.getByText('Inactif')).toBeInTheDocument()
    })

    it('affiche l avatar image quand disponible', () => {
      render(<ColumnsTestTable data={[mockEmployeeInactive]} />)
      const img = screen.getByRole('img', { name: 'Marie Martin' })
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })
  })

  describe('Headers', () => {
    it('affiche les headers des colonnes', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(screen.getByText('Employé')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Équipe')).toBeInTheDocument()
      expect(screen.getByText('Téléphone')).toBeInTheDocument()
      expect(screen.getByText('Heures/sem')).toBeInTheDocument()
      expect(screen.getByText('Embauché')).toBeInTheDocument()
      expect(screen.getByText('Statut')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('affiche la checkbox globale "Tout sélectionner"', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(
        screen.getByRole('checkbox', { name: 'Tout sélectionner' })
      ).toBeInTheDocument()
    })

    it('affiche la checkbox de ligne', () => {
      render(<ColumnsTestTable data={[mockEmployee]} />)
      expect(
        screen.getByRole('checkbox', { name: 'Sélectionner la ligne' })
      ).toBeInTheDocument()
    })
  })

  describe('Menu actions', () => {
    it('affiche le bouton menu', () => {
      render(
        <ColumnsTestTable
          data={[mockEmployee]}
          actions={{ onView: vi.fn() }}
        />
      )
      expect(screen.getByText('Menu actions')).toBeInTheDocument()
    })
  })
})
