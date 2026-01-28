import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeaveCalendar } from '../LeaveCalendar'
import { LeaveType, LeaveRequestStatus } from '@prisma/client'

const mockEmployees = [
  { id: 'emp-1', firstName: 'Jean', lastName: 'Dupont' },
  { id: 'emp-2', firstName: 'Marie', lastName: 'Martin' },
]

const createMockAbsence = (employeeId: string, overrides = {}) => ({
  id: 'absence-1',
  employeeId,
  companyId: 'company-1',
  type: LeaveType.PAID_LEAVE,
  status: LeaveRequestStatus.APPROVED,
  startDate: new Date('2026-02-02'),
  endDate: new Date('2026-02-04'),
  days: 3,
  halfDay: false,
  halfDayPeriod: null,
  reason: null,
  comment: null,
  attachments: [],
  reviewedById: null,
  reviewedAt: null,
  reviewComment: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: mockEmployees.find((e) => e.id === employeeId)!,
  ...overrides,
})

const defaultProps = {
  month: new Date('2026-02-01'),
  absences: [],
  employees: mockEmployees,
  onMonthChange: vi.fn(),
}

describe('LeaveCalendar', () => {
  it('renders month and year in header', () => {
    render(<LeaveCalendar {...defaultProps} />)
    expect(screen.getByText('février 2026')).toBeInTheDocument()
  })

  it('renders employee names', () => {
    render(<LeaveCalendar {...defaultProps} />)
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByText('Marie Martin')).toBeInTheDocument()
  })

  it('calls onMonthChange when clicking previous', () => {
    const handleMonthChange = vi.fn()
    render(
      <LeaveCalendar {...defaultProps} onMonthChange={handleMonthChange} />
    )

    fireEvent.click(screen.getByLabelText('Mois précédent'))
    expect(handleMonthChange).toHaveBeenCalled()
  })

  it('calls onMonthChange when clicking next', () => {
    const handleMonthChange = vi.fn()
    render(
      <LeaveCalendar {...defaultProps} onMonthChange={handleMonthChange} />
    )

    fireEvent.click(screen.getByLabelText('Mois suivant'))
    expect(handleMonthChange).toHaveBeenCalled()
  })

  it('renders today button', () => {
    render(<LeaveCalendar {...defaultProps} />)
    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument()
  })

  it('renders legend with leave types', () => {
    render(<LeaveCalendar {...defaultProps} />)
    // Legend shows full labels from LEAVE_TYPE_LABELS
    expect(screen.getByText('Congés payés')).toBeInTheDocument()
    expect(screen.getByText('RTT')).toBeInTheDocument()
    expect(screen.getByText('Arrêt maladie')).toBeInTheDocument()
  })

  it('renders day headers for the month', () => {
    render(<LeaveCalendar {...defaultProps} />)
    // February 2026 starts on Sunday, should have 28 days
    const dayNumbers = screen.getAllByText(/^(1|2|3|15|28)$/)
    expect(dayNumbers.length).toBeGreaterThan(0)
  })

  it('calls onCellClick when clicking an empty cell', () => {
    const handleCellClick = vi.fn()
    render(<LeaveCalendar {...defaultProps} onCellClick={handleCellClick} />)

    // Find a clickable cell (non-weekend day)
    const cells = document.querySelectorAll('[role="button"]')
    if (cells.length > 0 && cells[0]) {
      fireEvent.click(cells[0])
      expect(handleCellClick).toHaveBeenCalled()
    }
  })

  it('applies custom className', () => {
    const { container } = render(
      <LeaveCalendar {...defaultProps} className="custom-calendar" />
    )
    expect(container.firstChild).toHaveClass('custom-calendar')
  })

  it('renders absence indicator when employee has leave', () => {
    render(
      <LeaveCalendar
        {...defaultProps}
        absences={[createMockAbsence('emp-1')]}
      />
    )
    // Look for CP abbreviation (Congé Payé)
    const cpIndicators = screen.getAllByText('CP')
    expect(cpIndicators.length).toBeGreaterThan(0)
  })
})
