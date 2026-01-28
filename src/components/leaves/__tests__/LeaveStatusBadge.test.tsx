import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeaveStatusBadge } from '../LeaveStatusBadge'
import { LEAVE_STATUS_LABELS } from '@/lib/validations/leave'
import { LeaveRequestStatus } from '@prisma/client'

describe('LeaveStatusBadge', () => {
  it('renders label for each status', () => {
    for (const status of Object.values(LeaveRequestStatus)) {
      const { unmount } = render(<LeaveStatusBadge status={status} />)
      expect(screen.getByText(LEAVE_STATUS_LABELS[status])).toBeInTheDocument()
      unmount()
    }
  })

  it('applies PENDING color classes', () => {
    render(<LeaveStatusBadge status={LeaveRequestStatus.PENDING} />)
    const badge = screen.getByText('En attente')
    expect(badge).toHaveClass('bg-yellow-100')
    expect(badge).toHaveClass('text-yellow-800')
  })

  it('applies APPROVED color classes', () => {
    render(<LeaveStatusBadge status={LeaveRequestStatus.APPROVED} />)
    const badge = screen.getByText('Approuvé')
    expect(badge).toHaveClass('bg-green-100')
    expect(badge).toHaveClass('text-green-800')
  })

  it('renders icon for each status', () => {
    render(<LeaveStatusBadge status={LeaveRequestStatus.REJECTED} />)
    const iconContainer = document.querySelector('[aria-hidden="true"]')
    expect(iconContainer).toBeInTheDocument()
  })
})
