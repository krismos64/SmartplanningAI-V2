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
import { differenceInDays } from 'date-fns'

import { prisma } from '@/lib/prisma'
import { formatAmountEuros } from '@/lib/email/billing/format'
import {
  sendTrialEndingSoonEmail,
  sendTrialExpiredEmail,
} from '@/lib/email/templates/billing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TRIAL_REMINDER_DAYS = [14, 7, 3, 1] as const

interface CronResult {
  sent: number
  skipped: number
  failed: number
  details: string[]
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

  const results: CronResult = { sent: 0, skipped: 0, failed: 0, details: [] }

  // 3. Pour chaque company, calculer daysRemaining et envoyer l'email
  for (const company of trialCompanies) {
    const director = company.users[0]
    if (!director?.email) {
      results.skipped++
      results.details.push(`${company.name}: no director email`)
      continue
    }

    const daysRemaining = differenceInDays(company.trialEndsAt!, new Date())
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
