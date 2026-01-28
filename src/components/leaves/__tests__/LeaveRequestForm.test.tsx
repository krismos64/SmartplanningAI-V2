import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { LeaveRequestForm } from '../LeaveRequestForm'

// Mock server actions
vi.mock('@/lib/actions/leaves', () => ({
  createLeaveRequest: vi.fn().mockResolvedValue({ success: true, data: {} }),
  updateLeaveRequest: vi.fn().mockResolvedValue({ success: true, data: {} }),
  checkLeaveConflicts: vi.fn().mockResolvedValue({
    success: true,
    data: { hasConflict: false, percentAbsent: 0, absentEmployees: [] },
  }),
}))

// Mock useCrudMutation
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

// Mock toast
vi.mock('@/components/toast/use-toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    toast: vi.fn(),
  }),
}))

describe('LeaveRequestForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders in create mode', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    expect(screen.getByText('Type de congé')).toBeInTheDocument()
    expect(screen.getByText('Créer la demande')).toBeInTheDocument()
  })

  it('renders in edit mode', () => {
    render(
      <LeaveRequestForm mode="edit" employeeId="emp-1" requestId="req-1" />
    )
    expect(screen.getByText('Modifier la demande')).toBeInTheDocument()
  })

  it('renders type select with options', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    expect(screen.getByText('Type de congé')).toBeInTheDocument()
  })

  it('renders date picker', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Sélectionner les dates')).toBeInTheDocument()
  })

  it('renders half-day toggle', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    expect(screen.getByText('Demi-journée')).toBeInTheDocument()
  })

  it('renders reason textarea', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    expect(screen.getByText('Motif (optionnel)')).toBeInTheDocument()
  })

  it('shows cancel button when onCancel is provided', () => {
    const onCancel = vi.fn()
    render(
      <LeaveRequestForm mode="create" employeeId="emp-1" onCancel={onCancel} />
    )
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <LeaveRequestForm mode="create" employeeId="emp-1" onCancel={onCancel} />
    )
    await user.click(screen.getByText('Annuler'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('renders with default values', () => {
    render(
      <LeaveRequestForm
        mode="edit"
        employeeId="emp-1"
        requestId="req-1"
        defaultValues={{
          reason: 'Vacances été',
        }}
      />
    )
    expect(screen.getByDisplayValue('Vacances été')).toBeInTheDocument()
  })

  it('shows halfDayPeriod select when halfDay is toggled', async () => {
    const user = userEvent.setup()
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    const switchEl = screen.getByRole('switch')
    await user.click(switchEl)
    await waitFor(() => {
      expect(screen.getByText('Période')).toBeInTheDocument()
    })
  })

  it('does not show halfDayPeriod select initially', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    expect(screen.queryByText('Période')).not.toBeInTheDocument()
  })

  it('hides cancel button when onCancel is not provided', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    // Only the submit button should exist
    const buttons = screen.getAllByRole('button')
    const cancelButton = buttons.find((b) => b.textContent === 'Annuler')
    expect(cancelButton).toBeUndefined()
  })

  it('submit button is not disabled initially', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    expect(screen.getByText('Créer la demande')).not.toBeDisabled()
  })

  it('renders reason field as optional', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    expect(
      screen.getByPlaceholderText('Raison de la demande...')
    ).toBeInTheDocument()
  })

  it('renders the form with proper structure', () => {
    render(<LeaveRequestForm mode="create" employeeId="emp-1" />)
    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()
  })
})
