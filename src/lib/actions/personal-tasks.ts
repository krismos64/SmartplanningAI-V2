/**
 * Server Actions CRUD pour les tâches personnelles (Todolist)
 *
 * @description Actions 100% privées - chaque utilisateur n'accède qu'à ses propres tâches.
 * Aucun RBAC nécessaire, juste vérification du propriétaire (userId === session.user.id).
 *
 * @ticket SP-418
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { PersonalTask } from '@prisma/client'
import { auth } from '@/lib/auth'
import { validateData, handlePrismaError } from './crud-helpers'
import { assertNotImpersonating } from '@/lib/impersonation'
import {
  personalTaskCreateSchema,
  personalTaskUpdateSchema,
  personalTaskReorderSchema,
  type PersonalTaskCreateInput,
  type PersonalTaskUpdateInput,
} from '@/lib/validations/personal-task'

// ============================================================================
// Types
// ============================================================================

/**
 * Résultat d'action standardisé
 */
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string }

/**
 * Résultat d'action sans data (pour delete)
 */
type DeleteResult = { success: true } | { success: false; error: string }

// ============================================================================
// Constants
// ============================================================================

const TASKS_PATH = '/dashboard/tasks'

// ============================================================================
// Auth Helper
// ============================================================================

/**
 * Récupère l'utilisateur authentifié
 * @returns userId si connecté, erreur sinon
 */
async function getAuthenticatedUserId(): Promise<
  { success: true; userId: string } | { success: false; error: string }
> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour effectuer cette action',
      }
    }

    return { success: true, userId: session.user.id }
  } catch (error) {
    console.error('[getAuthenticatedUserId] Error:', error)
    return { success: false, error: 'Erreur de vérification de session' }
  }
}

// ============================================================================
// 1. getPersonalTasks - Liste des tâches de l'utilisateur
// ============================================================================

/**
 * Récupère toutes les tâches personnelles de l'utilisateur connecté
 * Triées par order ASC (ordre de drag & drop)
 */
export async function getPersonalTasks(): Promise<
  ActionResult<PersonalTask[]>
> {
  const authResult = await getAuthenticatedUserId()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { userId } = authResult

  try {
    const tasks = await prisma.personalTask.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    })

    return { success: true, data: tasks }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 2. createPersonalTask - Création d'une tâche
// ============================================================================

/**
 * Crée une nouvelle tâche personnelle
 * La tâche est placée en dernière position (order = max + 1)
 */
export async function createPersonalTask(
  input: PersonalTaskCreateInput
): Promise<ActionResult<PersonalTask>> {
  const authResult = await getAuthenticatedUserId()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { userId } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  // Validation Zod
  const validation = validateData(personalTaskCreateSchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error, field: validation.field }
  }
  const data = validation.data

  try {
    // Calculer l'order (max + 1) pour placer en dernière position
    const maxOrderTask = await prisma.personalTask.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const nextOrder = (maxOrderTask?.order ?? -1) + 1

    const task = await prisma.personalTask.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        dueDate: data.dueDate ?? null,
        completed: false,
        order: nextOrder,
        userId,
      },
    })

    revalidatePath(TASKS_PATH)
    return { success: true, data: task }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 3. updatePersonalTask - Mise à jour d'une tâche
// ============================================================================

/**
 * Met à jour une tâche personnelle
 * Vérifie que l'utilisateur est bien le propriétaire
 */
export async function updatePersonalTask(
  id: string,
  input: PersonalTaskUpdateInput
): Promise<ActionResult<PersonalTask>> {
  const authResult = await getAuthenticatedUserId()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { userId } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  // Validation Zod
  const validation = validateData(personalTaskUpdateSchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error, field: validation.field }
  }
  const data = validation.data

  try {
    // Vérifier que la tâche existe et appartient à l'utilisateur
    const existing = await prisma.personalTask.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existing) {
      return { success: false, error: 'Tâche non trouvée' }
    }

    if (existing.userId !== userId) {
      return { success: false, error: 'Accès refusé' }
    }

    // Mise à jour
    const task = await prisma.personalTask.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    })

    revalidatePath(TASKS_PATH)
    return { success: true, data: task }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 4. deletePersonalTask - Suppression d'une tâche
