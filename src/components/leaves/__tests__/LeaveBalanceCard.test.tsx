import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { LeaveBalanceCard } from '../LeaveBalanceCard'
import type { LeaveBalance } from '@prisma/client'

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

const mockBalance: LeaveBalance = {
  id: 'bal-1',
  employeeId: 'emp-1',
  companyId: 'comp-1',
  year: 2026,
  paidLeaveTotal: 25,
  paidLeaveUsed: 10,
  rttTotal: 10,
  rttUsed: 8,
  updatedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('LeaveBalanceCard', () => {
  it('renders CP section with remaining days', () => {
    render(<LeaveBalanceCard balance={mockBalance} />)
    expect(screen.getByText('Congés payés')).toBeInTheDocument()
    expect(screen.getByText('15 / 25 jours')).toBeInTheDocument()
  })

  it('renders RTT section with remaining days', () => {
    render(<LeaveBalanceCard balance={mockBalance} />)
    expect(screen.getByText('RTT')).toBeInTheDocument()
    expect(screen.getByText('2 / 10 jours')).toBeInTheDocument()
  })

  it('renders progress bars', () => {
    render(<LeaveBalanceCard balance={mockBalance} />)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars).toHaveLength(2)
  })

  it('shows edit button when showEdit is true', () => {
    const onEdit = vi.fn()
    render(<LeaveBalanceCard balance={mockBalance} showEdit onEdit={onEdit} />)
    expect(
      screen.getByRole('button', { name: /modifier les soldes/i })
    ).toBeInTheDocument()
  })

  it('hides edit button by default', () => {
    render(<LeaveBalanceCard balance={mockBalance} />)
    expect(
      screen.queryByRole('button', { name: /modifier/i })
    ).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<LeaveBalanceCard balance={mockBalance} showEdit onEdit={onEdit} />)
    await user.click(
      screen.getByRole('button', { name: /modifier les soldes/i })
    )
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
