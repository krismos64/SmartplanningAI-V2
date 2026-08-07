/**
 * Script de backfill — essais gratuits expirés
 *
 * @description
 * Rien ne faisait passer `Subscription.status` de TRIAL à EXPIRED quand
 * `Company.trialEndsAt` était dépassée : le cron `/api/cron/trial-emails`
 * envoyait bien l'email d'expiration mais ne touchait pas au statut. Résultat,
 * l'espace admin listait comme « essais en cours » des entreprises dont la
 * période était terminée depuis des semaines.
 *
 * La transition est désormais assurée par le cron pour les nouveaux cas. Ce
 * script rattrape l'historique déjà en base.
 *
 * Ne sont PAS touchées les entreprises ayant souscrit chez Stripe
 * (`stripeSubscriptionId` non null) : leur statut est piloté par les webhooks
 * (ACTIVE, PAST_DUE, CANCELED) et n'a aucune raison de passer par EXPIRED.
 *
 * Idempotent : une seconde exécution ne trouve plus rien à mettre à jour.
 *
 * ## Exécution en local (base de développement)
 *
 *   npx tsx src/scripts/backfill-expired-trials.ts
 *
 * ## Exécution en production : passer par SQL, pas par ce fichier
 *
 * L'image Docker de production est un build Next.js **standalone** : elle ne
 * contient ni `src/scripts/`, ni `tsx`, ni `node_modules/.bin`. Ce script n'y
 * est donc pas exécutable, et `docker exec smartplanning-app npx tsx …` échoue.
 * Appliquer la même opération directement sur Postgres.
 *
 * 1. Vérifier le périmètre (lecture seule, avec la clause exacte de l'UPDATE) :
 *
 *    docker exec smartplanning-postgres psql -U smartplanning -d smartplanning -c "
 *      SELECT s.id, c.name, c.\"trialEndsAt\"
 *      FROM subscriptions s
 *      JOIN companies c ON c.id = s.\"companyId\"
 *      WHERE s.status = 'TRIAL'
 *        AND s.\"stripeSubscriptionId\" IS NULL
 *        AND c.\"trialEndsAt\" IS NOT NULL
 *        AND c.\"trialEndsAt\" < now()
 *      ORDER BY c.\"trialEndsAt\";"
 *
 * 2. Appliquer, en transaction, une fois la liste validée :
 *
 *    docker exec smartplanning-postgres psql -U smartplanning -d smartplanning -c "
 *      BEGIN;
 *      UPDATE subscriptions s
 *         SET status = 'EXPIRED', \"updatedAt\" = now()
 *        FROM companies c
 *       WHERE c.id = s.\"companyId\"
 *         AND s.status = 'TRIAL'
 *         AND s.\"stripeSubscriptionId\" IS NULL
 *         AND c.\"trialEndsAt\" IS NOT NULL
 *         AND c.\"trialEndsAt\" < now();
 *      COMMIT;"
 *
 * Le nombre de lignes renvoyé par l'UPDATE doit correspondre au nombre de
 * lignes du SELECT de l'étape 1. Les deux clauses sont identiques, et
 * identiques au filtre `main()` ci-dessous : toute modification de la logique
 * doit être répercutée aux trois endroits.
 *
 * Attention à ne pas élargir le filtre aux abonnements `ACTIVE` sans
 * `stripeSubscriptionId` : la prod en compte au moins un (compte de test), et
 * rien ne garantit qu'un ACTIVE sans identifiant Stripe soit un essai échu.
 *
 * Exécuté le 06/08/2026 en production (3 lignes : Bassin à Bloc, Beynost
 * Evasion, Samba).
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🔄 Backfill essais expirés — démarrage...\n')

  const now = new Date()

  const candidates = await prisma.subscription.findMany({
    where: {
      status: 'TRIAL',
      stripeSubscriptionId: null,
      company: {
        trialEndsAt: { not: null, lt: now },
      },
    },
    select: {
      id: true,
      company: { select: { name: true, trialEndsAt: true } },
    },
  })

  if (candidates.length === 0) {
    console.log('✅ Aucun essai expiré à corriger. Rien à faire.\n')
    return
  }

  console.log(`📋 ${candidates.length} abonnement(s) à basculer en EXPIRED :\n`)

  await prisma.subscription.updateMany({
    where: { id: { in: candidates.map((s) => s.id) } },
    data: { status: 'EXPIRED' },
  })

  for (const sub of candidates) {
    const endedAt = sub.company.trialEndsAt?.toISOString() ?? 'inconnue'
    console.log(`  ✓ ${sub.company.name} → essai terminé le ${endedAt}`)
  }

  console.log(`\n✅ ${candidates.length} abonnement(s) mis à jour.\n`)
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
