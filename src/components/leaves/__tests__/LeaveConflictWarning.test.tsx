import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeaveConflictWarning } from '../LeaveConflictWarning'

describe('LeaveConflictWarning', () => {
  it('renders nothing when percentage is 50 or below', () => {
    const { container } = render(
      <LeaveConflictWarning conflictPercentage={50} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when percentage is 0', () => {
    const { container } = render(
      <LeaveConflictWarning conflictPercentage={0} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders warning when percentage exceeds 50', () => {
    render(<LeaveConflictWarning conflictPercentage={75} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/75%/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<LeaveConflictWarning conflictPercentage={60} className="mt-4" />)
    expect(screen.getByRole('alert')).toHaveClass('mt-4')
  })
})
