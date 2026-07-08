'use server'

/**
 * Server Actions pour la vue cross-company des abonnements et paiements.
 * Réservé au SYSTEM_ADMIN — isolation multi-tenant intentionnellement levée.
 *
 * @ticket SP-542
 */

import { auth } from '@/lib/auth'
import { hasRequiredRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import {
  calculateMrrFromSubscriptions,
  getCurrentMrr,
} from '@/lib/services/mrr.service'
import type {
  PaymentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client'

// ============================================================================
// Constantes
// ============================================================================

const MAX_PAGE_SIZE = 100

/** Whitelists : les filtres arrivent du client, on ignore toute valeur inconnue */
const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  'TRIAL',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'EXPIRED',
  'INCOMPLETE',
]

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = ['FREE', 'PER_SEAT']

const PAYMENT_STATUSES: PaymentStatus[] = [
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'REFUNDED',
  'REQUIRES_ACTION',
]

// ============================================================================
// Types
// ============================================================================

export interface AdminSubscriptionRow {
  id: string
  companyId: string
  companyName: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  quantity: number
  /** Contribution MRR mensuelle en euros (même formule que le dashboard, SP-469) */
  mrr: number
  billingInterval: string | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  createdAt: Date
}

export interface GetSubscriptionsAdminResult {
  subscriptions: AdminSubscriptionRow[]
  total: number
}

export interface AdminPaymentRow {
  id: string
  companyId: string
  companyName: string
  amount: number
  currency: string
  status: PaymentStatus
  paidAt: Date | null
  createdAt: Date
  stripeInvoiceId: string | null
  failureMessage: string | null
}

export interface GetPaymentsAdminResult {
  payments: AdminPaymentRow[]
  total: number
  /**
   * Base URL du dashboard Stripe, résolue côté serveur selon le mode de la
   * clé API (sk_test → /test). Une facture test ouverte sur l'URL live → 404.
   */
  stripeDashboardBaseUrl: string
}

export interface AdminSubscriptionsSummary {
  /** MRR global en euros (Single Source of Truth : mrr.service) */
  mrr: number
  activeCount: number
  trialCount: number
  pastDueCount: number
  /** Paiements FAILED sur les 30 derniers jours */
  failedPayments30d: number
}

// ============================================================================
// Helpers
// ============================================================================

async function assertSystemAdmin(): Promise<void> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }
}

/**
 * Les IDs Stripe vivent dans des espaces séparés test/live : le dashboard
 * exige le segment /test pour les objets créés avec une clé sk_test.
 */
function getStripeDashboardBaseUrl(): string {
  return process.env.STRIPE_SECRET_KEY?.startsWith('sk_test')
    ? 'https://dashboard.stripe.com/test'
    : 'https://dashboard.stripe.com'
}

function sanitizePagination(page?: number, pageSize?: number) {
  const safePage = Math.max(1, Math.trunc(page ?? 1))
  const safePageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.trunc(pageSize ?? 25))
  )
  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
  }
}

// ============================================================================
// Actions
// ============================================================================

/**
 * KPIs de synthèse pour l'en-tête de la page Abonnements.
 * MRR calculé via le service partagé (cohérent avec le dashboard admin).
 */
export async function getSubscriptionsSummaryAdmin(): Promise<AdminSubscriptionsSummary> {
  await assertSystemAdmin()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [mrr, statusCounts, failedPayments30d] = await Promise.all([
    getCurrentMrr(),
    prisma.subscription.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.payment.count({
      where: { status: 'FAILED', createdAt: { gte: thirtyDaysAgo } },
    }),
  ])

  const countFor = (status: SubscriptionStatus) =>
    statusCounts.find((item) => item.status === status)?._count ?? 0

  return {
    mrr,
    activeCount: countFor('ACTIVE'),
    trialCount: countFor('TRIAL'),
    pastDueCount: countFor('PAST_DUE'),
    failedPayments30d,
  }
}

/**
 * Liste cross-tenant des abonnements avec contribution MRR par ligne.
 * Tri par prix total desc (≈ MRR desc) puis date de création.
 */
export async function getSubscriptionsAdmin(params?: {
  status?: SubscriptionStatus | 'ALL'
  plan?: SubscriptionPlan | 'ALL'
  page?: number
  pageSize?: number
}): Promise<GetSubscriptionsAdminResult> {
  await assertSystemAdmin()

  const { pageSize, skip } = sanitizePagination(params?.page, params?.pageSize)

  const status =
    params?.status &&
    SUBSCRIPTION_STATUSES.includes(params.status as SubscriptionStatus)
      ? (params.status as SubscriptionStatus)
      : undefined
  const plan =
    params?.plan && SUBSCRIPTION_PLANS.includes(params.plan as SubscriptionPlan)
      ? (params.plan as SubscriptionPlan)
      : undefined

  const where = {
    ...(status && { status }),
    ...(plan && { plan }),
  }

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: { company: { select: { id: true, name: true } } },
      orderBy: [{ planPrice: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize,
    }),
    prisma.subscription.count({ where }),
  ])

  return {
    subscriptions: subscriptions.map((sub) => ({
      id: sub.id,
      companyId: sub.companyId,
      companyName: sub.company.name,
      plan: sub.plan,
      status: sub.status,
      quantity: sub.quantity,
      // Contribution MRR par ligne : ACTIVE uniquement, même règle que le MRR global
      mrr:
        sub.status === 'ACTIVE'
          ? calculateMrrFromSubscriptions([
              {
                plan: sub.plan,
                quantity: sub.quantity,
                pricePerEmployee: sub.pricePerEmployee,
                billingInterval: sub.billingInterval,
              },
            ])
          : 0,
      billingInterval: sub.billingInterval,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      createdAt: sub.createdAt,
    })),
    total,
  }
}

/**
 * Liste cross-tenant des paiements, du plus récent au plus ancien.
 * Filtre statut (accès direct aux échecs pour le support).
 */
export async function getPaymentsAdmin(params?: {
  status?: PaymentStatus | 'ALL'
  page?: number
  pageSize?: number
}): Promise<GetPaymentsAdminResult> {
  await assertSystemAdmin()

  const { pageSize, skip } = sanitizePagination(params?.page, params?.pageSize)

  const status =
    params?.status && PAYMENT_STATUSES.includes(params.status as PaymentStatus)
      ? (params.status as PaymentStatus)
      : undefined

  const where = {
    ...(status && { status }),
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { company: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
  ])

  return {
    payments: payments.map((payment) => ({
      id: payment.id,
      companyId: payment.companyId,
      companyName: payment.company.name,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      stripeInvoiceId: payment.stripeInvoiceId,
      failureMessage: payment.failureMessage,
    })),
    total,
    stripeDashboardBaseUrl: getStripeDashboardBaseUrl(),
  }
}
