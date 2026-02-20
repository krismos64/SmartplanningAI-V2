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
 * Recupere le MRR courant depuis la DB (abonnements ACTIVE uniquement)
 *
 * Version legere pour le monitoring — ne charge que les champs necessaires.
 *
 * @returns MRR en euros
 */
export async function getCurrentMrr(): Promise<number> {
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    select: {
      plan: true,
      quantity: true,
      pricePerEmployee: true,
      billingInterval: true,
    },
  })

  return calculateMrrFromSubscriptions(subscriptions)
}
