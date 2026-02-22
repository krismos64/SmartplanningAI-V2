/**
 * Tests unitaires pour TrialsAtRiskWidget
 *
 * Couvre :
 * 1. Rendu initial — skeleton de chargement visible
 * 2. Aucun trial at risk — affiche EmptyState
 * 3. Trials présents — affiche nom entreprise + badge urgence + jours restants
 * 4. Bouton Prolonger — appelle extendTrial() et refresh la liste
 *
 * @ticket SP-473
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const mockGetTrialsAtRisk = vi.fn()
const mockExtendTrial = vi.fn()

vi.mock('@/lib/actions/admin-trials', () => ({
  getTrialsAtRisk: (...args: unknown[]) => mockGetTrialsAtRisk(...args),
  extendTrial: (...args: unknown[]) => mockExtendTrial(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/app/admin/dashboard',
}))

vi.mock('@/components/toast/use-toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    message: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
    custom: vi.fn(),
    getHistory: vi.fn(() => []),
    getToasts: vi.fn(() => []),
  }),
}))

// Import après mocks
import { TrialsAtRiskWidget } from '@/app/app/admin/dashboard/_components/TrialsAtRiskWidget'

// ============================================================================
// Fixtures
// ============================================================================

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

const mockTrials = [
  {
    companyId: 'c1',
    companyName: 'Urgent Corp',
    trialEndsAt: daysFromNow(1),
    daysRemaining: 1,
    employeeCount: 12,
    ownerEmail: 'director@urgent.com',
    urgency: 'critical' as const,
  },
  {
    companyId: 'c2',
    companyName: 'Soon Corp',
    trialEndsAt: daysFromNow(4),
    daysRemaining: 4,
    employeeCount: 5,
    ownerEmail: 'director@soon.com',
    urgency: 'warning' as const,
  },
  {
    companyId: 'c3',
    companyName: 'Later Corp',
    trialEndsAt: daysFromNow(7),
    daysRemaining: 7,
    employeeCount: 3,
    ownerEmail: null,
    urgency: 'info' as const,
  },
]

// ============================================================================
// Tests
// ============================================================================

describe('TrialsAtRiskWidget (SP-473)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTrialsAtRisk.mockResolvedValue(mockTrials)
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  // 1. Skeleton de chargement
  it('affiche le skeleton de chargement au montage', () => {
    mockGetTrialsAtRisk.mockReturnValue(new Promise(() => {}))

    render(<TrialsAtRiskWidget />)

    expect(
      screen.getByRole('status', { name: /chargement des essais/i })
    ).toBeInTheDocument()
  })

  // 2. EmptyState si 0 trials
  it('affiche EmptyState si aucun trial at risk', async () => {
    mockGetTrialsAtRisk.mockResolvedValue([])

    render(<TrialsAtRiskWidget />)

    await waitFor(() => {
      expect(screen.getByText('Tout est en ordre')).toBeInTheDocument()
    })

    expect(
      screen.getByText(/aucun essai n'expire dans les 7 prochains jours/i)
    ).toBeInTheDocument()
  })

  // 3. Affiche les trials avec badges urgence
  it('affiche les trials avec nom, badge urgence et jours restants', async () => {
    render(<TrialsAtRiskWidget />)

    await waitFor(() => {
      expect(screen.getByText('Urgent Corp')).toBeInTheDocument()
    })

    // Noms
    expect(screen.getByText('Soon Corp')).toBeInTheDocument()
    expect(screen.getByText('Later Corp')).toBeInTheDocument()

    // Badges urgence
    expect(screen.getByText('Critique')).toBeInTheDocument()
    expect(screen.getByText('Attention')).toBeInTheDocument()
    expect(screen.getByText('Info')).toBeInTheDocument()

    // Jours restants
    expect(screen.getByText('1 jour restant')).toBeInTheDocument()
    expect(screen.getByText('4 jours restants')).toBeInTheDocument()
    expect(screen.getByText('7 jours restants')).toBeInTheDocument()

    // Employés
    expect(screen.getByText(/12 employés/)).toBeInTheDocument()
    expect(screen.getByText(/5 employés/)).toBeInTheDocument()

    // Email directeur
    expect(screen.getByText('director@urgent.com')).toBeInTheDocument()

    // Badge compteur total
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  // 4. Prolonger appelle extendTrial et refresh
  it('appelle extendTrial() et refresh la liste au clic Prolonger', async () => {
    mockExtendTrial.mockResolvedValue({ success: true })

    render(<TrialsAtRiskWidget />)

    await waitFor(() => {
      expect(screen.getByText('Urgent Corp')).toBeInTheDocument()
    })

    // Reset pour compter le refresh
    mockGetTrialsAtRisk.mockClear()
    mockGetTrialsAtRisk.mockResolvedValue([])

    // Cliquer sur le premier bouton +7j
    const extendButtons = screen.getAllByRole('button', { name: /\+7j/i })
    fireEvent.click(extendButtons[0])

    await waitFor(() => {
      expect(mockExtendTrial).toHaveBeenCalledWith('c1')
    })

    // La liste a été rafraîchie
    await waitFor(() => {
      expect(mockGetTrialsAtRisk).toHaveBeenCalled()
    })
  })
})
