/**
 * Service Onboarding : comptages propres à la checklist de démarrage
 *
 * L'inscription crée une fiche employé pour le dirigeant. Il occupe un siège
 * facturé (subscription-sync.service.ts compte toutes les fiches actives), mais
 * sa présence ne dit pas que l'équipe a été saisie. L'étape « Ajouter vos
 * employés » se juge donc sur les fiches autres que la sienne (SP-625).
 *
 * @ticket SP-625
 */

import { prisma } from '@/lib/prisma'

/**
 * Compte les fiches employé actives de l'entreprise, hors celle de l'utilisateur.
 *
 * Le `OR` sur `userId: null` est indispensable. Un `NOT: { userId }` donnerait
 * en SQL `NOT ("userId" = $1)`, qui vaut NULL, donc faux, pour un employé sans
 * compte utilisateur : précisément ceux que le dirigeant ajoute à la main.
 */
export async function countEmployeesBesidesUser(
  companyId: string,
  userId: string
): Promise<number> {
  return prisma.employee.count({
    where: {
      companyId,
      isActive: true,
      OR: [{ userId: null }, { userId: { not: userId } }],
    },
  })
}
