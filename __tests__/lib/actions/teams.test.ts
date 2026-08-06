/**
 * Tests unitaires pour les Server Actions Teams
 *
 * @description Tests des operations CRUD et gestion membres avec RBAC multi-role.
 * Verifie les acces differencies selon SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE.
 *
 * @ticket SP-153
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../mocks/prisma'

// Variable pour controler le mock auth dynamiquement
let mockUserData = {
  id: 'admin-1',
  role: 'SYSTEM_ADMIN' as const,
  companyId: null as string | null,
}

// Variable pour les equipes gerees (MANAGER)
let mockManagedTeams: string[] = []

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

// Import apres les mocks
import {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  assignManager,
  getTeamMembers,
  getAvailableEmployees,
  getManagersForSelect,
} from '@/lib/actions/teams'

// ============================================================================
// Fixtures
// ============================================================================

// IDs au format CUID valide pour la validation Zod
const COMPANY_ID = 'cltest00000000000company1'
const COMPANY_ID_2 = 'cltest00000000000company2'
const TEAM_ID = 'cltest000000000000team001'
const TEAM_ID_2 = 'cltest000000000000team002'
const EMP_ID = 'cltest0000000000000emp001'
const EMP_ID_2 = 'cltest0000000000000emp002'
const MANAGER_ID = 'cltest00000000000mgr0001'
const USER_ID = 'cltest000000000000user001'

const mockTeam = {
  id: TEAM_ID,
  name: 'Equipe Dev',
  description: 'Equipe de developpement',
  color: '#3B82F6',
  companyId: COMPANY_ID,
  managerId: MANAGER_ID,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
}

const mockTeamWithRelations = {
  ...mockTeam,
  manager: {
    id: MANAGER_ID,
    firstName: 'Marie',
    lastName: 'Martin',
    user: {
      email: 'marie.martin@acme.com',
      image: null,
    },
  },
  company: {
    id: COMPANY_ID,
    name: 'Acme Corp',
  },
  employees: [],
  _count: {
    employees: 5,
    schedules: 2,
  },
}

const mockTeamWithMembers = {
  ...mockTeamWithRelations,
  employees: [
    {
      id: EMP_ID,
      firstName: 'Jean',
      lastName: 'Dupont',
      jobTitle: 'Developpeur',
      isActive: true,
      user: {
        email: 'jean.dupont@acme.com',
        image: null,
      },
    },
    {
      id: EMP_ID_2,
      firstName: 'Sophie',
      lastName: 'Durand',
      jobTitle: 'Designer',
      isActive: true,
      user: {
        email: 'sophie.durand@acme.com',
        image: null,
      },
    },
  ],
}

const mockEmployee = {
  id: EMP_ID,
  firstName: 'Jean',
  lastName: 'Dupont',
  jobTitle: 'Developpeur',
  companyId: COMPANY_ID,
  teamId: null,
  isActive: true,
  userId: USER_ID,
  user: {
    email: 'jean.dupont@acme.com',
    image: null,
  },
}

// Helper pour changer le mock user
function setMockUser(
  role: 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE',
  companyId: string | null = null,
  managedTeamIds: string[] = []
) {
  mockUserData = {
    id: `${role.toLowerCase()}-1`,
    role: role as 'SYSTEM_ADMIN',
    companyId,
  }
  mockManagedTeams = managedTeamIds

  // Pour MANAGER, on doit aussi mocker la requete employee.findUnique
  if (role === 'MANAGER') {
    prismaMock.employee.findUnique.mockResolvedValue({
      id: EMP_ID,
      firstName: 'Manager',
      lastName: 'User',
      jobTitle: 'Manager',
      department: 'DIRECTION',
      phone: null,
      hireDate: null,
      weeklyHours: 35,
      skills: [],
      preferences: null,
      companyId,
      teamId: null,
      isActive: true,
      userId: `${role.toLowerCase()}-1`,
      createdAt: new Date(),
      updatedAt: new Date(),
      managedTeams: managedTeamIds.map((id) => ({ id })),
    } as unknown as ReturnType<typeof prismaMock.employee.findUnique>)
  }
}

// ============================================================================
// Tests RBAC - Acces refuse pour EMPLOYEE
// ============================================================================

describe('RBAC - EMPLOYEE role blocked', () => {
  beforeEach(() => {
    setMockUser('EMPLOYEE', COMPANY_ID)
  })

  it('listTeams: should block EMPLOYEE role', async () => {
    const result = await listTeams()
    expect(result.success).toBe(false)
    expect(result.error).toContain('permissions')
  })

  it('getTeam: should block EMPLOYEE role', async () => {
    const result = await getTeam(TEAM_ID)
    expect(result.success).toBe(false)
    expect(result.error).toContain('permissions')
  })

  it('createTeam: should block EMPLOYEE role', async () => {
    const result = await createTeam({
      name: 'New Team',
      companyId: COMPANY_ID,
      color: '#3B82F6',
    })
    expect(result.success).toBe(false)
    expect(result.error).toContain('permissions')
  })
})

// ============================================================================
// Tests CRUD - SYSTEM_ADMIN
// ============================================================================

describe('CRUD - SYSTEM_ADMIN role', () => {
  beforeEach(() => {
    setMockUser('SYSTEM_ADMIN', null)
  })

  describe('listTeams', () => {
    it('should list all teams without company filter', async () => {
      prismaMock.team.count.mockResolvedValue(2)
      prismaMock.team.findMany.mockResolvedValue([
        mockTeamWithRelations,
        { ...mockTeamWithRelations, id: TEAM_ID_2, name: 'Equipe 2' },
      ])

      const result = await listTeams({ page: 1, pageSize: 10 }, {})

      expect(result.success).toBe(true)
      expect(result.data?.data).toHaveLength(2)
      expect(result.data?.total).toBe(2)
    })

    it('should filter by companyId when provided', async () => {
      prismaMock.team.count.mockResolvedValue(1)
      prismaMock.team.findMany.mockResolvedValue([mockTeamWithRelations])

      const result = await listTeams({}, { companyId: COMPANY_ID })

      expect(result.success).toBe(true)
      expect(prismaMock.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: COMPANY_ID,
          }) as unknown,
        })
      )
    })

    it('should filter by search query', async () => {
      prismaMock.team.count.mockResolvedValue(1)
      prismaMock.team.findMany.mockResolvedValue([mockTeamWithRelations])

      const result = await listTeams({}, { search: 'Dev' })

      expect(result.success).toBe(true)
      expect(prismaMock.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ contains: 'Dev' }) as unknown,
              }),
            ]) as unknown,
          }) as unknown,
        })
      )
    })
  })

  describe('getTeam', () => {
    it('should return team with all relations', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithMembers)

      const result = await getTeam(TEAM_ID)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(TEAM_ID)
      expect(result.data?.employees).toHaveLength(2)
    })

    it('should return error for non-existent team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)

      const result = await getTeam('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('non trouvée')
    })
  })

  describe('createTeam', () => {
    it('should create team with valid data', async () => {
      prismaMock.team.create.mockResolvedValue(mockTeamWithRelations)

      const result = await createTeam({
        name: 'Nouvelle Equipe',
        description: 'Description test',
        color: '#10B981',
        companyId: COMPANY_ID,
      })

      expect(result.success).toBe(true)
      expect(prismaMock.team.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Nouvelle Equipe',
            companyId: COMPANY_ID,
          }) as unknown,
        })
      )
    })

    it('should validate manager belongs to same company', async () => {
      prismaMock.employee.findUnique.mockResolvedValue({
        ...mockEmployee,
        companyId: COMPANY_ID_2, // Different company
      })

      const result = await createTeam({
        name: 'Test Team',
        companyId: COMPANY_ID,
        managerId: EMP_ID,
        color: '#3B82F6',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('même entreprise')
    })

    it('should reject invalid color format', async () => {
      const result = await createTeam({
        name: 'Test Team',
        companyId: COMPANY_ID,
        color: 'red', // Invalid format
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('couleur')
    })

    it('should reject team name too short', async () => {
      const result = await createTeam({
        name: 'A', // Too short
        companyId: COMPANY_ID,
        color: '#3B82F6',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('2 caractères')
    })
  })

  describe('updateTeam', () => {
    it('should update team with valid data', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
      prismaMock.team.update.mockResolvedValue({
        ...mockTeamWithRelations,
        name: 'Updated Name',
      })

      const result = await updateTeam({
        id: TEAM_ID,
        name: 'Updated Name',
      })

      expect(result.success).toBe(true)
      expect(prismaMock.team.update).toHaveBeenCalled()
    })

    it('should return error for non-existent team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)

      const result = await updateTeam({
        id: 'non-existent-id',
        name: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('invalide')
    })
  })

  describe('deleteTeam', () => {
    it('should delete team without schedules', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        ...mockTeamWithRelations,
        _count: { employees: 2, schedules: 0 },
      })
      prismaMock.employee.updateMany.mockResolvedValue({ count: 2 })
      prismaMock.team.delete.mockResolvedValue(mockTeam)

      const result = await deleteTeam(TEAM_ID)

      expect(result.success).toBe(true)
      expect(prismaMock.employee.updateMany).toHaveBeenCalledWith({
        where: { teamId: TEAM_ID },
        data: { teamId: null },
      })
    })

    it('should block deletion when team has schedules', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        ...mockTeamWithRelations,
        _count: { employees: 2, schedules: 3 },
      })

      const result = await deleteTeam(TEAM_ID)

      expect(result.success).toBe(false)
      expect(result.error).toContain('planning')
    })
  })
})

// ============================================================================
// Tests CRUD - DIRECTOR
// ============================================================================

describe('CRUD - DIRECTOR role', () => {
  beforeEach(() => {
    setMockUser('DIRECTOR', COMPANY_ID)
  })

  it('listTeams: should only list teams from own company', async () => {
    prismaMock.team.count.mockResolvedValue(1)
    prismaMock.team.findMany.mockResolvedValue([mockTeamWithRelations])

    const result = await listTeams({}, {})

    expect(result.success).toBe(true)
    expect(prismaMock.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: COMPANY_ID,
        }) as unknown,
      })
    )
  })

  it('getTeam: should allow access to own company team', async () => {
    prismaMock.team.findUnique.mockResolvedValue(mockTeamWithMembers)

    const result = await getTeam(TEAM_ID)

    expect(result.success).toBe(true)
  })

  it('getTeam: should block access to other company team', async () => {
    prismaMock.team.findUnique.mockResolvedValue({
      ...mockTeamWithMembers,
      companyId: COMPANY_ID_2,
    })

    const result = await getTeam(TEAM_ID)

    expect(result.success).toBe(false)
    expect(result.error).toContain('non autorisé')
  })

  it('createTeam: should only allow creation in own company', async () => {
    const result = await createTeam({
      name: 'New Team',
      companyId: COMPANY_ID_2, // Different company
      color: '#3B82F6',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('votre entreprise')
  })

  it('createTeam: should allow creation in own company', async () => {
    prismaMock.team.create.mockResolvedValue(mockTeamWithRelations)

    const result = await createTeam({
      name: 'New Team',
      companyId: COMPANY_ID,
      color: '#3B82F6',
    })

    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Tests RBAC - MANAGER role
// ============================================================================

describe('CRUD - MANAGER role', () => {
  beforeEach(() => {
    setMockUser('MANAGER', COMPANY_ID, [TEAM_ID])
  })

  it('listTeams: should only list managed teams', async () => {
    prismaMock.team.count.mockResolvedValue(1)
    prismaMock.team.findMany.mockResolvedValue([mockTeamWithRelations])

    const result = await listTeams({}, {})

    expect(result.success).toBe(true)
    expect(prismaMock.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: [TEAM_ID] },
        }) as unknown,
      })
    )
  })

  it('getTeam: should allow access to managed team', async () => {
    prismaMock.team.findUnique.mockResolvedValue(mockTeamWithMembers)

    const result = await getTeam(TEAM_ID)

    expect(result.success).toBe(true)
  })

  it('getTeam: should block access to non-managed team', async () => {
    prismaMock.team.findUnique.mockResolvedValue({
      ...mockTeamWithMembers,
      id: TEAM_ID_2,
    })

    const result = await getTeam(TEAM_ID_2)

    expect(result.success).toBe(false)
    expect(result.error).toContain('non autorisé')
  })

  it('createTeam: should be blocked for MANAGER', async () => {
    const result = await createTeam({
      name: 'New Team',
      companyId: COMPANY_ID,
      color: '#3B82F6',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('permissions')
  })

  it('updateTeam: should be blocked for MANAGER', async () => {
    prismaMock.team.findUnique.mockResolvedValue(mockTeamWithMembers)

    const result = await updateTeam({
      id: TEAM_ID,
      name: 'Updated',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('permissions')
  })

  it('deleteTeam: should be blocked for MANAGER', async () => {
    prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)

    const result = await deleteTeam(TEAM_ID)

    expect(result.success).toBe(false)
    expect(result.error).toContain('permissions')
  })
})

// ============================================================================
// Tests Gestion des membres
// ============================================================================

describe('Member management', () => {
  beforeEach(() => {
    setMockUser('DIRECTOR', COMPANY_ID)
  })

  describe('addTeamMember', () => {
    it('should add employee to team', async () => {
      prismaMock.team.findUnique.mockResolvedValueOnce(mockTeamWithRelations)
      prismaMock.employee.findUnique.mockResolvedValue({
        ...mockEmployee,
        teamId: null,
      })
      prismaMock.employee.update.mockResolvedValue({
        ...mockEmployee,
        teamId: TEAM_ID,
      })
      prismaMock.team.findUnique.mockResolvedValueOnce(mockTeamWithMembers)

      const result = await addTeamMember(TEAM_ID, EMP_ID)

      expect(result.success).toBe(true)
      expect(prismaMock.employee.update).toHaveBeenCalledWith({
        where: { id: EMP_ID },
        data: { teamId: TEAM_ID },
      })
    })

    it('should reject employee from different company', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
      prismaMock.employee.findUnique.mockResolvedValue({
        ...mockEmployee,
        companyId: COMPANY_ID_2,
      })

      const result = await addTeamMember(TEAM_ID, EMP_ID)

      expect(result.success).toBe(false)
      expect(result.error).toContain('même entreprise')
    })

    it('should reject employee already in team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
      prismaMock.employee.findUnique.mockResolvedValue({
        ...mockEmployee,
        teamId: TEAM_ID,
      })

      const result = await addTeamMember(TEAM_ID, EMP_ID)

      expect(result.success).toBe(false)
      expect(result.error).toContain('déjà partie')
    })
  })

  describe('removeTeamMember', () => {
    it('should remove employee from team', async () => {
      prismaMock.team.findUnique.mockResolvedValueOnce(mockTeamWithRelations)
      prismaMock.employee.findUnique.mockResolvedValue({
        ...mockEmployee,
        teamId: TEAM_ID,
      })
      prismaMock.employee.update.mockResolvedValue({
        ...mockEmployee,
        teamId: null,
      })
      prismaMock.team.findUnique.mockResolvedValueOnce({
        ...mockTeamWithMembers,
        employees: [mockTeamWithMembers.employees[1]],
      })

      const result = await removeTeamMember(TEAM_ID, EMP_ID)

      expect(result.success).toBe(true)
      expect(prismaMock.employee.update).toHaveBeenCalledWith({
        where: { id: EMP_ID },
        data: { teamId: null },
      })
    })

    it('should reject if employee not in team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
      prismaMock.employee.findUnique.mockResolvedValue({
        ...mockEmployee,
        teamId: TEAM_ID_2, // Different team
      })

      const result = await removeTeamMember(TEAM_ID, EMP_ID)

      expect(result.success).toBe(false)
      expect(result.error).toContain('ne fait pas partie')
    })
  })

  describe('assignManager', () => {
    it('should assign manager to team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
      prismaMock.employee.findUnique.mockResolvedValue(mockEmployee)
      prismaMock.team.update.mockResolvedValue({
        ...mockTeamWithRelations,
        managerId: EMP_ID,
      })

      const result = await assignManager(TEAM_ID, EMP_ID)

      expect(result.success).toBe(true)
      expect(prismaMock.team.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: TEAM_ID },
          data: expect.objectContaining({
            managerId: EMP_ID,
          }) as unknown,
        })
      )
    })

    it('should remove manager when null is passed', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
      prismaMock.team.update.mockResolvedValue({
        ...mockTeamWithRelations,
        managerId: null,
      })

      const result = await assignManager(TEAM_ID, null)

      expect(result.success).toBe(true)
      expect(prismaMock.team.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            managerId: null,
          }) as unknown,
        })
      )
    })

    it('should reject manager from different company', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
      prismaMock.employee.findUnique.mockResolvedValue({
        ...mockEmployee,
        companyId: COMPANY_ID_2,
      })

      const result = await assignManager(TEAM_ID, EMP_ID)

      expect(result.success).toBe(false)
      expect(result.error).toContain('même entreprise')
    })
  })

  describe('getTeamMembers', () => {
    it('should return team members list', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
      prismaMock.employee.findMany.mockResolvedValue([
        mockEmployee,
        { ...mockEmployee, id: EMP_ID_2, firstName: 'Sophie' },
      ])

      const result = await getTeamMembers(TEAM_ID)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('getAvailableEmployees', () => {
    it('should return employees not in team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
      prismaMock.employee.findMany.mockResolvedValue([
        { ...mockEmployee, teamId: null },
      ])

      const result = await getAvailableEmployees(TEAM_ID)

      expect(result.success).toBe(true)
      expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: COMPANY_ID,
            isActive: true,
            OR: expect.arrayContaining([
              { teamId: null },
              { teamId: { not: TEAM_ID } },
            ]) as unknown,
          }) as unknown,
        })
      )
    })
  })

  describe('getManagersForSelect', () => {
    it('should return active employees for manager selection', async () => {
      prismaMock.employee.findMany.mockResolvedValue([
        mockEmployee,
        { ...mockEmployee, id: EMP_ID_2, firstName: 'Marie' },
      ])

      const result = await getManagersForSelect(COMPANY_ID)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            companyId: COMPANY_ID,
            isActive: true,
          },
        })
      )
    })

    it('should reject access to other company', async () => {
      const result = await getManagersForSelect(COMPANY_ID_2)

      expect(result.success).toBe(false)
      expect(result.error).toContain('accès')
    })
  })
})

// ============================================================================
// Rattachement du manager a son equipe
// ============================================================================

/**
 * `Team.managerId` (relation TeamManager) et `Employee.teamId` (relation
 * TeamMembers) sont deux relations distinctes : designer quelqu'un manager
 * d'une equipe ne le faisait pas apparaitre comme membre, et son profil
 * affichait « aucune equipe » alors qu'il figurait bien en tete de l'equipe.
 */
