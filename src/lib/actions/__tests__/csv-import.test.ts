/**
 * Tests unitaires pour la Server Action importEmployeesFromCsv
 *
 * @ticket SP-497
 */

/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma — vi.hoisted pour eviter le probleme de hoisting
const { mockTransaction } = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: mockTransaction,
  },
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/impersonation', () => ({
  getEffectiveSessionData: vi.fn(),
  assertNotImpersonating: vi.fn().mockResolvedValue(null),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/services/audit', () => ({
  logAuditAction: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/services/stripe/subscription-sync.service', () => ({
  syncEmployeeCountToStripe: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/cache', () => ({
  invalidateDashboardCache: vi.fn().mockResolvedValue(undefined),
  invalidateEmployeesCache: vi.fn().mockResolvedValue(undefined),
}))

import { auth } from '@/lib/auth'
import {
  getEffectiveSessionData,
  assertNotImpersonating,
} from '@/lib/impersonation'
import { importEmployeesFromCsv } from '../csv-import'

// ============================================================================
// Helpers
// ============================================================================

function mockSession(role: string, companyId: string | null) {
  vi.mocked(auth).mockResolvedValue({
    user: { id: 'user-1', role, companyId, email: 'admin@test.com' },
    expires: '2026-12-31',
  } as never)
  vi.mocked(getEffectiveSessionData).mockResolvedValue({
    userId: 'user-1',
    role,
    companyId,
  } as never)
}

const VALID_CSV = `firstName;lastName;email;phone;jobTitle;department;teamName;weeklyHours;hireDate;role;skills
Marie;Dupont;marie@test.com;0612345678;Caissière;Accueil;Caisse;35;2024-01-15;EMPLOYEE;caisse,accueil
Pierre;Martin;pierre@test.com;;Chef de rayon;Technique;Tech;39;2022-06-01;MANAGER;management`

const VALID_OPTIONS = { skipDuplicates: true, autoCreateTeams: true }

// ============================================================================
// Tests
// ============================================================================

