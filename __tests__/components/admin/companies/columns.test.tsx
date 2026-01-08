/**
 * Tests unitaires pour les colonnes DataTable Companies
 *
 * @description Tests des définitions de colonnes TanStack Table
 *
 * @ticket SP-151
 */

import React, { type ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/components/ui/tooltip'

const setupUser = () => userEvent.setup()

// Wrapper pour les tests avec TooltipProvider
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
)

const renderWithProviders = (ui: React.ReactElement) =>
  render(ui, { wrapper: TestWrapper })

import {
  createCompanyColumns,
  type CompanyActionsProps,
} from '@/components/admin/companies/columns'
import type { CompanyWithCounts } from '@/lib/actions/companies'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'

// Composant de test pour rendre les colonnes
function TestTable({
  data,
  actions,
}: {
  data: CompanyWithCounts[]
  actions?: CompanyActionsProps
}) {
  const columns = createCompanyColumns(actions)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
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
  )
}

const mockCompany: CompanyWithCounts = {
  id: 'company-1',
  name: 'Acme Corp',
  slug: 'acme-corp',
  email: 'contact@acme.com',
  phone: '+33123456789',
  subscriptionPlan: 'BUSINESS',
  subscriptionStatus: 'ACTIVE',
  isActive: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  _count: {
    users: 5,
    teams: 2,
    employees: 10,
  },
}

describe('createCompanyColumns', () => {
  it('should create columns array', () => {
    const columns = createCompanyColumns()

    expect(columns).toBeInstanceOf(Array)
    expect(columns.length).toBeGreaterThan(0)
  })

  it('should include select column', () => {
    const columns = createCompanyColumns()

    expect(columns.find((c) => c.id === 'select')).toBeDefined()
  })

  it('should include name column', () => {
    const columns = createCompanyColumns()

    expect(columns.find((c) => 'accessorKey' in c && c.accessorKey === 'name')).toBeDefined()
  })

  it('should include subscriptionPlan column', () => {
    const columns = createCompanyColumns()

    expect(
      columns.find((c) => 'accessorKey' in c && c.accessorKey === 'subscriptionPlan')
    ).toBeDefined()
  })

  it('should include subscriptionStatus column', () => {
    const columns = createCompanyColumns()

    expect(
      columns.find((c) => 'accessorKey' in c && c.accessorKey === 'subscriptionStatus')
    ).toBeDefined()
  })

  it('should include actions column', () => {
    const columns = createCompanyColumns()

    expect(columns.find((c) => c.id === 'actions')).toBeDefined()
  })
})

describe('Company columns rendering', () => {
  it('should render company name', () => {
    renderWithProviders(<TestTable data={[mockCompany]} />)

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('should render company slug', () => {
    renderWithProviders(<TestTable data={[mockCompany]} />)

    expect(screen.getByText('acme-corp')).toBeInTheDocument()
  })

  it('should render subscription plan badge', () => {
    renderWithProviders(<TestTable data={[mockCompany]} />)

    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  it('should render subscription status badge', () => {
    renderWithProviders(<TestTable data={[mockCompany]} />)

    // "Actif" peut apparaître plusieurs fois (statut d'abonnement et isActive)
    const activeElements = screen.getAllByText('Actif')
    expect(activeElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should render employee count', () => {
    renderWithProviders(<TestTable data={[mockCompany]} />)

    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should render team count', () => {
    renderWithProviders(<TestTable data={[mockCompany]} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should render active status badge for active company', () => {
    renderWithProviders(<TestTable data={[mockCompany]} />)

    // "Actif" appears twice - once for status, once for isActive
    const activeElements = screen.getAllByText('Actif')
    expect(activeElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should render inactive status badge for inactive company', () => {
    const inactiveCompany = { ...mockCompany, isActive: false }
    renderWithProviders(<TestTable data={[inactiveCompany]} />)

    expect(screen.getByText('Inactif')).toBeInTheDocument()
  })

  it('should render actions menu button', () => {
    renderWithProviders(<TestTable data={[mockCompany]} />)

    expect(screen.getByRole('button', { name: /menu actions/i })).toBeInTheDocument()
  })
})

describe('Company columns actions', () => {
  it('should call onView when view action is clicked', async () => {
    const onView = vi.fn()
    const user = setupUser()

    renderWithProviders(<TestTable data={[mockCompany]} actions={{ onView }} />)

    // Ouvrir le menu
    await user.click(screen.getByRole('button', { name: /menu actions/i }))

    // Cliquer sur "Voir détails"
    await user.click(screen.getByText('Voir détails'))

    expect(onView).toHaveBeenCalledWith(mockCompany)
  })

  it('should call onEdit when edit action is clicked', async () => {
    const onEdit = vi.fn()
    const user = setupUser()

    renderWithProviders(<TestTable data={[mockCompany]} actions={{ onEdit }} />)

    await user.click(screen.getByRole('button', { name: /menu actions/i }))
    await user.click(screen.getByText('Modifier'))

    expect(onEdit).toHaveBeenCalledWith(mockCompany)
  })

  it('should call onDelete when delete action is clicked', async () => {
    const onDelete = vi.fn()
    const user = setupUser()

    renderWithProviders(<TestTable data={[mockCompany]} actions={{ onDelete }} />)

    await user.click(screen.getByRole('button', { name: /menu actions/i }))
    await user.click(screen.getByText('Supprimer'))

    expect(onDelete).toHaveBeenCalledWith(mockCompany)
  })

  it('should call onToggleStatus when toggle action is clicked', async () => {
    const onToggleStatus = vi.fn()
    const user = setupUser()

    renderWithProviders(<TestTable data={[mockCompany]} actions={{ onToggleStatus }} />)

    await user.click(screen.getByRole('button', { name: /menu actions/i }))
    await user.click(screen.getByText('Désactiver'))

    expect(onToggleStatus).toHaveBeenCalledWith(mockCompany)
  })

  it('should show "Activer" for inactive company', async () => {
    const onToggleStatus = vi.fn()
    const inactiveCompany = { ...mockCompany, isActive: false }
    const user = setupUser()

    renderWithProviders(<TestTable data={[inactiveCompany]} actions={{ onToggleStatus }} />)

    await user.click(screen.getByRole('button', { name: /menu actions/i }))

    expect(screen.getByText('Activer')).toBeInTheDocument()
  })
})
