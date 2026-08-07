/**
 * Sélection des notifications de congé cross-tenant
 *
 * @description Logique pure extraite de
 * `src/scripts/cleanup-cross-tenant-leave-notifications.ts`, isolée dans un
 * module sans effet de bord pour être testable : le script, lui, ouvre une
 * connexion Prisma et s'exécute au chargement.
 *
 * C'est la seule partie du nettoyage qui peut se tromper, et une erreur ici
 * supprimerait des notifications légitimes.
 */

/** Notification de congé, réduite aux champs nécessaires à la décision */
export interface LeaveNotificationRow {
  id: string
  companyId: string | null
  relatedId: string | null
}

/**
 * Sélectionne les notifications dont la fuite cross-tenant est prouvée.
 *
 * Est retenue une notification qui remplit les DEUX conditions :
 * - sa `LeaveRequest` liée existe encore (sinon on ne peut rien prouver) ;
 * - le `companyId` de la notification diffère de celui de la demande.
 *
 * @param notifications - Notifications de type LeaveRequest en base
 * @param companyByLeaveId - companyId de chaque demande encore existante
 */
export function selectCrossTenantNotifications<T extends LeaveNotificationRow>(
  notifications: T[],
  companyByLeaveId: Map<string, string>
): T[] {
  return notifications.filter((n) => {
    if (!n.relatedId) return false

    const leaveCompanyId = companyByLeaveId.get(n.relatedId)
    // Demande supprimée : impossible de distinguer une fuite d'une
    // notification légitime dont le congé a été purgé. On n'y touche pas.
    if (leaveCompanyId === undefined) return false

    return n.companyId !== leaveCompanyId
  })
}
