/**
 * Garde de désactivation d'une fiche employé
 *
 * @ticket SP-611
 * @description Le 20 octobre 2026, le dirigeant de sarl chouphil a désactivé
 * sa propre fiche, et l'email SP-480 « compte désactivé » est parti dans la
 * seconde vers sa propre adresse. Rien ne l'en empêchait : la fiche d'un
 * dirigeant porte son compte, elle n'est pas celle d'un collaborateur.
 *
 * Fonction pure, partagée par la Server Action et par l'interface.
 */

import type { UserRole } from '@prisma/client'

interface DeactivationTarget {
  userId: string | null
  user?: { role?: UserRole } | null
}

/**
 * Raison du refus de désactiver cette fiche, ou `null` si rien ne s'y oppose.
 *
 * @param target - Fiche visée, avec le rôle du compte rattaché s'il existe
 * @param actorUserId - Compte qui demande la désactivation
 */
export function getDeactivationBlock(
  target: DeactivationTarget,
  actorUserId: string
): string | null {
  if (target.userId !== null && target.userId === actorUserId) {
    return 'Vous ne pouvez pas désactiver votre propre fiche'
  }
  if (target.user?.role === 'DIRECTOR') {
    return "La fiche d'un dirigeant ne peut pas être désactivée"
  }
  return null
}
