'use server'

/**
 * Server Actions pour le parcours d'onboarding
 *
 * Écran de bienvenue affiché une seule fois à la première connexion,
 * pour guider un utilisateur (DIRECTOR en priorité) vers sa première
 * action utile plutôt qu'un dashboard vide.
 */

import { revalidatePath } from 'next/cache'

import type { Prisma } from '@prisma/client'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseUserPreferences } from '@/lib/utils/preferences'
import type { CrudActionResult } from '@/types'

/**
 * Marque l'écran de bienvenue comme vu pour l'utilisateur connecté
 *
 * Appelé au clic sur le CTA principal ou sur "Plus tard" : dans les deux cas
 * l'écran ne doit plus jamais réapparaître pour cet utilisateur.
 */
export async function markWelcomeSeen(): Promise<CrudActionResult<null>> {
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

    const currentPrefs = parseUserPreferences(user.preferences)

    const updatedPrefs = {
      ...currentPrefs,
      onboarding: {
        ...currentPrefs.onboarding,
        hasSeenWelcome: true,
      },
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: updatedPrefs as unknown as Prisma.InputJsonValue,
      },
    })

    revalidatePath('/app/director/dashboard')

    return { success: true, data: null }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[markWelcomeSeen] Error:', error)
    }

    return {
      success: false,
      error: "Erreur lors de la mise à jour de l'onboarding",
    }
  }
}
