/**
 * Service partage de calcul MRR (Monthly Recurring Revenue)
 *
 * Centralise toute la logique de calcul MRR pour le modele per-seat.
 * Utilise par admin-stats.service.ts et tout futur consommateur.
 *
 * @ticket SP-469
 */

import { prisma } from '@/lib/prisma'

/**
 * Type d'un abonnement pour le calcul MRR
 */
export interface MrrSubscription {
  /** Plan d'abonnement (FREE, PER_SEAT) */
  plan: string
  /** Nombre d'employes factures */
  quantity: number
  /** Prix en centimes par employe */
  pricePerEmployee: number
  /** Intervalle de facturation ("month", "year", ou null) */
  billingInterval: string | null
}

/**
 * Calcule le MRR mensuel a partir d'une liste d'abonnements (modele per-seat)
 *
 * Formule :
 * - FREE → 0 EUR
 * - PER_SEAT mensuel → (quantity x pricePerEmployee) / 100 en euros
 * - PER_SEAT annuel → ((quantity x pricePerEmployee) / 12) / 100 en euros
 *
 * @param subscriptions Liste des abonnements a agreger
 * @returns MRR en euros (pas en centimes)
 */
export function calculateMrrFromSubscriptions(
  subscriptions: MrrSubscription[]
): number {
  return subscriptions.reduce((total, sub) => {
    if (sub.plan === 'FREE') return total

    let monthlyPriceCents = sub.quantity * sub.pricePerEmployee

    if (sub.billingInterval === 'year') {
      monthlyPriceCents = monthlyPriceCents / 12
    }

    return total + monthlyPriceCents / 100
  }, 0)
}

/**
 * Abonnement avec statut pour le calcul de contribution MRR
 */
export interface MrrSubscriptionWithStatus extends MrrSubscription {
  /** Statut de l'abonnement (TRIAL, ACTIVE, PAST_DUE, ...) */
  status: string
}

/**
 * Contribution MRR d'UN abonnement — Single Source of Truth de la règle
 * métier « seuls les abonnements ACTIVE contribuent au MRR » (SP-547).
 *
 * Avant, cette règle vivait en plusieurs endroits (WHERE Prisma dans
 * getCurrentMrr, ternaire au call site de getSubscriptionsAdmin) et
 * pouvait diverger silencieusement : le KPI global et les lignes du
 * tableau admin n'auraient plus totalisé la même chose. Si la définition
 * du revenu évolue (ex : PAST_DUE compte jusqu'à l'abandon Stripe),
 * modifier UNIQUEMENT cette fonction.
 *
 * @returns Contribution mensuelle en euros (0 si non-ACTIVE ou FREE)
 */
export function mrrContribution(sub: MrrSubscriptionWithStatus): number {
  if (sub.status !== 'ACTIVE') return 0
  return calculateMrrFromSubscriptions([sub])
}

/**
 * Recupere le MRR courant depuis la DB (abonnements ACTIVE uniquement)
 *
 * Version legere pour le monitoring — ne charge que les champs necessaires.
 * Le WHERE status ACTIVE est une optimisation de requête ; la règle métier
 * est portée par mrrContribution (appliquée aussi en mémoire).
 *
 * @returns MRR en euros
 */
export async function getCurrentMrr(): Promise<number> {
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    select: {
      status: true,
      plan: true,
      quantity: true,
      pricePerEmployee: true,
      billingInterval: true,
    },
  })

  return subscriptions.reduce((total, sub) => total + mrrContribution(sub), 0)
}
