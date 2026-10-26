/**
 * Tests de la garde de désactivation d'une fiche employé
 *
 * @ticket SP-611
 * @description Le 20 octobre 2026, un dirigeant a désactivé sa propre fiche
 * et reçu l'email « compte désactivé ». Ces tests prouvent le refus sur les
 * deux chemins qui écrivent `isActive` : aucune écriture, aucun email.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFindUnique, mockUpdate, mockSendDeactivated } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockSendDeactivated: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: { findUnique: mockFindUnique, update: mockUpdate },
    user: { findUnique: vi.fn() },
  },
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/impersonation', () => ({
  getEffectiveSessionData: vi.fn(),
  assertNotImpersonating: vi.fn().mockResolvedValue(null),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/services/audit', () => ({
  logAuditAction: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/services/stripe', () => ({
  syncEmployeeCountToStripe: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/services/funnel-milestones.service', () => ({}))
vi.mock('@/lib/email/templates/invitation', () => ({
  sendInvitationEmail: vi.fn(),
}))
vi.mock('@/lib/services/email-change.service', () => ({}))
vi.mock('@/lib/notifications/emit-notification', () => ({
  emitNotification: vi.fn(),
}))
vi.mock('@/lib/email/templates/account-notifications', () => ({
  sendEmployeeDeactivatedEmail: mockSendDeactivated,
}))
vi.mock('@/lib/cache', () => ({
  invalidateDashboardCache: vi.fn().mockResolvedValue(undefined),
  invalidateEmployeesCache: vi.fn().mockResolvedValue(undefined),
}))

import { auth } from '@/lib/auth'
import { getEffectiveSessionData } from '@/lib/impersonation'
import { toggleEmployeeStatus, updateEmployee } from '../employees'

// ============================================================================
// Données, à la forme des lignes de production
// ============================================================================

const COMPANY = 'cl000000000000000000comp1'
const DIRECTOR_USER = 'cl000000000000000000user1'
const OTHER_DIRECTOR_USER = 'cl000000000000000000user2'
const EMPLOYEE_USER = 'cl000000000000000000user3'

function asDirector() {
  vi.mocked(auth).mockResolvedValue({
    user: { id: DIRECTOR_USER, role: 'DIRECTOR', companyId: COMPANY },
    expires: '2026-12-31',
  } as never)
  vi.mocked(getEffectiveSessionData).mockResolvedValue({
    userId: DIRECTOR_USER,
    role: 'DIRECTOR',
    companyId: COMPANY,
  } as never)
}

function fiche(
  id: string,
  userId: string | null,
  role: 'DIRECTOR' | 'EMPLOYEE' | null
) {
  return {
    id,
    userId,
    firstName: 'philippe',
    lastName: 'bogat',
    email: 'lebossu4@example.com',
    companyId: COMPANY,
    teamId: null,
    isActive: true,
    user: userId
      ? { id: userId, name: null, email: 'x@example.com', image: null, role }
      : null,
    company: { id: COMPANY, name: 'sarl chouphil' },
    team: null,
    _count: { schedules: 0, leaveRequests: 0 },
  }
}

const OWN = 'cl000000000000000000empl1'
const OTHER_DIRECTOR = 'cl000000000000000000empl2'
const COLLABORATOR = 'cl000000000000000000empl3'

describe('SP-611, désactivation de fiche', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    asDirector()
  })

  describe('toggleEmployeeStatus', () => {
    it('refuse la propre fiche du dirigeant, sans écriture ni email', async () => {
      mockFindUnique.mockResolvedValue(fiche(OWN, DIRECTOR_USER, 'DIRECTOR'))

      const result = await toggleEmployeeStatus(OWN, false)

      expect(result).toEqual({
        success: false,
        error: 'Vous ne pouvez pas désactiver votre propre fiche',
      })
      expect(mockUpdate).not.toHaveBeenCalled()
      expect(mockSendDeactivated).not.toHaveBeenCalled()
    })

    it("refuse la fiche d'un autre dirigeant", async () => {
      mockFindUnique.mockResolvedValue(
        fiche(OTHER_DIRECTOR, OTHER_DIRECTOR_USER, 'DIRECTOR')
      )

      const result = await toggleEmployeeStatus(OTHER_DIRECTOR, false)

      expect(result.success).toBe(false)
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('laisse réactiver sa propre fiche, pour réparer une fiche désactivée', async () => {
      const existing = { ...fiche(OWN, DIRECTOR_USER, 'DIRECTOR') }
      existing.isActive = false
      mockFindUnique.mockResolvedValue(existing)
      mockUpdate.mockResolvedValue({ ...existing, isActive: true })

      const result = await toggleEmployeeStatus(OWN, true)

      expect(result.success).toBe(true)
      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockSendDeactivated).not.toHaveBeenCalled()
    })

    it("désactive toujours un collaborateur, et l'email part", async () => {
      const existing = fiche(COLLABORATOR, EMPLOYEE_USER, 'EMPLOYEE')
      mockFindUnique.mockResolvedValue(existing)
      mockUpdate.mockResolvedValue({ ...existing, isActive: false })
      mockSendDeactivated.mockResolvedValue(undefined)

      const result = await toggleEmployeeStatus(COLLABORATOR, false)

      expect(result.success).toBe(true)
      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockSendDeactivated).toHaveBeenCalledTimes(1)
    })

    it("refuse une fiche d'une autre entreprise, avant la garde", async () => {
      mockFindUnique.mockResolvedValue({
        ...fiche(COLLABORATOR, EMPLOYEE_USER, 'EMPLOYEE'),
        companyId: 'cl000000000000000000comp2',
      })

      const result = await toggleEmployeeStatus(COLLABORATOR, false)

      expect(result).toEqual({
        success: false,
        error: 'Employé non trouvé ou accès non autorisé',
      })
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('updateEmployee', () => {
    it('refuse isActive à false sur la propre fiche, sans écriture', async () => {
      mockFindUnique.mockResolvedValue(fiche(OWN, DIRECTOR_USER, 'DIRECTOR'))

      const result = await updateEmployee({ id: OWN, isActive: false })

      expect(result.success).toBe(false)
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })
})
