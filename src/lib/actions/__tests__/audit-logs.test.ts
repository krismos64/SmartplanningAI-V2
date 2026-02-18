/**
 * Tests unitaires pour les Server Actions audit-logs
 *
 * Couvre :
 * - getAuditLogs : RBAC, pagination, filtres, résultat vide, erreur DB
 * - exportAuditLogsCsv : RBAC, CSV output, limit 10k, filtres
 * - Validation Zod des filtres
 *
 * @ticket SP-445
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

const mockCount = vi.fn()
const mockFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      count: (...args: unknown[]) => mockCount(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

// ============================================================================
// Imports
// ============================================================================

import {
  getAuditLogs,
  exportAuditLogsCsv,
  getUserActivity,
} from '../audit-logs'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: {
    id: 'admin-001',
    role: 'SYSTEM_ADMIN',
    companyId: null,
  },
}

const DIRECTOR_SESSION = {
  user: {
    id: 'director-001',
    role: 'DIRECTOR',
    companyId: 'company-001',
  },
}

const EMPLOYEE_SESSION = {
  user: {
    id: 'employee-001',
    role: 'EMPLOYEE',
    companyId: 'company-001',
  },
}

const MANAGER_SESSION = {
  user: {
    id: 'manager-001',
    role: 'MANAGER',
    companyId: 'company-001',
  },
}

const SAMPLE_LOG = {
  id: 'log-001',
  action: 'CREATE' as const,
  entityType: 'EMPLOYEE' as const,
  entityId: 'emp-001',
  userId: 'admin-001',
  companyId: 'company-001',
  details: { name: 'Jean Dupont' },
  createdAt: new Date('2026-02-15T10:00:00Z'),
  user: { id: 'admin-001', email: 'admin@test.com', name: 'Admin Test' },
  company: { id: 'company-001', name: 'Acme Corp' },
}

const SAMPLE_LOG_2 = {
  id: 'log-002',
  action: 'DELETE' as const,
  entityType: 'TEAM' as const,
  entityId: 'team-001',
  userId: 'admin-001',
  companyId: null,
  details: null,
  createdAt: new Date('2026-02-15T11:00:00Z'),
  user: { id: 'admin-001', email: 'admin@test.com', name: 'Admin Test' },
  company: null,
}

// ============================================================================
// Helpers
// ============================================================================

function setupAdmin() {
  mockAuth.mockResolvedValue(ADMIN_SESSION)
}

function setupDirector() {
  mockAuth.mockResolvedValue(DIRECTOR_SESSION)
}

function setupUnauthenticated() {
  mockAuth.mockResolvedValue(null)
}

// ============================================================================
// getAuditLogs
// ============================================================================

describe('getAuditLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- RBAC ---

  it('refuse les utilisateurs non authentifiés', async () => {
    setupUnauthenticated()

    const result = await getAuditLogs()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('connecté')
    }
    expect(mockCount).not.toHaveBeenCalled()
  })

  it('refuse les utilisateurs non SYSTEM_ADMIN', async () => {
    setupDirector()

    const result = await getAuditLogs()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('permissions')
    }
    expect(mockCount).not.toHaveBeenCalled()
  })

  it('autorise les SYSTEM_ADMIN', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    const result = await getAuditLogs()

    expect(result.success).toBe(true)
  })

  // --- Pagination ---

  it('retourne un résultat paginé par défaut (page 1, pageSize 25)', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(50)
    mockFindMany.mockResolvedValue([SAMPLE_LOG, SAMPLE_LOG_2])

    const result = await getAuditLogs()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(25)
      expect(result.data.total).toBe(50)
      expect(result.data.totalPages).toBe(2)
      expect(result.data.data).toHaveLength(2)
    }

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 25,
      })
    )
  })

  it('respecte les paramètres de pagination personnalisés', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(100)
    mockFindMany.mockResolvedValue([])

    await getAuditLogs({ page: '3', pageSize: '50' } as any)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 100,
        take: 50,
      })
    )
  })

  it('rejette pageSize > 100 via validation', async () => {
    setupAdmin()

    const result = await getAuditLogs({ pageSize: '999' } as any)

    expect(result.success).toBe(false)
    expect(mockFindMany).not.toHaveBeenCalled()
  })

  // --- Filtres ---

  it('filtre par action', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(5)
    mockFindMany.mockResolvedValue([SAMPLE_LOG])

    await getAuditLogs({ action: 'CREATE' })

    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ action: 'CREATE' }),
      })
    )
  })

  it('filtre par entityType', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(3)
    mockFindMany.mockResolvedValue([])

    await getAuditLogs({ entityType: 'TEAM' })

    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ entityType: 'TEAM' }),
      })
    )
  })

  it('filtre par recherche (email/nom utilisateur)', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(1)
    mockFindMany.mockResolvedValue([SAMPLE_LOG])

    await getAuditLogs({ search: 'admin@test' })

    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          user: {
            OR: [
              { email: { contains: 'admin@test', mode: 'insensitive' } },
              { name: { contains: 'admin@test', mode: 'insensitive' } },
            ],
          },
        }),
      })
    )
  })

  it('filtre par plage de dates', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(2)
    mockFindMany.mockResolvedValue([SAMPLE_LOG])

    await getAuditLogs({ dateFrom: '2026-02-01', dateTo: '2026-02-28' })

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const callArgs = mockCount.mock.calls[0]![0] as {
      where: { createdAt: { gte: Date; lte: Date } }
    }
    expect(callArgs.where.createdAt).toBeDefined()
    expect(callArgs.where.createdAt.gte).toEqual(new Date('2026-02-01'))
    expect(callArgs.where.createdAt.lte.getFullYear()).toBe(2026)
    expect(callArgs.where.createdAt.lte.getMonth()).toBe(1) // février = 1
    expect(callArgs.where.createdAt.lte.getDate()).toBe(28)
  })

  it('combine plusieurs filtres', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(1)
    mockFindMany.mockResolvedValue([SAMPLE_LOG])

    await getAuditLogs({
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      search: 'admin',
    })

    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          action: 'CREATE',
          entityType: 'EMPLOYEE',
          user: expect.any(Object),
        }),
      })
    )
  })

  // --- Résultat vide ---

  it('retourne un résultat vide valide', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    const result = await getAuditLogs()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data).toEqual([])
      expect(result.data.total).toBe(0)
      expect(result.data.totalPages).toBe(0)
    }
  })

  // --- Transformation des données ---

  it('transforme les enregistrements Prisma en AuditLogEntry', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(1)
    mockFindMany.mockResolvedValue([SAMPLE_LOG])

    const result = await getAuditLogs()

    expect(result.success).toBe(true)
    if (result.success) {
      const entry = result.data.data[0]!
      expect(entry.id).toBe('log-001')
      expect(entry.action).toBe('CREATE')
      expect(entry.entityType).toBe('EMPLOYEE')
      expect(entry.entityId).toBe('emp-001')
      expect(entry.user.email).toBe('admin@test.com')
      expect(entry.company?.name).toBe('Acme Corp')
      expect(entry.details).toEqual({ name: 'Jean Dupont' })
    }
  })

  it('gère les entrées sans company ni details', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(1)
    mockFindMany.mockResolvedValue([SAMPLE_LOG_2])

    const result = await getAuditLogs()

    expect(result.success).toBe(true)
    if (result.success) {
      const entry = result.data.data[0]!
      expect(entry.company).toBeNull()
      expect(entry.details).toBeNull()
    }
  })

  // --- Validation ---

  it('rejette une action invalide', async () => {
    setupAdmin()

    const result = await getAuditLogs({ action: 'INVALID_ACTION' } as any)

    expect(result.success).toBe(false)
    expect(mockCount).not.toHaveBeenCalled()
  })

  it('rejette un entityType invalide', async () => {
    setupAdmin()

    const result = await getAuditLogs({ entityType: 'INVALID_TYPE' } as any)

    expect(result.success).toBe(false)
    expect(mockCount).not.toHaveBeenCalled()
  })

  // --- Erreur DB ---

  it('gère les erreurs Prisma', async () => {
    setupAdmin()
    mockCount.mockRejectedValue(new Error('DB connection lost'))

    const result = await getAuditLogs()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Erreur')
    }
  })
})

// ============================================================================
// exportAuditLogsCsv
// ============================================================================

describe('exportAuditLogsCsv', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- RBAC ---

  it('refuse les utilisateurs non SYSTEM_ADMIN', async () => {
    setupDirector()

    const result = await exportAuditLogsCsv()

    expect(result.success).toBe(false)
    expect(mockFindMany).not.toHaveBeenCalled()
  })

  it('refuse les utilisateurs non authentifiés', async () => {
    setupUnauthenticated()

    const result = await exportAuditLogsCsv()

    expect(result.success).toBe(false)
  })

  // --- CSV ---

  it('génère un CSV avec header et données', async () => {
    setupAdmin()
    mockFindMany.mockResolvedValue([SAMPLE_LOG])

    const result = await exportAuditLogsCsv()

    expect(result.success).toBe(true)
    if (result.success) {
      const lines = result.data.split('\n')
      expect(lines[0]).toBe(
        'Date,Utilisateur,Email,Action,Type Entité,ID Entité,Entreprise,Détails'
      )
      expect(lines).toHaveLength(2)
      expect(lines[1]).toContain('Admin Test')
      expect(lines[1]).toContain('admin@test.com')
      expect(lines[1]).toContain('CREATE')
      expect(lines[1]).toContain('EMPLOYEE')
      expect(lines[1]).toContain('Acme Corp')
    }
  })

  it('génère un CSV vide (header uniquement) si aucun log', async () => {
    setupAdmin()
    mockFindMany.mockResolvedValue([])

    const result = await exportAuditLogsCsv()

    expect(result.success).toBe(true)
    if (result.success) {
      const lines = result.data.split('\n')
      expect(lines).toHaveLength(1) // header only
    }
  })

  it('respecte la limite de 10 000 lignes', async () => {
    setupAdmin()
    mockFindMany.mockResolvedValue([])

    await exportAuditLogsCsv()

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10_000,
      })
    )
  })

  it('applique les filtres au CSV', async () => {
    setupAdmin()
    mockFindMany.mockResolvedValue([])

    await exportAuditLogsCsv({ action: 'DELETE', entityType: 'TEAM' })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          action: 'DELETE',
          entityType: 'TEAM',
        }),
      })
    )
  })

  it('échappe les guillemets dans le CSV', async () => {
    setupAdmin()
    const logWithQuotes = {
      ...SAMPLE_LOG,
      user: {
        ...SAMPLE_LOG.user,
        name: 'Jean "Le Boss" Dupont',
      },
    }
    mockFindMany.mockResolvedValue([logWithQuotes])

    const result = await exportAuditLogsCsv()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toContain('Jean ""Le Boss"" Dupont')
    }
  })

  it('gère les entrées sans company ni details dans le CSV', async () => {
    setupAdmin()
    mockFindMany.mockResolvedValue([SAMPLE_LOG_2])

    const result = await exportAuditLogsCsv()

    expect(result.success).toBe(true)
    if (result.success) {
      const lines = result.data.split('\n')
      // company et details doivent être vides
      expect(lines[1]).toContain('""') // empty company
    }
  })

  // --- Erreur ---

  it('gère les erreurs DB', async () => {
    setupAdmin()
    mockFindMany.mockRejectedValue(new Error('DB timeout'))

    const result = await exportAuditLogsCsv()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Erreur')
    }
  })
})

// ============================================================================
// Validation schema (auditLogFiltersSchema)
// ============================================================================

// ============================================================================
// getUserActivity (SP-463)
// ============================================================================

describe('getUserActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Auth ---

  it('refuse les utilisateurs non authentifiés', async () => {
    setupUnauthenticated()

    const result = await getUserActivity()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('connecté')
    }
    expect(mockCount).not.toHaveBeenCalled()
  })

  it('refuse une session sans user.id', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'EMPLOYEE' } })

    const result = await getUserActivity()

    expect(result.success).toBe(false)
    expect(mockCount).not.toHaveBeenCalled()
  })

  // --- Accessible à tous les rôles ---

  it('autorise les EMPLOYEE', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    const result = await getUserActivity()

    expect(result.success).toBe(true)
  })

  it('autorise les MANAGER', async () => {
    mockAuth.mockResolvedValue(MANAGER_SESSION)
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    const result = await getUserActivity()

    expect(result.success).toBe(true)
  })

  it('autorise les DIRECTOR', async () => {
    setupDirector()
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    const result = await getUserActivity()

    expect(result.success).toBe(true)
  })

  it('autorise les SYSTEM_ADMIN', async () => {
    setupAdmin()
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    const result = await getUserActivity()

    expect(result.success).toBe(true)
  })

  // --- Isolation par userId ---

  it('filtre toujours par le userId de la session (isolation stricte)', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(5)
    mockFindMany.mockResolvedValue([])

    await getUserActivity()

    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'employee-001' }),
      })
    )
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'employee-001' }),
      })
    )
  })

  it("ne permet pas de voir les logs d'un autre utilisateur", async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    // Même en passant un action filter, le userId reste celui de la session
    await getUserActivity({ action: 'LOGIN' })

    const countCall = mockCount.mock.calls[0]![0] as {
      where: { userId: string }
    }
    expect(countCall.where.userId).toBe('employee-001')
  })

  // --- Pagination ---

  it('retourne page 1 et pageSize 20 par défaut', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(45)
    mockFindMany.mockResolvedValue([SAMPLE_LOG])

    const result = await getUserActivity()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(20)
      expect(result.data.total).toBe(45)
      expect(result.data.totalPages).toBe(3)
    }

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('respecte les paramètres de pagination personnalisés', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(100)
    mockFindMany.mockResolvedValue([])

    await getUserActivity({ page: 3, pageSize: 10 })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      })
    )
  })

  it('cap pageSize à 100 maximum', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    await getUserActivity({ pageSize: 500 })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 100,
      })
    )
  })

  it('force page minimum à 1', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    await getUserActivity({ page: -5 })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
      })
    )
  })

  it('force pageSize minimum à 1', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    await getUserActivity({ pageSize: 0 })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 1,
      })
    )
  })

  // --- Filtre action ---

  it('filtre par action', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(2)
    mockFindMany.mockResolvedValue([SAMPLE_LOG])

    await getUserActivity({ action: 'LOGIN' })

    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'employee-001',
          action: 'LOGIN',
        }),
      })
    )
  })

  it('ne filtre pas par action quand action est undefined', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(10)
    mockFindMany.mockResolvedValue([])

    await getUserActivity({})

    const countCall = mockCount.mock.calls[0]![0] as {
      where: Record<string, unknown>
    }
    expect(countCall.where).not.toHaveProperty('action')
  })

  // --- Résultat vide ---

  it('retourne un résultat vide valide', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(0)
    mockFindMany.mockResolvedValue([])

    const result = await getUserActivity()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data).toEqual([])
      expect(result.data.total).toBe(0)
      expect(result.data.totalPages).toBe(0)
    }
  })

  // --- Transformation ---

  it('transforme les enregistrements en AuditLogEntry', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockResolvedValue(1)
    mockFindMany.mockResolvedValue([SAMPLE_LOG])

    const result = await getUserActivity()

    expect(result.success).toBe(true)
    if (result.success) {
      const entry = result.data.data[0]!
      expect(entry.id).toBe('log-001')
      expect(entry.action).toBe('CREATE')
      expect(entry.entityType).toBe('EMPLOYEE')
      expect(entry.user.email).toBe('admin@test.com')
      expect(entry.details).toEqual({ name: 'Jean Dupont' })
    }
  })

  // --- Erreur DB ---

  it('gère les erreurs Prisma', async () => {
    mockAuth.mockResolvedValue(EMPLOYEE_SESSION)
    mockCount.mockRejectedValue(new Error('DB connection lost'))

    const result = await getUserActivity()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Erreur')
    }
  })
})

// ============================================================================
// Validation schema (auditLogFiltersSchema)
// ============================================================================

describe('auditLogFiltersSchema', () => {
  // Import separately to test validation directly
  let auditLogFiltersSchema: typeof import('../../validations/audit-logs').auditLogFiltersSchema

  beforeEach(async () => {
    const mod = await import('../../validations/audit-logs')
    auditLogFiltersSchema = mod.auditLogFiltersSchema
  })

  it('accepte un objet vide (valeurs par défaut)', () => {
    const result = auditLogFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(25)
    }
  })

  it('accepte des filtres valides complets', () => {
    const result = auditLogFiltersSchema.safeParse({
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      search: 'admin',
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      page: 2,
      pageSize: 50,
    })
    expect(result.success).toBe(true)
  })

  it('rejette une action invalide', () => {
    const result = auditLogFiltersSchema.safeParse({ action: 'HACK' })
    expect(result.success).toBe(false)
  })

  it('rejette un entityType invalide', () => {
    const result = auditLogFiltersSchema.safeParse({ entityType: 'INVALID' })
    expect(result.success).toBe(false)
  })

  it('cap pageSize à 100 max', () => {
    const result = auditLogFiltersSchema.safeParse({ pageSize: 200 })
    expect(result.success).toBe(false)
  })

  it('trim la recherche', () => {
    const result = auditLogFiltersSchema.safeParse({ search: '  admin  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.search).toBe('admin')
    }
  })
})
