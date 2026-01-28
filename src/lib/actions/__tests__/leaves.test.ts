/**
 * Tests unitaires pour les Server Actions Leave Management
 *
 * @ticket SP-410
 */

/* eslint-disable @typescript-eslint/unbound-method */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  cancelLeaveRequest,
  reviewLeaveRequest,
  getLeaveBalance,
  updateLeaveBalance,
  getTeamAbsences,
  getLeaveStats,
  checkLeaveConflicts,
} from '../leaves'

// Mock des dépendances
vi.mock('@/lib/prisma', () => ({
  prisma: {
    leaveRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    leaveBalance: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    employee: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/email/templates/leave-decision', () => ({
  sendLeaveApprovedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendLeaveRejectedEmail: vi.fn().mockResolvedValue({ success: true }),
}))

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// ============================================================================
// Helpers de test
// ============================================================================

const COMPANY_ID = 'clcompany0000000001'
const EMPLOYEE_ID = 'clemployee00000001'
const MANAGER_EMPLOYEE_ID = 'clemployee00000002'
const USER_ID = 'cluser000000000001'
const MANAGER_USER_ID = 'cluser000000000002'
const DIRECTOR_USER_ID = 'cluser000000000003'
const TEAM_ID = 'clteam00000000000001'

const futureDate = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(12, 0, 0, 0)
  return d
}

const mockSession = (role: string, userId = USER_ID) => ({
  user: {
    id: userId,
    role,
    companyId: COMPANY_ID,
  },
})

const mockLeaveRequest = (overrides = {}) => ({
  id: 'clleave0000000000001',
  type: 'PAID_LEAVE',
  status: 'PENDING',
  startDate: futureDate(5),
  endDate: futureDate(10),
  days: 4,
  halfDay: false,
  halfDayPeriod: null,
  reason: 'Vacances',
  comment: null,
  attachments: [],
  employeeId: EMPLOYEE_ID,
  companyId: COMPANY_ID,
  reviewedById: null,
  reviewedAt: null,
  reviewComment: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: EMPLOYEE_ID,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@test.com',
    teamId: TEAM_ID,
  },
  ...overrides,
})

const mockBalance = (overrides = {}) => ({
  id: 'clbalance000000001',
  employeeId: EMPLOYEE_ID,
  companyId: COMPANY_ID,
  year: 2026,
  paidLeaveTotal: 25,
  paidLeaveUsed: 10,
  rttTotal: 12,
  rttUsed: 5,
  updatedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

function setupAuth(role: string, userId = USER_ID) {
  const session = mockSession(role, userId)
  vi.mocked(auth).mockResolvedValue(session as never)

  // Mock employee lookup pour le contexte RBAC
  const employeeData = {
    id: role === 'EMPLOYEE' ? EMPLOYEE_ID : MANAGER_EMPLOYEE_ID,
    managedTeams: role === 'MANAGER' ? [{ id: TEAM_ID }] : [],
  }
  vi.mocked(prisma.employee.findUnique).mockResolvedValue(employeeData as never)

  return session
}

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  vi.resetAllMocks()
})

// ─── getLeaveRequests ─────────────────────────────────────────────

describe('getLeaveRequests', () => {
  it('refuse l\'accès si non authentifié', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const result = await getLeaveRequests()
    expect(result.success).toBe(false)
  })

  it('EMPLOYEE voit uniquement ses propres demandes', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([mockLeaveRequest()] as never)
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(1 as never)

    const result = await getLeaveRequests()
    expect(result.success).toBe(true)
    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ employeeId: EMPLOYEE_ID }),
      })
    )
  })

  it('DIRECTOR voit toutes les demandes de l\'entreprise', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(0 as never)

    const result = await getLeaveRequests()
    expect(result.success).toBe(true)
    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: COMPANY_ID }),
      })
    )
  })

  it('MANAGER voit les demandes de son équipe', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(0 as never)

    const result = await getLeaveRequests()
    expect(result.success).toBe(true)
    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          employee: { teamId: { in: [TEAM_ID] } },
        }),
      })
    )
  })

  it('applique les filtres de status', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(0 as never)

    await getLeaveRequests({ status: 'PENDING' })
    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PENDING' }),
      })
    )
  })

  it('applique les filtres de type', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(0 as never)

    await getLeaveRequests({ type: 'RTT' })
    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'RTT' }),
      })
    )
  })

  it('pagine correctement les résultats', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(25 as never)

    const result = await getLeaveRequests(undefined, { page: 2, pageSize: 10 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.pageSize).toBe(10)
    }
  })
})

