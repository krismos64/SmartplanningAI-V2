/**
 * Tests unitaires pour les Server Actions Personal Tasks
 *
 * @description Tests des opérations CRUD pour les tâches personnelles.
 * Vérifie la sécurité (accès uniquement aux propres tâches de l'utilisateur).
 *
 * @ticket SP-418
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../mocks/prisma'

// ============================================================================
// Mock Setup
// ============================================================================

// Variable pour contrôler le mock auth dynamiquement
let mockSession: { user: { id: string } } | null = {
  user: { id: 'user-1' },
}

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockImplementation(() => Promise.resolve(mockSession)),
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import après les mocks
import {
  getPersonalTasks,
  getPersonalTasksForWidget,
  createPersonalTask,
  updatePersonalTask,
  deletePersonalTask,
  togglePersonalTask,
  reorderPersonalTasks,
} from '@/lib/actions/personal-tasks'

// ============================================================================
// Fixtures
// ============================================================================

const USER_ID = 'user-1'
const USER_ID_2 = 'user-2'
const TASK_ID_1 = 'clz1234567890abcdefghij'
const TASK_ID_2 = 'clz0987654321abcdefghij'
const TASK_ID_3 = 'clz1111111111abcdefghij'

const mockTask1 = {
  id: TASK_ID_1,
  title: 'Première tâche',
  description: 'Description de la première tâche',
  dueDate: new Date('2026-02-15'),
  completed: false,
  order: 0,
  userId: USER_ID,
  createdAt: new Date('2026-01-29'),
  updatedAt: new Date('2026-01-29'),
}

const mockTask2 = {
  id: TASK_ID_2,
  title: 'Deuxième tâche',
  description: null,
  dueDate: null,
  completed: true,
  order: 1,
  userId: USER_ID,
  createdAt: new Date('2026-01-29'),
  updatedAt: new Date('2026-01-29'),
}

const mockTask3 = {
  id: TASK_ID_3,
  title: 'Troisième tâche',
  description: null,
  dueDate: null,
  completed: false,
  order: 2,
  userId: USER_ID,
  createdAt: new Date('2026-01-29'),
  updatedAt: new Date('2026-01-29'),
}

const mockTaskOtherUser = {
  id: 'clzother123456789abcdef',
  title: 'Tâche autre utilisateur',
  description: null,
  dueDate: null,
  completed: false,
  order: 0,
  userId: USER_ID_2,
  createdAt: new Date('2026-01-29'),
  updatedAt: new Date('2026-01-29'),
}

// Helper pour définir la session mock
function setMockSession(userId: string | null) {
  if (userId === null) {
    mockSession = null
  } else {
    mockSession = { user: { id: userId } }
  }
}

// ============================================================================
// Tests getPersonalTasks
// ============================================================================

describe('getPersonalTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockSession(USER_ID)
  })

  it('should return tasks for authenticated user', async () => {
    prismaMock.personalTask.findMany.mockResolvedValue([mockTask1, mockTask2])

    const result = await getPersonalTasks()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(2)
      expect(result.data[0].id).toBe(TASK_ID_1)
      expect(result.data[1].id).toBe(TASK_ID_2)
    }

    expect(prismaMock.personalTask.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      orderBy: { order: 'asc' },
    })
  })

  it('should return empty array if no tasks', async () => {
    prismaMock.personalTask.findMany.mockResolvedValue([])

    const result = await getPersonalTasks()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(0)
    }
  })

  it('should fail if not authenticated', async () => {
    setMockSession(null)

    const result = await getPersonalTasks()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('connecté')
    }
  })

  it('should only return user own tasks (filtered by userId)', async () => {
    prismaMock.personalTask.findMany.mockResolvedValue([mockTask1])

    await getPersonalTasks()

    expect(prismaMock.personalTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID },
      })
    )
  })
})

// ============================================================================
// Tests getPersonalTasksForWidget
// ============================================================================

describe('getPersonalTasksForWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockSession(USER_ID)
  })

  it('should return only uncompleted tasks', async () => {
    prismaMock.personalTask.findMany.mockResolvedValue([mockTask1, mockTask3])

    const result = await getPersonalTasksForWidget()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(2)
      // Tous doivent être non complétés
      expect(result.data.every((t) => !t.completed)).toBe(true)
    }

    expect(prismaMock.personalTask.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID, completed: false },
      orderBy: { order: 'asc' },
      take: 5,
    })
  })

  it('should respect the limit parameter', async () => {
    prismaMock.personalTask.findMany.mockResolvedValue([mockTask1])

    await getPersonalTasksForWidget(3)

    expect(prismaMock.personalTask.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID, completed: false },
      orderBy: { order: 'asc' },
      take: 3,
    })
  })

  it('should use default limit of 5', async () => {
    prismaMock.personalTask.findMany.mockResolvedValue([])

    await getPersonalTasksForWidget()

    expect(prismaMock.personalTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
      })
    )
  })

  it('should return empty array if no uncompleted tasks', async () => {
    prismaMock.personalTask.findMany.mockResolvedValue([])

    const result = await getPersonalTasksForWidget()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(0)
    }
  })

  it('should fail if not authenticated', async () => {
    setMockSession(null)

    const result = await getPersonalTasksForWidget()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('connecté')
    }
  })

  it('should filter by userId and completed=false', async () => {
    prismaMock.personalTask.findMany.mockResolvedValue([mockTask1])

    await getPersonalTasksForWidget()

    expect(prismaMock.personalTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID, completed: false },
      })
    )
  })
})

// ============================================================================
// Tests createPersonalTask
// ============================================================================

describe('createPersonalTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockSession(USER_ID)
  })

  it('should create task with valid data', async () => {
    prismaMock.personalTask.findFirst.mockResolvedValue(null)
    prismaMock.personalTask.create.mockResolvedValue(mockTask1)

    const result = await createPersonalTask({
      title: 'Première tâche',
      description: 'Description de la première tâche',
      dueDate: new Date('2026-02-15'),
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Première tâche')
    }

    expect(prismaMock.personalTask.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Première tâche',
        description: 'Description de la première tâche',
        userId: USER_ID,
        order: 0,
        completed: false,
      }),
    })
  })

  it('should create task with title only', async () => {
    prismaMock.personalTask.findFirst.mockResolvedValue(null)
    prismaMock.personalTask.create.mockResolvedValue({
      ...mockTask1,
      description: null,
      dueDate: null,
    })

    const result = await createPersonalTask({
      title: 'Tâche simple',
    })

    expect(result.success).toBe(true)
    expect(prismaMock.personalTask.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Tâche simple',
        description: null,
        dueDate: null,
      }),
    })
  })

  it('should fail with invalid data (empty title)', async () => {
    const result = await createPersonalTask({
      title: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('titre')
    }
  })

  it('should fail if not authenticated', async () => {
    setMockSession(null)

    const result = await createPersonalTask({
      title: 'Test',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('connecté')
    }
  })

  it('should set correct order (last position)', async () => {
    prismaMock.personalTask.findFirst.mockResolvedValue({ order: 5 } as any)
    prismaMock.personalTask.create.mockResolvedValue({
      ...mockTask1,
      order: 6,
    })

    await createPersonalTask({ title: 'Nouvelle tâche' })

    expect(prismaMock.personalTask.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        order: 6,
      }),
    })
  })
})

// ============================================================================
// Tests updatePersonalTask
// ============================================================================

describe('updatePersonalTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockSession(USER_ID)
  })

  it('should update own task', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue({
      userId: USER_ID,
    } as any)
    prismaMock.personalTask.update.mockResolvedValue({
      ...mockTask1,
      title: 'Titre modifié',
    })

    const result = await updatePersonalTask(TASK_ID_1, {
      title: 'Titre modifié',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Titre modifié')
    }
  })

  it('should fail to update another user task', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue({
      userId: USER_ID_2,
    } as any)

    const result = await updatePersonalTask(TASK_ID_1, {
      title: 'Tentative de modification',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('refusé')
    }
  })

  it('should fail with invalid data (empty title)', async () => {
    const result = await updatePersonalTask(TASK_ID_1, {
      title: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('titre')
    }
  })

  it('should fail if task not found', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue(null)

    const result = await updatePersonalTask('nonexistent-id', {
      title: 'Test',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('non trouvée')
    }
  })

  it('should update completed status', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue({
      userId: USER_ID,
    } as any)
    prismaMock.personalTask.update.mockResolvedValue({
      ...mockTask1,
      completed: true,
    })

    const result = await updatePersonalTask(TASK_ID_1, {
      completed: true,
    })

    expect(result.success).toBe(true)
    expect(prismaMock.personalTask.update).toHaveBeenCalledWith({
      where: { id: TASK_ID_1 },
      data: expect.objectContaining({
        completed: true,
      }),
    })
  })
})

// ============================================================================
// Tests deletePersonalTask
// ============================================================================

describe('deletePersonalTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockSession(USER_ID)
  })

  it('should delete own task', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue({
      userId: USER_ID,
    } as any)
    prismaMock.personalTask.delete.mockResolvedValue(mockTask1)

    const result = await deletePersonalTask(TASK_ID_1)

    expect(result.success).toBe(true)
    expect(prismaMock.personalTask.delete).toHaveBeenCalledWith({
      where: { id: TASK_ID_1 },
    })
  })

  it('should fail to delete another user task', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue({
      userId: USER_ID_2,
    } as any)

    const result = await deletePersonalTask(TASK_ID_1)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('refusé')
    }
  })

  it('should fail if task not found', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue(null)

    const result = await deletePersonalTask('nonexistent-id')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('non trouvée')
    }
  })

  it('should fail if not authenticated', async () => {
    setMockSession(null)

    const result = await deletePersonalTask(TASK_ID_1)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('connecté')
    }
  })
})

// ============================================================================
// Tests togglePersonalTask
// ============================================================================

describe('togglePersonalTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockSession(USER_ID)
  })

  it('should toggle completed from false to true', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue({
      userId: USER_ID,
      completed: false,
    } as any)
    prismaMock.personalTask.update.mockResolvedValue({
      ...mockTask1,
      completed: true,
    })

    const result = await togglePersonalTask(TASK_ID_1)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.completed).toBe(true)
    }
    expect(prismaMock.personalTask.update).toHaveBeenCalledWith({
      where: { id: TASK_ID_1 },
      data: { completed: true },
    })
  })

  it('should toggle completed from true to false', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue({
      userId: USER_ID,
      completed: true,
    } as any)
    prismaMock.personalTask.update.mockResolvedValue({
      ...mockTask2,
      completed: false,
    })

    const result = await togglePersonalTask(TASK_ID_2)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.completed).toBe(false)
    }
    expect(prismaMock.personalTask.update).toHaveBeenCalledWith({
      where: { id: TASK_ID_2 },
      data: { completed: false },
    })
  })

  it('should fail for another user task', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue({
      userId: USER_ID_2,
      completed: false,
    } as any)

    const result = await togglePersonalTask(TASK_ID_1)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('refusé')
    }
  })

  it('should fail if task not found', async () => {
    prismaMock.personalTask.findUnique.mockResolvedValue(null)

    const result = await togglePersonalTask('nonexistent-id')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('non trouvée')
    }
  })
})

// ============================================================================
// Tests reorderPersonalTasks
// ============================================================================

describe('reorderPersonalTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockSession(USER_ID)
  })

  it('should reorder tasks correctly', async () => {
    const orderedIds = [TASK_ID_3, TASK_ID_1, TASK_ID_2]

    prismaMock.personalTask.findMany.mockResolvedValue([
      { id: TASK_ID_1, userId: USER_ID },
      { id: TASK_ID_2, userId: USER_ID },
      { id: TASK_ID_3, userId: USER_ID },
    ] as any)
    prismaMock.$transaction.mockResolvedValue([mockTask3, mockTask1, mockTask2])

    const result = await reorderPersonalTasks(orderedIds)

    expect(result.success).toBe(true)
    expect(prismaMock.$transaction).toHaveBeenCalled()
  })

  it('should fail if any ID belongs to another user', async () => {
    const orderedIds = [TASK_ID_1, TASK_ID_2]

    prismaMock.personalTask.findMany.mockResolvedValue([
      { id: TASK_ID_1, userId: USER_ID },
      { id: TASK_ID_2, userId: USER_ID_2 }, // Autre utilisateur
    ] as any)

    const result = await reorderPersonalTasks(orderedIds)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('refusé')
    }
  })

  it('should fail with empty array', async () => {
    const result = await reorderPersonalTasks([])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Au moins une tâche')
    }
  })

  it('should fail if some tasks not found', async () => {
    // Utiliser un CUID valide mais inexistant dans le mock
    const orderedIds = [TASK_ID_1, TASK_ID_2, TASK_ID_3]

    prismaMock.personalTask.findMany.mockResolvedValue([
      { id: TASK_ID_1, userId: USER_ID },
      { id: TASK_ID_2, userId: USER_ID },
      // TASK_ID_3 n'est pas retourné = introuvable
    ] as any)

    const result = await reorderPersonalTasks(orderedIds)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('introuvables')
    }
  })

  it('should use transaction for atomicity', async () => {
    const orderedIds = [TASK_ID_2, TASK_ID_1]

    prismaMock.personalTask.findMany.mockResolvedValue([
      { id: TASK_ID_1, userId: USER_ID },
      { id: TASK_ID_2, userId: USER_ID },
    ] as any)
    prismaMock.$transaction.mockResolvedValue([mockTask2, mockTask1])

    await reorderPersonalTasks(orderedIds)

    // Vérifier que $transaction a été appelée avec un tableau de 2 éléments
    expect(prismaMock.$transaction).toHaveBeenCalled()
    const transactionCall = prismaMock.$transaction.mock.calls[0][0]
    expect(Array.isArray(transactionCall)).toBe(true)
    expect(transactionCall).toHaveLength(2)
  })

  it('should fail if not authenticated', async () => {
    setMockSession(null)

    const result = await reorderPersonalTasks([TASK_ID_1])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('connecté')
    }
  })
})
