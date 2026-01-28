/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { LeaveReviewDialog } from '../LeaveReviewDialog'
import { LeaveType, LeaveRequestStatus } from '@prisma/client'

// Mock server actions
vi.mock('@/lib/actions/leaves', () => ({
  reviewLeaveRequest: vi.fn().mockResolvedValue({ success: true, data: {} }),
}))

const mockMutate = vi.fn().mockResolvedValue({ success: true, data: {} })
vi.mock('@/hooks/use-crud-mutation', () => ({
  useCrudMutation: () => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
    errorField: null,
    reset: vi.fn(),
  }),
}))

vi.mock('@/components/toast/use-toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    toast: vi.fn(),
  }),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRequest: any = {
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
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie@test.com',
    teamId: 'team-1',
  },
}

describe('LeaveReviewDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders employee name and request info when open', () => {
    render(
      <LeaveReviewDialog
        open={true}
        onOpenChange={vi.fn()}
        request={mockRequest}
      />
    )
    expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    expect(screen.getByText(/5 jour/)).toBeInTheDocument()
  })

  it('renders approve and reject buttons', () => {
    render(
      <LeaveReviewDialog
        open={true}
        onOpenChange={vi.fn()}
        request={mockRequest}
      />
    )
    expect(screen.getByText('Approuver')).toBeInTheDocument()
    expect(screen.getByText('Refuser')).toBeInTheDocument()
  })

  it('shows reason when provided', () => {
    render(
      <LeaveReviewDialog
        open={true}
        onOpenChange={vi.fn()}
        request={mockRequest}
      />
    )
    expect(screen.getByText(/Vacances/)).toBeInTheDocument()
  })

  it('calls mutate with APPROVED on approve click', async () => {
    const user = userEvent.setup()
    render(
      <LeaveReviewDialog
        open={true}
        onOpenChange={vi.fn()}
        request={mockRequest}
      />
    )
    await user.click(screen.getByText('Approuver'))
    expect(mockMutate).toHaveBeenCalledWith({
      status: 'APPROVED',
      reviewComment: undefined,
    })
  })

  it('shows error when rejecting without comment', async () => {
    const user = userEvent.setup()
    render(
      <LeaveReviewDialog
        open={true}
        onOpenChange={vi.fn()}
        request={mockRequest}
      />
    )
    await user.click(screen.getByText('Refuser'))
    expect(
      screen.getByText('Un commentaire est obligatoire en cas de refus')
    ).toBeInTheDocument()
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('calls mutate with REJECTED and comment', async () => {
    const user = userEvent.setup()
    render(
      <LeaveReviewDialog
        open={true}
        onOpenChange={vi.fn()}
        request={mockRequest}
      />
    )
    await user.type(
      screen.getByPlaceholderText('Ajouter un commentaire...'),
      'Effectif insuffisant'
    )
    await user.click(screen.getByText('Refuser'))
    expect(mockMutate).toHaveBeenCalledWith({
      status: 'REJECTED',
      reviewComment: 'Effectif insuffisant',
    })
  })
})
