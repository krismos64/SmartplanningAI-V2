/**
 * Script de backfill — vérification d'email (SP-526)
 *
 * @description
 * Avant l'introduction du verrou `emailVerified` dans `authorize()`
 * (cf. src/lib/auth.ts), les comptes pouvaient se connecter sans avoir
 * vérifié leur email. Tous ces comptes ont `emailVerified = null` en base.
 *
 * Si on déployait le verrou tel quel, TOUS les utilisateurs existants en
 * production se retrouveraient bloqués à leur prochaine connexion. Ce script
 * « rattrape » ces comptes en considérant qu'ils sont vérifiés rétroactivement :
 * on positionne `emailVerified = createdAt` (date d'inscription) et
 * `isEmailVerified = true` pour les comptes actifs non encore vérifiés.
 *
 * On utilise `createdAt` plutôt que `now()` pour rester fidèle à la réalité
 * historique : la valeur reflète la date d'ouverture du compte, pas la date
 * d'exécution du script.
 *
 * ⚠️ À exécuter UNE SEULE FOIS, juste avant le déploiement du verrou.
 * Idempotent : relancer le script ne touche que les comptes encore à null,
 * donc une seconde exécution ne fait rien de plus (0 compte mis à jour).
 *
 * Exécution (base de développement uniquement) :
 *   npx tsx src/scripts/backfill-email-verified.ts
 *
 * En production, ce script n'est PAS exécutable : l'image Docker est un build
 * Next.js standalone, sans `src/scripts/` ni `tsx`. Passer par un UPDATE SQL
 * sur Postgres, en reprenant le filtre de `main()` ci-dessous. Voir
 * `backfill-expired-trials.ts` pour la marche à suivre détaillée (vérification
 * en lecture seule, puis UPDATE en transaction).
 *
 * @ticket SP-526
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🔄 [SP-526] Backfill emailVerified — démarrage...\n')

  // Comptes concernés : actifs et jamais vérifiés.
  // On ne touche PAS aux comptes désactivés (isActive: false) : s'ils sont
  // réactivés un jour, le flow de vérification normal s'appliquera.
  const candidates = await prisma.user.findMany({
    where: {
      emailVerified: null,
      isActive: true,
    },
    select: { id: true, email: true, createdAt: true },
  })

  if (candidates.length === 0) {
    console.log('✅ Aucun compte à mettre à jour. Rien à faire.\n')
    return
  }

  console.log(`📋 ${candidates.length} compte(s) à mettre à jour :\n`)

  // On met à jour chaque compte avec SA propre date de création.
  // Un updateMany ne permet pas de référencer une autre colonne (createdAt),
  // donc on boucle dans une transaction pour garder l'atomicité.
  await prisma.$transaction(
    candidates.map((user) =>
      prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: user.createdAt,
          isEmailVerified: true,
        },
      })
    )
  )

  for (const user of candidates) {
    console.log(
      `  ✓ ${user.email} → emailVerified = ${user.createdAt.toISOString()}`
    )
  }

  console.log(`\n✅ ${candidates.length} compte(s) mis à jour avec succès.\n`)
}

main()
  .catch((error) => {
    console.error('\n❌ ERREUR PENDANT LE BACKFILL :')
    console.error(error)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
