/**
 * Tests unitaires pour les Server Actions admin-contact
 *
 * Couvre :
 * 1. sendAdminMessageToCompany() — non SYSTEM_ADMIN → throw Unauthorized
 * 2. Validation Zod — subject trop court → throw Invalid input
 * 3. Entreprise sans DIRECTOR → retourne sentCount: 0
 * 4. Envoi réussi → sentCount: 1, success: true, EmailLog créé
 * 5. Échec sendEmail → erreur tracée dans results.errors
 *
 * @ticket SP-474
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../mocks/prisma'

// ============================================================================
// Mocks
// ============================================================================

const mockAuth = vi.fn()
const mockSendEmail = vi.fn()
const mockRender = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/email', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

vi.mock('@react-email/components', () => ({
  render: (...args: unknown[]) => mockRender(...args),
}))

vi.mock('../../../emails/templates/AdminContactEmail', () => ({
  AdminContactEmail: vi.fn(() => '<div>mock</div>'),
}))

// Import après mocks
import { sendAdminMessageToCompany } from '@/lib/actions/admin-contact'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: { id: 'admin-1', role: 'SYSTEM_ADMIN', companyId: null },
}

const DIRECTOR_SESSION = {
  user: { id: 'dir-1', role: 'DIRECTOR', companyId: 'comp-1' },
}

const validInput = {
  companyId: 'comp-1',
  subject: 'Mise à jour importante',
  message: 'Votre essai gratuit expire bientôt. Pensez à activer votre abonnement.',
  category: 'information' as const,
}

// ============================================================================
// Tests
// ============================================================================

describe('sendAdminMessageToCompany (SP-474)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockRender.mockResolvedValue('<html>rendered</html>')
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-123' })
  })

  // 1. Non SYSTEM_ADMIN → throw
  it('throw Unauthorized si non SYSTEM_ADMIN', async () => {
    mockAuth.mockResolvedValue(DIRECTOR_SESSION)

    await expect(sendAdminMessageToCompany(validInput)).rejects.toThrow(
      'Unauthorized'
    )
  })

  // 2. Validation Zod — subject trop court
  it('throw Invalid input si sujet trop court', async () => {
    await expect(
      sendAdminMessageToCompany({ ...validInput, subject: 'AB' })
    ).rejects.toThrow('Invalid input')
  })

  // 3. Entreprise sans DIRECTOR
  it('retourne sentCount: 0 si aucun directeur', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      id: 'comp-1',
      name: 'Test Corp',
      users: [],
    } as never)

    const result = await sendAdminMessageToCompany(validInput)

    expect(result.success).toBe(false)
    expect(result.sentCount).toBe(0)
    expect(result.errors).toContain('Aucun directeur trouvé')
  })

  // 4. Envoi réussi
  it('envoie le message et crée un EmailLog', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      id: 'comp-1',
      name: 'Test Corp',
      users: [{ email: 'director@test.com', name: 'Jean Dupont' }],
    } as never)

    prismaMock.emailLog.create.mockResolvedValue({} as never)

    const result = await sendAdminMessageToCompany(validInput)

    expect(result.success).toBe(true)
    expect(result.sentCount).toBe(1)
    expect(result.errors).toHaveLength(0)

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'director@test.com',
        subject: '[SmartPlanning] Mise à jour importante',
      })
    )

    expect(prismaMock.emailLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        companyId: 'comp-1',
        emailType: 'ADMIN_MESSAGE',
        recipientEmail: 'director@test.com',
        status: 'SENT',
      }),
    })
  })

  // 5. Échec sendEmail → erreur tracée
  it('trace les erreurs quand sendEmail échoue', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      id: 'comp-1',
      name: 'Test Corp',
      users: [{ email: 'fail@test.com', name: 'Fail User' }],
    } as never)

    mockSendEmail.mockResolvedValue({ success: false, error: 'SMTP error' })
    prismaMock.emailLog.create.mockResolvedValue({} as never)

    const result = await sendAdminMessageToCompany(validInput)

    expect(result.success).toBe(false)
    expect(result.sentCount).toBe(0)
    expect(result.errors).toContain('fail@test.com')

    expect(prismaMock.emailLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'FAILED',
        recipientEmail: 'fail@test.com',
      }),
    })
  })
})
