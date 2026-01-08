/**
 * Tests unitaires pour les Server Actions Companies
 *
 * @description Tests des opérations CRUD pour les entreprises
 * avec mocks Prisma et vérification RBAC.
 *
 * @ticket SP-151
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../mocks/prisma'

// Mock auth pour RBAC
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'admin-1',
      role: 'SYSTEM_ADMIN',
      companyId: null,
    },
  }),
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import après les mocks
import {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  toggleCompanyStatus,
} from '@/lib/actions/companies'

// ============================================================================
// Fixtures
// ============================================================================

const mockCompany = {
  id: 'company-1',
  name: 'Acme Corp',
  slug: 'acme-corp',
  logo: null,
  email: 'contact@acme.com',
  phone: '+33123456789',
  address: '123 Rue Test',
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
  workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
  timezone: 'Europe/Paris',
  subscriptionPlan: 'BUSINESS',
  subscriptionStatus: 'ACTIVE',
  trialEndsAt: null,
  subscriptionEndsAt: null,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
}

const mockCompanyWithCounts = {
  ...mockCompany,
  _count: {
    users: 5,
    teams: 2,
    employees: 10,
  },
}

// ============================================================================
// Tests listCompanies
// ============================================================================

describe('listCompanies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return paginated companies list', async () => {
    prismaMock.company.count.mockResolvedValue(1)
    prismaMock.company.findMany.mockResolvedValue([mockCompanyWithCounts])

    const result = await listCompanies({ page: 1, pageSize: 10 })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data).toHaveLength(1)
      expect(result.data.total).toBe(1)
      expect(result.data.data[0].name).toBe('Acme Corp')
    }
  })

  it('should filter by subscription plan', async () => {
    prismaMock.company.count.mockResolvedValue(1)
    prismaMock.company.findMany.mockResolvedValue([mockCompanyWithCounts])

    await listCompanies({}, { subscriptionPlan: 'BUSINESS' })

    expect(prismaMock.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          subscriptionPlan: 'BUSINESS',
        }),
      })
    )
  })

  it('should filter by search term', async () => {
    prismaMock.company.count.mockResolvedValue(1)
    prismaMock.company.findMany.mockResolvedValue([mockCompanyWithCounts])

    await listCompanies({}, { search: 'acme' })

    expect(prismaMock.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: { contains: 'acme', mode: 'insensitive' } }),
          ]),
        }),
      })
    )
  })

  it('should filter by isActive status', async () => {
    prismaMock.company.count.mockResolvedValue(1)
    prismaMock.company.findMany.mockResolvedValue([mockCompanyWithCounts])

    await listCompanies({}, { isActive: true })

    expect(prismaMock.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
        }),
      })
    )
  })

  it('should apply pagination correctly', async () => {
    prismaMock.company.count.mockResolvedValue(25)
    prismaMock.company.findMany.mockResolvedValue([])

    await listCompanies({ page: 2, pageSize: 10 })

    expect(prismaMock.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    )
  })
})

// ============================================================================
// Tests getCompany
// ============================================================================

describe('getCompany', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return company details by ID', async () => {
    prismaMock.company.findUnique.mockResolvedValue(mockCompanyWithCounts)

    const result = await getCompany('company-1')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('company-1')
      expect(result.data.name).toBe('Acme Corp')
    }
  })

  it('should return error for non-existent company', async () => {
    prismaMock.company.findUnique.mockResolvedValue(null)

    const result = await getCompany('non-existent')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Entreprise non trouvée')
    }
  })
})

// ============================================================================
// Tests createCompany
// ============================================================================

describe('createCompany', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a company with valid data', async () => {
    prismaMock.company.findUnique.mockResolvedValue(null) // slug not taken
    prismaMock.company.create.mockResolvedValue(mockCompanyWithCounts)

    const result = await createCompany({
      name: 'Acme Corp',
      email: 'contact@acme.com',
      timezone: 'Europe/Paris',
      subscriptionPlan: 'BUSINESS',
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    })

    expect(result.success).toBe(true)
    expect(prismaMock.company.create).toHaveBeenCalled()
  })

  it('should generate unique slug on creation', async () => {
    prismaMock.company.findUnique.mockResolvedValue(null)
    prismaMock.company.create.mockResolvedValue(mockCompanyWithCounts)

    await createCompany({
      name: 'Acme Corp',
    })

    expect(prismaMock.company.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'acme-corp',
        }),
      })
    )
  })

  it('should reject invalid email format', async () => {
    const result = await createCompany({
      name: 'Test Company',
      email: 'invalid-email',
    })

    expect(result.success).toBe(false)
  })

  it('should reject name shorter than 2 characters', async () => {
    const result = await createCompany({
      name: 'A',
    })

    expect(result.success).toBe(false)
  })

  it('should set default values for optional fields', async () => {
    prismaMock.company.findUnique.mockResolvedValue(null)
    prismaMock.company.create.mockResolvedValue(mockCompanyWithCounts)

    await createCompany({
      name: 'New Company',
    })

    expect(prismaMock.company.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          timezone: 'Europe/Paris',
          subscriptionPlan: 'FREE',
          subscriptionStatus: 'TRIAL',
          isActive: true,
        }),
      })
    )
  })
})

// ============================================================================
// Tests updateCompany
// ============================================================================

describe('updateCompany', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update company with valid data', async () => {
    prismaMock.company.findUnique.mockResolvedValue(mockCompany)
    prismaMock.company.update.mockResolvedValue(mockCompanyWithCounts)

    const result = await updateCompany({
      id: 'company-1',
      name: 'Updated Acme Corp',
    })

    expect(result.success).toBe(true)
    expect(prismaMock.company.update).toHaveBeenCalled()
  })

  it('should return error for non-existent company', async () => {
    prismaMock.company.findUnique.mockResolvedValue(null)

    const result = await updateCompany({
      id: 'non-existent',
      name: 'Updated Name',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Entreprise non trouvée')
    }
  })

  it('should generate new slug when name changes', async () => {
    prismaMock.company.findUnique
      .mockResolvedValueOnce(mockCompany) // existing company
      .mockResolvedValueOnce(null) // new slug not taken
    prismaMock.company.update.mockResolvedValue({
      ...mockCompanyWithCounts,
      name: 'New Company Name',
      slug: 'new-company-name',
    })

    await updateCompany({
      id: 'company-1',
      name: 'New Company Name',
    })

    expect(prismaMock.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'new-company-name',
        }),
      })
    )
  })

  it('should convert empty strings to null', async () => {
    prismaMock.company.findUnique.mockResolvedValue(mockCompany)
    prismaMock.company.update.mockResolvedValue(mockCompanyWithCounts)

    await updateCompany({
      id: 'company-1',
      email: '',
      phone: '',
    })

    expect(prismaMock.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: null,
          phone: null,
        }),
      })
    )
  })
})

// ============================================================================
// Tests deleteCompany
// ============================================================================

describe('deleteCompany', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete existing company', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      ...mockCompany,
      _count: { users: 0, employees: 0 },
    })
    prismaMock.company.delete.mockResolvedValue(mockCompany)

    const result = await deleteCompany('company-1')

    expect(result.success).toBe(true)
    expect(prismaMock.company.delete).toHaveBeenCalledWith({
      where: { id: 'company-1' },
    })
  })

  it('should return error for non-existent company', async () => {
    prismaMock.company.findUnique.mockResolvedValue(null)

    const result = await deleteCompany('non-existent')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('non trouvée')
    }
  })
})

// ============================================================================
// Tests toggleCompanyStatus
// ============================================================================

describe('toggleCompanyStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should activate inactive company', async () => {
    prismaMock.company.update.mockResolvedValue({
      ...mockCompanyWithCounts,
      isActive: true,
    })

    const result = await toggleCompanyStatus('company-1', true)

    expect(result.success).toBe(true)
    expect(prismaMock.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isActive: true },
      })
    )
  })

  it('should deactivate active company', async () => {
    prismaMock.company.update.mockResolvedValue({
      ...mockCompanyWithCounts,
      isActive: false,
    })

    const result = await toggleCompanyStatus('company-1', false)

    expect(result.success).toBe(true)
    expect(prismaMock.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isActive: false },
      })
    )
  })
})
