/**
 * Tests unitaires pour les Server Actions IncidentNote
 *
 * @ticket SP-425
 */

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createIncidentNote,
  getIncidentNotes,
  getIncidentNoteById,
  getMyIncidentNotes,
  updateIncidentNote,
  deleteIncidentNote,
  getIncidentNotesForEmployee,
} from '../incident-notes'

// Mock des dépendances
vi.mock('@/lib/prisma', () => ({
  prisma: {
    incidentNote: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    employee: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// ============================================================================
// Helpers de test
// ============================================================================

const COMPANY_ID = 'clcompany0000000001'
const EMPLOYEE_ID = 'clemployee00000001'
const OTHER_EMPLOYEE_ID = 'clemployee00000002'
const USER_ID = 'cluser000000000001'
const MANAGER_USER_ID = 'cluser000000000002'
const DIRECTOR_USER_ID = 'cluser000000000003'
const TEAM_ID = 'clteam00000000000001'
const OTHER_TEAM_ID = 'clteam00000000000002'
const NOTE_ID = 'clnote00000000000001'

const mockSession = (role: string, userId = USER_ID) => ({
  user: {
    id: userId,
    role,
    companyId: COMPANY_ID,
  },
})

const mockIncidentNote = (overrides = {}) => ({
  id: NOTE_ID,
  title: 'Retard répété',
  content: "L'employé est arrivé en retard 3 fois cette semaine.",
  date: new Date('2026-01-15'),
  visibility: 'DIRECTOR_ONLY',
  subjectId: EMPLOYEE_ID,
  authorId: MANAGER_USER_ID,
  companyId: COMPANY_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  subject: {
    id: EMPLOYEE_ID,
    firstName: 'Jean',
    lastName: 'Dupont',
    teamId: TEAM_ID,
    team: { id: TEAM_ID, name: 'Équipe A' },
  },
  author: {
    id: MANAGER_USER_ID,
    name: 'Manager Test',
    email: 'manager@test.com',
  },
  company: {
    id: COMPANY_ID,
    name: 'Test Company',
  },
  ...overrides,
})

const mockEmployee = (overrides = {}) => ({
  id: EMPLOYEE_ID,
  companyId: COMPANY_ID,
  teamId: TEAM_ID,
  managedTeams: [],
  ...overrides,
})

function setupAuth(
  role: string,
  userId = USER_ID,
  managedTeamIds: string[] = []
) {
  const session = mockSession(role, userId)
  vi.mocked(auth).mockResolvedValue(session as never)

  // Mock employee lookup pour le contexte RBAC
  const employeeData = {
    id: role === 'EMPLOYEE' ? EMPLOYEE_ID : 'clemployee_manager',
    managedTeams: managedTeamIds.map((id) => ({ id })),
  }
  vi.mocked(prisma.employee.findUnique).mockResolvedValue(employeeData as never)

  return session
}

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  vi.resetAllMocks()
})

// ─── createIncidentNote ─────────────────────────────────────────────

describe('createIncidentNote', () => {
  const validInput = {
    title: 'Nouvelle note',
    content: 'Contenu de la note de test.',
    date: new Date('2026-01-20'),
    visibility: 'MANAGER_DIRECTOR' as const,
    subjectId: EMPLOYEE_ID,
  }

  it('crée une note avec succès pour un MANAGER (employé de son équipe)', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID, [TEAM_ID])

    // Mock employee lookup pour le sujet
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({
        id: 'clemployee_manager',
        managedTeams: [{ id: TEAM_ID }],
      } as never)
      .mockResolvedValueOnce(mockEmployee() as never)

    vi.mocked(prisma.incidentNote.create).mockResolvedValue(
      mockIncidentNote({
        ...validInput,
        authorId: MANAGER_USER_ID,
      }) as never
    )

    const result = await createIncidentNote(validInput)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Nouvelle note')
    }
    expect(prisma.incidentNote.create).toHaveBeenCalled()
  })

  it('crée une note avec succès pour un DIRECTOR', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)

    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({
        id: 'clemployee_director',
        managedTeams: [],
      } as never)
      .mockResolvedValueOnce(mockEmployee() as never)

    vi.mocked(prisma.incidentNote.create).mockResolvedValue(
      mockIncidentNote({ authorId: DIRECTOR_USER_ID }) as never
    )

    const result = await createIncidentNote(validInput)

    expect(result.success).toBe(true)
  })

  it('refuse la création pour un EMPLOYEE', async () => {
    setupAuth('EMPLOYEE')

    const result = await createIncidentNote(validInput)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('permissions')
    }
  })

  it('refuse si le MANAGER essaie de créer une note pour un employé hors de son équipe', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID, [TEAM_ID])

    // Sujet dans une autre équipe
    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({
        id: 'clemployee_manager',
        managedTeams: [{ id: TEAM_ID }],
      } as never)
      .mockResolvedValueOnce(mockEmployee({ teamId: OTHER_TEAM_ID }) as never)

    const result = await createIncidentNote(validInput)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('équipes')
    }
  })

  it('échoue si les données sont invalides (titre vide)', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)

    const result = await createIncidentNote({
      ...validInput,
      title: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('titre')
    }
  })
})