// ─── getLeaveRequestById ──────────────────────────────────────────

describe('getLeaveRequestById', () => {
  it('retourne la demande si accès autorisé', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(mockLeaveRequest() as never)

    const result = await getLeaveRequestById('clleave0000000000001')
    expect(result.success).toBe(true)
  })

  it('refuse si demande inexistante', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(null as never)

    const result = await getLeaveRequestById('nonexistent')
    expect(result.success).toBe(false)
  })

  it('EMPLOYEE ne voit pas les demandes des autres', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(
      mockLeaveRequest({ employeeId: 'other_employee' }) as never
    )

    const result = await getLeaveRequestById('clleave0000000000001')
    expect(result.success).toBe(false)
  })
})

// ─── createLeaveRequest ───────────────────────────────────────────

describe('createLeaveRequest', () => {
  const validInput = {
    type: 'PAID_LEAVE',
    startDate: futureDate(5),
    endDate: futureDate(10),
    halfDay: false,
    reason: 'Vacances',
    employeeId: EMPLOYEE_ID,
  }

  it('crée une demande valide', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: EMPLOYEE_ID, managedTeams: [] } as never) // auth
      .mockResolvedValueOnce({
        id: EMPLOYEE_ID,
        companyId: COMPANY_ID,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.com',
        teamId: TEAM_ID,
      } as never) // employee check
    vi.mocked(prisma.leaveBalance.findUnique).mockResolvedValue(mockBalance() as never)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([] as never) // conflict check
    vi.mocked(prisma.employee.count).mockResolvedValue(5 as never) // team count
    vi.mocked(prisma.leaveRequest.create).mockResolvedValue(mockLeaveRequest() as never)

    const result = await createLeaveRequest(validInput)
    expect(result.success).toBe(true)
    expect(prisma.leaveRequest.create).toHaveBeenCalled()
  })

  it('refuse si solde CP insuffisant', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: EMPLOYEE_ID, managedTeams: [] } as never)
      .mockResolvedValueOnce({
        id: EMPLOYEE_ID,
        companyId: COMPANY_ID,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.com',
        teamId: null,
      } as never)
    vi.mocked(prisma.leaveBalance.findUnique).mockResolvedValue(
      mockBalance({ paidLeaveTotal: 25, paidLeaveUsed: 24 }) as never
    )

    const result = await createLeaveRequest(validInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('insuffisant')
    }
  })

  it('refuse si solde RTT insuffisant', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: EMPLOYEE_ID, managedTeams: [] } as never)
      .mockResolvedValueOnce({
        id: EMPLOYEE_ID,
        companyId: COMPANY_ID,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.com',
        teamId: null,
      } as never)
    vi.mocked(prisma.leaveBalance.findUnique).mockResolvedValue(
      mockBalance({ rttTotal: 10, rttUsed: 10 }) as never
    )

    const result = await createLeaveRequest({ ...validInput, type: 'RTT' })
    expect(result.success).toBe(false)
  })

  it('accepte UNPAID_LEAVE sans vérification de solde', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: EMPLOYEE_ID, managedTeams: [] } as never)
      .mockResolvedValueOnce({
        id: EMPLOYEE_ID,
        companyId: COMPANY_ID,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.com',
        teamId: null,
      } as never)
    vi.mocked(prisma.leaveRequest.create).mockResolvedValue(mockLeaveRequest({ type: 'UNPAID_LEAVE' }) as never)

    const result = await createLeaveRequest({ ...validInput, type: 'UNPAID_LEAVE' })
    expect(result.success).toBe(true)
    expect(prisma.leaveBalance.findUnique).not.toHaveBeenCalled()
  })

  it('refuse pour un employé d\'une autre entreprise', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: EMPLOYEE_ID, managedTeams: [] } as never)
      .mockResolvedValueOnce({
        id: EMPLOYEE_ID,
        companyId: 'other_company',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.com',
        teamId: null,
      } as never)

    const result = await createLeaveRequest(validInput)
    expect(result.success).toBe(false)
  })

  it('EMPLOYEE ne peut créer que pour soi-même', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: EMPLOYEE_ID, managedTeams: [] } as never)
      .mockResolvedValueOnce({
        id: 'other_employee',
        companyId: COMPANY_ID,
        firstName: 'Paul',
        lastName: 'Martin',
        email: 'paul@test.com',
        teamId: null,
      } as never)

    const result = await createLeaveRequest({ ...validInput, employeeId: 'other_employee' })
    expect(result.success).toBe(false)
  })

  it('calcule correctement les jours avec halfDay', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: EMPLOYEE_ID, managedTeams: [] } as never) // auth
      .mockResolvedValueOnce({
        id: EMPLOYEE_ID,
        companyId: COMPANY_ID,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.com',
        teamId: null,
      } as never) // employee check
    vi.mocked(prisma.leaveBalance.findUnique).mockResolvedValue(mockBalance() as never)
    vi.mocked(prisma.leaveRequest.create).mockResolvedValue(mockLeaveRequest({ days: 0.5, halfDay: true }) as never)

    const result = await createLeaveRequest({
      ...validInput,
      halfDay: true,
      halfDayPeriod: 'AM',
      endDate: validInput.startDate,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.days).toBe(0.5)
      expect(result.data.halfDay).toBe(true)
    }
  })

  it('valide le schéma Zod (données invalides)', async () => {
    setupAuth('EMPLOYEE')
    const result = await createLeaveRequest({ type: 'INVALID' })
    expect(result.success).toBe(false)
  })
})

