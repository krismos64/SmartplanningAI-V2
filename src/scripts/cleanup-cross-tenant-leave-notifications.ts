/**
 * Script de nettoyage : notifications de congés cross-tenant
 *
 * @description
 * `createLeaveRequest` construisait la liste des managers à notifier ainsi :
 *
 *   where: {
 *     managedTeams: employee.teamId ? { some: { id: employee.teamId } } : undefined,
 *     isActive: true,
 *     userId: { not: null },
 *   }
 *
 * Quand l'employé n'avait pas d'équipe (`teamId` null), `managedTeams` valait
 * `undefined`. Prisma ne traite pas `undefined` comme « ne rien matcher » : il
 * retire le critère. La requête devenait « tous les employés actifs », sans
 * aucun filtre `companyId`. Chaque manager de la base, toutes entreprises
 * confondues, recevait la demande de congé, avec le nom de l'employé et ses
 * dates d'absence.
 *
 * La notification était ensuite créée avec `companyId: user.companyId`, soit
 * l'entreprise du DESTINATAIRE et non celle de la demande. C'est précisément
 * cet écart qui permet de les identifier de façon certaine :
 * `notification.companyId IS DISTINCT FROM leaveRequest.companyId`.
 *
 * Le bug est corrigé côté code (helper `notifyTeamManagersOfLeaveEvent` +
 * gardes multi-tenant dans les factories de `notifications.ts`). Ce script
 * rattrape les lignes déjà écrites en base.
 *
 * ## Périmètre : strict
 *
 * Seules sont supprimées les notifications dont la fuite est PROUVÉE, c'est-à-
 * dire dont la `LeaveRequest` liée existe encore et appartient à une autre
 * entreprise que la notification. Aucun faux positif possible.
 *
 * Ne sont volontairement PAS touchées les notifications `LeaveRequest` dont la
 * demande a disparu (`relatedId` orphelin) : rien ne permet de distinguer une
 * fuite d'une notification légitime dont le congé a été purgé. Les supprimer
 * ferait disparaître des notifications légitimes.
 *
 * Les autres types (Schedule, IncidentNote, SYSTEM) ne sont pas concernés :
 * l'audit du code a établi qu'ils dérivent tous leurs destinataires d'entités
 * déjà filtrées par `companyId`. Un SELECT de contrôle est fourni ci-dessous
 * pour le vérifier en production plutôt que de le supposer.
 *
 * Idempotent : une seconde exécution ne trouve plus rien à supprimer.
 *
 * ## Exécution en local (base de développement)
 *
 *   npx tsx src/scripts/cleanup-cross-tenant-leave-notifications.ts
 *
 * ## Exécution en production : passer par SQL, pas par ce fichier
 *
 * L'image Docker de production est un build Next.js **standalone** : elle ne
 * contient ni `src/scripts/`, ni `tsx`, ni `node_modules/.bin`. Ce script n'y
 * est donc pas exécutable, et `docker exec smartplanning-app npx tsx …` échoue.
 * Appliquer la même opération directement sur Postgres.
 *
 * 0. Mesurer l'ampleur de la fuite (lecture seule). À exécuter AVANT tout
 *    nettoyage : ces chiffres documentent l'incident, et le détail par
 *    entreprise sert à évaluer l'obligation de notification RGPD.
 *
 *    docker exec smartplanning-postgres psql -U smartplanning -d smartplanning -c "
 *      SELECT
 *        cn.name AS entreprise_destinataire,
 *        cl.name AS entreprise_source,
 *        count(*) AS notifications,
 *        count(DISTINCT n.\"userId\") AS destinataires,
 *        min(n.\"createdAt\") AS premiere,
 *        max(n.\"createdAt\") AS derniere
 *      FROM notifications n
 *      JOIN leave_requests lr ON lr.id = n.\"relatedId\"
 *      LEFT JOIN companies cn ON cn.id = n.\"companyId\"
 *      LEFT JOIN companies cl ON cl.id = lr.\"companyId\"
 *      WHERE n.\"relatedType\" = 'LeaveRequest'
 *        AND n.\"companyId\" IS DISTINCT FROM lr.\"companyId\"
 *      GROUP BY cn.name, cl.name
 *      ORDER BY notifications DESC;"
 *
 * 1. Vérifier le périmètre exact du DELETE (lecture seule, MÊME clause) :
 *
 *    docker exec smartplanning-postgres psql -U smartplanning -d smartplanning -c "
 *      SELECT count(*)
 *      FROM notifications n
 *      JOIN leave_requests lr ON lr.id = n.\"relatedId\"
 *      WHERE n.\"relatedType\" = 'LeaveRequest'
 *        AND n.\"companyId\" IS DISTINCT FROM lr.\"companyId\";"
 *
 * 2. Contrôle des autres types : doit renvoyer 0 sur les trois lignes. Si ce
 *    n'est pas le cas, NE PAS poursuivre : une seconde fuite existe et ce
 *    script ne la couvre pas.
 *
 *    docker exec smartplanning-postgres psql -U smartplanning -d smartplanning -c "
 *      SELECT 'Schedule' AS type, count(*)
 *        FROM notifications n JOIN schedules s ON s.id = n.\"relatedId\"
 *       WHERE n.\"relatedType\" = 'Schedule'
 *         AND n.\"companyId\" IS DISTINCT FROM s.\"companyId\"
 *      UNION ALL
 *      SELECT 'IncidentNote', count(*)
 *        FROM notifications n JOIN incident_notes i ON i.id = n.\"relatedId\"
 *       WHERE n.\"relatedType\" = 'IncidentNote'
 *         AND n.\"companyId\" IS DISTINCT FROM i.\"companyId\"
 *      UNION ALL
 *      SELECT 'user hors entreprise', count(*)
 *        FROM notifications n JOIN users u ON u.id = n.\"userId\"
 *       WHERE n.\"companyId\" IS NOT NULL
 *         AND u.\"companyId\" IS DISTINCT FROM n.\"companyId\";"
 *
 * 3. Appliquer, en transaction, une fois les comptages validés :
 *
 *    docker exec smartplanning-postgres psql -U smartplanning -d smartplanning -c "
 *      BEGIN;
 *      DELETE FROM notifications n
 *       USING leave_requests lr
 *       WHERE n.\"relatedType\" = 'LeaveRequest'
 *         AND lr.id = n.\"relatedId\"
 *         AND n.\"companyId\" IS DISTINCT FROM lr.\"companyId\";
 *      COMMIT;"
 *
 * Le nombre de lignes renvoyé par le DELETE doit correspondre exactement au
 * compte de l'étape 1. Les deux clauses sont identiques, et identiques au
 * filtre `main()` ci-dessous : toute modification de la logique doit être
 * répercutée aux trois endroits.
 *
 * `IS DISTINCT FROM` et non `<>` : `Notification.companyId` est nullable, et
 * `NULL <> 'x'` vaut NULL, donc faux. Une notification au `companyId` nul
 * rattachée à une demande d'une entreprise donnée serait silencieusement
 * ignorée par `<>`.
 *
 * 4. Après le nettoyage, rejouer l'étape 1 : elle doit renvoyer 0.
 *
 * ## Suppression et non réaffectation
 *
 * Ces notifications sont supprimées, pas réattribuées à la bonne entreprise :
 * leur destinataire n'avait aucune raison de les recevoir, et le manager
 * légitime a déjà reçu la sienne par le même appel. Les réaffecter créerait
 * des doublons chez lui.
 */

