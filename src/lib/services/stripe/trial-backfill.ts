/**
 * Logique de sélection du backfill des subscriptions manquantes
 *
 * Contexte (audit du 02/07/2026) : registerUser créait Company + User sans
 * ligne Subscription. Le cron /api/cron/trial-emails filtre sur
 * subscription.status = 'TRIAL' : les companies sans ligne Subscription
 * étaient donc invisibles et ne recevaient aucun rappel de fin d'essai.
 *
 * Ce module est une fonction pure (aucun accès DB/Stripe) pour être
 * testable unitairement. L'exécution réelle est portée par
 * scripts/backfill-trial-subscriptions.ts.
 *
 * Choix du statut : toujours TRIAL, y compris pour un essai déjà expiré.
 * - C'est le statut qu'aurait la ligne si le bug n'avait pas existé
 *   (défaut du schéma + upsert de createCheckoutSession)
 * - Le subscription guard bloque déjà via trialEndsAt passé, le statut
 *   TRIAL ne rouvre donc aucun accès
 * - Effet de bord assumé : le prochain cron enverra TRIAL_EXPIRED aux
 *   companies dont l'essai est déjà passé (signalé via trialAlreadyExpired)
 */

export interface BackfillCompanyInput {
  id: string
  name: string
  trialEndsAt: Date | null
  directorEmail: string | null
  /** Garde défensive : une company qui a déjà sa ligne Subscription ne doit
   *  jamais être backfillée, même si la requête amont laissait passer. */
  hasSubscription?: boolean
}

export type BackfillSkipReason =
  | 'no_trial_end'
  | 'no_director_email'
  | 'already_has_subscription'
  | 'excluded'

export interface BackfillPlanItem {
  companyId: string
  companyName: string
  directorEmail: string
  trialEndsAt: Date
  status: 'TRIAL'
  /** true si l'essai est déjà expiré → le prochain cron enverra TRIAL_EXPIRED */
  trialAlreadyExpired: boolean
}

export interface BackfillSkippedItem {
  companyId: string
  companyName: string
  reason: BackfillSkipReason
}

export interface BackfillPlan {
  items: BackfillPlanItem[]
  skipped: BackfillSkippedItem[]
}

export interface BackfillOptions {
  /** Companies explicitement hors périmètre (décision opérateur), quel que
   *  soit leur état — ex : suppression commerciale prévue. */
  excludedCompanyIds?: readonly string[]
}

/**
 * Construit le plan de backfill à partir des companies SANS ligne Subscription.
 *
 * Le filtre « pas de Subscription » est fait en amont par la requête Prisma
 * (where: { subscription: null }) ; cette fonction décide quoi créer et
 * écarte les cas non exploitables :
 * - excludedCompanyIds : hors périmètre par décision opérateur
 * - hasSubscription : garde défensive, ne jamais écraser une ligne existante
 * - trialEndsAt null : aucune base pour dater l'essai → intervention manuelle
 * - pas d'email de DIRECTOR : impossible de créer le customer Stripe
 *   (l'email est requis par la convention createCheckoutSession)
 */
export function planTrialSubscriptionBackfill(
  companies: BackfillCompanyInput[],
  now: Date = new Date(),
  options: BackfillOptions = {}
): BackfillPlan {
  const excluded = new Set(options.excludedCompanyIds ?? [])
  const items: BackfillPlanItem[] = []
  const skipped: BackfillSkippedItem[] = []

  for (const company of companies) {
    const skip = (reason: BackfillSkipReason): void => {
      skipped.push({
        companyId: company.id,
        companyName: company.name,
        reason,
      })
    }

    if (excluded.has(company.id)) {
      skip('excluded')
      continue
    }

    if (company.hasSubscription) {
      skip('already_has_subscription')
      continue
    }

    if (!company.trialEndsAt) {
      skip('no_trial_end')
      continue
    }

    if (!company.directorEmail) {
      skip('no_director_email')
      continue
    }

    items.push({
      companyId: company.id,
      companyName: company.name,
      directorEmail: company.directorEmail,
      trialEndsAt: company.trialEndsAt,
      status: 'TRIAL',
      trialAlreadyExpired: company.trialEndsAt.getTime() <= now.getTime(),
    })
  }

  return { items, skipped }
}