// ─── getIncidentNotes ─────────────────────────────────────────────

describe('getIncidentNotes', () => {
  it("refuse l'accès si non authentifié", async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const result = await getIncidentNotes()

    expect(result.success).toBe(false)
  })

  it('EMPLOYEE voit uniquement ses notes avec visibility=ALL', async () => {
    setupAuth('EMPLOYEE', USER_ID)
    vi.mocked(prisma.incidentNote.findMany).mockResolvedValue([
      mockIncidentNote({ visibility: 'ALL', subjectId: EMPLOYEE_ID }),
    ] as never)
    vi.mocked(prisma.incidentNote.count).mockResolvedValue(1 as never)

    const result = await getIncidentNotes()

    expect(result.success).toBe(true)
    expect(prisma.incidentNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              visibility: 'ALL',
              subjectId: EMPLOYEE_ID,
            }),
          ]),
        }),
      })
    )
  })

  it('MANAGER voit les notes MANAGER_DIRECTOR et ALL de son équipe', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID, [TEAM_ID])
    vi.mocked(prisma.incidentNote.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.incidentNote.count).mockResolvedValue(0 as never)

    const result = await getIncidentNotes()

    expect(result.success).toBe(true)
    expect(prisma.incidentNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              visibility: { in: ['MANAGER_DIRECTOR', 'ALL'] },
              subject: { teamId: { in: [TEAM_ID] } },
            }),
          ]),
        }),
      })
    )
  })

  it("DIRECTOR voit toutes les notes de l'entreprise", async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.incidentNote.findMany).mockResolvedValue([
      mockIncidentNote(),
    ] as never)
    vi.mocked(prisma.incidentNote.count).mockResolvedValue(1 as never)

    const result = await getIncidentNotes()

    expect(result.success).toBe(true)
    expect(prisma.incidentNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ companyId: COMPANY_ID }),
          ]),
        }),
      })
    )
  })

  it('applique correctement les filtres par date', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.incidentNote.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.incidentNote.count).mockResolvedValue(0 as never)

    const startDate = new Date('2026-01-01')
    const endDate = new Date('2026-01-31')

    const result = await getIncidentNotes({ startDate, endDate })

    expect(result.success).toBe(true)
    expect(prisma.incidentNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              date: { gte: startDate, lte: endDate },
            }),
          ]),
        }),
      })
    )
  })

  it('applique correctement la recherche textuelle', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.incidentNote.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.incidentNote.count).mockResolvedValue(0 as never)

    const result = await getIncidentNotes({ search: 'retard' })

    expect(result.success).toBe(true)
    expect(prisma.incidentNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({
                  title: { contains: 'retard', mode: 'insensitive' },
                }),
              ]),
            }),
          ]),
        }),
      })
    )
  })
})

// ─── getIncidentNoteById ─────────────────────────────────────────────

