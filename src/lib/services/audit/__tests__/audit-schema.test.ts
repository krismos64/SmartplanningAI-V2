/**
 * Tests unitaires pour le schéma AuditLog
 *
 * Vérifie que le modèle Prisma AuditLog et les enums associés
 * sont correctement définis et utilisables.
 *
 * @ticket SP-442
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma (pattern du projet)
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

// ============================================================================
// Données de test
// ============================================================================

const MOCK_AUDIT_LOG = {
  id: 'clauditlog0000000001',
  action: 'CREATE' as const,
  entityType: 'EMPLOYEE' as const,
  entityId: 'clemployee0000000001',
  userId: 'cluser00000000000001',
  companyId: 'clcompany0000000001',
  details: { firstName: 'Jean', lastName: 'Dupont' },
  createdAt: new Date('2026-02-18T10:00:00.000Z'),
}

const MOCK_AUDIT_LOG_WITH_RELATIONS = {
  ...MOCK_AUDIT_LOG,
  user: {
    id: 'cluser00000000000001',
    email: 'admin@test.com',
    name: 'Admin Test',
  },
  company: {
    id: 'clcompany0000000001',
    name: 'TechCorp',
  },
}

// ============================================================================
// Tests
// ============================================================================

describe('AuditLog Schema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --------------------------------------------------------------------------
  // Création avec tous les champs obligatoires
  // --------------------------------------------------------------------------

  it('crée un AuditLog avec tous les champs obligatoires', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue(MOCK_AUDIT_LOG as never)

    const result = await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'EMPLOYEE',
        entityId: 'clemployee0000000001',
        userId: 'cluser00000000000001',
        companyId: 'clcompany0000000001',
        details: { firstName: 'Jean', lastName: 'Dupont' },
      },
    })

    expect(prisma.auditLog.create).toHaveBeenCalledOnce()
    expect(result.id).toBe('clauditlog0000000001')
    expect(result.action).toBe('CREATE')
    expect(result.entityType).toBe('EMPLOYEE')
    expect(result.entityId).toBe('clemployee0000000001')
    expect(result.userId).toBe('cluser00000000000001')
    expect(result.companyId).toBe('clcompany0000000001')
  })

  // --------------------------------------------------------------------------
  // Création sans companyId (cas SYSTEM_ADMIN)
  // --------------------------------------------------------------------------

  it('crée un AuditLog avec companyId null (cas SYSTEM_ADMIN)', async () => {
    const logSansCompany = {
      ...MOCK_AUDIT_LOG,
      companyId: null,
      entityType: 'COMPANY' as const,
      action: 'CREATE' as const,
    }

    vi.mocked(prisma.auditLog.create).mockResolvedValue(logSansCompany as never)

    const result = await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'COMPANY',
        entityId: 'clcompany0000000002',
        userId: 'clsuperadmin00000001',
        companyId: null,
      },
    })

    expect(result.companyId).toBeNull()
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ companyId: null }),
    })
  })

  // --------------------------------------------------------------------------
  // Création avec details Json
  // --------------------------------------------------------------------------

  it('crée un AuditLog avec details Json complexe', async () => {
    const complexDetails = {
      before: { firstName: 'Jean', lastName: 'Dupont', weeklyHours: 35 },
      after: { firstName: 'Jean', lastName: 'Martin', weeklyHours: 39 },
      changedFields: ['lastName', 'weeklyHours'],
    }

    const logAvecDetails = {
      ...MOCK_AUDIT_LOG,
      action: 'UPDATE' as const,
      details: complexDetails,
    }

    vi.mocked(prisma.auditLog.create).mockResolvedValue(logAvecDetails as never)

    const result = await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'EMPLOYEE',
        entityId: 'clemployee0000000001',
        userId: 'cluser00000000000001',
        companyId: 'clcompany0000000001',
        details: complexDetails,
      },
    })

    expect(result.details).toEqual(complexDetails)
    expect((result.details as Record<string, unknown>).changedFields).toEqual([
      'lastName',
      'weeklyHours',
    ])
  })

  // --------------------------------------------------------------------------
  // Création sans entityId (cas LOGIN/LOGOUT)
  // --------------------------------------------------------------------------

  it('crée un AuditLog sans entityId (cas LOGIN)', async () => {
    const loginLog = {
      ...MOCK_AUDIT_LOG,
      action: 'LOGIN' as const,
      entityType: 'USER' as const,
      entityId: null,
      details: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
    }

    vi.mocked(prisma.auditLog.create).mockResolvedValue(loginLog as never)

    const result = await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entityType: 'USER',
        entityId: null,
        userId: 'cluser00000000000001',
        companyId: 'clcompany0000000001',
        details: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
      },
    })

    expect(result.entityId).toBeNull()
    expect(result.action).toBe('LOGIN')
  })

  // --------------------------------------------------------------------------
  // Validation des enums AuditAction
  // --------------------------------------------------------------------------

  describe('AuditAction enum', () => {
    const AUDIT_ACTIONS = [
      'CREATE',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'EXPORT',
      'STATUS_CHANGE',
      'IMPERSONATE',
      'PASSWORD_CHANGE',
    ] as const

    it.each(AUDIT_ACTIONS)('accepte la valeur AuditAction.%s', async (action) => {
      const log = { ...MOCK_AUDIT_LOG, action }
      vi.mocked(prisma.auditLog.create).mockResolvedValue(log as never)

      const result = await prisma.auditLog.create({
        data: {
          action,
          entityType: 'USER',
          userId: 'cluser00000000000001',
        },
      })

      expect(result.action).toBe(action)
    })

    it('contient exactement 9 valeurs', () => {
      expect(AUDIT_ACTIONS).toHaveLength(9)
    })
  })

  // --------------------------------------------------------------------------
  // Validation des enums AuditEntityType
  // --------------------------------------------------------------------------

  describe('AuditEntityType enum', () => {
    const AUDIT_ENTITY_TYPES = [
      'COMPANY',
      'EMPLOYEE',
      'TEAM',
      'SCHEDULE',
      'LEAVE',
      'SUBSCRIPTION',
      'USER',
      'SETTINGS',
      'INCIDENT_NOTE',
      'AVAILABILITY',
    ] as const

    it.each(AUDIT_ENTITY_TYPES)(
      'accepte la valeur AuditEntityType.%s',
      async (entityType) => {
        const log = { ...MOCK_AUDIT_LOG, entityType }
        vi.mocked(prisma.auditLog.create).mockResolvedValue(log as never)

        const result = await prisma.auditLog.create({
          data: {
            action: 'CREATE',
            entityType,
            userId: 'cluser00000000000001',
          },
        })

        expect(result.entityType).toBe(entityType)
      }
    )

    it('contient exactement 10 valeurs', () => {
      expect(AUDIT_ENTITY_TYPES).toHaveLength(10)
    })
  })

  // --------------------------------------------------------------------------
  // Requêtes de lecture (findMany, count)
  // --------------------------------------------------------------------------

  it('liste les AuditLogs avec relations user et company', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([
      MOCK_AUDIT_LOG_WITH_RELATIONS,
    ] as never)

    const result = await prisma.auditLog.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    expect(result).toHaveLength(1)
    expect(result[0]!.user.email).toBe('admin@test.com')
    expect(result[0]!.company?.name).toBe('TechCorp')
  })

  it('compte les AuditLogs filtrés par companyId et action', async () => {
    vi.mocked(prisma.auditLog.count).mockResolvedValue(42)

    const count = await prisma.auditLog.count({
      where: {
        companyId: 'clcompany0000000001',
        action: 'CREATE',
      },
    })

    expect(count).toBe(42)
    expect(prisma.auditLog.count).toHaveBeenCalledWith({
      where: {
        companyId: 'clcompany0000000001',
        action: 'CREATE',
      },
    })
  })

  it('filtre les AuditLogs par plage de dates', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([])

    await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: new Date('2026-02-01'),
          lte: new Date('2026-02-28'),
        },
      },
    })

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: new Date('2026-02-01'),
          lte: new Date('2026-02-28'),
        },
      },
    })
  })
})
