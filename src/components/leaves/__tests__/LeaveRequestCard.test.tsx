/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { LeaveRequestCard } from '../LeaveRequestCard'
import { LeaveType, LeaveRequestStatus } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeRequest = (overrides: Record<string, unknown> = {}): any => ({
  id: 'req-1',
  type: LeaveType.PAID_LEAVE,
  status: LeaveRequestStatus.PENDING,
  startDate: new Date('2026-03-10'),
  endDate: new Date('2026-03-14'),
  days: 5,
  halfDay: false,
  halfDayPeriod: null,
  reason: 'Vacances',
  comment: null,
  attachments: [],
  employeeId: 'emp-1',
  companyId: 'comp-1',
  reviewedById: null,
  reviewedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'emp-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@test.com',
    teamId: 'team-1',
  },
  ...overrides,
})

describe('LeaveRequestCard', () => {
  it('renders employee name', () => {
    render(
      <LeaveRequestCard
        request={makeRequest()}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-1"
      />
    )
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
  })

  it('renders dates in FR format', () => {
    render(
      <LeaveRequestCard
        request={makeRequest()}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-1"
      />
    )
    // French date format
    expect(screen.getByText(/10 mars 2026/)).toBeInTheDocument()
  })

  it('renders days count', () => {
    render(
      <LeaveRequestCard
        request={makeRequest()}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-1"
      />
    )
    expect(screen.getByText(/5 jours/)).toBeInTheDocument()
  })

  it('shows half-day indicator', () => {
    render(
      <LeaveRequestCard
        request={makeRequest({ halfDay: true, days: 0.5 })}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-1"
      />
    )
    expect(screen.getByText(/demi-journée/)).toBeInTheDocument()
  })

  it('shows reason when provided', () => {
    render(
      <LeaveRequestCard
        request={makeRequest()}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-1"
      />
    )
    expect(screen.getByText('Vacances')).toBeInTheDocument()
  })

  it('shows edit/cancel buttons for owner with PENDING status', () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    render(
      <LeaveRequestCard
        request={makeRequest()}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-1"
        onEdit={onEdit}
        onCancel={onCancel}
      />
    )
    expect(screen.getByText('Modifier')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })

  it('hides edit/cancel for non-owner', () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    render(
      <LeaveRequestCard
        request={makeRequest()}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-other"
        onEdit={onEdit}
        onCancel={onCancel}
      />
    )
    expect(screen.queryByText('Modifier')).not.toBeInTheDocument()
    expect(screen.queryByText('Annuler')).not.toBeInTheDocument()
  })

  it('shows review button for MANAGER with PENDING status', () => {
    const onReview = vi.fn()
    render(
      <LeaveRequestCard
        request={makeRequest()}
        currentUserRole="MANAGER"
        currentUserId="mgr-1"
        onReview={onReview}
      />
    )
    expect(screen.getByText('Examiner')).toBeInTheDocument()
  })

  it('hides all actions for CANCELLED requests', () => {
    render(
      <LeaveRequestCard
        request={makeRequest({ status: LeaveRequestStatus.CANCELLED })}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-1"
        onEdit={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.queryByText('Modifier')).not.toBeInTheDocument()
    expect(screen.queryByText('Annuler')).not.toBeInTheDocument()
  })

  it('calls onEdit with request id', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <LeaveRequestCard
        request={makeRequest()}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-1"
        onEdit={onEdit}
      />
    )
    await user.click(screen.getByText('Modifier'))
    expect(onEdit).toHaveBeenCalledWith('req-1')
  })

  it('calls onCancel with request id', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <LeaveRequestCard
        request={makeRequest()}
        currentUserRole="EMPLOYEE"
        currentUserId="emp-1"
        onCancel={onCancel}
      />
    )
    await user.click(screen.getByText('Annuler'))
    expect(onCancel).toHaveBeenCalledWith('req-1')
  })
})