describe('getIncidentNoteById', () => {
  it('récupère une note avec toutes les relations', async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)
    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue(
      mockIncidentNote() as never
    )

    const result = await getIncidentNoteById(NOTE_ID)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(NOTE_ID)
      expect(result.data.subject).toBeDefined()
      expect(result.data.author).toBeDefined()
    }
  })

  it("refuse l'accès si visibility insuffisante (EMPLOYEE sur DIRECTOR_ONLY)", async () => {
    setupAuth('EMPLOYEE', USER_ID)

    // Simuler la récupération du contexte employé
    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      managedTeams: [],
    } as never)

    // Note avec visibility DIRECTOR_ONLY
    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue(
      mockIncidentNote({ visibility: 'DIRECTOR_ONLY' }) as never
    )

    const result = await getIncidentNoteById(NOTE_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('accès')
    }
  })

  it("autorise l'accès si visibility OK (EMPLOYEE sur sa note ALL)", async () => {
    setupAuth('EMPLOYEE', USER_ID)

    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      managedTeams: [],
    } as never)

    // Note pour cet employé avec visibility ALL
    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue(
      mockIncidentNote({
        visibility: 'ALL',
        subjectId: EMPLOYEE_ID,
      }) as never
    )

    const result = await getIncidentNoteById(NOTE_ID)

    expect(result.success).toBe(true)
  })
})

// ─── updateIncidentNote ─────────────────────────────────────────────

describe('updateIncidentNote', () => {
  const updateInput = {
    title: 'Titre modifié',
    content: 'Nouveau contenu',
  }

  it("permet à l'auteur de modifier sa note", async () => {
    setupAuth('MANAGER', MANAGER_USER_ID, [TEAM_ID])

    // Note créée par ce manager
    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue({
      id: NOTE_ID,
      authorId: MANAGER_USER_ID,
      companyId: COMPANY_ID,
    } as never)

    vi.mocked(prisma.incidentNote.update).mockResolvedValue(
      mockIncidentNote({ ...updateInput, authorId: MANAGER_USER_ID }) as never
    )

    const result = await updateIncidentNote(NOTE_ID, updateInput)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Titre modifié')
    }
  })

  it("permet au DIRECTOR de modifier n'importe quelle note", async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)

    // Note créée par un autre utilisateur
    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue({
      id: NOTE_ID,
      authorId: MANAGER_USER_ID, // Pas le director
      companyId: COMPANY_ID,
    } as never)

    vi.mocked(prisma.incidentNote.update).mockResolvedValue(
      mockIncidentNote(updateInput) as never
    )

    const result = await updateIncidentNote(NOTE_ID, updateInput)

    expect(result.success).toBe(true)
  })

  it("refuse la modification si pas l'auteur ni DIRECTOR", async () => {
    // Un autre manager qui n'est pas l'auteur
    const otherManagerId = 'cluser_other_manager'
    setupAuth('MANAGER', otherManagerId, [TEAM_ID])

    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue({
      id: NOTE_ID,
      authorId: MANAGER_USER_ID, // Auteur différent
      companyId: COMPANY_ID,
    } as never)

    const result = await updateIncidentNote(NOTE_ID, updateInput)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('auteur')
    }
  })
})

// ─── deleteIncidentNote ─────────────────────────────────────────────

describe('deleteIncidentNote', () => {
  it("permet à l'auteur de supprimer sa note", async () => {
    setupAuth('MANAGER', MANAGER_USER_ID, [TEAM_ID])

    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue({
      id: NOTE_ID,
      authorId: MANAGER_USER_ID,
      companyId: COMPANY_ID,
    } as never)

    vi.mocked(prisma.incidentNote.delete).mockResolvedValue(
      mockIncidentNote() as never
    )

    const result = await deleteIncidentNote(NOTE_ID)

    expect(result.success).toBe(true)
    expect(prisma.incidentNote.delete).toHaveBeenCalledWith({
      where: { id: NOTE_ID },
    })
  })

  it("permet au DIRECTOR de supprimer n'importe quelle note", async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)

    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue({
      id: NOTE_ID,
      authorId: MANAGER_USER_ID, // Pas le director
      companyId: COMPANY_ID,
    } as never)

    vi.mocked(prisma.incidentNote.delete).mockResolvedValue(
      mockIncidentNote() as never
    )

    const result = await deleteIncidentNote(NOTE_ID)

    expect(result.success).toBe(true)
  })

  it("refuse la suppression si pas l'auteur ni DIRECTOR", async () => {
    const otherManagerId = 'cluser_other_manager'
    setupAuth('MANAGER', otherManagerId, [TEAM_ID])

    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue({
      id: NOTE_ID,
      authorId: MANAGER_USER_ID,
      companyId: COMPANY_ID,
    } as never)

    const result = await deleteIncidentNote(NOTE_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('auteur')
    }
  })
})