import { PrismaClient } from '@prisma/client'

import { selectCrossTenantNotifications } from './lib/cross-tenant-notifications'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🔄 Nettoyage notifications congés cross-tenant : démarrage...\n')

  // Les notifications de congé encore rattachées à une demande existante.
  // La comparaison des companyId se fait en mémoire : Prisma ne sait pas
  // comparer deux colonnes de tables différentes dans un `where`.
  const leaveNotifications = await prisma.notification.findMany({
    where: {
      relatedType: 'LeaveRequest',
      relatedId: { not: null },
    },
    select: {
      id: true,
      companyId: true,
      relatedId: true,
      createdAt: true,
      user: { select: { email: true } },
    },
  })

  if (leaveNotifications.length === 0) {
    console.log('✅ Aucune notification de congé en base. Rien à faire.\n')
    return
  }

  const relatedIds = leaveNotifications
    .map((n) => n.relatedId)
    .filter((id): id is string => id !== null)

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { id: { in: relatedIds } },
    select: { id: true, companyId: true },
  })

  const companyByLeaveId = new Map(
    leaveRequests.map((lr) => [lr.id, lr.companyId])
  )

  // Périmètre strict : la demande liée doit exister ET appartenir à une autre
  // entreprise. Une demande absente ne prouve rien, on n'y touche pas.
  const leaked = selectCrossTenantNotifications(
    leaveNotifications,
    companyByLeaveId
  )

  if (leaked.length === 0) {
    console.log('✅ Aucune notification cross-tenant détectée. Rien à faire.\n')
    return
  }

  console.log(
    `📋 ${leaked.length} notification(s) cross-tenant à supprimer :\n`
  )

  for (const n of leaked) {
    const when = n.createdAt.toISOString()
    console.log(`  ✗ ${n.user.email} : reçue le ${when} (notif ${n.id})`)
  }

  const result = await prisma.notification.deleteMany({
    where: { id: { in: leaked.map((n) => n.id) } },
  })

  console.log(`\n✅ ${result.count} notification(s) supprimée(s).\n`)

  if (result.count !== leaked.length) {
    console.warn(
      `⚠️  Écart entre le périmètre annoncé (${leaked.length}) et les lignes supprimées (${result.count}).`
    )
  }
}

main()
  .catch((error) => {
    console.error('\n❌ ERREUR PENDANT LE NETTOYAGE :')
    console.error(error)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