// ============================================================================

/**
 * Supprime une tâche personnelle
 * Vérifie que l'utilisateur est bien le propriétaire
 */
export async function deletePersonalTask(id: string): Promise<DeleteResult> {
  const authResult = await getAuthenticatedUserId()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { userId } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  try {
    // Vérifier que la tâche existe et appartient à l'utilisateur
    const existing = await prisma.personalTask.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existing) {
      return { success: false, error: 'Tâche non trouvée' }
    }

    if (existing.userId !== userId) {
      return { success: false, error: 'Accès refusé' }
    }

    await prisma.personalTask.delete({ where: { id } })

    revalidatePath(TASKS_PATH)
    return { success: true }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 5. togglePersonalTask - Basculer le statut completed
// ============================================================================

/**
 * Bascule le statut completed d'une tâche (true <-> false)
 * Raccourci pratique pour l'UI (checkbox)
 */
export async function togglePersonalTask(
  id: string
): Promise<ActionResult<PersonalTask>> {
  const authResult = await getAuthenticatedUserId()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { userId } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  try {
    // Vérifier que la tâche existe et appartient à l'utilisateur
    const existing = await prisma.personalTask.findUnique({
      where: { id },
      select: { userId: true, completed: true },
    })

    if (!existing) {
      return { success: false, error: 'Tâche non trouvée' }
    }

    if (existing.userId !== userId) {
      return { success: false, error: 'Accès refusé' }
    }

    // Inverser le statut completed
    const task = await prisma.personalTask.update({
      where: { id },
      data: { completed: !existing.completed },
    })

    revalidatePath(TASKS_PATH)
    return { success: true, data: task }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 6. getPersonalTasksForWidget - Tâches limitées pour le widget dashboard
// ============================================================================

/**
 * Récupère les tâches non complétées pour le widget dashboard
 * @param limit Nombre maximum de tâches à retourner (défaut: 5)
 * @returns Liste des tâches triées par order ASC
 */
export async function getPersonalTasksForWidget(
  limit: number = 5
): Promise<ActionResult<PersonalTask[]>> {
  const authResult = await getAuthenticatedUserId()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { userId } = authResult

  try {
    const tasks = await prisma.personalTask.findMany({
      where: {
        userId,
        completed: false,
      },
      orderBy: { order: 'asc' },
      take: limit,
    })

    return { success: true, data: tasks }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 7. reorderPersonalTasks - Réorganiser les tâches (drag & drop)
// ============================================================================

/**
 * Réorganise les tâches selon un nouvel ordre
 * Reçoit un tableau d'IDs dans le nouvel ordre souhaité
 * Met à jour le champ order de chaque tâche via une transaction
 */
export async function reorderPersonalTasks(
  orderedIds: string[]
): Promise<DeleteResult> {
  const authResult = await getAuthenticatedUserId()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { userId } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  // Validation Zod
  const validation = validateData(personalTaskReorderSchema, { orderedIds })
  if (!validation.success) {
    return { success: false, error: validation.error }
  }

  try {
    // Vérifier que TOUS les IDs appartiennent à l'utilisateur
    const tasks = await prisma.personalTask.findMany({
      where: { id: { in: orderedIds } },
      select: { id: true, userId: true },
    })

    // Vérifier que tous les IDs ont été trouvés
    if (tasks.length !== orderedIds.length) {
      return { success: false, error: 'Certaines tâches sont introuvables' }
    }

    // Vérifier que toutes les tâches appartiennent à l'utilisateur
    const unauthorizedTask = tasks.find((task) => task.userId !== userId)
    if (unauthorizedTask) {
      return { success: false, error: 'Accès refusé à certaines tâches' }
    }

    // Transaction pour mettre à jour l'ordre de toutes les tâches
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.personalTask.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    revalidatePath(TASKS_PATH)
    return { success: true }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}
