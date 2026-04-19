/**
 * Tests unitaires pour les Server Actions de messagerie
 *
 * @ticket SP-507
 */

/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    conversation: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    conversationMember: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn(),
    },
    message: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    employee: {
      findFirst: vi.fn(),
    },
    team: {
      findUnique: vi.fn(),
    },
    company: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/impersonation', () => ({
  getEffectiveSessionData: vi.fn(),
  assertNotImpersonating: vi.fn().mockResolvedValue(null),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/services/audit', () => ({
  logAuditAction: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/notifications/emit-message', () => ({
  emitNewMessage: vi.fn(),
}))

import { auth } from '@/lib/auth'
import {
  getEffectiveSessionData,
  assertNotImpersonating,
} from '@/lib/impersonation'
import {
  sendMessage,
  getMessages,
  createDirectConversation,
  createGroupConversation,
  markAsRead,
  getConversations,
  searchAllUsersForAdmin,
} from '../messaging'

// ============================================================================
// Constantes — faux CUIDs valides pour les tests
// ============================================================================

const USER_1 = 'cl000000000000000000user1'
const USER_2 = 'cl000000000000000000user2'
const CONV_1 = 'cl000000000000000000conv1'
const COMP_1 = 'cl000000000000000000comp1'
const COMP_2 = 'cl000000000000000000comp2'
const ADMIN_USER = 'cl00000000000000000admin1'

// ============================================================================
// Helpers
// ============================================================================

function mockSession(role: string, companyId: string | null, userId = USER_1) {
  vi.mocked(auth).mockResolvedValue({
    user: { id: userId, role, companyId, email: 'test@test.com' },
    expires: '2026-12-31',
  } as never)
  vi.mocked(getEffectiveSessionData).mockResolvedValue({
    userId,
    role,
    companyId,
  } as never)
}

// ============================================================================
// Tests
// ============================================================================

