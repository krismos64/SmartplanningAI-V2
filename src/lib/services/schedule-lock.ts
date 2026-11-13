/**
 * Verrou de planification par employé (SP-619)
 *
 * La vérification des conflits lit les créneaux existants, puis la création
 * écrit. Hors transaction, deux appels simultanés pour le même employé lisent
 * tous deux « aucun conflit » et écrivent tous deux : un doublon, mesuré le
 * 26 octobre 2026 sur deux exécutions E2E parallèles, à la milliseconde près.
 *
 * `pg_advisory_xact_lock` pose un verrou applicatif tenu jusqu'à la fin de la
 * transaction qui le prend. Le second appel attend que le premier ait écrit,
 * puis lit son créneau et reçoit le message de conflit habituel. Une
 * transaction sérialisable aurait aussi empêché le doublon, mais en faisant
 * échouer le second appel en `P2034`, à relancer.
 *
 * Le verrou ne vaut qu'en `ReadCommitted`. Le client Prisma impose
 * `Serializable` à toutes les transactions (`src/lib/prisma.ts`) : l'instantané
 * y est pris au premier ordre, donc pendant l'attente du verrou, et le second
 * appel ne voyait pas le créneau du premier. Il écrivait, puis Postgres
 * l'annulait (« could not serialize access », `P2034`), mesuré par le test
 * d'intégration. En `ReadCommitted`, chaque requête relit l'état validé.
 *
 * La clé vit dans l'espace `schedule:` pour ne croiser aucun autre verrou.
 * Une collision de hachage entre deux employés ne ferait que les sérialiser,
 * sans risque pour les données.
 *
 * @ticket SP-619
 */

import { Prisma } from '@prisma/client'

/**
 * Options de toute transaction qui prend ce verrou.
 *
 * `ReadCommitted` : voir l'en-tête, le verrou ne protège de rien sans lui.
 * `timeout` : une création récurrente plafonne à 200 créneaux
 * (`MAX_TOTAL_SCHEDULES`), chacun vérifié par trois requêtes, et les
 * 10 secondes du client global seraient justes.
 */
export const SCHEDULE_TRANSACTION_OPTIONS = {
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  maxWait: 5000,
  timeout: 20000,
} as const

/**
 * Prend le verrou de planification de chaque employé, dans la transaction
 * reçue. Les identifiants sont dédoublonnés et triés : deux créations
 * multi-employés qui verrouilleraient dans des ordres différents
 * s'attendraient l'une l'autre (interblocage).
 */
export async function lockEmployeesForScheduling(
  tx: Prisma.TransactionClient,
  employeeIds: readonly string[]
): Promise<void> {
  const ordered = [...new Set(employeeIds)].sort()
  for (const employeeId of ordered) {
    // $executeRaw : la fonction rend `void`, que $queryRaw ne sait pas lire
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`schedule:${employeeId}`}, 0))`
  }
}
