/**
 * Tests unitaires des Server Actions admin-contact-messages (SP-577)
 *
 * `contact_messages` ne porte pas de `companyId` : l'expediteur est un
 * visiteur anonyme. Il n'y a donc aucun filtre d'isolation a verifier ici,
 * et toute la protection repose sur le controle de role. Les tests negatifs
 * ci-dessous sont la seule preuve que la table n'est pas lisible par un
 * utilisateur d'entreprise.
 *
 * Couvre aussi le masquage de `emailError`, qui contient le message brut de
 * Nodemailer et peut porter l'hote, le port et l'utilisateur SMTP.
 *
 * @ticket SP-577
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../mocks/prisma'

// ============================================================================
// Mocks
// ============================================================================

const mockAuth = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import apres mocks
import {
  getContactMessagesAdmin,
  getContactMessagesKpisAdmin,
  markContactMessageRead,
} from '@/lib/actions/admin-contact-messages'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: { id: 'admin-1', role: 'SYSTEM_ADMIN', companyId: null },
}

const DIRECTOR_SESSION = {
  user: { id: 'dir-1', role: 'DIRECTOR', companyId: 'comp-1' },
}

const MANAGER_SESSION = {
  user: { id: 'mgr-1', role: 'MANAGER', companyId: 'comp-1' },
}

const EMPLOYEE_SESSION = {
  user: { id: 'emp-1', role: 'EMPLOYEE', companyId: 'comp-1' },
}

const MESSAGE_ID = 'cl000000000000000000msg1'

function messageFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: MESSAGE_ID,
    name: 'Camille Verdier',
    email: 'camille@exemple.fr',
    subject: 'Demande de devis',
    message: 'Bonjour, je cherche une solution de planning.',
    emailStatus: 'SENT',
    emailError: null,
    ipAddress: '203.0.113.10',
    userAgent: 'Mozilla/5.0',
    isRead: false,
    handledAt: null,
    createdAt: new Date('2026-08-13T10:00:00Z'),
    updatedAt: new Date('2026-08-13T10:00:00Z'),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================================================
// Tests negatifs : le controle de role est la seule protection
// ============================================================================

describe('admin-contact-messages, controle de role', () => {
  const roles = [
    ['DIRECTOR', DIRECTOR_SESSION],
    ['MANAGER', MANAGER_SESSION],
    ['EMPLOYEE', EMPLOYEE_SESSION],
  ] as const

  it.each(roles)('refuse la lecture a un %s', async (_label, session) => {
    mockAuth.mockResolvedValue(session)

    const result = await getContactMessagesAdmin()

    expect(result.success).toBe(false)
    expect(prismaMock.contactMessage.findMany).not.toHaveBeenCalled()
  })

  it.each(roles)('refuse les compteurs a un %s', async (_label, session) => {
    mockAuth.mockResolvedValue(session)

    const result = await getContactMessagesKpisAdmin()

    expect(result.success).toBe(false)
    expect(prismaMock.contactMessage.count).not.toHaveBeenCalled()
  })

  it.each(roles)('refuse le marquage a un %s', async (_label, session) => {
    mockAuth.mockResolvedValue(session)

    const result = await markContactMessageRead({
      id: MESSAGE_ID,
      isRead: true,
    })

    expect(result.success).toBe(false)
    expect(prismaMock.contactMessage.update).not.toHaveBeenCalled()
  })

  it('refuse un visiteur non connecte', async () => {
    mockAuth.mockResolvedValue(null)

    const result = await getContactMessagesAdmin()

    expect(result.success).toBe(false)
    expect(prismaMock.contactMessage.findMany).not.toHaveBeenCalled()
  })
})

// ============================================================================
// Lecture
// ============================================================================

describe('getContactMessagesAdmin', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
  })

  it('retourne les messages du plus recent au plus ancien', async () => {
    prismaMock.contactMessage.findMany.mockResolvedValue([
      messageFixture(),
    ] as never)
    prismaMock.contactMessage.count.mockResolvedValue(1)

    const result = await getContactMessagesAdmin()

    expect(result.success).toBe(true)
    expect(prismaMock.contactMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    )
  })

  it('n expose jamais le contenu technique de emailError', async () => {
    prismaMock.contactMessage.findMany.mockResolvedValue([
      messageFixture({
        emailStatus: 'FAILED',
        emailError:
          'Invalid login: 535 auth failed for user contact@smartplanning.fr on smtp.hostinger.com:587',
      }),
    ] as never)
    prismaMock.contactMessage.count.mockResolvedValue(1)

    const result = await getContactMessagesAdmin()

    expect(result.success).toBe(true)
    const serialise = JSON.stringify(result.data)
    expect(serialise).not.toContain('smtp.hostinger.com')
    expect(serialise).not.toContain('535 auth failed')
    // Seule la presence de l'erreur remonte
    expect(result.data?.messages[0]?.hasEmailError).toBe(true)
  })

  it('filtre les demandes non traitees', async () => {
    prismaMock.contactMessage.findMany.mockResolvedValue([] as never)
    prismaMock.contactMessage.count.mockResolvedValue(0)

    await getContactMessagesAdmin({ readState: 'unread' })

    expect(prismaMock.contactMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isRead: false }),
      })
    )
  })

  it('filtre les notifications jamais parties', async () => {
    prismaMock.contactMessage.findMany.mockResolvedValue([] as never)
    prismaMock.contactMessage.count.mockResolvedValue(0)

    await getContactMessagesAdmin({ emailStatus: 'FAILED' })

    expect(prismaMock.contactMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ emailStatus: 'FAILED' }),
      })
    )
  })

  it('rejette un filtre de statut inconnu', async () => {
    const result = await getContactMessagesAdmin({
      emailStatus: 'INVENTE' as never,
    })

    expect(result.success).toBe(false)
    expect(prismaMock.contactMessage.findMany).not.toHaveBeenCalled()
  })
})

// ============================================================================
// Marquage
// ============================================================================

describe('markContactMessageRead', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
  })

  it('date le traitement quand on marque comme lu', async () => {
    prismaMock.contactMessage.update.mockResolvedValue({
      id: MESSAGE_ID,
      isRead: true,
    } as never)

    const result = await markContactMessageRead({
      id: MESSAGE_ID,
      isRead: true,
    })

    expect(result.success).toBe(true)
    const call = prismaMock.contactMessage.update.mock.calls[0]?.[0]
    expect(call?.data.isRead).toBe(true)
    expect(call?.data.handledAt).toBeInstanceOf(Date)
  })

  it('efface la date quand on repasse en non lu', async () => {
    prismaMock.contactMessage.update.mockResolvedValue({
      id: MESSAGE_ID,
      isRead: false,
    } as never)

    await markContactMessageRead({ id: MESSAGE_ID, isRead: false })

    const call = prismaMock.contactMessage.update.mock.calls[0]?.[0]
    expect(call?.data.handledAt).toBeNull()
  })

  it('rejette un identifiant qui n est pas un cuid', async () => {
    const result = await markContactMessageRead({
      id: 'pas-un-cuid',
      isRead: true,
    })

    expect(result.success).toBe(false)
    expect(prismaMock.contactMessage.update).not.toHaveBeenCalled()
  })
})
