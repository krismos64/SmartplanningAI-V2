/**
 * Tests unitaires pour createAdminNotification (SP-476)
 *
 * Couvre :
 * - Creation de notifications pour tous les SYSTEM_ADMIN
 * - Emission SSE
 * - Aucun admin = no-op
 * - Paramètres optionnels (priority, actionUrl)
 * - Gestion d'erreur
 *
 * @ticket SP-476
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

const mockGetSystemAdminUserIds = vi.fn()
vi.mock('@/lib/services/admin-notification.service', () => ({
  getSystemAdminUserIds: () => mockGetSystemAdminUserIds(),
}))

const mockCreateMany = vi.fn()
const mockFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      createMany: (...args: unknown[]) => mockCreateMany(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

const mockEmitNotification = vi.fn()
vi.mock('@/lib/notifications', () => ({
  emitNotification: (...args: unknown[]) => mockEmitNotification(...args),
}))

// ============================================================================
// Import
// ============================================================================

import { createAdminNotification } from '../notifications'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_IDS = ['admin-001', 'admin-002']

const MOCK_NOTIFICATION = {
  id: 'notif-001',
  title: 'Nouvelle entreprise inscrite',
  message: 'Acme Corp vient de s\'inscrire',
  type: 'INFO',
  priority: 'MEDIUM',
  userId: 'admin-001',
  companyId: null,
  actionUrl: '/app/admin/logs',
  isRead: false,
  readAt: null,
  relatedType: null,
  relatedId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ============================================================================
// Tests
// ============================================================================

describe('createAdminNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSystemAdminUserIds.mockResolvedValue(ADMIN_IDS)
    mockCreateMany.mockResolvedValue({ count: 2 })
    mockFindMany.mockResolvedValue([
      { ...MOCK_NOTIFICATION, userId: 'admin-001' },
      { ...MOCK_NOTIFICATION, id: 'notif-002', userId: 'admin-002' },
    ])
  })

  it('cree des notifications pour chaque SYSTEM_ADMIN', async () => {
    await createAdminNotification({
      title: 'Nouvelle entreprise inscrite',
      message: 'Acme Corp vient de s\'inscrire',
      type: 'INFO' as any,
      actionUrl: '/app/admin/logs',
    })

    expect(mockCreateMany).toHaveBeenCalledTimes(1)
    const callArgs = mockCreateMany.mock.calls[0]![0] as any
    expect(callArgs.data).toHaveLength(2)
    expect(callArgs.data[0].userId).toBe('admin-001')
    expect(callArgs.data[1].userId).toBe('admin-002')
    expect(callArgs.data[0].title).toBe('Nouvelle entreprise inscrite')
    expect(callArgs.data[0].type).toBe('INFO')
    expect(callArgs.data[0].companyId).toBeNull()
  })

  it('emet via SSE a chaque admin', async () => {
    await createAdminNotification({
      title: 'Test',
      message: 'Test message',
      type: 'INFO' as any,
    })

    expect(mockEmitNotification).toHaveBeenCalledTimes(2)
    expect(mockEmitNotification).toHaveBeenCalledWith(
      'admin-001',
      expect.objectContaining({ userId: 'admin-001' })
    )
    expect(mockEmitNotification).toHaveBeenCalledWith(
      'admin-002',
      expect.objectContaining({ userId: 'admin-002' })
    )
  })

  it('ne fait rien si aucun admin', async () => {
    mockGetSystemAdminUserIds.mockResolvedValue([])

    await createAdminNotification({
      title: 'Test',
      message: 'Test message',
      type: 'INFO' as any,
    })

    expect(mockCreateMany).not.toHaveBeenCalled()
    expect(mockEmitNotification).not.toHaveBeenCalled()
  })

  it('utilise priority MEDIUM par defaut', async () => {
    await createAdminNotification({
      title: 'Test',
      message: 'Test',
      type: 'WARNING' as any,
    })

    const callArgs = mockCreateMany.mock.calls[0]![0] as any
    expect(callArgs.data[0].priority).toBe('MEDIUM')
  })

  it('accepte une priority custom', async () => {
    await createAdminNotification({
      title: 'Paiement echoue',
      message: 'Paiement echoue',
      type: 'WARNING' as any,
      priority: 'HIGH' as any,
    })

    const callArgs = mockCreateMany.mock.calls[0]![0] as any
    expect(callArgs.data[0].priority).toBe('HIGH')
  })

  it('gere actionUrl null par defaut', async () => {
    await createAdminNotification({
      title: 'Test',
      message: 'Test',
      type: 'SYSTEM' as any,
    })

    const callArgs = mockCreateMany.mock.calls[0]![0] as any
    expect(callArgs.data[0].actionUrl).toBeNull()
  })

  it('passe actionUrl quand fourni', async () => {
    await createAdminNotification({
      title: 'Test',
      message: 'Test',
      type: 'SYSTEM' as any,
      actionUrl: '/app/admin/logs',
    })

    const callArgs = mockCreateMany.mock.calls[0]![0] as any
    expect(callArgs.data[0].actionUrl).toBe('/app/admin/logs')
  })

  it('propage les erreurs Prisma', async () => {
    mockCreateMany.mockRejectedValue(new Error('DB error'))

    await expect(
      createAdminNotification({
        title: 'Test',
        message: 'Test',
        type: 'INFO' as any,
      })
    ).rejects.toThrow('DB error')
  })
})
