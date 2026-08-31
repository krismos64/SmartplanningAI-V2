/**
 * Tests unitaires pour les Server Actions Employees
 *
 * @description Tests des operations CRUD avec RBAC multi-role.
 * Verifie les acces differencies selon SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE.
 *
 * @ticket SP-152
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../mocks/prisma'

// Variable pour controler le mock auth dynamiquement
let mockUserData = {
  id: 'admin-1',
  role: 'SYSTEM_ADMIN' as const,
  companyId: null as string | null,
}

// Mock auth pour RBAC - dynamique selon le test
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockImplementation(() =>
    Promise.resolve({
      user: mockUserData,
    })
  ),
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock syncEmployeeCountToStripe (SP-439)
const mockSyncEmployeeCountToStripe = vi.fn().mockResolvedValue({
  synced: true,
  previousQuantity: 5,
  newQuantity: 6,
})
vi.mock('@/lib/services/stripe', () => ({
  syncEmployeeCountToStripe: (...args: unknown[]) =>
    mockSyncEmployeeCountToStripe(...args),
}))

// Mock des nouveaux imports du système d'invitation
vi.mock('@/lib/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-placeholder'),
}))
vi.mock('@/lib/email/templates/invitation', () => ({
  sendInvitationEmail: vi.fn().mockResolvedValue({ success: true }),
}))
vi.mock('@/lib/notifications/emit-notification', () => ({
  emitNotification: vi.fn(),
}))
vi.mock('@/lib/impersonation', () => ({
  assertNotImpersonating: vi.fn(),
  getEffectiveSessionData: vi
    .fn()
    .mockImplementation(
      (session: {
        user: { id: string; role: string; companyId?: string | null }
      }) =>
        Promise.resolve({
          userId: session.user.id,
          role: session.user.role,
          companyId: session.user.companyId ?? null,
        })
    ),
}))
vi.mock('@/lib/services/audit', () => ({
  logAuditAction: vi.fn().mockResolvedValue(undefined),
}))

// Import apres les mocks
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  getTeamsForSelect,
  bulkDeleteEmployees,
  resendInvitationByEmployee,
} from '@/lib/actions/employees'

// ============================================================================
// Fixtures
// ============================================================================

// IDs au format CUID valide pour la validation Zod
const COMPANY_ID = 'cltest00000000000company1'
const COMPANY_ID_2 = 'cltest00000000000company2'
const TEAM_ID = 'cltest000000000000team001'
const TEAM_ID_2 = 'cltest000000000000team002'
const EMP_ID = 'cltest0000000000000emp001'
const USER_ID = 'cltest000000000000user001'

// Fixture entreprise pour company.findUnique (requis par createEmployee)
const mockCompany = { id: COMPANY_ID, name: 'Acme Corp' }

const mockEmployee = {
  id: EMP_ID,
  userId: USER_ID,
  firstName: 'Jean',
  lastName: 'Dupont',
  jobTitle: 'Developpeur',
  department: 'TECHNIQUE',
  phone: '+33612345678',
  hireDate: new Date('2023-06-01'),
  weeklyHours: 35,
  skills: ['React', 'TypeScript'],
  preferences: null,
  companyId: COMPANY_ID,
  teamId: TEAM_ID,
  isActive: true,
  createdAt: new Date('2023-06-01'),
  updatedAt: new Date('2024-01-15'),
}

const mockEmployeeWithRelations = {
  ...mockEmployee,
  user: {
    id: USER_ID,
    name: 'Jean Dupont',
    email: 'jean.dupont@acme.com',
    image: null,
  },
  company: {
    id: COMPANY_ID,
    name: 'Acme Corp',
  },
  team: {
    id: TEAM_ID,
    name: 'Equipe Dev',
  },
  _count: {
    schedules: 5,
    leaveRequests: 2,
  },
}

const mockTeam = {
  id: TEAM_ID,
  name: 'Equipe Dev',
  companyId: COMPANY_ID,
}

// Helper pour changer le mock user
function setMockUser(
  role: 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE',
  companyId: string | null = null
) {
  mockUserData = {
    id: `${role.toLowerCase()}-1`,
    role: role as 'SYSTEM_ADMIN',
    companyId,
  }
}

// ============================================================================
// Tests RBAC - Acces refuse pour EMPLOYEE
// ============================================================================

describe('RBAC - EMPLOYEE role blocked', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('EMPLOYEE', COMPANY_ID)
  })

  it('should deny listEmployees for EMPLOYEE role', async () => {
    const result = await listEmployees()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('permissions')
    }
  })

  it('should deny getEmployee for EMPLOYEE role', async () => {
    const result = await getEmployee(EMP_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('permissions')
    }
  })

  it('should deny createEmployee for EMPLOYEE role', async () => {
    const result = await createEmployee({
      firstName: 'Test',
      lastName: 'User',
      companyId: COMPANY_ID,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('permissions')
    }
  })
})

// ============================================================================
// Tests RBAC - SYSTEM_ADMIN (acces total)
// ============================================================================

describe('RBAC - SYSTEM_ADMIN full access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('should allow listEmployees for all companies', async () => {
    prismaMock.employee.count.mockResolvedValue(2)
    prismaMock.employee.findMany.mockResolvedValue([
      mockEmployeeWithRelations,
    ] as never)

    const result = await listEmployees()

    expect(result.success).toBe(true)
    // Pas de filtre companyId pour SYSTEM_ADMIN
    expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          companyId: expect.anything(),
        }),
      })
    )
  })

  it('should allow getEmployee from any company', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(
      mockEmployeeWithRelations as never
    )

    const result = await getEmployee(EMP_ID)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.firstName).toBe('Jean')
    }
  })

  it('should allow createEmployee in any company', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      id: COMPANY_ID_2,
      name: 'Other Corp',
    } as never)
    prismaMock.employee.create.mockResolvedValue(
      mockEmployeeWithRelations as never
    )

    const result = await createEmployee({
      firstName: 'Marie',
      lastName: 'Martin',
      companyId: COMPANY_ID_2, // Autre company
    })

    expect(result.success).toBe(true)
  })

  it('should allow deleteEmployee', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({
      ...mockEmployeeWithRelations,
      _count: { schedules: 0, leaveRequests: 0 },
    } as never)
    prismaMock.employee.delete.mockResolvedValue(mockEmployee as never)

    const result = await deleteEmployee(EMP_ID)

    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Tests RBAC - DIRECTOR (acces company uniquement)
// ============================================================================

describe('RBAC - DIRECTOR company-scoped access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('DIRECTOR', COMPANY_ID)
  })

  it('should filter listEmployees by own company', async () => {
    prismaMock.employee.count.mockResolvedValue(1)
    prismaMock.employee.findMany.mockResolvedValue([
      mockEmployeeWithRelations,
    ] as never)

    await listEmployees()

    expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: COMPANY_ID,
        }),
      })
    )
  })

  it('should allow getEmployee from own company', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(
      mockEmployeeWithRelations as never
    )

    const result = await getEmployee(EMP_ID)

    expect(result.success).toBe(true)
  })

  it('should deny getEmployee from other company', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({
      ...mockEmployeeWithRelations,
      companyId: COMPANY_ID_2, // Autre company
    } as never)

    const result = await getEmployee(EMP_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('non autorisé')
    }
  })

  it('should deny createEmployee in other company', async () => {
    const result = await createEmployee({
      firstName: 'Test',
      lastName: 'User',
      companyId: COMPANY_ID_2, // Autre company
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('votre entreprise')
    }
  })

  it('should allow deleteEmployee from own company', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({
      ...mockEmployeeWithRelations,
      _count: { schedules: 0, leaveRequests: 0 },
    } as never)
    prismaMock.employee.delete.mockResolvedValue(mockEmployee as never)

    const result = await deleteEmployee(EMP_ID)

    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Tests RBAC - MANAGER (acces equipes uniquement)
// ============================================================================

const MANAGER_EMP_ID = 'cltest0000000000manager01'
const TEAM_ID_3 = 'cltest000000000000team003'
const TEAM_ID_5 = 'cltest000000000000team005'

describe('RBAC - MANAGER team-scoped access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('MANAGER', COMPANY_ID)
    // Mock pour recuperer les equipes gerees
    prismaMock.employee.findUnique.mockResolvedValue({
      id: MANAGER_EMP_ID,
      managedTeams: [{ id: TEAM_ID }, { id: TEAM_ID_2 }],
    } as never)
  })

  it('should filter listEmployees by managed teams', async () => {
    prismaMock.employee.count.mockResolvedValue(1)
    prismaMock.employee.findMany.mockResolvedValue([
      mockEmployeeWithRelations,
    ] as never)

    await listEmployees()

    expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          teamId: { in: [TEAM_ID, TEAM_ID_2] },
        }),
      })
    )
  })

  it('should deny getEmployee not in managed teams', async () => {
    // Reset le mock pour getEmployee specifique
    prismaMock.employee.findUnique
      .mockResolvedValueOnce({
        id: MANAGER_EMP_ID,
        managedTeams: [{ id: TEAM_ID }],
      } as never)
      .mockResolvedValueOnce({
        ...mockEmployeeWithRelations,
        teamId: TEAM_ID_3, // Pas dans ses equipes
      } as never)

    const result = await getEmployee(EMP_ID)

    expect(result.success).toBe(false)
  })

  it('should require teamId for createEmployee', async () => {
    const result = await createEmployee({
      firstName: 'Test',
      lastName: 'User',
      companyId: COMPANY_ID,
      // teamId manquant
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('équipe')
    }
  })

  it('should deny createEmployee in non-managed team', async () => {
    const result = await createEmployee({
      firstName: 'Test',
      lastName: 'User',
      companyId: COMPANY_ID,
      teamId: TEAM_ID_5, // Pas dans ses equipes gerees
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('vos équipes')
    }
  })

  it('should deny deleteEmployee (only toggle status allowed)', async () => {
    const result = await deleteEmployee(EMP_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Désactivez')
    }
  })

  it('should allow toggleEmployeeStatus in managed teams', async () => {
    prismaMock.employee.findUnique
      .mockResolvedValueOnce({
        id: MANAGER_EMP_ID,
        managedTeams: [{ id: TEAM_ID }],
      } as never)
      .mockResolvedValueOnce(mockEmployeeWithRelations as never)
    prismaMock.employee.update.mockResolvedValue({
      ...mockEmployeeWithRelations,
      isActive: false,
    } as never)

    const result = await toggleEmployeeStatus(EMP_ID, false)

    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Tests CRUD basiques
// ============================================================================

describe('listEmployees', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('should return paginated employees list', async () => {
    prismaMock.employee.count.mockResolvedValue(1)
    prismaMock.employee.findMany.mockResolvedValue([
      mockEmployeeWithRelations,
    ] as never)

    const result = await listEmployees({ page: 1, pageSize: 10 })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data).toHaveLength(1)
      expect(result.data.total).toBe(1)
      expect(result.data.data[0].firstName).toBe('Jean')
    }
  })

  it('should filter by department', async () => {
    prismaMock.employee.count.mockResolvedValue(1)
    prismaMock.employee.findMany.mockResolvedValue([
      mockEmployeeWithRelations,
    ] as never)

    await listEmployees({}, { department: 'TECHNIQUE' })

    expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          department: 'TECHNIQUE',
        }),
      })
    )
  })

  it('should filter by search term', async () => {
    prismaMock.employee.count.mockResolvedValue(1)
    prismaMock.employee.findMany.mockResolvedValue([
      mockEmployeeWithRelations,
    ] as never)

    await listEmployees({}, { search: 'Jean' })

    expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              firstName: { contains: 'Jean', mode: 'insensitive' },
            }),
          ]),
        }),
      })
    )
  })

  it('should filter by isActive status', async () => {
    prismaMock.employee.count.mockResolvedValue(1)
    prismaMock.employee.findMany.mockResolvedValue([
      mockEmployeeWithRelations,
    ] as never)

    await listEmployees({}, { isActive: true })

    expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
        }),
      })
    )
  })

  it('should filter by skill', async () => {
    prismaMock.employee.count.mockResolvedValue(1)
    prismaMock.employee.findMany.mockResolvedValue([
      mockEmployeeWithRelations,
    ] as never)

    await listEmployees({}, { skill: 'React' })

    expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          skills: { has: 'React' },
        }),
      })
    )
  })
})

const NON_EXISTENT_ID = 'cltest00000000nonexistent'

describe('getEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('should return employee details by ID', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(
      mockEmployeeWithRelations as never
    )

    const result = await getEmployee(EMP_ID)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(EMP_ID)
      expect(result.data.firstName).toBe('Jean')
      expect(result.data.team?.name).toBe('Equipe Dev')
    }
  })

  it('should return error for non-existent employee', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(null)

    const result = await getEmployee(NON_EXISTENT_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('non trouvé')
    }
  })
})

describe('createEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('should create an employee with valid data', async () => {
    prismaMock.company.findUnique.mockResolvedValue(mockCompany as never)
    prismaMock.employee.create.mockResolvedValue(
      mockEmployeeWithRelations as never
    )

    const result = await createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      companyId: COMPANY_ID,
      jobTitle: 'Developpeur',
      weeklyHours: 35,
    })

    expect(result.success).toBe(true)
    expect(prismaMock.employee.create).toHaveBeenCalled()
  })

  it('should reject invalid firstName (too short)', async () => {
    const result = await createEmployee({
      firstName: 'J', // Trop court
      lastName: 'Dupont',
      companyId: COMPANY_ID,
    })

    expect(result.success).toBe(false)
  })

  it('should set default weeklyHours to 35', async () => {
    prismaMock.company.findUnique.mockResolvedValue(mockCompany as never)
    prismaMock.employee.create.mockResolvedValue(
      mockEmployeeWithRelations as never
    )

    await createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      companyId: COMPANY_ID,
    })

    expect(prismaMock.employee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          weeklyHours: 35,
        }),
      })
    )
  })
})

describe('updateEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('should update employee with valid data', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(
      mockEmployeeWithRelations as never
    )
    prismaMock.employee.update.mockResolvedValue({
      ...mockEmployeeWithRelations,
      jobTitle: 'Senior Developpeur',
    } as never)

    const result = await updateEmployee({
      id: EMP_ID,
      jobTitle: 'Senior Developpeur',
    })

    expect(result.success).toBe(true)
    expect(prismaMock.employee.update).toHaveBeenCalled()
  })

  it('should return error for non-existent employee', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(null)

    const result = await updateEmployee({
      id: NON_EXISTENT_ID,
      jobTitle: 'Test',
    })

    expect(result.success).toBe(false)
  })
})

describe('deleteEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('should delete employee without schedules', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({
      ...mockEmployeeWithRelations,
      _count: { schedules: 0, leaveRequests: 0 },
    } as never)
    prismaMock.employee.delete.mockResolvedValue(mockEmployee as never)

    const result = await deleteEmployee(EMP_ID)

    expect(result.success).toBe(true)
  })

  it('should prevent deletion if employee has schedules', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({
      ...mockEmployeeWithRelations,
      _count: { schedules: 5, leaveRequests: 0 },
    } as never)

    const result = await deleteEmployee(EMP_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('planning')
    }
  })
})

describe('toggleEmployeeStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('should deactivate active employee', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(
      mockEmployeeWithRelations as never
    )
    prismaMock.employee.update.mockResolvedValue({
      ...mockEmployeeWithRelations,
      isActive: false,
    } as never)

    const result = await toggleEmployeeStatus(EMP_ID, false)

    expect(result.success).toBe(true)
    expect(prismaMock.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isActive: false },
      })
    )
  })

  it('should activate inactive employee', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({
      ...mockEmployeeWithRelations,
      isActive: false,
    } as never)
    prismaMock.employee.update.mockResolvedValue({
      ...mockEmployeeWithRelations,
      isActive: true,
    } as never)

    const result = await toggleEmployeeStatus(EMP_ID, true)

    expect(result.success).toBe(true)
  })
})

describe('getTeamsForSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('should return all teams for SYSTEM_ADMIN', async () => {
    prismaMock.team.findMany.mockResolvedValue([
      { id: TEAM_ID, name: 'Equipe A' },
      { id: TEAM_ID_2, name: 'Equipe B' },
    ] as never)

    const result = await getTeamsForSelect()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(2)
    }
    // Pas de filtre pour SYSTEM_ADMIN
    expect(prismaMock.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    )
  })

  it('should filter teams by company for DIRECTOR', async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    prismaMock.team.findMany.mockResolvedValue([mockTeam] as never)

    await getTeamsForSelect()

    expect(prismaMock.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: COMPANY_ID },
      })
    )
  })

  it('should filter teams by managed IDs for MANAGER', async () => {
    setMockUser('MANAGER', COMPANY_ID)
    prismaMock.employee.findUnique.mockResolvedValue({
      id: MANAGER_EMP_ID,
      managedTeams: [{ id: TEAM_ID }],
    } as never)
    prismaMock.team.findMany.mockResolvedValue([mockTeam] as never)

    await getTeamsForSelect()

    expect(prismaMock.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: [TEAM_ID] } },
      })
    )
  })
})

// ============================================================================
// Tests SP-439 - Synchronisation Stripe quantity
// ============================================================================

describe('SP-439 - Stripe quantity sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSyncEmployeeCountToStripe.mockResolvedValue({
      synced: true,
      previousQuantity: 5,
      newQuantity: 6,
    })
  })

  it('appelle syncEmployeeCountToStripe après createEmployee', async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    prismaMock.company.findUnique.mockResolvedValue(mockCompany as never)
    prismaMock.employee.create.mockResolvedValue(
      mockEmployeeWithRelations as never
    )

    await createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      companyId: COMPANY_ID,
    })

    // Attendre le fire-and-forget
    await new Promise((r) => setTimeout(r, 10))

    expect(mockSyncEmployeeCountToStripe).toHaveBeenCalledWith(COMPANY_ID)
  })

  it('appelle syncEmployeeCountToStripe après deleteEmployee', async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    prismaMock.employee.findUnique.mockResolvedValue({
      ...mockEmployeeWithRelations,
      _count: { schedules: 0, leaveRequests: 0 },
    } as never)
    prismaMock.employee.delete.mockResolvedValue(mockEmployee as never)

    await deleteEmployee(EMP_ID)

    await new Promise((r) => setTimeout(r, 10))

    expect(mockSyncEmployeeCountToStripe).toHaveBeenCalledWith(COMPANY_ID)
  })

  it('appelle syncEmployeeCountToStripe après toggleEmployeeStatus', async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    prismaMock.employee.findUnique.mockResolvedValue(
      mockEmployeeWithRelations as never
    )
    prismaMock.employee.update.mockResolvedValue(
      mockEmployeeWithRelations as never
    )

    await toggleEmployeeStatus(EMP_ID, false)

    await new Promise((r) => setTimeout(r, 10))

    expect(mockSyncEmployeeCountToStripe).toHaveBeenCalledWith(COMPANY_ID)
  })

  it('appelle syncEmployeeCountToStripe après bulkDeleteEmployees', async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    prismaMock.employee.findMany.mockResolvedValue([
      { ...mockEmployee, _count: { schedules: 0 } },
    ] as never)
    prismaMock.$transaction.mockResolvedValue([])

    await bulkDeleteEmployees([EMP_ID])

    await new Promise((r) => setTimeout(r, 10))

    expect(mockSyncEmployeeCountToStripe).toHaveBeenCalledWith(COMPANY_ID)
  })

  it('ne crash PAS si syncEmployeeCountToStripe throw', async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    mockSyncEmployeeCountToStripe.mockRejectedValue(new Error('Stripe down'))
    prismaMock.company.findUnique.mockResolvedValue(mockCompany as never)
    prismaMock.employee.create.mockResolvedValue(
      mockEmployeeWithRelations as never
    )

    // Ne doit PAS throw — fire-and-forget
    const result = await createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      companyId: COMPANY_ID,
    })

    await new Promise((r) => setTimeout(r, 10))

    expect(result.success).toBe(true)
  })

  it('passe le bon companyId après deleteEmployee', async () => {
    setMockUser('SYSTEM_ADMIN')
    const empWithOtherCompany = {
      ...mockEmployeeWithRelations,
      companyId: COMPANY_ID_2,
      _count: { schedules: 0, leaveRequests: 0 },
    }
    prismaMock.employee.findUnique.mockResolvedValue(
      empWithOtherCompany as never
    )
    prismaMock.employee.delete.mockResolvedValue(mockEmployee as never)

    await deleteEmployee(EMP_ID)

    await new Promise((r) => setTimeout(r, 10))

    expect(mockSyncEmployeeCountToStripe).toHaveBeenCalledWith(COMPANY_ID_2)
  })
})

// ============================================================================
// SP-578 - Relance d'invitation depuis la fiche employe
// ============================================================================

describe('resendInvitationByEmployee (SP-578)', () => {
  const INVITED_USER_ID = 'cltest000000000000user002'

  /** Employe dont le compte existe mais n'a jamais ete active */
  const pendingEmployee = {
    ...mockEmployeeWithRelations,
    userId: INVITED_USER_ID,
    user: {
      id: INVITED_USER_ID,
      name: 'Cassy Bouson',
      email: 'cassy@acme.com',
      image: null,
      isEmailVerified: false,
    },
  }

  const pendingUser = {
    id: INVITED_USER_ID,
    email: 'cassy@acme.com',
    name: 'Cassy Bouson',
    role: 'EMPLOYEE',
    isEmailVerified: false,
    company: { name: 'Acme Corp' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockResolvedValue([] as never)
  })

  it('renvoie une invitation pour un compte non active de sa propre entreprise', async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    prismaMock.employee.findUnique.mockResolvedValue(pendingEmployee as never)
    prismaMock.user.findUnique.mockResolvedValue(pendingUser as never)

    const result = await resendInvitationByEmployee({ employeeId: EMP_ID })

    expect(result.success).toBe(true)
    // Le token est remplace : l'ancien lien ne doit plus fonctionner
    expect(prismaMock.$transaction).toHaveBeenCalled()
  })

  it("refuse la relance sur un employe d'une autre entreprise (isolation)", async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    // L'employe cible appartient a l'entreprise 2
    prismaMock.employee.findUnique.mockResolvedValue({
      ...pendingEmployee,
      companyId: COMPANY_ID_2,
    } as never)

    const result = await resendInvitationByEmployee({ employeeId: EMP_ID })

    expect(result.success).toBe(false)
    // Aucun token cree, aucun email declenche pour un tenant etranger
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it("refuse la relance a un MANAGER sur une equipe qu'il ne gere pas", async () => {
    setMockUser('MANAGER', COMPANY_ID)
    prismaMock.employee.findUnique
      // 1er appel : resolution des equipes gerees par le manager
      .mockResolvedValueOnce({
        id: EMP_ID,
        teamId: TEAM_ID,
        managedTeams: [{ id: TEAM_ID }],
      } as never)
      // 2e appel : l'employe cible est dans une equipe qu'il ne gere pas
      .mockResolvedValueOnce({
        ...pendingEmployee,
        teamId: TEAM_ID_2,
      } as never)

    const result = await resendInvitationByEmployee({ employeeId: EMP_ID })

    expect(result.success).toBe(false)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('refuse la relance sur un compte deja active', async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    prismaMock.employee.findUnique.mockResolvedValue(pendingEmployee as never)
    prismaMock.user.findUnique.mockResolvedValue({
      ...pendingUser,
      isEmailVerified: true,
    } as never)

    const result = await resendInvitationByEmployee({ employeeId: EMP_ID })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('déjà activé')
    }
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('refuse la relance sur un employe sans compte utilisateur', async () => {
    setMockUser('DIRECTOR', COMPANY_ID)
    prismaMock.employee.findUnique.mockResolvedValue({
      ...pendingEmployee,
      userId: null,
      user: null,
    } as never)

    const result = await resendInvitationByEmployee({ employeeId: EMP_ID })

    expect(result.success).toBe(false)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it("rejette un employeeId qui n'est pas un CUID (validation Zod)", async () => {
    setMockUser('DIRECTOR', COMPANY_ID)

    const result = await resendInvitationByEmployee({
      employeeId: 'pas-un-cuid',
    })

    expect(result.success).toBe(false)
    expect(prismaMock.employee.findUnique).not.toHaveBeenCalled()
  })
})

// ============================================================================
// SP-579 lot 3 - Signalement d'une adresse ayant refusé le dernier envoi
// ============================================================================

describe('lastBounce sur la liste des employés (SP-579)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockUser('DIRECTOR', COMPANY_ID)
  })

  /** Prépare listEmployees avec un employé et les lignes EmailLog données. */
  const arrange = (logs: unknown[]) => {
    prismaMock.employee.count.mockResolvedValue(1)
    prismaMock.employee.findMany.mockResolvedValue([
      mockEmployeeWithRelations,
    ] as never)
    prismaMock.emailLog.findMany.mockResolvedValue(logs as never)
  }

  it('signale une adresse dont le dernier envoi a rebondi', async () => {
    arrange([
      {
        recipientEmail: 'jean.dupont@acme.com',
        status: 'BOUNCED',
        sentAt: new Date('2026-08-31T08:24:58Z'),
        metadata: { bounce: { status: '5.1.1', kind: 'PERMANENT' } },
      },
    ])

    const result = await listEmployees({}, {})

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data[0]?.lastBounce).toMatchObject({
        email: 'jean.dupont@acme.com',
        status: '5.1.1',
        kind: 'PERMANENT',
      })
    }
  })

  it("n'alerte plus quand un envoi ultérieur a été accepté", async () => {
    // Une adresse corrigée doit cesser d'être signalée dès le premier envoi
    // accepté, sans quoi l'alerte resterait collée au compte indéfiniment.
    arrange([
      {
        recipientEmail: 'jean.dupont@acme.com',
        status: 'SENT',
        sentAt: new Date('2026-08-31T10:00:00Z'),
        metadata: null,
      },
      {
        recipientEmail: 'jean.dupont@acme.com',
        status: 'BOUNCED',
        sentAt: new Date('2026-08-31T08:24:58Z'),
        metadata: { bounce: { status: '5.1.1', kind: 'PERMANENT' } },
      },
    ])

    const result = await listEmployees({}, {})

    if (result.success) {
      expect(result.data.data[0]?.lastBounce).toBeNull()
    }
  })

  it('distingue un refus temporaire d un refus définitif', async () => {
    arrange([
      {
        recipientEmail: 'jean.dupont@acme.com',
        status: 'BOUNCED',
        sentAt: new Date('2026-08-31T08:00:00Z'),
        metadata: { bounce: { status: '4.2.2', kind: 'TRANSIENT' } },
      },
    ])

    const result = await listEmployees({}, {})

    if (result.success) {
      expect(result.data.data[0]?.lastBounce?.kind).toBe('TRANSIENT')
    }
  })

  it("borne la recherche des bounces à l'entreprise du DIRECTOR", async () => {
    // Test négatif d'isolation : EmailLog est cross-tenant, la requête doit
    // porter le companyId sous peine d'exposer l'activité d'un autre client.
    arrange([])

    await listEmployees({}, {})

    const where = (
      prismaMock.emailLog.findMany.mock.calls[0]?.[0] as {
        where: { companyId?: string }
      }
    ).where
    expect(where.companyId).toBe(COMPANY_ID)
  })

  it('ne filtre pas par entreprise pour un SYSTEM_ADMIN', async () => {
    // Seul rôle dont companyId vaut null : le filtre doit disparaître, sans
    // quoi la clause `companyId: undefined` élargirait silencieusement.
    setMockUser('SYSTEM_ADMIN', null)
    arrange([])

    await listEmployees({}, {})

    const where = (
      prismaMock.emailLog.findMany.mock.calls[0]?.[0] as {
        where: Record<string, unknown>
      }
    ).where
    expect('companyId' in where).toBe(false)
  })

  it('ne requête pas EmailLog quand aucun employé n a d adresse', async () => {
    prismaMock.employee.count.mockResolvedValue(1)
    prismaMock.employee.findMany.mockResolvedValue([
      { ...mockEmployeeWithRelations, email: null, user: null },
    ] as never)

    await listEmployees({}, {})

    expect(prismaMock.emailLog.findMany).not.toHaveBeenCalled()
  })
})