// ─── reviewLeaveRequest ───────────────────────────────────────────

describe('reviewLeaveRequest', () => {
  it('MANAGER peut approuver une demande de son équipe', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID)
    // findUnique is called again inside reviewLeaveRequest for the leave request
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(mockLeaveRequest() as never)
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      if (typeof fn === 'function') {
        // Interactive transaction - provide mock tx
        const tx = {
          leaveRequest: { update: vi.fn().mockResolvedValue(mockLeaveRequest({ status: 'APPROVED' })) },
          leaveBalance: { upsert: vi.fn().mockResolvedValue(mockBalance()) },
        }
        return fn(tx as never)
      }
      return [mockLeaveRequest({ status: 'APPROVED' })]
    })

    const result = await reviewLeaveRequest('clleave0000000000001', {
      status: 'APPROVED',
    })
    expect(result.success).toBe(true)
  })

  it('MANAGER ne peut pas approuver une demande hors équipe', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID)
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(
      mockLeaveRequest({ employee: { ...mockLeaveRequest().employee, teamId: 'other_team' } }) as never
    )

    const result = await reviewLeaveRequest('clleave0000000000001', {
      status: 'APPROVED',
    })
    expect(result.success).toBe(false)
  })

  it('DIRECTOR peut approuver toute demande de l\'entreprise', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(mockLeaveRequest() as never)
    vi.mocked(prisma.$transaction).mockResolvedValue(mockLeaveRequest({ status: 'APPROVED' }) as never)

    const result = await reviewLeaveRequest('clleave0000000000001', {
      status: 'APPROVED',
    })
    expect(result.success).toBe(true)
  })

  it('exige un commentaire pour un refus', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID)
    const result = await reviewLeaveRequest('clleave0000000000001', {
      status: 'REJECTED',
    })
    expect(result.success).toBe(false)
  })

  it('accepte un refus avec commentaire', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID)
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(mockLeaveRequest() as never)
    vi.mocked(prisma.$transaction).mockResolvedValue(mockLeaveRequest({ status: 'REJECTED' }) as never)

    const result = await reviewLeaveRequest('clleave0000000000001', {
      status: 'REJECTED',
      reviewComment: 'Période de forte activité',
    })
    expect(result.success).toBe(true)
  })

  it('refuse de valider une demande non PENDING', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(
      mockLeaveRequest({ status: 'APPROVED' }) as never
    )

    const result = await reviewLeaveRequest('clleave0000000000001', {
      status: 'REJECTED',
      reviewComment: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('EMPLOYEE ne peut pas valider', async () => {
    setupAuth('EMPLOYEE')
    const result = await reviewLeaveRequest('clleave0000000000001', {
      status: 'APPROVED',
    })
    expect(result.success).toBe(false)
  })
})

// ─── cancelLeaveRequest ───────────────────────────────────────────

describe('cancelLeaveRequest', () => {
  it('annule une demande PENDING sans recrédit', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(mockLeaveRequest() as never)
    vi.mocked(prisma.leaveRequest.update).mockResolvedValue(
      mockLeaveRequest({ status: 'CANCELLED' }) as never
    )

    const result = await cancelLeaveRequest('clleave0000000000001')
    expect(result.success).toBe(true)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('annule une demande APPROVED avec recrédit CP', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(
      mockLeaveRequest({ status: 'APPROVED', type: 'PAID_LEAVE' }) as never
    )
    vi.mocked(prisma.$transaction).mockResolvedValue([
      mockLeaveRequest({ status: 'CANCELLED' }),
      mockBalance(),
    ] as never)

    const result = await cancelLeaveRequest('clleave0000000000001')
    expect(result.success).toBe(true)
    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('annule une demande APPROVED avec recrédit RTT', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(
      mockLeaveRequest({ status: 'APPROVED', type: 'RTT' }) as never
    )
    vi.mocked(prisma.$transaction).mockResolvedValue([
      mockLeaveRequest({ status: 'CANCELLED' }),
      mockBalance(),
    ] as never)

    const result = await cancelLeaveRequest('clleave0000000000001')
    expect(result.success).toBe(true)
    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('refuse l\'annulation par un non-owner', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(
      mockLeaveRequest({ employeeId: 'other_employee' }) as never
    )

    const result = await cancelLeaveRequest('clleave0000000000001')
    expect(result.success).toBe(false)
  })

  it('refuse l\'annulation d\'une demande déjà annulée', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(
      mockLeaveRequest({ status: 'CANCELLED' }) as never
    )

    const result = await cancelLeaveRequest('clleave0000000000001')
    expect(result.success).toBe(false)
  })

  it('refuse l\'annulation d\'une demande refusée', async () => {
    setupAuth('EMPLOYEE')
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(
      mockLeaveRequest({ status: 'REJECTED' }) as never
    )

    const result = await cancelLeaveRequest('clleave0000000000001')
    expect(result.success).toBe(false)
  })
})

// ─── getLeaveBalance ──────────────────────────────────────────────

describe('getLeaveBalance', () => {
  it('retourne le solde de l\'employé connecté', async () => {
    setupAuth('EMPLOYEE')
    const balance = mockBalance()
    vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(balance as never)

    const result = await getLeaveBalance()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.paidLeaveRemaining).toBe(15)
      expect(result.data.rttRemaining).toBe(7)
    }
  })

  it('EMPLOYEE ne peut voir que son propre solde', async () => {
    setupAuth('EMPLOYEE')
    const result = await getLeaveBalance('other_employee')
    expect(result.success).toBe(false)
  })

  it('MANAGER peut voir le solde de son équipe', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID)
    // Mock pour la vérification RBAC du target employee
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: MANAGER_EMPLOYEE_ID, managedTeams: [{ id: TEAM_ID }] } as never) // auth
      .mockResolvedValueOnce({ teamId: TEAM_ID } as never) // RBAC check
    vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockBalance() as never)

    const result = await getLeaveBalance(EMPLOYEE_ID)
    expect(result.success).toBe(true)
  })

  it('DIRECTOR peut voir tout solde de l\'entreprise', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockBalance() as never)

    const result = await getLeaveBalance(EMPLOYEE_ID)
    expect(result.success).toBe(true)
  })
})