describe('Messaging Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(assertNotImpersonating).mockResolvedValue(null as never)
  })

  // ------------------------------------------------------------------
  // sendMessage
  // ------------------------------------------------------------------

  describe('sendMessage', () => {
    it('refuse si non authentifié', async () => {
      vi.mocked(auth).mockResolvedValue(null as never)

      const result = await sendMessage({
        conversationId: CONV_1,
        content: 'Hello',
      })

      expect(result.success).toBe(false)
      if (!result.success) expect(result.error).toContain('connecté')
    })

    it('refuse si pas membre de la conversation', async () => {
      mockSession('EMPLOYEE', COMP_1)
      mockPrisma.conversationMember.findUnique.mockResolvedValue(null)

      const result = await sendMessage({
        conversationId: CONV_1,
        content: 'Hello',
      })

      expect(result.success).toBe(false)
      if (!result.success) expect(result.error).toContain('membre')
    })

    it('refuse en mode impersonation', async () => {
      mockSession('DIRECTOR', COMP_1)
      vi.mocked(assertNotImpersonating).mockResolvedValue({
        success: false,
        error: 'Mode support actif',
      })

      const result = await sendMessage({
        conversationId: CONV_1,
        content: 'Hello',
      })

      expect(result.success).toBe(false)
    })

    it('crée un message avec content', async () => {
      mockSession('EMPLOYEE', COMP_1)
      mockPrisma.conversationMember.findUnique.mockResolvedValue({
        id: 'cl00000000000000000member1',
      })
      mockPrisma.conversation.findUnique.mockResolvedValue({
        id: CONV_1,
        companyId: COMP_1,
      })
      mockPrisma.message.create.mockResolvedValue({
        id: 'cl0000000000000000000msg1',
        conversationId: CONV_1,
        senderId: USER_1,
        sender: { id: USER_1, name: 'Test', image: null },
        content: 'Hello',
        attachments: null,
        isDeleted: false,
        createdAt: new Date(),
      })
      mockPrisma.conversation.update.mockResolvedValue({})
      mockPrisma.conversationMember.findMany.mockResolvedValue([
        { userId: USER_1 },
        { userId: USER_2 },
      ])

      const result = await sendMessage({
        conversationId: CONV_1,
        content: 'Hello',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.content).toBe('Hello')
        expect(result.data.senderId).toBe(USER_1)
      }
    })

    it('refuse si content ET attachments sont vides', async () => {
      mockSession('EMPLOYEE', COMP_1)

      const result = await sendMessage({
        conversationId: CONV_1,
        content: '',
        attachments: [],
      })

      expect(result.success).toBe(false)
      if (!result.success)
        expect(result.error).toContain('texte ou au moins une pièce jointe')
    })
  })

  // ------------------------------------------------------------------
  // getMessages
  // ------------------------------------------------------------------

  describe('getMessages', () => {
    it('retourne hasMore correctement', async () => {
      mockSession('EMPLOYEE', COMP_1)
      mockPrisma.conversationMember.findUnique.mockResolvedValue({
        id: 'cl00000000000000000member1',
      })

      // Retourner 31 messages (take=30 + 1 pour hasMore)
      const messages = Array.from({ length: 31 }, (_, i) => ({
        id: `cl00000000000000000msg${String(i).padStart(3, '0')}`,
        conversationId: CONV_1,
        senderId: USER_1,
        sender: { id: USER_1, name: 'Test', image: null },
        content: `Message ${i}`,
        attachments: null,
        isDeleted: false,
        createdAt: new Date(2026, 3, 1, 0, 0, i),
      }))
      mockPrisma.message.findMany.mockResolvedValue(messages)

      const result = await getMessages(CONV_1)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.messages.length).toBe(30)
        expect(result.data.hasMore).toBe(true)
      }
    })
  })

  // ------------------------------------------------------------------
  // createDirectConversation
  // ------------------------------------------------------------------

  describe('createDirectConversation', () => {
    it('retourne une conversation existante si déjà créée', async () => {
      mockSession('EMPLOYEE', COMP_1)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: USER_2,
        companyId: COMP_1,
      })
      mockPrisma.conversation.findFirst.mockResolvedValue({
        id: 'cl0000000000000convexisting',
        type: 'DIRECT',
        name: null,
        teamId: null,
        companyId: COMP_1,
        createdById: USER_1,
        lastMessageAt: null,
        lastMessagePreview: null,
        createdAt: new Date(),
        members: [
          {
            userId: USER_1,
            user: { id: USER_1, name: 'User 1', image: null },
            role: 'MEMBER',
          },
          {
            userId: USER_2,
            user: { id: USER_2, name: 'User 2', image: null },
            role: 'MEMBER',
          },
        ],
      })

      const result = await createDirectConversation(USER_2)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('cl0000000000000convexisting')
      }
      expect(mockPrisma.conversation.create).not.toHaveBeenCalled()
    })

    it('refuse si targetUser dans une autre company', async () => {
      mockSession('EMPLOYEE', COMP_1)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: USER_2,
        companyId: 'cl000000000000000000comp2',
      })

      const result = await createDirectConversation(USER_2)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.error).toContain('entreprise')
    })
  })

  // ------------------------------------------------------------------
  // createGroupConversation
  // ------------------------------------------------------------------

  describe('createGroupConversation', () => {
    it('permet à un EMPLOYEE de créer un groupe', async () => {
      mockSession('EMPLOYEE', COMP_1)
      mockPrisma.user.findMany.mockResolvedValue([{ id: USER_2 }])
      mockPrisma.conversation.create.mockResolvedValue({
        id: CONV_1,
        type: 'GROUP',
        name: 'Mon groupe',
        teamId: null,
        avatarUrl: null,
        companyId: COMP_1,
        createdById: USER_1,
        lastMessageAt: null,
        lastMessagePreview: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          {
            userId: USER_1,
            user: { id: USER_1, name: 'User 1', image: null },
            role: 'ADMIN',
          },
          {
            userId: USER_2,
            user: { id: USER_2, name: 'User 2', image: null },
            role: 'MEMBER',
          },
        ],
      })

      const result = await createGroupConversation({
        name: 'Mon groupe',
        memberUserIds: [USER_2],
      })

      expect(result.success).toBe(true)
    })
  })

  // ------------------------------------------------------------------
  // markAsRead
  // ------------------------------------------------------------------

  describe('markAsRead', () => {
    it('met à jour lastReadAt', async () => {
      mockSession('EMPLOYEE', COMP_1)
      mockPrisma.conversationMember.update.mockResolvedValue({
        id: 'cl00000000000000000member1',
        lastReadAt: new Date(),
      })

      const result = await markAsRead(CONV_1)

      expect(result.success).toBe(true)
      expect(mockPrisma.conversationMember.update).toHaveBeenCalledWith({
        where: {
          conversationId_userId: { conversationId: CONV_1, userId: USER_1 },
        },
        data: { lastReadAt: expect.any(Date) },
      })
    })
  })

  // ------------------------------------------------------------------
  // SP-520 — createDirectConversation : cas admin cross-tenant
  // ------------------------------------------------------------------

  describe('createDirectConversation — SP-520 admin cross-tenant', () => {
    it('SYSTEM_ADMIN crée une conv cross-tenant avec companyId null', async () => {
      mockSession('SYSTEM_ADMIN', null, ADMIN_USER)
      // targetUser dans COMP_2 (autre company)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: USER_2,
        name: 'User Two',
        companyId: COMP_2,
        company: { name: 'Entreprise B' },
      })
      // Pas de conversation existante
      mockPrisma.conversation.findFirst.mockResolvedValue(null)
      mockPrisma.conversation.create.mockResolvedValue({
        id: CONV_1,
        type: 'DIRECT',
        name: null,
        teamId: null,
        avatarUrl: null,
        companyId: null,
        createdById: ADMIN_USER,
        lastMessageAt: null,
        lastMessagePreview: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          { userId: ADMIN_USER, user: { id: ADMIN_USER, name: 'Admin', image: null }, role: 'MEMBER' },
          { userId: USER_2, user: { id: USER_2, name: 'User Two', image: null }, role: 'MEMBER' },
        ],
      })

      const result = await createDirectConversation(USER_2)

      expect(result.success).toBe(true)
      expect(mockPrisma.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ companyId: null }),
        })
      )
    })

    it('SYSTEM_ADMIN contactant un autre admin (companyId null) conserve companyId null', async () => {
      mockSession('SYSTEM_ADMIN', null, ADMIN_USER)
      // targetUser est aussi un SYSTEM_ADMIN (companyId null)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: USER_2,
        name: 'Admin 2',
        companyId: null,
        company: null,
      })
      mockPrisma.conversation.findFirst.mockResolvedValue(null)
      mockPrisma.conversation.create.mockResolvedValue({
        id: CONV_1,
        type: 'DIRECT',
        name: null,
        teamId: null,
        avatarUrl: null,
        companyId: null,
        createdById: ADMIN_USER,
        lastMessageAt: null,
        lastMessagePreview: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          { userId: ADMIN_USER, user: { id: ADMIN_USER, name: 'Admin', image: null }, role: 'MEMBER' },
          { userId: USER_2, user: { id: USER_2, name: 'Admin 2', image: null }, role: 'MEMBER' },
        ],
      })

      const result = await createDirectConversation(USER_2)

      expect(result.success).toBe(true)
      expect(mockPrisma.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ companyId: null }),
        })
      )
    })

    it('non-admin ne peut pas créer une conv cross-tenant', async () => {
      mockSession('MANAGER', COMP_1, USER_1)
      // targetUser dans une autre company
      mockPrisma.user.findUnique.mockResolvedValue({
        id: USER_2,
        name: 'User Two',
        companyId: COMP_2,
        company: { name: 'Entreprise B' },
      })

      const result = await createDirectConversation(USER_2)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.error).toContain('entreprise')
      expect(mockPrisma.conversation.create).not.toHaveBeenCalled()
    })

    it('non-admin peut créer une conv intra-company', async () => {
      mockSession('MANAGER', COMP_1, USER_1)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: USER_2,
        name: 'User Two',
        companyId: COMP_1,
        company: { name: 'Entreprise A' },
      })
      mockPrisma.conversation.findFirst.mockResolvedValue(null)
      mockPrisma.conversation.create.mockResolvedValue({
        id: CONV_1,
        type: 'DIRECT',
        name: null,
        teamId: null,
        avatarUrl: null,
        companyId: COMP_1,
        createdById: USER_1,
        lastMessageAt: null,
        lastMessagePreview: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          { userId: USER_1, user: { id: USER_1, name: 'User One', image: null }, role: 'MEMBER' },
          { userId: USER_2, user: { id: USER_2, name: 'User Two', image: null }, role: 'MEMBER' },
        ],
      })

      const result = await createDirectConversation(USER_2)

      expect(result.success).toBe(true)
    })

    it('self-conversation toujours bloquée (admin)', async () => {
      mockSession('SYSTEM_ADMIN', null, ADMIN_USER)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: ADMIN_USER,
        name: 'Admin',
        companyId: null,
        company: null,
      })

      const result = await createDirectConversation(ADMIN_USER)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.error).toContain('vous-même')
      expect(mockPrisma.conversation.create).not.toHaveBeenCalled()
    })

    it('self-conversation toujours bloquée (non-admin)', async () => {
      mockSession('EMPLOYEE', COMP_1, USER_1)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: USER_1,
        name: 'User One',
        companyId: COMP_1,
        company: { name: 'Entreprise A' },
      })

      const result = await createDirectConversation(USER_1)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.error).toContain('vous-même')
      expect(mockPrisma.conversation.create).not.toHaveBeenCalled()
    })
  })

  // ------------------------------------------------------------------
  // SP-520 — getConversations : bypass companyId pour SYSTEM_ADMIN
  // ------------------------------------------------------------------

  describe('getConversations — SP-520 admin bypass', () => {
    it('SYSTEM_ADMIN appelle findMany sans filtre companyId', async () => {
      mockSession('SYSTEM_ADMIN', null, ADMIN_USER)
      mockPrisma.conversation.findMany.mockResolvedValue([])

      await getConversations()

      expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ companyId: expect.anything() }),
        })
      )
    })

    it('MANAGER appelle findMany avec filtre companyId', async () => {
      mockSession('MANAGER', COMP_1, USER_1)
      mockPrisma.conversation.findMany.mockResolvedValue([])

      await getConversations()

      expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: COMP_1 }),
        })
      )
    })
  })

  // ------------------------------------------------------------------
  // SP-520 — searchAllUsersForAdmin : pagination, filtres, RBAC
  // ------------------------------------------------------------------

  describe('searchAllUsersForAdmin — SP-520', () => {
    it('retourne une erreur pour un rôle non-admin', async () => {
      mockSession('MANAGER', COMP_1, USER_1)

      const result = await searchAllUsersForAdmin({ page: 1 })

      expect(result.success).toBe(false)
      if (!result.success) expect(result.error).toContain('refusé')
    })

    it('retourne la page 1 avec hasMore quand 11 résultats (take=11)', async () => {
      mockSession('SYSTEM_ADMIN', null, ADMIN_USER)
      const fakeUsers = Array.from({ length: 11 }, (_, i) => ({
        id: `cl0000000000000000000usr${String(i).padStart(2, '0')}`,
        name: `User ${i}`,
        image: null,
        role: 'EMPLOYEE',
        companyId: COMP_1,
        company: { name: 'Entreprise A' },
      }))
      mockPrisma.user.findMany.mockResolvedValue(fakeUsers)
      mockPrisma.user.count.mockResolvedValue(25)

      const result = await searchAllUsersForAdmin({ page: 1 })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.users.length).toBe(10)
        expect(result.data.hasMore).toBe(true)
        expect(result.data.total).toBe(25)
      }
    })

    it('transmet le filtre search dans le where Prisma', async () => {
      mockSession('SYSTEM_ADMIN', null, ADMIN_USER)
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(0)

      await searchAllUsersForAdmin({ search: 'Martin', page: 1 })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = mockPrisma.user.findMany.mock.calls[0]?.[0] as unknown as Record<string, any>
      expect((callArgs.where as Record<string, unknown>).OR).toBeDefined()
      expect(JSON.stringify((callArgs.where as Record<string, unknown>).OR)).toContain('Martin')
    })

    it('transmet le filtre companyId dans le where Prisma', async () => {
      mockSession('SYSTEM_ADMIN', null, ADMIN_USER)
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(0)

      await searchAllUsersForAdmin({ companyId: COMP_1, page: 1 })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = mockPrisma.user.findMany.mock.calls[0]?.[0] as unknown as Record<string, any>
      expect((callArgs.where as Record<string, unknown>).companyId).toBe(COMP_1)
    })

    it("exclut l'admin courant des résultats", async () => {
      mockSession('SYSTEM_ADMIN', null, ADMIN_USER)
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(0)

      await searchAllUsersForAdmin({ page: 1 })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = mockPrisma.user.findMany.mock.calls[0]?.[0] as unknown as Record<string, any>
      expect((callArgs.where as Record<string, unknown>).id).toEqual({ not: ADMIN_USER })
    })
  })
})
