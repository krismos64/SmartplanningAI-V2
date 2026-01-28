/**
 * Tests pour LeaveTimeline
 *
 * @ticket SP-414
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeaveTimeline, type TimelineEvent } from '../LeaveTimeline'

const createMockEvents = (): TimelineEvent[] => [
  {
    type: 'created',
    date: new Date('2026-01-15T10:00:00'),
    actor: { name: 'Jean Dupont' },
  },
  {
    type: 'approved',
    date: new Date('2026-01-16T14:30:00'),
    actor: { name: 'Marie Martin' },
    comment: 'Approuvé, bon voyage !',
  },
]

describe('LeaveTimeline', () => {
  describe('Rendering', () => {
    it('renders empty state when no events', () => {
      render(<LeaveTimeline events={[]} />)

      expect(screen.getByText('Aucun événement')).toBeInTheDocument()
    })

    it('renders timeline events', () => {
      render(<LeaveTimeline events={createMockEvents()} />)

      expect(screen.getByText('Demande créée')).toBeInTheDocument()
      expect(screen.getByText('Demande approuvée')).toBeInTheDocument()
    })

    it('renders actor names', () => {
      render(<LeaveTimeline events={createMockEvents()} />)

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    })

    it('renders comment when provided', () => {
      render(<LeaveTimeline events={createMockEvents()} />)

      expect(screen.getByText('Approuvé, bon voyage !')).toBeInTheDocument()
    })

    it('renders actor initials in avatar', () => {
      render(<LeaveTimeline events={createMockEvents()} />)

      // Jean Dupont -> JD
      expect(screen.getByText('JD')).toBeInTheDocument()
      // Marie Martin -> MM
      expect(screen.getByText('MM')).toBeInTheDocument()
    })
  })

  describe('Event Types', () => {
    it('renders rejected event correctly', () => {
      const events: TimelineEvent[] = [
        {
          type: 'rejected',
          date: new Date('2026-01-16T14:30:00'),
          actor: { name: 'Manager Test' },
          comment: 'Période non disponible',
        },
      ]
      render(<LeaveTimeline events={events} />)

      expect(screen.getByText('Demande refusée')).toBeInTheDocument()
      expect(screen.getByText('Période non disponible')).toBeInTheDocument()
    })

    it('renders cancelled event correctly', () => {
      const events: TimelineEvent[] = [
        {
          type: 'cancelled',
          date: new Date('2026-01-16T14:30:00'),
          actor: { name: 'Jean Dupont' },
        },
      ]
      render(<LeaveTimeline events={events} />)

      expect(screen.getByText('Demande annulée')).toBeInTheDocument()
    })
  })

  describe('Relative Time', () => {
    it('renders relative time for events', () => {
      const recentEvent: TimelineEvent[] = [
        {
          type: 'created',
          date: new Date(), // Now
          actor: { name: 'Test User' },
        },
      ]
      render(<LeaveTimeline events={recentEvent} />)

      // Should show "il y a moins d'une minute" or similar
      expect(
        screen.getByText(/il y a|moins d'une minute|à l'instant/i)
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('applies custom className when provided', () => {
      const { container } = render(
        <LeaveTimeline events={createMockEvents()} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
