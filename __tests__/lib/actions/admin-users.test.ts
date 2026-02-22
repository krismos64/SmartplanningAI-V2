/**
 * Tests unitaires pour les Server Actions admin-users
 *
 * Couvre :
 * 1. getAllUsersAdmin — non SYSTEM_ADMIN → throw Unauthorized
 * 2. getAllUsersAdmin — sans params → retourne users paginés
 * 3. getAllUsersAdmin({ search }) → filtre OR email/name
 * 4. getAllUsersAdmin({ role }) → filtre par rôle
 * 5. toggleUserStatusAdmin — non SYSTEM_ADMIN → throw Unauthorized
 *
 * @ticket SP-472
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

// Import après mocks
import {
  getAllUsersAdmin,
  toggleUserStatusAdmin,
} from '@/lib/actions/admin-users'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: { id: 'admin-1', role: 'SYSTEM_ADMIN', companyId: null },
}

const DIRECTOR_SESSION = {
  user: { id: 'dir-1', role: 'DIRECTOR', companyId: 'comp-1' },
}

const mockUsers = [
  {
    id: 'user-1',
    email: 'alice@acme.com',
    emailVerified: null,
    name: 'Alice Martin',
    password: 'hash',
    image: null,
    role: 'DIRECTOR' as const,
    isActive: true,
    isEmailVerified: true,
    lastLoginAt: new Date('2026-02-20'),
    companyId: 'comp-1',
    company: { id: 'comp-1', name: 'Acme Corp' },
    preferences: null,
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2026-02-20'),
  },
  {
    id: 'user-2',
    email: 'bob@techcorp.com',
    emailVerified: null,
    name: 'Bob Dupont',
    password: 'hash',
    image: null,
    role: 'EMPLOYEE' as const,
    isActive: false,
    isEmailVerified: true,
    lastLoginAt: null,
    companyId: 'comp-2',
    company: { id: 'comp-2', name: 'TechCorp' },
    preferences: null,
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2026-01-10'),
  },
]

// ============================================================================
// Tests
// ============================================================================

describe('getAllUsersAdmin (SP-472)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue(ADMIN_SESSION)
  })

  // 1. Non SYSTEM_ADMIN → throw
  it('throw Unauthorized si non SYSTEM_ADMIN', async () => {
    mockAuth.mockResolvedValue(DIRECTOR_SESSION)

    await expect(getAllUsersAdmin()).rejects.toThrow('Unauthorized')
  })

  // 2. Sans params → retourne users paginés
  it('retourne les utilisateurs paginés sans filtre', async () => {
    prismaMock.user.findMany.mockResolvedValue(mockUsers)
    prismaMock.user.count.mockResolvedValue(2)

    const result = await getAllUsersAdmin()

    expect(result.total).toBe(2)
    expect(result.users).toHaveLength(2)
    expect(result.users[0].email).toBe('alice@acme.com')
    expect(result.users[0].companyName).toBe('Acme Corp')
    expect(result.users[0].isActive).toBe(true)
    expect(result.users[1].isActive).toBe(false)

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  // 3. Search → filtre OR email/name
  it('applique le filtre de recherche sur email et name', async () => {
    prismaMock.user.findMany.mockResolvedValue([mockUsers[0]])
    prismaMock.user.count.mockResolvedValue(1)

    await getAllUsersAdmin({ search: 'alice' })

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { email: { contains: 'alice', mode: 'insensitive' } },
            { name: { contains: 'alice', mode: 'insensitive' } },
          ],
        }),
      })
    )
  })

  // 4. Role filter
  it('applique le filtre par rôle', async () => {
    prismaMock.user.findMany.mockResolvedValue([])
    prismaMock.user.count.mockResolvedValue(0)

    await getAllUsersAdmin({ role: 'MANAGER' })

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: 'MANAGER',
        }),
      })
    )
  })
})

describe('toggleUserStatusAdmin (SP-472)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 5. Non SYSTEM_ADMIN → throw
  it('throw Unauthorized si non SYSTEM_ADMIN', async () => {
    mockAuth.mockResolvedValue(DIRECTOR_SESSION)

    await expect(
      toggleUserStatusAdmin('user-1', false)
    ).rejects.toThrow('Unauthorized')
  })
})
