'use server'

/**
 * Server Actions pour les préférences de notifications
 *
 * @ticket SP-275 - Préférences Notifications
 *
 * Architecture :
 * - Sauvegarde dans User.preferences.notifications (JSON Prisma)
 * - Pas de cookie nécessaire (contrairement à display-preferences)
 * - Merge partiel pour mise à jour granulaire
 */

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  updateNotificationPreferencesSchema,
  type UpdateNotificationPreferencesInput,
} from '@/lib/validations/preferences'
import { parseUserPreferences } from '@/lib/utils/preferences'
import type { CrudActionResult } from '@/types'
import type { NotificationPreferences } from '@/types/preferences'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/preferences'
import { assertNotImpersonating } from '@/lib/impersonation'

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Récupère les préférences de notifications de l'utilisateur connecté
 *
 * @returns Préférences de notifications complètes
 */
export async function getNotificationPreferences(): Promise<
  CrudActionResult<NotificationPreferences>
> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    })

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    const userPrefs = parseUserPreferences(user.preferences)
    const notificationPrefs = userPrefs.notifications ?? {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
    }

    return { success: true, data: notificationPrefs }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getNotificationPreferences] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la récupération des préférences',
    }
  }
}

/**
 * Met à jour les préférences de notifications (merge partiel)
 *
 * @param input - Préférences à mettre à jour (partielles)
 * @returns Préférences complètes après mise à jour
 *
 * @example
 * // Désactiver les emails pour planning uniquement
 * await updateNotificationPreferences({ email: { planning: false } })
 *
 * // Désactiver tous les emails pour congés et tâches
 * await updateNotificationPreferences({
 *   email: { leaves: false, tasks: false }
 * })
 */
export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput
): Promise<CrudActionResult<NotificationPreferences>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const impersonationBlock = await assertNotImpersonating()
    if (impersonationBlock) return impersonationBlock

    // Validation Zod
    const validation = updateNotificationPreferencesSchema.safeParse(input)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Données invalides',
        field: (firstError?.path[0] as string) ?? undefined,
      }
    }

    const updates = validation.data

    // Récupérer les préférences actuelles
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    })

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    const currentPrefs = parseUserPreferences(user.preferences)
    const currentNotifications =
      currentPrefs.notifications ?? DEFAULT_NOTIFICATION_PREFERENCES

    // Merge profond des préférences de notifications
    const updatedNotifications: NotificationPreferences = {
      email: {
        ...currentNotifications.email,
        ...(updates.email || {}),
      },
      inApp: {
        ...currentNotifications.inApp,
        ...(updates.inApp || {}),
      },
    }

    // Construire les préférences complètes à sauvegarder
    const updatedPrefs = {
      ...currentPrefs,
      notifications: updatedNotifications,
    }

    // Sauvegarder en base
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: updatedPrefs as unknown as Prisma.InputJsonValue,
      },
    })

    revalidatePath('/app/settings')
    revalidatePath('/app/settings/notifications')

    return { success: true, data: updatedNotifications }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[updateNotificationPreferences] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la mise à jour des préférences',
    }
  }
}

/**
 * Réinitialise les préférences de notifications aux valeurs par défaut
 *
 * @returns Préférences par défaut
 */
export async function resetNotificationPreferences(): Promise<
  CrudActionResult<NotificationPreferences>
> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const impersonationBlock = await assertNotImpersonating()
    if (impersonationBlock) return impersonationBlock

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    })

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    const currentPrefs = parseUserPreferences(user.preferences)

    // Remplacer les préférences de notifications par les valeurs par défaut
    const updatedPrefs = {
      ...currentPrefs,
      notifications: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: updatedPrefs as unknown as Prisma.InputJsonValue,
      },
    })

    revalidatePath('/app/settings')
    revalidatePath('/app/settings/notifications')

    return { success: true, data: { ...DEFAULT_NOTIFICATION_PREFERENCES } }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[resetNotificationPreferences] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la réinitialisation des préférences',
    }
  }
}
