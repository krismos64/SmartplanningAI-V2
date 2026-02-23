/**
 * Service de notifications SYSTEM_ADMIN
 *
 * @description Fournit la liste des user IDs SYSTEM_ADMIN actifs
 * pour l'envoi de notifications temps-reel.
 * @ticket SP-476
 */

import { prisma } from '@/lib/prisma'

/**
 * Recupere les IDs des utilisateurs SYSTEM_ADMIN actifs.
 * Resultat mis en cache pour eviter les requetes repetees.
 *
 * @returns Liste des user IDs SYSTEM_ADMIN
 */
export async function getSystemAdminUserIds(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: {
      role: 'SYSTEM_ADMIN',
      isActive: true,
    },
    select: { id: true },
  })

  return admins.map((a) => a.id)
}
