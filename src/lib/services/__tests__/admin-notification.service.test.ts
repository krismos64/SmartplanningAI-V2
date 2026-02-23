/**
 * Tests unitaires pour admin-notification.service
 *
 * Couvre : getSystemAdminUserIds
 * @ticket SP-476
 */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

const mockFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findMany: (...args: any[]) => mockFindMany(...args),
    },
  },
}))

// ============================================================================
// Import
// ============================================================================

import { getSystemAdminUserIds } from '../admin-notification.service'

// ============================================================================
// Tests
// ============================================================================

describe('getSystemAdminUserIds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne les IDs des SYSTEM_ADMIN actifs', async () => {
    mockFindMany.mockResolvedValue([{ id: 'admin-001' }, { id: 'admin-002' }])

    const ids = await getSystemAdminUserIds()

    expect(ids).toEqual(['admin-001', 'admin-002'])
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { role: 'SYSTEM_ADMIN', isActive: true },
      select: { id: true },
    })
  })

  it('retourne un tableau vide si aucun admin', async () => {
    mockFindMany.mockResolvedValue([])

    const ids = await getSystemAdminUserIds()

    expect(ids).toEqual([])
  })

  it('propage les erreurs Prisma', async () => {
    mockFindMany.mockRejectedValue(new Error('DB error'))

    await expect(getSystemAdminUserIds()).rejects.toThrow('DB error')
  })
})
