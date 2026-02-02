/**
 * Tests unitaires pour les Server Actions du profil
 *
 * @ticket SP-270, SP-271
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProfile, updateProfile } from '@/lib/actions/profile'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    employee: {
      update: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import mocks après le mock
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

describe('getProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await getProfile()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Non authentifié')
    }
  })

  it('should return error when session has no user id', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: undefined },
    } as never)

    const result = await getProfile()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Non authentifié')
    }
  })

  it('should return user profile without employee (SYSTEM_ADMIN)', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-admin-1' },
    } as never)

    const mockUser = {
      id: 'user-admin-1',
      name: 'Admin Test',
      email: 'admin@smartplanning.fr',
      role: 'SYSTEM_ADMIN',
      emailVerified: null,
      isActive: true,
      lastLoginAt: new Date('2026-02-01T10:00:00Z'),
      createdAt: new Date('2025-01-01T00:00:00Z'),
      employee: null,
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

    const result = await getProfile()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.user.id).toBe('user-admin-1')
      expect(result.data.user.email).toBe('admin@smartplanning.fr')
      expect(result.data.user.role).toBe('SYSTEM_ADMIN')
      expect(result.data.employee).toBeNull()
    }
  })

  it('should return user profile with employee data (EMPLOYEE)', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-emp-1' },
    } as never)

    const mockUser = {
      id: 'user-emp-1',
      name: 'Jean Dupont',
      email: 'jean.dupont@company.com',
      role: 'EMPLOYEE',
      emailVerified: new Date('2025-06-15T12:00:00Z'),
      isActive: true,
      lastLoginAt: new Date('2026-02-02T08:30:00Z'),
      createdAt: new Date('2025-01-15T00:00:00Z'),
      employee: {
        id: 'emp-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        jobTitle: 'Développeur Full-Stack',
        department: 'Informatique',
        phone: '0612345678',
        email: 'jean.dupont@company.com',
        hireDate: new Date('2020-03-01T00:00:00Z'),
        weeklyHours: 35,
        team: {
          id: 'team-1',
          name: 'Équipe Dev',
        },
      },
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

    const result = await getProfile()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.user.role).toBe('EMPLOYEE')
      expect(result.data.employee).not.toBeNull()
      expect(result.data.employee?.firstName).toBe('Jean')
      expect(result.data.employee?.lastName).toBe('Dupont')
      expect(result.data.employee?.jobTitle).toBe('Développeur Full-Stack')
      expect(result.data.employee?.team?.name).toBe('Équipe Dev')
      expect(result.data.employee?.weeklyHours).toBe(35)
    }
  })

  it('should return user profile with employee but no team', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-emp-2' },
    } as never)

    const mockUser = {
      id: 'user-emp-2',
      name: 'Marie Martin',
      email: 'marie@company.com',
      role: 'EMPLOYEE',
      emailVerified: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2025-12-01T00:00:00Z'),
      employee: {
        id: 'emp-2',
        firstName: 'Marie',
        lastName: 'Martin',
        jobTitle: null,
        department: null,
        phone: null,
        email: null,
        hireDate: null,
        weeklyHours: 39,
        team: null,
      },
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

    const result = await getProfile()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.employee?.firstName).toBe('Marie')
      expect(result.data.employee?.team).toBeNull()
      expect(result.data.employee?.jobTitle).toBeNull()
    }
  })

  it('should return error when user not found in database', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'nonexistent-user' },
    } as never)

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const result = await getProfile()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Utilisateur non trouvé')
    }
  })

  it('should handle database errors gracefully', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error('Database connection failed')
    )

    const result = await getProfile()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Erreur lors de la récupération du profil')
    }
  })

  it('should include all required user fields', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@test.com',
      role: 'DIRECTOR',
      emailVerified: new Date(),
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      employee: null,
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

    const result = await getProfile()

    expect(result.success).toBe(true)
    if (result.success) {
      // Vérifier que tous les champs requis sont présents
      expect(result.data.user).toHaveProperty('id')
      expect(result.data.user).toHaveProperty('name')
      expect(result.data.user).toHaveProperty('email')
      expect(result.data.user).toHaveProperty('role')
      expect(result.data.user).toHaveProperty('emailVerified')
      expect(result.data.user).toHaveProperty('isActive')
      expect(result.data.user).toHaveProperty('lastLoginAt')
      expect(result.data.user).toHaveProperty('createdAt')
    }
  })

  it('should call prisma with correct select fields', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      name: 'Test',
      email: 'test@test.com',
      role: 'EMPLOYEE',
      emailVerified: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      employee: null,
    } as never)

    await getProfile()

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: expect.objectContaining({
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        employee: expect.any(Object),
      }),
    })
  })
})

// ============================================================================
// TESTS updateProfile
// ============================================================================
describe('updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await updateProfile({
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Non authentifié')
    }
  })

  it('should return validation error for invalid firstName', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    const result = await updateProfile({
      firstName: 'J', // Trop court
      lastName: 'Dupont',
      phone: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Minimum 2 caractères')
      expect(result.field).toBe('firstName')
    }
  })

  it('should return validation error for invalid phone format', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    const result = await updateProfile({
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '123', // Format invalide
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Numéro invalide')
      expect(result.field).toBe('phone')
    }
  })

  it('should return error when user not found', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'nonexistent-user' },
    } as never)

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const result = await updateProfile({
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Utilisateur non trouvé')
    }
  })

  it('should update Employee and User.name when user has employee', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-emp-1' },
    } as never)

    // Premier appel: findUnique avec include
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-emp-1',
      name: 'Ancien Nom',
      employee: {
        id: 'emp-1',
        firstName: 'Ancien',
        lastName: 'Nom',
        phone: null,
      },
    } as never)

    // Mock employee.update
    vi.mocked(prisma.employee.update).mockResolvedValue({
      id: 'emp-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0612345678',
    } as never)

    // Mock user.update
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-emp-1',
      name: 'Jean Dupont',
    } as never)

    // Second appel: findUnique avec select (dans getProfile)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-emp-1',
      name: 'Jean Dupont',
      email: 'jean@company.com',
      role: 'EMPLOYEE',
      emailVerified: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      employee: {
        id: 'emp-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        jobTitle: null,
        department: null,
        phone: '0612345678',
        email: null,
        hireDate: null,
        weeklyHours: 35,
        team: null,
      },
    } as never)

    const result = await updateProfile({
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0612345678',
    })

    expect(result.success).toBe(true)
    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '0612345678',
      },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-emp-1' },
      data: { name: 'Jean Dupont' },
    })
  })

  it('should update only User.name when user has no employee (SYSTEM_ADMIN)', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-admin-1' },
    } as never)

    // Premier appel: findUnique avec include
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-admin-1',
      name: 'Admin Test',
      employee: null,
    } as never)

    // Mock user.update
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-admin-1',
      name: 'Super Admin',
    } as never)

    // Second appel: findUnique avec select (dans getProfile)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-admin-1',
      name: 'Super Admin',
      email: 'admin@smartplanning.fr',
      role: 'SYSTEM_ADMIN',
      emailVerified: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      employee: null,
    } as never)

    const result = await updateProfile({
      firstName: 'Super',
      lastName: 'Admin',
      phone: '',
    })

    expect(result.success).toBe(true)
    expect(prisma.employee.update).not.toHaveBeenCalled()
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-admin-1' },
      data: { name: 'Super Admin' },
    })
  })

  it('should call revalidatePath after successful update', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-1',
      name: 'Test',
      employee: null,
    } as never)

    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-1',
      name: 'Jean Dupont',
    } as never)

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-1',
      name: 'Jean Dupont',
      email: 'test@test.com',
      role: 'SYSTEM_ADMIN',
      emailVerified: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      employee: null,
    } as never)

    await updateProfile({
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '',
    })

    expect(revalidatePath).toHaveBeenCalledWith('/app/profile')
    expect(revalidatePath).toHaveBeenCalledWith('/app/profile/edit')
  })

  it('should set phone to null when phone is empty string', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-emp-1' },
    } as never)

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-emp-1',
      name: 'Test',
      employee: {
        id: 'emp-1',
        firstName: 'Test',
        lastName: 'User',
        phone: '0612345678',
      },
    } as never)

    vi.mocked(prisma.employee.update).mockResolvedValue({} as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-emp-1',
      name: 'Jean Dupont',
      email: 'test@test.com',
      role: 'EMPLOYEE',
      emailVerified: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      employee: {
        id: 'emp-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        jobTitle: null,
        department: null,
        phone: null,
        email: null,
        hireDate: null,
        weeklyHours: 35,
        team: null,
      },
    } as never)

    await updateProfile({
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '', // Vide
    })

    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: null, // Doit être null, pas ''
      },
    })
  })

  it('should handle database errors gracefully', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error('Database connection failed')
    )

    const result = await updateProfile({
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Erreur lors de la mise à jour du profil')
    }
  })

  it('should return updated profile data after success', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-emp-1' },
    } as never)

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-emp-1',
      name: 'Old Name',
      employee: {
        id: 'emp-1',
        firstName: 'Old',
        lastName: 'Name',
        phone: null,
      },
    } as never)

    vi.mocked(prisma.employee.update).mockResolvedValue({} as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-emp-1',
      name: 'Jean Dupont',
      email: 'jean@test.com',
      role: 'EMPLOYEE',
      emailVerified: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      employee: {
        id: 'emp-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        jobTitle: null,
        department: null,
        phone: '0612345678',
        email: null,
        hireDate: null,
        weeklyHours: 35,
        team: null,
      },
    } as never)

    const result = await updateProfile({
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0612345678',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.user.name).toBe('Jean Dupont')
      expect(result.data.employee?.firstName).toBe('Jean')
      expect(result.data.employee?.lastName).toBe('Dupont')
      expect(result.data.employee?.phone).toBe('0612345678')
    }
  })
})