// ─── updateLeaveBalance ───────────────────────────────────────────

describe('updateLeaveBalance', () => {
  it('DIRECTOR peut modifier un solde', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: MANAGER_EMPLOYEE_ID, managedTeams: [] } as never) // auth
      .mockResolvedValueOnce({ companyId: COMPANY_ID } as never) // employee check
    vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockBalance({ paidLeaveTotal: 30 }) as never)

    const result = await updateLeaveBalance(EMPLOYEE_ID, 2026, { paidLeaveTotal: 30 })
    expect(result.success).toBe(true)
  })

  it('MANAGER ne peut pas modifier un solde', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID)
    const result = await updateLeaveBalance(EMPLOYEE_ID, 2026, { paidLeaveTotal: 30 })
    expect(result.success).toBe(false)
  })

  it('EMPLOYEE ne peut pas modifier un solde', async () => {
    setupAuth('EMPLOYEE')
    const result = await updateLeaveBalance(EMPLOYEE_ID, 2026, { paidLeaveTotal: 30 })
    expect(result.success).toBe(false)
  })

  it('refuse si employé d\'une autre entreprise', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({ id: MANAGER_EMPLOYEE_ID, managedTeams: [] } as never)
      .mockResolvedValueOnce({ companyId: 'other_company' } as never)

    const result = await updateLeaveBalance(EMPLOYEE_ID, 2026, { paidLeaveTotal: 30 })
    expect(result.success).toBe(false)
  })
})

