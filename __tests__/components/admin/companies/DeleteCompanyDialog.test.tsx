/**
 * Tests unitaires pour DeleteCompanyDialog
 *
 * @description Tests du dialog de confirmation de suppression
 *
 * @ticket SP-151
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const setupUser = () => userEvent.setup()

// Mock useDeleteMutation avant l'import du composant
vi.mock('@/hooks/use-crud-mutation', () => ({
  useDeleteMutation: vi.fn().mockReturnValue({
    mutate: vi.fn().mockResolvedValue({ success: true }),
    isPending: false,
  }),
}))

// Mock les server actions pour éviter les imports next-auth
vi.mock('@/lib/actions/companies', () => ({
  deleteCompany: vi.fn(),
}))

import { DeleteCompanyDialog } from '@/components/admin/companies/DeleteCompanyDialog'

// Type local pour éviter l'import de companies
interface CompanyWithCounts {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  subscriptionPlan: string
  subscriptionStatus: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    users: number
    teams: number
    employees: number
  }
}

describe('DeleteCompanyDialog', () => {
  const mockCompany: CompanyWithCounts = {
    id: 'company-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    email: 'contact@acme.com',
    phone: '+33123456789',
    subscriptionPlan: 'BUSINESS',
    subscriptionStatus: 'ACTIVE',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    _count: {
      users: 5,
      teams: 2,
      employees: 10,
    },
  }

  const defaultProps = {
    company: mockCompany,
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  }

  it('should render dialog when open is true', () => {
    render(<DeleteCompanyDialog {...defaultProps} />)

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('should not render when company is null', () => {
    render(<DeleteCompanyDialog {...defaultProps} company={null} />)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('should display company name in dialog', () => {
    render(<DeleteCompanyDialog {...defaultProps} />)

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('should display warning about related data when company has relations', () => {
    render(<DeleteCompanyDialog {...defaultProps} />)

    expect(screen.getByText(/5 utilisateurs/i)).toBeInTheDocument()
    expect(screen.getByText(/2 équipes/i)).toBeInTheDocument()
    expect(screen.getByText(/10 employés/i)).toBeInTheDocument()
  })

  it('should not display warning when company has no relations', () => {
    const companyWithNoRelations: CompanyWithCounts = {
      ...mockCompany,
      _count: { users: 0, teams: 0, employees: 0 },
    }

    render(<DeleteCompanyDialog {...defaultProps} company={companyWithNoRelations} />)

    expect(screen.queryByText(/utilisateurs/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/équipes/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/employés/i)).not.toBeInTheDocument()
  })

  it('should render cancel button', () => {
    render(<DeleteCompanyDialog {...defaultProps} />)

    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
  })

  it('should render delete button', () => {
    render(<DeleteCompanyDialog {...defaultProps} />)

    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
  })

  it('should call onOpenChange when cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    const user = setupUser()

    render(<DeleteCompanyDialog {...defaultProps} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: /annuler/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should display irreversible action warning', () => {
    render(<DeleteCompanyDialog {...defaultProps} />)

    expect(screen.getByText(/irréversible/i)).toBeInTheDocument()
  })

  it('should display alert icon', () => {
    render(<DeleteCompanyDialog {...defaultProps} />)

    expect(screen.getByText(/supprimer l'entreprise/i)).toBeInTheDocument()
  })
})
