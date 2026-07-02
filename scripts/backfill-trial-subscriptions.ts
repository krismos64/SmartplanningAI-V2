/**
 * Backfill des lignes subscriptions manquantes (audit du 02/07/2026)
 *
 * Pour chaque Company SANS ligne Subscription mais avec trialEndsAt :
 * 1. Réutilise ou crée le customer Stripe (recherche par metadata
 *    smartplanning_company_id pour éviter les doublons — cf. doublon
 *    Distri Shop constaté à l'audit)
 * 2. Upsert la ligne Subscription (plan FREE, status TRIAL), même pattern
 *    que createCheckoutSession → idempotent, ré-exécutable sans risque
 *
 * USAGE (depuis le conteneur app en production, env déjà chargé) :
 *   node backfill-trial-subscriptions.js           # DRY-RUN (aucune écriture)
 *   node backfill-trial-subscriptions.js --apply   # écrit Stripe + DB
 *
 * En local : npx tsx scripts/backfill-trial-subscriptions.ts [--apply]
 *
 * Le dry-run n'effectue AUCUNE écriture (ni Stripe, ni DB) : uniquement
 * des SELECT Prisma et une recherche customers Stripe en lecture.
 */

import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

import {
  planTrialSubscriptionBackfill,
  type BackfillPlanItem,
} from '../src/lib/services/stripe/trial-backfill'

// Même clé que STRIPE_METADATA_KEYS.COMPANY_ID (src/lib/stripe/stripe-config.ts).
// Littéral volontaire : le script doit rester autonome (bundle esbuild sans
// résolution de l'alias @/) — ne pas modifier sans synchroniser les deux.
const METADATA_COMPANY_ID = 'smartplanning_company_id'

// Hors périmètre par décision opérateur (validé le 02/07/2026) :
// - sofreba : suppression commerciale prévue, ne pas backfiller ni notifier
const EXCLUDED_COMPANY_IDS = [
  'cmpglgx420000rx01467b8jhc', // sofreba
] as const

const APPLY = process.argv.includes('--apply')

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY manquante dans l’environnement')
  }
  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  })
  const keyMode = secretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST'

  console.log('='.repeat(72))
  console.log(
    `Backfill subscriptions manquantes — mode ${APPLY ? 'APPLY (écritures réelles)' : 'DRY-RUN (aucune écriture)'} — Stripe ${keyMode}`
  )
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
          `           director: ${item.directorEmail} | trialEndsAt: ${item.trialEndsAt.toISOString()} | status: ${item.status}${expiredFlag ? '\n' + expiredFlag : ''}`
      )
    }
    for (const s of plan.skipped) {
      console.log(`  [SKIP]   ${s.companyName} (${s.companyId}) — ${s.reason}`)
    }

    if (!APPLY) {
      console.log(
        '\nDRY-RUN terminé. Relancer avec --apply pour créer les customers Stripe + lignes subscriptions.'
      )
      return
    }

    // --- APPLY ---
    let created = 0
    let failed = 0
    for (const item of plan.items) {
      try {
        const customerId = await getOrCreateCustomer(stripe, item)
        await prisma.subscription.upsert({
          where: { companyId: item.companyId },
          create: {
            companyId: item.companyId,
            stripeCustomerId: customerId,
            plan: 'FREE',
            status: 'TRIAL',
          },
          // Ligne apparue entre-temps : ne rien écraser
          update: {},
        })
        created++
        console.log(`  ✅ ${item.companyName} → customer ${customerId}, subscription upsertée`)
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

/**
 * Réutilise le customer Stripe existant (recherche par metadata companyId,
 * fallback par email exact) ou en crée un — même convention que
 * createCheckoutSession (email + name + metadata smartplanning_company_id).
 */
async function getOrCreateCustomer(
  stripe: Stripe,
  item: BackfillPlanItem
): Promise<string> {
  const search = await stripe.customers.search({
    query: `metadata['${METADATA_COMPANY_ID}']:'${item.companyId}'`,
    limit: 1,
  })
  if (search.data[0]) {
    return search.data[0].id
  }

  const customer = await stripe.customers.create({
    email: item.directorEmail,
    name: item.companyName,
    metadata: { [METADATA_COMPANY_ID]: item.companyId },
  })
  return customer.id
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
