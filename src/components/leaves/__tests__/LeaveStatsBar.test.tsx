import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeaveStatsBar } from '../LeaveStatsBar'
import { LeaveRequestStatus } from '@prisma/client'

const mockStats = {
  pending: 5,
  approved: 12,
  rejected: 2,
  cancelled: 1,
}

describe('LeaveStatsBar', () => {
  it('renders all status counts', () => {
    render(<LeaveStatsBar stats={mockStats} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders status labels', () => {
    render(<LeaveStatsBar stats={mockStats} />)
    expect(screen.getByText('En attente')).toBeInTheDocument()
    expect(screen.getByText('Approuvés')).toBeInTheDocument()
    expect(screen.getByText('Refusés')).toBeInTheDocument()
    expect(screen.getByText('Annulés')).toBeInTheDocument()
  })

  it('calls onStatClick with correct status', () => {
    const handleClick = vi.fn()
    render(<LeaveStatsBar stats={mockStats} onStatClick={handleClick} />)

    fireEvent.click(screen.getByText('En attente'))
    expect(handleClick).toHaveBeenCalledWith(LeaveRequestStatus.PENDING)

    fireEvent.click(screen.getByText('Approuvés'))
    expect(handleClick).toHaveBeenCalledWith(LeaveRequestStatus.APPROVED)
  })

  it('highlights active status with ring class', () => {
    render(
      <LeaveStatsBar
        stats={mockStats}
        activeStatus={LeaveRequestStatus.PENDING}
      />
    )
    const pendingButton = screen.getByLabelText('En attente: 5')
    expect(pendingButton).toHaveClass('ring-2')
  })

  it('has proper aria-pressed state for active status', () => {
    render(
      <LeaveStatsBar
        stats={mockStats}
        activeStatus={LeaveRequestStatus.APPROVED}
      />
    )
    const approvedButton = screen.getByLabelText('Approuvés: 12')
    expect(approvedButton).toHaveAttribute('aria-pressed', 'true')

    const pendingButton = screen.getByLabelText('En attente: 5')
    expect(pendingButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('applies custom className', () => {
    render(<LeaveStatsBar stats={mockStats} className="custom-class" />)
    const container = screen.getByRole('group')
    expect(container).toHaveClass('custom-class')
  })
})
