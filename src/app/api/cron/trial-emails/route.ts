/**
 * API Route — Cron rappels trial et expiration
 *
 * Envoie les emails de rappel trial (J-14, J-7, J-3, J-1) et
 * d'expiration (J0) aux directors des companies en TRIAL.
 *
 * Sécurisé par CRON_SECRET (header Authorization: Bearer <secret>).
 * Idempotent grâce au système anti-doublon de sendBillingEmail / EmailLog.
 *
 * ENDPOINT : POST /api/cron/trial-emails
 *
 * @ticket SP-370
 */

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { formatAmountEuros } from '@/lib/email/billing/format'
import {
  sendTrialEndingSoonEmail,
  sendTrialExpiredEmail,
} from '@/lib/email/templates/billing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TRIAL_REMINDER_DAYS = [14, 7, 3, 1] as const

/** Millisecondes dans un jour */
const MS_PER_DAY = 86_400_000

/**
 * Jours restants avant la fin d'essai, arrondis vers le haut.
 *
 * `differenceInDays` de date-fns tronque vers zéro : à 7 heures de la fin il
 * renvoyait 0, donc `daysRemaining <= 0` déclenchait l'expiration alors que
 * l'essai courait encore. Chaque entreprise perdait sa dernière journée, celle
 * où le dirigeant décide d'acheter, et se voyait refuser l'accès à
 * l'application avec un « essai terminé » prématuré.
 *
 * L'arrondi vers le haut rend `daysRemaining` strictement positif tant que la
 * date de fin n'est pas atteinte, et le fait passer à 0 ou moins ensuite. Les
 * seuils de rappel (J-14, J-7, J-3, J-1) gardent le même sens : il reste
 * « 1 jour » pendant toute la dernière journée.
 *
 * Constaté en production le 26 août 2026, cron de 08h00 UTC sur un essai
 * expirant à 15h05.
 */
function getTrialDaysRemaining(trialEndsAt: Date, now: Date): number {
  return Math.ceil((trialEndsAt.getTime() - now.getTime()) / MS_PER_DAY)
}

interface CronResult {
  sent: number
  skipped: number
  failed: number
  /** Subscriptions basculées de TRIAL à EXPIRED sur ce passage */
  expired: number
  details: string[]
}

/**
 * Bascule une subscription de TRIAL à EXPIRED quand la période d'essai est
 * terminée.
 *
 * Sans cette transition, `status` restait TRIAL indéfiniment : l'espace admin
 * listait comme « essais en cours » des entreprises dont la période s'était
 * achevée depuis des semaines.
 *
 * Les entreprises ayant souscrit chez Stripe sont exclues : leur statut est
 * piloté par les webhooks (ACTIVE, PAST_DUE, CANCELED).
 */
async function expireTrialSubscription({
  subscription,
  daysRemaining,
  companyName,
  results,
}: {
  subscription: {
    id: string
    stripeSubscriptionId: string | null
  } | null
  daysRemaining: number
  companyName: string
  results: CronResult
}): Promise<void> {
  if (daysRemaining > 0) return
  if (!subscription || subscription.stripeSubscriptionId) return

  try {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'EXPIRED' },
    })
    results.expired++
  } catch {
    results.failed++
    results.details.push(`${companyName}: trial status update failed`)
  }
}

export async function POST(request: NextRequest) {
  // 1. Vérifier CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Récupérer les companies en TRIAL avec trialEndsAt défini
  const trialCompanies = await prisma.company.findMany({
    where: {
      subscription: {
        status: 'TRIAL',
      },
      trialEndsAt: { not: null },
    },
    select: {
      id: true,
      name: true,
      trialEndsAt: true,
      subscription: {
        select: {
          id: true,
          stripeSubscriptionId: true,
          pricePerEmployee: true,
        },
      },
      users: {
        where: { role: 'DIRECTOR' },
        take: 1,
        select: { email: true, name: true },
      },
      _count: { select: { employees: true } },
    },
  })

  const results: CronResult = {
    sent: 0,
    skipped: 0,
    failed: 0,
    expired: 0,
    details: [],
  }

  // 3. Pour chaque company, calculer daysRemaining et envoyer l'email
  for (const company of trialCompanies) {
    const daysRemaining = getTrialDaysRemaining(
      company.trialEndsAt!,
      new Date()
    )

    // Une company dont l'essai est fini mais sans directeur joignable ne doit
    // pas rester bloquée en TRIAL : on corrige son statut avant de sortir.
    const director = company.users[0]
    if (!director?.email) {
      await expireTrialSubscription({
        subscription: company.subscription,
        daysRemaining,
        companyName: company.name,
        results,
      })
      results.skipped++
      results.details.push(`${company.name}: no director email`)
      continue
    }
    const employeeCount = company._count.employees
    const estimatedMonthlyPrice = formatAmountEuros(
      employeeCount * (company.subscription?.pricePerEmployee ?? 290)
    )
    const subscriptionId =
      company.subscription?.stripeSubscriptionId ??
      company.subscription?.id ??
      ''
    const firstName = director.name?.split(' ')[0] ?? 'Dirigeant'

    if (daysRemaining <= 0) {
      // Trial expiré → email expiration
      try {
        const result = await sendTrialExpiredEmail({
          companyId: company.id,
          subscriptionId,
          recipientEmail: director.email,
          firstName,
          companyName: company.name,
          employeeCount,
          estimatedMonthlyPrice,
        })
        if (result.skipped) {
          results.skipped++
        } else {
          results.sent++
        }
      } catch {
        results.failed++
        results.details.push(`${company.name}: trial expired email failed`)
      }

      // Après l'email seulement : la bascule en EXPIRED fait sortir la company
      // du filtre `status: 'TRIAL'` de ce cron, donc l'email d'expiration ne
      // repartira plus aux passages suivants.
      await expireTrialSubscription({
        subscription: company.subscription,
        daysRemaining,
        companyName: company.name,
        results,
      })
    } else if (
      TRIAL_REMINDER_DAYS.includes(
        daysRemaining as (typeof TRIAL_REMINDER_DAYS)[number]
      )
    ) {
      // Rappel trial (J-14, J-7, J-3, J-1)
      try {
        const result = await sendTrialEndingSoonEmail({
          companyId: company.id,
          subscriptionId,
          recipientEmail: director.email,
          firstName,
          companyName: company.name,
          daysRemaining,
          employeeCount,
          estimatedMonthlyPrice,
        })
        if (result.skipped) {
          results.skipped++
        } else {
          results.sent++
        }
      } catch {
        results.failed++
        results.details.push(
          `${company.name}: trial reminder J-${daysRemaining} failed`
        )
      }
    } else {
      results.skipped++
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    companiesProcessed: trialCompanies.length,
    ...results,
  })
}
