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
 * Exécution :
 *   npx tsx src/scripts/backfill-expired-trials.ts
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
