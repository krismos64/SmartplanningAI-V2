'use server'

/**
 * Server Actions pour les préférences d'affichage
 *
 * @ticket SP-276 - Préférences Affichage (Thème, Date, Heure)
 *
 * Architecture :
 * - Cookie pour persistence SSR (évite flash FOUC)
 * - Base de données pour sync multi-device
 * - Mise à jour en parallèle Cookie + DB
 */

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { Prisma } from '@prisma/client'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  updateDisplayPreferencesSchema,
  type UpdateDisplayPreferencesInput,
} from '@/lib/validations/preferences'
import {
  parseUserPreferences,
  parseDisplayPreferences,
} from '@/lib/utils/preferences'
import type { CrudActionResult, DisplayPreferences } from '@/types'
import { DEFAULT_DISPLAY_PREFERENCES } from '@/types/preferences'

// ============================================================================
// CONSTANTES
// ============================================================================

/** Nom du cookie pour les préférences d'affichage */
const DISPLAY_PREFERENCES_COOKIE = 'display-preferences'

/** Durée de vie du cookie : 1 an */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 365 jours

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Récupère les préférences d'affichage depuis le cookie
 *
 * Utilisé côté serveur pour le rendu initial SSR
 */
export async function getDisplayPreferencesFromCookie(): Promise<DisplayPreferences> {
  const cookieStore = await cookies()
  const prefsCookie = cookieStore.get(DISPLAY_PREFERENCES_COOKIE)

  if (!prefsCookie?.value) {
    return { ...DEFAULT_DISPLAY_PREFERENCES }
  }

  try {
    const parsed: unknown = JSON.parse(prefsCookie.value)
    return parseDisplayPreferences(parsed)
  } catch {
    return { ...DEFAULT_DISPLAY_PREFERENCES }
  }
}

/**
 * Définit le cookie des préférences d'affichage
 */
async function setDisplayPreferencesCookie(
  prefs: Partial<DisplayPreferences>
): Promise<void> {
  const cookieStore = await cookies()
  const currentPrefs = await getDisplayPreferencesFromCookie()

  const updatedPrefs = {
    ...currentPrefs,
    ...prefs,
  }

  cookieStore.set(DISPLAY_PREFERENCES_COOKIE, JSON.stringify(updatedPrefs), {
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // Permet à next-themes de lire le cookie côté client
  })
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Récupère les préférences d'affichage de l'utilisateur
 *
 * Priorité :
 * 1. Base de données (si authentifié)
 * 2. Cookie (fallback pour visiteurs)
 * 3. Valeurs par défaut
 *
 * @returns Préférences d'affichage complètes
 */
export async function getDisplayPreferences(): Promise<
  CrudActionResult<DisplayPreferences>
> {
  try {
    // 1. Vérifier l'authentification
    const session = await auth()

    if (!session?.user?.id) {
      // Utilisateur non authentifié : lire depuis le cookie
      const prefs = await getDisplayPreferencesFromCookie()
      return { success: true, data: prefs }
    }

    // 2. Récupérer depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    })

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // 3. Parser les préférences
    const userPrefs = parseUserPreferences(user.preferences)
    const displayPrefs = userPrefs.display ?? { ...DEFAULT_DISPLAY_PREFERENCES }

    return { success: true, data: displayPrefs }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getDisplayPreferences] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la récupération des préférences',
    }
  }
}

/**
 * Met à jour les préférences d'affichage
 *
 * Actions :
 * 1. Valide les données entrantes
 * 2. Met à jour le cookie (SSR immédiat)
 * 3. Si authentifié, met à jour la base de données (sync multi-device)
 *
 * @param input - Préférences à mettre à jour (partielles)
 * @returns Préférences complètes après mise à jour
 *
 * @example
 * // Changer uniquement le thème
 * await updateDisplayPreferences({ theme: 'dark' })
 *
 * // Changer plusieurs préférences
 * await updateDisplayPreferences({
 *   theme: 'light',
 *   dateFormat: 'YYYY-MM-DD',
 *   timeFormat: '12h'
 * })
 */
export async function updateDisplayPreferences(
  input: UpdateDisplayPreferencesInput
): Promise<CrudActionResult<DisplayPreferences>> {
  try {
    // 1. Valider les données entrantes
    const validation = updateDisplayPreferencesSchema.safeParse(input)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Données invalides',
        field: (firstError?.path[0] as string) ?? undefined,
      }
    }

    const updates = validation.data

    // 2. Mettre à jour le cookie (pour tous les utilisateurs)
    await setDisplayPreferencesCookie(updates)

    // 3. Si authentifié, mettre à jour la base de données
    const session = await auth()

    if (session?.user?.id) {
      // Récupérer les préférences actuelles
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { preferences: true },
      })

      if (user) {
        const currentPrefs = parseUserPreferences(user.preferences)

        // Fusionner avec les nouvelles valeurs
        const updatedPrefs = {
          ...currentPrefs,
          display: {
            ...currentPrefs.display,
            ...updates,
          },
        }

        // Sauvegarder en base
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            preferences: updatedPrefs as unknown as Prisma.InputJsonValue,
          },
        })
      }
    }

    // 4. Revalidate les pages qui utilisent les préférences
    revalidatePath('/app')
    revalidatePath('/app/settings')
    revalidatePath('/app/settings/appearance')

    // 5. Retourner les préférences mises à jour
    return await getDisplayPreferences()
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[updateDisplayPreferences] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la mise à jour des préférences',
    }
  }
}

/**
 * Synchronise les préférences du cookie vers la base de données
 *
 * Appelé lors de la connexion pour récupérer les préférences
 * définies avant l'authentification.
 *
 * @returns Résultat de la synchronisation
 */
export async function syncPreferencesFromCookie(): Promise<
  CrudActionResult<DisplayPreferences>
> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // 1. Lire les préférences du cookie
    const cookiePrefs = await getDisplayPreferencesFromCookie()

    // 2. Récupérer les préférences de la base de données
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    })

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    const dbPrefs = parseUserPreferences(user.preferences)

    // 3. Fusionner : le cookie a priorité (préférences récentes)
    const mergedPrefs = {
      ...dbPrefs,
      display: {
        ...dbPrefs.display,
        ...cookiePrefs,
      },
    }

    // 4. Sauvegarder en base
    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferences: mergedPrefs as unknown as Prisma.InputJsonValue },
    })

    // 5. Mettre à jour le cookie avec les valeurs fusionnées
    await setDisplayPreferencesCookie(mergedPrefs.display)

    revalidatePath('/app')

    return { success: true, data: mergedPrefs.display }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[syncPreferencesFromCookie] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la synchronisation des préférences',
    }
  }
}

/**
 * Réinitialise les préférences d'affichage aux valeurs par défaut
 *
 * @returns Préférences par défaut
 */
export async function resetDisplayPreferences(): Promise<
  CrudActionResult<DisplayPreferences>
> {
  return updateDisplayPreferences({ ...DEFAULT_DISPLAY_PREFERENCES })
}
