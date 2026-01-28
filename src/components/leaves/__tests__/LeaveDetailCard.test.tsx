/**
 * Tests pour LeaveDetailCard
 *
 * @ticket SP-414
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeaveDetailCard } from '../LeaveDetailCard'
import { LeaveType, LeaveRequestStatus } from '@prisma/client'

const createMockRequest = (overrides = {}) => ({
  id: 'leave-1',
  employeeId: 'emp-1',
  companyId: 'company-1',
  type: LeaveType.PAID_LEAVE,
  status: LeaveRequestStatus.PENDING,
  startDate: new Date('2026-02-10'),
  endDate: new Date('2026-02-14'),
  days: 5,
  halfDay: false,
  halfDayPeriod: null,
  reason: 'Vacances familiales',
  comment: null,
  attachments: [],
  reviewedById: null,
  reviewedAt: null,
  reviewComment: null,
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

describe('LeaveDetailCard', () => {
  describe('Rendering', () => {
    it('renders card title', () => {
      render(<LeaveDetailCard request={createMockRequest()} />)

      expect(screen.getByText('Détails de la demande')).toBeInTheDocument()
    })

    it('renders leave type badge', () => {
      render(<LeaveDetailCard request={createMockRequest()} />)

      expect(screen.getByText('Congés payés')).toBeInTheDocument()
    })

    it('renders start and end dates', () => {
      render(<LeaveDetailCard request={createMockRequest()} />)

      expect(screen.getByText('Date de début')).toBeInTheDocument()
      expect(screen.getByText('Date de fin')).toBeInTheDocument()
    })

    it('renders duration in days', () => {
      render(<LeaveDetailCard request={createMockRequest()} />)

      expect(screen.getByText('Durée totale')).toBeInTheDocument()
      expect(screen.getByText('5 jours')).toBeInTheDocument()
    })

    it('renders reason when provided', () => {
      render(<LeaveDetailCard request={createMockRequest()} />)

      expect(screen.getByText('Motif')).toBeInTheDocument()
      expect(screen.getByText('Vacances familiales')).toBeInTheDocument()
    })

    it('does not render reason section when reason is empty', () => {
      render(<LeaveDetailCard request={createMockRequest({ reason: null })} />)

      expect(screen.queryByText('Motif')).not.toBeInTheDocument()
    })
  })

  describe('Half Day Handling', () => {
    it('displays PM badge when half day afternoon', () => {
      render(
        <LeaveDetailCard
          request={createMockRequest({
            halfDay: true,
            halfDayPeriod: 'PM',
            days: 0.5,
          })}
        />
      )

      expect(screen.getByText('Après-midi')).toBeInTheDocument()
    })

    it('displays AM badge when half day morning', () => {
      render(
        <LeaveDetailCard
          request={createMockRequest({
            halfDay: true,
            halfDayPeriod: 'AM',
            days: 0.5,
          })}
        />
      )

      expect(screen.getByText('Matin')).toBeInTheDocument()
    })

    it('shows half symbol in duration for half day', () => {
      render(
        <LeaveDetailCard
          request={createMockRequest({
            halfDay: true,
            halfDayPeriod: 'AM',
            days: 1,
          })}
        />
      )

      expect(screen.getByText(/1 jour ½/)).toBeInTheDocument()
    })
  })

  describe('Leave Types', () => {
    it('renders RTT type correctly', () => {
      render(
        <LeaveDetailCard request={createMockRequest({ type: LeaveType.RTT })} />
      )

      expect(screen.getByText('RTT')).toBeInTheDocument()
    })

    it('renders sick leave type correctly', () => {
      render(
        <LeaveDetailCard
          request={createMockRequest({ type: LeaveType.SICK_LEAVE })}
        />
      )

      expect(screen.getByText('Arrêt maladie')).toBeInTheDocument()
    })
  })
})
