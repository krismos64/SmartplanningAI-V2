/**
 * Tests unitaires pour sendAdminBroadcast (SP-477)
 *
 * Couvre :
 * - Envoi uniquement aux DIRECTOR actifs d'entreprises ACTIVE/TRIAL
 * - Exclusion des entreprises CANCELED/PAST_DUE
 * - Batch Promise.allSettled — échec partiel non bloquant
 * - Retour totalSent / totalFailed corrects
 * - EmailLog créé par destinataire
 * - RBAC : rejeté si rôle != SYSTEM_ADMIN
 * - Validation Zod des inputs
 * - Aucun destinataire = retour vide
 *
 * @ticket SP-477
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

vi.mock('@/lib/permissions', () => ({
  hasRequiredRole: (role: string, required: string) =>
    role === required || role === 'SYSTEM_ADMIN',
}))

const mockFindMany = vi.fn()
const mockEmailLogCreate = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    company: {
      findMany: (...args: any[]) => mockFindMany(...args),
      findUnique: vi.fn(),
    },
    emailLog: {
      create: (...args: any[]) => mockEmailLogCreate(...args),
    },
  },
}))

const mockSendEmail = vi.fn()
vi.mock('@/lib/email', () => ({
  sendEmail: (...args: any[]) => mockSendEmail(...args),
}))

const mockRender = vi.fn()
vi.mock('@react-email/components', () => ({
  render: (...args: any[]) => mockRender(...args),
}))

vi.mock('../../../../emails/templates/AdminContactEmail', () => ({
  AdminContactEmail: vi.fn(() => 'mocked-email-component'),
}))

// ============================================================================
// Import (après les mocks)
// ============================================================================

import { sendAdminBroadcast } from '../admin-contact'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: { id: 'admin-001', role: 'SYSTEM_ADMIN', email: 'admin@sp.io' },
}

const NON_ADMIN_SESSION = {
  user: { id: 'user-001', role: 'DIRECTOR', email: 'dir@acme.com' },
}

const VALID_INPUT = {
  subject: 'Maintenance prévue ce week-end',
  message: 'Nous procéderons à une maintenance de 2h samedi matin.',
  category: 'maintenance' as const,
}

const MOCK_COMPANIES = [
  {
    id: 'comp-1',
    name: 'Acme Corp',
    users: [
      { email: 'dir1@acme.com', name: 'Alice' },
      { email: 'dir2@acme.com', name: 'Bob' },
    ],
  },
  {
    id: 'comp-2',
    name: 'Beta Inc',
    users: [{ email: 'dir@beta.com', name: 'Charlie' }],
  },
]

// ============================================================================
// Tests
// ============================================================================

describe('sendAdminBroadcast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindMany.mockResolvedValue(MOCK_COMPANIES)
    mockRender.mockResolvedValue('<html>email</html>')
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' })
    mockEmailLogCreate.mockResolvedValue({ id: 'log-1' })
  })

  // -------------------------------------------------------------------------
  // RBAC
  // -------------------------------------------------------------------------

  it('rejette si non authentifié', async () => {
    mockAuth.mockResolvedValue(null)

    await expect(sendAdminBroadcast(VALID_INPUT)).rejects.toThrow(
      'Unauthorized'
    )
  })

  it('rejette si rôle != SYSTEM_ADMIN', async () => {
    mockAuth.mockResolvedValue(NON_ADMIN_SESSION)

    await expect(sendAdminBroadcast(VALID_INPUT)).rejects.toThrow(
      'Unauthorized'
    )
  })

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  it('rejette un sujet trop court', async () => {
    await expect(
      sendAdminBroadcast({ ...VALID_INPUT, subject: 'Hi' })
    ).rejects.toThrow('Invalid input')
  })

  it('rejette un message trop court', async () => {
    await expect(
      sendAdminBroadcast({ ...VALID_INPUT, message: 'Trop court.' })
    ).rejects.toThrow('Invalid input')
  })

  // -------------------------------------------------------------------------
  // Envoi
  // -------------------------------------------------------------------------

  it('envoie uniquement aux DIRECTOR actifs des entreprises ACTIVE/TRIAL', async () => {
    const result = await sendAdminBroadcast(VALID_INPUT)

    expect(result.totalSent).toBe(3)
    expect(result.totalFailed).toBe(0)
    expect(result.success).toBe(true)

    // Vérifie que findMany filtre correctement les entreprises
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          subscription: {
            is: { status: { in: ['ACTIVE', 'TRIAL'] } },
          },
        }),
      })
    )
  })

  it('retourne 0 destinataire si aucune entreprise active', async () => {
    mockFindMany.mockResolvedValue([])

    const result = await sendAdminBroadcast(VALID_INPUT)

    expect(result.totalSent).toBe(0)
    expect(result.totalFailed).toBe(0)
    expect(result.failedEmails).toEqual([])
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Promise.allSettled — échec partiel
  // -------------------------------------------------------------------------

  it("continue l'envoi même si un email échoue (Promise.allSettled)", async () => {
    // Le 2ème envoi échoue
    mockSendEmail
      .mockResolvedValueOnce({ success: true, messageId: 'msg-1' })
      .mockResolvedValueOnce({ success: false, error: 'SMTP error' })
      .mockResolvedValueOnce({ success: true, messageId: 'msg-3' })

    const result = await sendAdminBroadcast(VALID_INPUT)

    expect(result.totalSent).toBe(2)
    expect(result.totalFailed).toBe(1)
    expect(result.failedEmails).toContain('dir2@acme.com')
    expect(result.success).toBe(true) // Au moins 1 envoyé
  })

  // -------------------------------------------------------------------------
  // EmailLog
  // -------------------------------------------------------------------------

  it('crée un EmailLog par destinataire', async () => {
    await sendAdminBroadcast(VALID_INPUT)

    expect(mockEmailLogCreate).toHaveBeenCalledTimes(3)
    expect(mockEmailLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailType: 'ADMIN_BROADCAST',
          recipientEmail: 'dir1@acme.com',
          companyId: 'comp-1',
          status: 'SENT',
        }),
      })
    )
  })

  it('marque le EmailLog FAILED pour un email en échec', async () => {
    mockSendEmail.mockResolvedValue({ success: false, error: 'SMTP error' })

    await sendAdminBroadcast(VALID_INPUT)

    expect(mockEmailLogCreate).toHaveBeenCalledTimes(3)
    const statuses = mockEmailLogCreate.mock.calls.map(
      (call: any[]) => call[0].data.status
    )
    expect(statuses).toEqual(['FAILED', 'FAILED', 'FAILED'])
  })
})