describe('importEmployeesFromCsv', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset impersonation guard par defaut (pas en mode support)
    vi.mocked(assertNotImpersonating).mockResolvedValue(null as never)
  })

  // ------------------------------------------------------------------
  // Auth & RBAC
  // ------------------------------------------------------------------

  describe('Auth & RBAC', () => {
    it('retourne une erreur si non authentifie', async () => {
      vi.mocked(auth).mockResolvedValue(null as never)

      const result = await importEmployeesFromCsv(VALID_CSV, VALID_OPTIONS)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('connecté')
      }
    })

    it('refuse si le role est EMPLOYEE', async () => {
      mockSession('EMPLOYEE', 'company-1')

      const result = await importEmployeesFromCsv(VALID_CSV, VALID_OPTIONS)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('permissions')
      }
    })

    it('refuse si le role est MANAGER', async () => {
      mockSession('MANAGER', 'company-1')

      const result = await importEmployeesFromCsv(VALID_CSV, VALID_OPTIONS)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('permissions')
      }
    })

    it('refuse si impersonation active', async () => {
      mockSession('DIRECTOR', 'company-1')
      vi.mocked(assertNotImpersonating).mockResolvedValue({
        success: false,
        error: 'Mode support actif',
      })

      const result = await importEmployeesFromCsv(VALID_CSV, VALID_OPTIONS)

      expect(result.success).toBe(false)
    })
  })

  // ------------------------------------------------------------------
  // Validation CSV
  // ------------------------------------------------------------------

  describe('Validation CSV', () => {
    it('refuse un CSV vide', async () => {
      mockSession('DIRECTOR', 'company-1')

      const result = await importEmployeesFromCsv('', VALID_OPTIONS)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('vide')
      }
    })

    it('refuse un CSV sans colonnes obligatoires', async () => {
      mockSession('DIRECTOR', 'company-1')

      const csvSansNom = `email;phone
marie@test.com;0612345678`

      const result = await importEmployeesFromCsv(csvSansNom, VALID_OPTIONS)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('obligatoires')
      }
    })

    it('accepte les en-tetes en francais', async () => {
      mockSession('DIRECTOR', 'company-1')

      const csvFr = `Prénom;Nom;Email
Marie;Dupont;marie@test.com`

      // Mock transaction
      mockTransaction.mockImplementation((fn: (tx: any) => any) => {
        const tx = {
          employee: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({ id: 'emp-1' }),
          },
          team: { findMany: vi.fn().mockResolvedValue([]) },
        }
        return fn(tx)
      })

      const result = await importEmployeesFromCsv(csvFr, VALID_OPTIONS)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.created.length).toBe(1)
      }
    })

    it('accepte les en-tetes du template avec annotations (obligatoire/facultatif)', async () => {
      mockSession('DIRECTOR', 'company-1')

      const csvTemplate = `Prénom (obligatoire);Nom (obligatoire);Email (facultatif);Téléphone (facultatif);Poste (facultatif);Département (facultatif);Équipe (facultatif);Heures/semaine (facultatif);Date d'embauche (facultatif);Rôle (facultatif);Compétences (facultatif)
Marie;Dupont;marie@test.com;0612345678;Caissière;Support;Caisse;35;15/01/2024;Employé;caisse,accueil`

      mockTransaction.mockImplementation((fn: (tx: any) => any) => {
        const tx = {
          employee: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({ id: 'emp-1' }),
          },
          team: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({ id: 'team-1', name: 'Caisse' }),
          },
        }
        return fn(tx)
      })

      const result = await importEmployeesFromCsv(csvTemplate, VALID_OPTIONS)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.created.length).toBe(1)
        expect(result.data.created[0]?.employeeName).toBe('Marie Dupont')
        expect(result.data.teamsCreated).toContain('Caisse')
      }
    })
  })

  // ------------------------------------------------------------------
  // Import avec $transaction
  // ------------------------------------------------------------------

  describe('Import', () => {
    it('cree les employes avec succes', async () => {
      mockSession('DIRECTOR', 'company-1')

      mockTransaction.mockImplementation((fn: (tx: any) => any) => {
        const tx = {
          employee: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi
              .fn()
              .mockResolvedValueOnce({ id: 'emp-1' })
              .mockResolvedValueOnce({ id: 'emp-2' }),
          },
          team: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi
              .fn()
              .mockResolvedValueOnce({ id: 'team-1', name: 'Caisse' })
              .mockResolvedValueOnce({ id: 'team-2', name: 'Tech' }),
          },
        }
        return fn(tx)
      })

      const result = await importEmployeesFromCsv(VALID_CSV, VALID_OPTIONS)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.created.length).toBe(2)
        expect(result.data.teamsCreated).toContain('Caisse')
        expect(result.data.teamsCreated).toContain('Tech')
      }
    })

    it('skippe les doublons par email', async () => {
      mockSession('DIRECTOR', 'company-1')

      mockTransaction.mockImplementation((fn: (tx: any) => any) => {
        const tx = {
          employee: {
            findMany: vi.fn().mockResolvedValue([
              {
                id: 'existing-1',
                firstName: 'Marie',
                lastName: 'Dupont',
                email: 'marie@test.com',
              },
            ]),
            create: vi.fn().mockResolvedValue({ id: 'emp-2' }),
          },
          team: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({ id: 'team-1', name: 'Tech' }),
          },
        }
        return fn(tx)
      })

      const result = await importEmployeesFromCsv(VALID_CSV, VALID_OPTIONS)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.created.length).toBe(1)
        expect(result.data.skipped.length).toBe(1)
        expect(result.data.skipped[0]?.reason).toContain('Doublon')
      }
    })

    it('retourne des erreurs de validation par ligne', async () => {
      mockSession('DIRECTOR', 'company-1')

      const csvInvalid = `firstName;lastName;email
M;Dupont;pas-un-email`

      mockTransaction.mockImplementation((fn: (tx: any) => any) => {
        const tx = {
          employee: { findMany: vi.fn().mockResolvedValue([]) },
          team: { findMany: vi.fn().mockResolvedValue([]) },
        }
        return fn(tx)
      })

      const result = await importEmployeesFromCsv(csvInvalid, VALID_OPTIONS)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.errors.length).toBeGreaterThan(0)
        expect(result.data.created.length).toBe(0)
      }
    })
  })
})
