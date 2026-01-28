import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeaveTypeBadge } from '../LeaveTypeBadge'
import { LEAVE_TYPE_LABELS } from '@/lib/validations/leave'
import { LeaveType } from '@prisma/client'

describe('LeaveTypeBadge', () => {
  it('renders label for each leave type', () => {
    for (const type of Object.values(LeaveType)) {
      const { unmount } = render(<LeaveTypeBadge type={type} />)
      expect(screen.getByText(LEAVE_TYPE_LABELS[type])).toBeInTheDocument()
      unmount()
    }
  })

  it('applies correct color classes', () => {
    render(<LeaveTypeBadge type={LeaveType.PAID_LEAVE} />)
    const badge = screen.getByText('Congés payés')
    expect(badge).toHaveClass('bg-blue-100')
    expect(badge).toHaveClass('text-blue-800')
  })

  it('shows icon by default', () => {
    render(<LeaveTypeBadge type={LeaveType.PAID_LEAVE} />)
    // Badge with icon prop renders a span with aria-hidden
    const iconContainer = document.querySelector('[aria-hidden="true"]')
    expect(iconContainer).toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    render(<LeaveTypeBadge type={LeaveType.PAID_LEAVE} showIcon={false} />)
    const iconContainer = document.querySelector('[aria-hidden="true"]')
    expect(iconContainer).not.toBeInTheDocument()
  })
})