// ─── getTeamAbsences ──────────────────────────────────────────────

describe('getTeamAbsences', () => {
  it('retourne les absences APPROVED de la période', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([mockLeaveRequest({ status: 'APPROVED' })] as never)

    const result = await getTeamAbsences(TEAM_ID, new Date(), futureDate(30))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(1)
    }
  })

  it('MANAGER ne peut voir que son équipe', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID)
    const result = await getTeamAbsences('other_team', new Date(), futureDate(30))
    expect(result.success).toBe(false)
  })

  it('DIRECTOR peut voir toutes les absences', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([] as never)

    const result = await getTeamAbsences(TEAM_ID, new Date(), futureDate(30))
    expect(result.success).toBe(true)
  })

  it('EMPLOYEE ne peut pas voir les absences d\'équipe', async () => {
    setupAuth('EMPLOYEE')
    const result = await getTeamAbsences(TEAM_ID, new Date(), futureDate(30))
    expect(result.success).toBe(false)
  })
})

// ─── getLeaveStats ────────────────────────────────────────────────

describe('getLeaveStats', () => {
  it('retourne les stats correctement', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([
      { status: 'PENDING', type: 'PAID_LEAVE' },
      { status: 'APPROVED', type: 'PAID_LEAVE' },
      { status: 'APPROVED', type: 'RTT' },
    ] as never)

    const result = await getLeaveStats()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.total).toBe(3)
      expect(result.data.byStatus.PENDING).toBe(1)
      expect(result.data.byStatus.APPROVED).toBe(2)
      expect(result.data.byType.PAID_LEAVE).toBe(2)
    }
  })

  it('EMPLOYEE ne peut pas voir les stats', async () => {
    setupAuth('EMPLOYEE')
    const result = await getLeaveStats()
    expect(result.success).toBe(false)
  })
})

// ─── checkLeaveConflicts ──────────────────────────────────────────

describe('checkLeaveConflicts', () => {
  it('retourne hasConflict=false si <50% absents', async () => {
    // Note: checkLeaveConflicts calls prisma.employee.findUnique internally
    // We need to set up auth first, then mock the internal calls
    vi.mocked(prisma.employee.findUnique).mockResolvedValue({ teamId: TEAM_ID } as never)
    vi.mocked(prisma.employee.count).mockResolvedValue(10 as never)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([
      { employee: { firstName: 'Marie', lastName: 'Martin' } },
    ] as never)

    const result = await checkLeaveConflicts(EMPLOYEE_ID, futureDate(5), futureDate(10))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hasConflict).toBe(false)
      expect(result.data.percentAbsent).toBe(20) // 2/10 (1 absent + requesting)
    }
  })

  it('retourne hasConflict=true si >50% absents', async () => {
    vi.mocked(prisma.employee.findUnique).mockResolvedValue({ teamId: TEAM_ID } as never)
    vi.mocked(prisma.employee.count).mockResolvedValue(4 as never)
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([
      { employee: { firstName: 'Marie', lastName: 'Martin' } },
      { employee: { firstName: 'Paul', lastName: 'Durand' } },
    ] as never)

    const result = await checkLeaveConflicts(EMPLOYEE_ID, futureDate(5), futureDate(10))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hasConflict).toBe(true)
      expect(result.data.percentAbsent).toBe(75) // 3/4
      expect(result.data.warning).toBeDefined()
    }
  })

  it('retourne hasConflict=false si pas d\'équipe', async () => {
    vi.mocked(prisma.employee.findUnique).mockResolvedValue({ teamId: null } as never)

    const result = await checkLeaveConflicts(EMPLOYEE_ID, futureDate(5), futureDate(10))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hasConflict).toBe(false)
    }
  })
})