describe('rattachement du manager comme membre de son equipe', () => {
  beforeEach(() => {
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('createTeam rattache le manager designe a la nouvelle equipe', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(mockEmployee)
    prismaMock.team.create.mockResolvedValue({
      ...mockTeamWithRelations,
      managerId: EMP_ID,
    })

    await createTeam({
      name: 'Equipe Support',
      companyId: COMPANY_ID,
      managerId: EMP_ID,
      color: '#3B82F6',
    })

    expect(prismaMock.employee.updateMany).toHaveBeenCalledWith({
      where: { id: EMP_ID, teamId: null },
      data: { teamId: TEAM_ID },
    })
  })

  it('assignManager rattache le nouveau manager a l equipe', async () => {
    prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
    prismaMock.employee.findUnique.mockResolvedValue(mockEmployee)
    prismaMock.team.update.mockResolvedValue({
      ...mockTeamWithRelations,
      managerId: EMP_ID,
    })

    await assignManager(TEAM_ID, EMP_ID)

    expect(prismaMock.employee.updateMany).toHaveBeenCalledWith({
      where: { id: EMP_ID, teamId: null },
      data: { teamId: TEAM_ID },
    })
  })

  it('ne touche pas a l appartenance d un employe deja dans une equipe', async () => {
    prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
    prismaMock.employee.findUnique.mockResolvedValue(mockEmployee)
    prismaMock.team.update.mockResolvedValue({
      ...mockTeamWithRelations,
      managerId: EMP_ID,
    })

    await assignManager(TEAM_ID, EMP_ID)

    // La clause `teamId: null` du updateMany garantit qu'un employe deja
    // rattache ailleurs garde son equipe : un `teamId` unique ne peut pas
    // representer plusieurs equipes managees.
    const call = prismaMock.employee.updateMany.mock.calls[0]?.[0] as {
      where: { teamId: null }
    }
    expect(call.where.teamId).toBeNull()
  })

  it('retirer le manager ne rattache personne', async () => {
    prismaMock.team.findUnique.mockResolvedValue(mockTeamWithRelations)
    prismaMock.team.update.mockResolvedValue({
      ...mockTeamWithRelations,
      managerId: null,
    })

    await assignManager(TEAM_ID, null)

    expect(prismaMock.employee.updateMany).not.toHaveBeenCalled()
  })

  it('une equipe creee sans manager ne declenche aucun rattachement', async () => {
    prismaMock.team.create.mockResolvedValue({
      ...mockTeamWithRelations,
      managerId: null,
    })

    await createTeam({
      name: 'Equipe Sans Manager',
      companyId: COMPANY_ID,
      color: '#3B82F6',
    })

    expect(prismaMock.employee.updateMany).not.toHaveBeenCalled()
  })
})

// ============================================================================
// Tests Validation Zod
// ============================================================================

describe('Zod validation', () => {
  beforeEach(() => {
    setMockUser('SYSTEM_ADMIN', null)
  })

  it('should reject invalid team ID format', async () => {
    const result = await getTeam('invalid-format')

    expect(result.success).toBe(false)
    // L'ID invalide retourne "non trouvée" car il ne passe pas la requete
  })

  it('should validate color format on create', async () => {
    const result = await createTeam({
      name: 'Test Team',
      companyId: COMPANY_ID,
      color: 'not-a-color',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('couleur')
  })

  it('should reject description over 500 chars', async () => {
    const result = await createTeam({
      name: 'Test Team',
      companyId: COMPANY_ID,
      description: 'a'.repeat(501),
      color: '#3B82F6',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('500')
  })
})
