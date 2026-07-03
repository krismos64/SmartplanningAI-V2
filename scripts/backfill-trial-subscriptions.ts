/**
 * Backfill des lignes subscriptions manquantes (audit du 02/07/2026)
 *
 * Pour chaque Company SANS ligne Subscription mais avec trialEndsAt :
 * Upsert la ligne Subscription (plan FREE, status TRIAL, stripeCustomerId NULL).
 * Le Customer Stripe sera créé au premier checkout volontaire via
 * createCheckoutSession (qui teste déjà `if (!customerId)` avant de créer).
 * Comportement identique à une inscription normale — aucune divergence introduite.
 *
 * Aucun appel Stripe, aucun moyen de paiement attaché, aucun abonnement créé.
 *
 * Pré-requis : migration 20260702000000_make_subscription_stripe_customer_id_nullable
 * déjà appliquée (rend stripeCustomerId nullable en base).
 *
 * USAGE (depuis le conteneur app en production, env déjà chargé) :
 *   node backfill-trial-subscriptions.js           # DRY-RUN (aucune écriture)
 *   node backfill-trial-subscriptions.js --apply   # écrit en DB uniquement
 *
 * En local : npx tsx scripts/backfill-trial-subscriptions.ts [--apply]
 *
 * Le dry-run n'effectue AUCUNE écriture : uniquement des SELECT Prisma.
 * L'opération est idempotente (upsert) : ré-exécutable sans risque.
 */

import { PrismaClient } from '@prisma/client'

import {
  planTrialSubscriptionBackfill,
} from '../src/lib/services/stripe/trial-backfill'

// Hors périmètre par décision opérateur (validé le 02/07/2026) :
// - sofreba : suppression commerciale prévue, ne pas backfiller ni notifier
const EXCLUDED_COMPANY_IDS = [
  'cmpglgx420000rx01467b8jhc', // sofreba
] as const

const APPLY = process.argv.includes('--apply')

async function main(): Promise<void> {
  const prisma = new PrismaClient()

  console.log('='.repeat(72))
  console.log(
    `Backfill subscriptions manquantes — mode ${APPLY ? 'APPLY (écritures DB)' : 'DRY-RUN (aucune écriture)'}`
  )
  console.log('Aucun appel Stripe — stripeCustomerId laissé à null')
  console.log('='.repeat(72))

  try {
    // Companies sans ligne Subscription (relation 1:1 absente)
    const companies = await prisma.company.findMany({
      where: { subscription: null },
      select: {
        id: true,
        name: true,
        trialEndsAt: true,
        users: {
          where: { role: 'DIRECTOR' },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { email: true },
        },
      },
      orderBy: { trialEndsAt: 'asc' },
    })

    const plan = planTrialSubscriptionBackfill(
      companies.map((c) => ({
        id: c.id,
        name: c.name,
        trialEndsAt: c.trialEndsAt,
        directorEmail: c.users[0]?.email ?? null,
      })),
      new Date(),
      { excludedCompanyIds: EXCLUDED_COMPANY_IDS }
    )

    console.log(`\nCompanies sans Subscription : ${companies.length}`)
    console.log(`À backfiller : ${plan.items.length} | Écartées : ${plan.skipped.length}\n`)

    for (const item of plan.items) {
      const expiredFlag = item.trialAlreadyExpired
        ? '  ⚠️  essai DÉJÀ EXPIRÉ → TRIAL_EXPIRED partira au prochain cron'
        : ''
      console.log(
        `  [CREATE] ${item.companyName} (${item.companyId})\n` +
        `           director: ${item.directorEmail}\n` +
        `           trialEndsAt: ${item.trialEndsAt.toISOString()}\n` +
        `           → subscriptions row : plan=FREE status=TRIAL stripeCustomerId=null stripeSubscriptionId=null` +
        (expiredFlag ? '\n' + expiredFlag : '')
      )
    }
    for (const s of plan.skipped) {
      console.log(`  [SKIP]   ${s.companyName} (${s.companyId}) — ${s.reason}`)
    }

    if (!APPLY) {
      console.log(
        '\nDRY-RUN terminé. Relancer avec --apply pour écrire les lignes subscriptions en DB.'
      )
      return
    }

    // --- APPLY ---
    let created = 0
    let failed = 0
    for (const item of plan.items) {
      try {
        await prisma.subscription.upsert({
          where: { companyId: item.companyId },
          create: {
            company: { connect: { id: item.companyId } },
            stripeCustomerId: null,
            plan: 'FREE',
            status: 'TRIAL',
          },
          // Ligne apparue entre-temps (ex : checkout concurrent) : ne rien écraser
          update: {},
        })
        created++
        console.log(`  ✅ ${item.companyName} — subscription créée (stripeCustomerId=null)`)
      } catch (error) {
        failed++
        const message = error instanceof Error ? error.message : String(error)
        console.error(`  ❌ ${item.companyName} — ${message}`)
      }
    }

    console.log(`\nAPPLY terminé : ${created} créée(s), ${failed} échec(s)`)
    if (failed > 0) {
      process.exitCode = 1
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
