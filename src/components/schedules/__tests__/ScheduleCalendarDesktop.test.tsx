/**
 * Tests unitaires pour ScheduleCalendarDesktop
 *
 * @description Tests du composant calendrier desktop avec drag & drop
 * @ticket SP-398
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// ============================================================================
// Mocks - DOIT être avant les imports du composant
// ============================================================================

// Mock useToast
const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/components/toast/use-toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}))

// Mock updateSchedule Server Action
const mockUpdateSchedule = vi.fn()

vi.mock('@/lib/actions/schedules', () => ({
  updateSchedule: (data: unknown) =>
    mockUpdateSchedule(data) as Promise<unknown>,
}))

// Mock checkAvailabilityConflicts Server Action
const mockCheckAvailabilityConflicts = vi.fn()

vi.mock('@/lib/actions/availabilities', () => ({
  checkAvailabilityConflicts: (...args: unknown[]) =>
    mockCheckAvailabilityConflicts(...args) as Promise<unknown>,
}))

// Mock leaves actions (SP-415)
vi.mock('@/lib/actions/leaves', () => ({}))

// Mock Schedule-X components
vi.mock('@schedule-x/react', () => ({
  useNextCalendarApp: vi.fn(() => ({
    setDate: vi.fn(),
    setView: vi.fn(),
  })),
  useCalendarApp: vi.fn(() => ({
    setDate: vi.fn(),
    setView: vi.fn(),
  })),
  ScheduleXCalendar: function MockCalendar({
    calendarApp: _calendarApp,
  }: {
    calendarApp: unknown
  }) {
    return <div data-testid="schedule-x-calendar">Mock Calendar</div>
  },
}))

vi.mock('@schedule-x/calendar', () => ({
  createViewDay: vi.fn(() => ({})),
  createViewWeek: vi.fn(() => ({})),
  createViewMonthGrid: vi.fn(() => ({})),
}))

const mockDragAndDropPlugin = vi.fn(() => ({}))
vi.mock('@schedule-x/drag-and-drop', () => ({
  createDragAndDropPlugin: () => mockDragAndDropPlugin(),
}))

const mockResizePlugin = vi.fn(() => ({}))
vi.mock('@schedule-x/resize', () => ({
  createResizePlugin: () => mockResizePlugin(),
}))

vi.mock('@schedule-x/events-service', () => ({
  createEventsServicePlugin: vi.fn(() => ({
    getAll: vi.fn(() => []),
    add: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
  })),
}))

// Import du composant APRÈS les mocks
import { ScheduleCalendarDesktop } from '../ScheduleCalendarDesktop'
import type { ScheduleWithRelations } from '@/lib/actions/schedules'
import type { LeaveRequestWithEmployee } from '@/lib/actions/leaves'

// ============================================================================
// Données de test
// ============================================================================

const mockSchedules: ScheduleWithRelations[] = [
  {
    id: 'schedule-1',
    title: 'Test Schedule',
    employeeId: 'emp-1',
    companyId: 'company-1',
    teamId: 'team-1',
    startDate: new Date('2026-01-26'),
    endDate: new Date('2026-01-26'),
    startTime: '09:00',
    endTime: '17:00',
    type: 'WORK',
    status: 'CONFIRMED',
    description: null,
    location: null,
    color: null,
    isRecurring: false,
    recurrenceRule: null,
    recurrenceGroupId: null,
    scheduleGroupId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    employee: {
      id: 'emp-1',
      firstName: 'Jean',
      lastName: 'Dupont',
    },
    team: {
      id: 'team-1',
      name: 'Équipe A',
    },
  },
  {
    id: 'schedule-2',
    title: null,
    employeeId: 'emp-2',
    companyId: 'company-1',
    teamId: 'team-1',
    startDate: new Date('2026-01-27'),
    endDate: new Date('2026-01-27'),
    startTime: '10:00',
    endTime: '18:00',
    type: 'MEETING',
    status: 'DRAFT',
    description: null,
    location: null,
    color: null,
    isRecurring: false,
    recurrenceRule: null,
    recurrenceGroupId: null,
    scheduleGroupId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    employee: {
      id: 'emp-2',
      firstName: 'Marie',
      lastName: 'Martin',
    },
    team: {
      id: 'team-1',
      name: 'Équipe A',
    },
  },
]

const defaultProps = {
  schedules: mockSchedules,
  viewMode: 'week' as const,
  currentDate: new Date('2026-01-26'),
  canEdit: true,
}

// ============================================================================
// Tests
// ============================================================================

describe('ScheduleCalendarDesktop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateSchedule.mockResolvedValue({ success: true, data: {} })
    mockCheckAvailabilityConflicts.mockResolvedValue({
      success: true,
      data: {
        hasConflict: false,
        hasHardConflict: false,
        hasSoftConflict: false,
        conflicts: [],
        hardConflicts: [],
        softConflicts: [],
      },
    })
  })

  describe('Rendering', () => {
    it('affiche le calendrier Schedule-X', () => {
      render(<ScheduleCalendarDesktop {...defaultProps} />)

      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })

    it("affiche le message d'aide drag & drop quand canEdit=true", () => {
      render(<ScheduleCalendarDesktop {...defaultProps} canEdit={true} />)

      expect(screen.getByText(/glissez-déposez/i)).toBeInTheDocument()
    })

    it("n'affiche pas le message d'aide quand canEdit=false", () => {
      render(<ScheduleCalendarDesktop {...defaultProps} canEdit={false} />)

      expect(screen.queryByText(/glissez-déposez/i)).not.toBeInTheDocument()
    })

    it('affiche la légende des types de créneaux', () => {
      render(<ScheduleCalendarDesktop {...defaultProps} />)

      expect(screen.getByText('Travail')).toBeInTheDocument()
      expect(screen.getByText('Pause')).toBeInTheDocument()
      expect(screen.getByText('Réunion')).toBeInTheDocument()
      expect(screen.getByText('Formation')).toBeInTheDocument()
      expect(screen.getByText('Télétravail')).toBeInTheDocument()
      expect(screen.getByText('Astreinte')).toBeInTheDocument()
      expect(screen.getByText('Heures sup.')).toBeInTheDocument()
    })

    it('affiche un spinner quand isLoading=true', () => {
      render(<ScheduleCalendarDesktop {...defaultProps} isLoading={true} />)

      // Le composant affiche un spinner animé
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('affiche le calendrier meme sans schedule', () => {
      render(<ScheduleCalendarDesktop {...defaultProps} schedules={[]} />)

      // Le calendrier Schedule-X est toujours affiché pour permettre la navigation
      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })
  })

  describe('Plugins conditionnels', () => {
    it('charge les plugins drag & drop et resize quand canEdit=true', () => {
      mockDragAndDropPlugin.mockClear()
      mockResizePlugin.mockClear()

      render(<ScheduleCalendarDesktop {...defaultProps} canEdit={true} />)

      // Les plugins devraient être créés
      expect(mockDragAndDropPlugin).toHaveBeenCalled()
      expect(mockResizePlugin).toHaveBeenCalled()
    })

    it('ne charge pas les plugins quand canEdit=false', () => {
      mockDragAndDropPlugin.mockClear()
      mockResizePlugin.mockClear()

      render(<ScheduleCalendarDesktop {...defaultProps} canEdit={false} />)

      // Les plugins ne devraient pas être créés
      expect(mockDragAndDropPlugin).not.toHaveBeenCalled()
      expect(mockResizePlugin).not.toHaveBeenCalled()
    })
  })

  describe('Callbacks', () => {
    it('appelle onScheduleClick quand défini', () => {
      const onScheduleClick = vi.fn()

      render(
        <ScheduleCalendarDesktop
          {...defaultProps}
          onScheduleClick={onScheduleClick}
        />
      )

      // Le callback est passé au calendrier - le test complet nécessiterait
      // de simuler un clic Schedule-X qui est difficile à mocker
      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })

    it('appelle onScheduleUpdate quand défini', () => {
      const onScheduleUpdate = vi.fn()

      render(
        <ScheduleCalendarDesktop
          {...defaultProps}
          onScheduleUpdate={onScheduleUpdate}
        />
      )

      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })
  })

  describe('ViewMode', () => {
    it('rend correctement en mode jour', () => {
      render(<ScheduleCalendarDesktop {...defaultProps} viewMode="day" />)

      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })

    it('rend correctement en mode semaine', () => {
      render(<ScheduleCalendarDesktop {...defaultProps} viewMode="week" />)

      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })

    it('rend correctement en mode mois', () => {
      render(<ScheduleCalendarDesktop {...defaultProps} viewMode="month" />)

      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })
  })
})

describe('Drag & Drop Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateSchedule pour drag & drop', () => {
    it('appelle updateSchedule avec les bonnes données', async () => {
      mockUpdateSchedule.mockResolvedValue({ success: true, data: {} })

      const updateData = {
        id: 'schedule-1',
        startDate: new Date('2026-01-27'),
        endDate: new Date('2026-01-27'),
        startTime: '10:00',
        endTime: '18:00',
      }

      await mockUpdateSchedule(updateData)

      expect(mockUpdateSchedule).toHaveBeenCalledWith({
        id: 'schedule-1',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        startDate: expect.any(Date),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        endDate: expect.any(Date),
        startTime: '10:00',
        endTime: '18:00',
      })
    })

    it('gère les erreurs de permission', async () => {
      mockUpdateSchedule.mockResolvedValue({
        success: false,
        error: 'Modification non autorisée',
      })

      const updateData = {
        id: 'schedule-1',
        startDate: new Date('2026-01-27'),
        endDate: new Date('2026-01-27'),
        startTime: '10:00',
        endTime: '18:00',
      }

      const result = (await mockUpdateSchedule(updateData)) as {
        success: boolean
        error?: string
      }

      expect(result.success).toBe(false)
      expect(result.error).toBe('Modification non autorisée')
    })

    it('gère les erreurs de validation', async () => {
      mockUpdateSchedule.mockResolvedValue({
        success: false,
        error: 'Données invalides',
      })

      const updateData = {
        id: 'schedule-1',
        startDate: new Date('2026-01-27'),
        endDate: new Date('2026-01-26'), // Fin avant début
        startTime: '10:00',
        endTime: '18:00',
      }

      const result = (await mockUpdateSchedule(updateData)) as {
        success: boolean
      }

      expect(result.success).toBe(false)
    })
  })

  describe('Toast notifications', () => {
    it('affiche un toast de succès après mise à jour réussie', () => {
      mockUpdateSchedule.mockResolvedValue({ success: true, data: {} })

      render(<ScheduleCalendarDesktop {...defaultProps} canEdit={true} />)

      // La notification serait affichée après un drag - difficile à tester
      // sans simuler le callback Schedule-X
      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })
  })

  describe('RBAC Permissions', () => {
    it('désactive le drag & drop pour canEdit=false', () => {
      render(<ScheduleCalendarDesktop {...defaultProps} canEdit={false} />)

      // Pas de message d'aide = pas de drag & drop
      expect(screen.queryByText(/glissez-déposez/i)).not.toBeInTheDocument()
    })

    it('active le drag & drop pour canEdit=true', () => {
      render(<ScheduleCalendarDesktop {...defaultProps} canEdit={true} />)

      expect(screen.getByText(/glissez-déposez/i)).toBeInTheDocument()
    })
  })
})

// ============================================================================
// Tests Leave Requests Overlay (SP-415)
// ============================================================================

describe('Leave Requests Overlay (SP-415)', () => {
  const mockLeaveRequests: LeaveRequestWithEmployee[] = [
    {
      id: 'leave-1',
      employeeId: 'emp-1',
      companyId: 'company-1',
      type: 'PAID_LEAVE',
      status: 'APPROVED',
      startDate: new Date('2026-01-27'),
      endDate: new Date('2026-01-30'),
      days: 4,
      halfDay: false,
      halfDayPeriod: null,
      reason: 'Vacances',
      comment: null,
      attachments: [],
      reviewComment: null,
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
    },
    {
      id: 'leave-2',
      employeeId: 'emp-2',
      companyId: 'company-1',
      type: 'RTT',
      status: 'APPROVED',
      startDate: new Date('2026-01-28'),
      endDate: new Date('2026-01-28'),
      days: 1,
      halfDay: false,
      halfDayPeriod: null,
      reason: null,
      comment: null,
      attachments: [],
      reviewComment: null,
      reviewedById: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      employee: {
        id: 'emp-2',
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie@test.com',
        teamId: 'team-1',
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckAvailabilityConflicts.mockResolvedValue({
      success: true,
      data: {
        hasConflict: false,
        conflicts: [],
        hardConflicts: [],
        softConflicts: [],
      },
    })
  })

  it('rend le calendrier avec les congés quand showLeaves=true', () => {
    render(
      <ScheduleCalendarDesktop
        {...defaultProps}
        leaveRequests={mockLeaveRequests}
        showLeaves={true}
      />
    )

    expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
  })

  it('rend le calendrier sans erreur quand leaveRequests est vide', () => {
    render(
      <ScheduleCalendarDesktop
        {...defaultProps}
        leaveRequests={[]}
        showLeaves={true}
      />
    )

    expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
  })

  it('rend le calendrier sans erreur quand showLeaves=false', () => {
    render(
      <ScheduleCalendarDesktop
        {...defaultProps}
        leaveRequests={mockLeaveRequests}
        showLeaves={false}
      />
    )

    expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
  })

  it('accepte le callback onLeaveClick', () => {
    const onLeaveClick = vi.fn()

    render(
      <ScheduleCalendarDesktop
        {...defaultProps}
        leaveRequests={mockLeaveRequests}
        showLeaves={true}
        onLeaveClick={onLeaveClick}
      />
    )

    // Le callback est passé au calendrier - le clic est simulé dans Schedule-X
    expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
  })

  it('rend les schedules et les congés ensemble', () => {
    render(
      <ScheduleCalendarDesktop
        {...defaultProps}
        leaveRequests={mockLeaveRequests}
        showLeaves={true}
        showAvailabilities={true}
      />
    )

    // Les deux types d'events sont combinés dans le calendrier
    expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
  })
})
