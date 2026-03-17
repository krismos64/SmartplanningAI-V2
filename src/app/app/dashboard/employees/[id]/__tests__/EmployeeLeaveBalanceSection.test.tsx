import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { EmployeeLeaveBalanceSection } from '../_components/EmployeeLeaveBalanceSection'
import type { LeaveBalance } from '@prisma/client'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

// Mock framer-motion for ProgressBar
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}))

vi.mock('@/lib/animations', () => ({
  useReducedMotion: () => false,
}))

// Mock LeaveBalanceEditDialog
vi.mock('@/components/leaves/LeaveBalanceEditDialog', () => ({
  LeaveBalanceEditDialog: ({
    open,
    onOpenChange,
  }: {
    open: boolean
    onOpenChange: (open: boolean) => void
  }) =>
    open ? (
      <div data-testid="edit-dialog">
        <button onClick={() => onOpenChange(false)}>Fermer</button>
      </div>
    ) : null,
}))

const mockBalance: LeaveBalance = {
  id: 'bal-1',
  employeeId: 'emp-1',
  companyId: 'comp-1',
  year: 2026,
  paidLeaveTotal: 25,
  paidLeaveUsed: 10,
  rttTotal: 10,
  rttUsed: 3,
  updatedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('EmployeeLeaveBalanceSection', () => {
  it('affiche les données du solde CP et RTT', () => {
    render(
      <EmployeeLeaveBalanceSection balance={mockBalance} canEdit={false} />
    )
    expect(screen.getByText('Congés payés')).toBeInTheDocument()
    expect(screen.getByText('15 / 25 jours')).toBeInTheDocument()
    expect(screen.getByText('RTT')).toBeInTheDocument()
    expect(screen.getByText('7 / 10 jours')).toBeInTheDocument()
  })

  it('affiche le bouton modifier si canEdit=true', () => {
    render(<EmployeeLeaveBalanceSection balance={mockBalance} canEdit={true} />)
    expect(
      screen.getByRole('button', { name: /modifier les soldes/i })
    ).toBeInTheDocument()
  })

  it('masque le bouton modifier si canEdit=false', () => {
    render(
      <EmployeeLeaveBalanceSection balance={mockBalance} canEdit={false} />
    )
    expect(
      screen.queryByRole('button', { name: /modifier/i })
    ).not.toBeInTheDocument()
  })

  it('ouvre le dialog au clic sur modifier', async () => {
    const user = userEvent.setup()
    render(<EmployeeLeaveBalanceSection balance={mockBalance} canEdit={true} />)
    expect(screen.queryByTestId('edit-dialog')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /modifier les soldes/i })
    )
    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument()
  })
})