// ─── getMyIncidentNotes ─────────────────────────────────────────────

describe('getMyIncidentNotes', () => {
  it("retourne les notes où l'utilisateur est le sujet avec visibility=ALL", async () => {
    setupAuth('EMPLOYEE', USER_ID)

    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      managedTeams: [],
    } as never)

    vi.mocked(prisma.incidentNote.findMany).mockResolvedValue([
      mockIncidentNote({ visibility: 'ALL', subjectId: EMPLOYEE_ID }),
    ] as never)

    const result = await getMyIncidentNotes()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(1)
    }
    expect(prisma.incidentNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          subjectId: EMPLOYEE_ID,
          visibility: 'ALL',
        }),
      })
    )
  })
})

// ─── getIncidentNotesForEmployee ─────────────────────────────────────

describe('getIncidentNotesForEmployee', () => {
  it("DIRECTOR voit toutes les notes d'un employé", async () => {
    setupAuth('DIRECTOR', DIRECTOR_USER_ID)

    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({
        id: 'clemployee_director',
        managedTeams: [],
      } as never)
      .mockResolvedValueOnce(mockEmployee() as never)

    vi.mocked(prisma.incidentNote.findMany).mockResolvedValue([
      mockIncidentNote({ visibility: 'DIRECTOR_ONLY' }),
      mockIncidentNote({ visibility: 'MANAGER_DIRECTOR' }),
      mockIncidentNote({ visibility: 'ALL' }),
    ] as never)

    const result = await getIncidentNotesForEmployee(EMPLOYEE_ID)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(3)
    }
    expect(prisma.incidentNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          visibility: { in: ['DIRECTOR_ONLY', 'MANAGER_DIRECTOR', 'ALL'] },
        }),
      })
    )
  })

  it('MANAGER voit MANAGER_DIRECTOR et ALL pour son équipe', async () => {
    setupAuth('MANAGER', MANAGER_USER_ID, [TEAM_ID])

    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({
        id: 'clemployee_manager',
        managedTeams: [{ id: TEAM_ID }],
      } as never)
      .mockResolvedValueOnce(mockEmployee({ teamId: TEAM_ID }) as never)

    vi.mocked(prisma.incidentNote.findMany).mockResolvedValue([
      mockIncidentNote({ visibility: 'MANAGER_DIRECTOR' }),
      mockIncidentNote({ visibility: 'ALL' }),
    ] as never)

    const result = await getIncidentNotesForEmployee(EMPLOYEE_ID)

    expect(result.success).toBe(true)
    expect(prisma.incidentNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          visibility: { in: ['MANAGER_DIRECTOR', 'ALL'] },
        }),
      })
    )
  })

  it("MANAGER ne peut pas voir les notes d'un employé hors de son équipe", async () => {
    setupAuth('MANAGER', MANAGER_USER_ID, [TEAM_ID])

    vi.mocked(prisma.employee.findUnique)
      .mockResolvedValueOnce({
        id: 'clemployee_manager',
        managedTeams: [{ id: TEAM_ID }],
      } as never)
      .mockResolvedValueOnce(mockEmployee({ teamId: OTHER_TEAM_ID }) as never)

    const result = await getIncidentNotesForEmployee(OTHER_EMPLOYEE_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('accès')
    }
  })
})
