/**
 * Tests unitaires pour le service logAuditAction
 *
 * Vérifie le comportement du service d'audit :
 * - Création d'enregistrements via Prisma
 * - Gestion des erreurs silencieuses (fire-and-forget)
 * - Paramètres optionnels (companyId, details, entityId)
 *
 * @ticket SP-443
 */

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma (pattern du projet — inline par fichier)
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { logAuditAction } from '../audit.service'

// ============================================================================
// Tests
// ============================================================================

describe('logAuditAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --------------------------------------------------------------------------
  // Création d'un enregistrement
  // --------------------------------------------------------------------------

  it('crée un enregistrement AuditLog avec tous les champs', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    await logAuditAction({
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      entityId: 'clemployee0000000001',
      userId: 'cluser00000000000001',
      companyId: 'clcompany0000000001',
      details: { firstName: 'Jean', lastName: 'Dupont' },
    })

    expect(prisma.auditLog.create).toHaveBeenCalledOnce()
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'CREATE',
        entityType: 'EMPLOYEE',
        entityId: 'clemployee0000000001',
        userId: 'cluser00000000000001',
        companyId: 'clcompany0000000001',
        details: { firstName: 'Jean', lastName: 'Dupont' },
      },
    })
  })

  // --------------------------------------------------------------------------
  // Paramètre details optionnel
  // --------------------------------------------------------------------------

  it('crée un AuditLog sans details quand undefined', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    await logAuditAction({
      action: 'DELETE',
      entityType: 'TEAM',
      entityId: 'clteam00000000000001',
      userId: 'cluser00000000000001',
      companyId: 'clcompany0000000001',
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'DELETE',
        entityType: 'TEAM',
        entityId: 'clteam00000000000001',
        userId: 'cluser00000000000001',
        companyId: 'clcompany0000000001',
      },
    })
  })

  it('inclut details quand fourni', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    const details = { before: { name: 'old' }, after: { name: 'new' } }

    await logAuditAction({
      action: 'UPDATE',
      entityType: 'EMPLOYEE',
      entityId: 'clemployee0000000001',
      userId: 'cluser00000000000001',
      details,
    })

    const callArg = vi.mocked(prisma.auditLog.create).mock.calls[0]![0]
    expect(callArg.data).toHaveProperty('details', details)
  })

  // --------------------------------------------------------------------------
  // Erreur silencieuse
  // --------------------------------------------------------------------------

  it('ne lève pas d exception si Prisma échoue', async () => {
    vi.mocked(prisma.auditLog.create).mockRejectedValue(
      new Error('DB connection lost')
    )

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Ne doit PAS throw
    await expect(
      logAuditAction({
        action: 'CREATE',
        entityType: 'EMPLOYEE',
        userId: 'cluser00000000000001',
      })
    ).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalledOnce()
    expect(consoleSpy).toHaveBeenCalledWith(
      '[AuditLog] Failed to log action:',
      expect.objectContaining({
        action: 'CREATE',
        entityType: 'EMPLOYEE',
        error: 'DB connection lost',
      })
    )

    consoleSpy.mockRestore()
  })

  it('loggue une erreur non-Error en console sans crash', async () => {
    vi.mocked(prisma.auditLog.create).mockRejectedValue('string error')

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      logAuditAction({
        action: 'LOGIN',
        entityType: 'USER',
        userId: 'cluser00000000000001',
      })
    ).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalledWith(
      '[AuditLog] Failed to log action:',
      expect.objectContaining({ error: 'Unknown error' })
    )

    consoleSpy.mockRestore()
  })

  // --------------------------------------------------------------------------
  // companyId optionnel (cas SYSTEM_ADMIN)
  // --------------------------------------------------------------------------

  it('envoie companyId null quand non fourni (cas SYSTEM_ADMIN)', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    await logAuditAction({
      action: 'CREATE',
      entityType: 'COMPANY',
      entityId: 'clcompany0000000002',
      userId: 'clsuperadmin00000001',
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ companyId: null }),
    })
  })

  it('envoie companyId quand fourni', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    await logAuditAction({
      action: 'UPDATE',
      entityType: 'SETTINGS',
      userId: 'cluser00000000000001',
      companyId: 'clcompany0000000001',
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ companyId: 'clcompany0000000001' }),
    })
  })

  // --------------------------------------------------------------------------
  // entityId optionnel (cas LOGIN/LOGOUT)
  // --------------------------------------------------------------------------

  it('envoie entityId null quand non fourni', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    await logAuditAction({
      action: 'LOGIN',
      entityType: 'USER',
      userId: 'cluser00000000000001',
      companyId: 'clcompany0000000001',
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ entityId: null }),
    })
  })

  it('envoie entityId quand fourni', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    await logAuditAction({
      action: 'DELETE',
      entityType: 'EMPLOYEE',
      entityId: 'clemployee0000000001',
      userId: 'cluser00000000000001',
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ entityId: 'clemployee0000000001' }),
    })
  })

  // --------------------------------------------------------------------------
  // Paramètres obligatoires
  // --------------------------------------------------------------------------

  it('passe les 3 paramètres obligatoires (action, entityType, userId)', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    await logAuditAction({
      action: 'EXPORT',
      entityType: 'EMPLOYEE',
      userId: 'cluser00000000000001',
    })

    const callArg = vi.mocked(prisma.auditLog.create).mock.calls[0]![0]
    expect(callArg.data.action).toBe('EXPORT')
    expect(callArg.data.entityType).toBe('EMPLOYEE')
    expect(callArg.data.userId).toBe('cluser00000000000001')
  })

  // --------------------------------------------------------------------------
  // Toutes les valeurs AuditAction
  // --------------------------------------------------------------------------

  describe('supporte toutes les valeurs AuditAction', () => {
    const ACTIONS = [
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

    it.each(ACTIONS)('accepte action=%s', async (action) => {
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

      await logAuditAction({
        action,
        entityType: 'USER',
        userId: 'cluser00000000000001',
      })

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ action }),
      })
    })
  })

  // --------------------------------------------------------------------------
  // Toutes les valeurs AuditEntityType
  // --------------------------------------------------------------------------

  describe('supporte toutes les valeurs AuditEntityType', () => {
    const ENTITY_TYPES = [
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

    it.each(ENTITY_TYPES)('accepte entityType=%s', async (entityType) => {
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

      await logAuditAction({
        action: 'CREATE',
        entityType,
        userId: 'cluser00000000000001',
      })

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ entityType }),
      })
    })
  })

  // --------------------------------------------------------------------------
  // Details complexes
  // --------------------------------------------------------------------------

  it('gère des details Json avec structure before/after', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    const details = {
      before: { firstName: 'Jean', weeklyHours: 35 },
      after: { firstName: 'Jean', weeklyHours: 39 },
      changedFields: ['weeklyHours'],
    }

    await logAuditAction({
      action: 'UPDATE',
      entityType: 'EMPLOYEE',
      entityId: 'clemployee0000000001',
      userId: 'cluser00000000000001',
      companyId: 'clcompany0000000001',
      details,
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ details }),
    })
  })

  it('gère des details avec email pour LOGIN', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)

    await logAuditAction({
      action: 'LOGIN',
      entityType: 'USER',
      entityId: 'cluser00000000000001',
      userId: 'cluser00000000000001',
      companyId: 'clcompany0000000001',
      details: { email: 'admin@techcorp.com' },
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        details: { email: 'admin@techcorp.com' },
      }),
    })
  })
})
