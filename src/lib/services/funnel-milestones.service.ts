/**
 * Detection des premieres fois du tunnel de conversion
 *
 * @description Les etapes 4 a 6 du tunnel sont des jalons d'activation :
 * « la premiere equipe », « le premier collaborateur », « le premier
 * planning ». Emettre un evenement a chaque creation noierait ces etapes sous
 * le volume d'usage courant et rendrait le tunnel illisible : une entreprise
 * qui cree sa quarantieme equipe n'est plus en train de s'activer.
 *
 * Ce module porte donc la question « est-ce la premiere ? », posee apres la
 * creation. Le comptage sert de detecteur : si l'entreprise n'a qu'une equipe
 * et qu'on vient d'en creer une, c'est la premiere.
 *
 * IMPORTANT : pas de directive 'use server', ce module est importe depuis des
 * Server Actions et depuis une route API (voir la note en tete de
 * funnel-analytics.service.ts).
 *
 * @ticket SP-591
 */

import { prisma } from '@/lib/prisma'

import {
  trackFunnelStep,
  accountAgeInDays,
  toSizeBucket,
  type FunnelEventData,
} from './funnel-analytics.service'

/**
 * Lit la date de creation de l'entreprise, pour situer le jalon dans le cycle
 * d'essai. C'est la seule information qu'on joint, et elle n'identifie
 * personne.
 */
async function companyAgeDays(companyId: string): Promise<number | undefined> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { createdAt: true },
  })
  return company ? accountAgeInDays(company.createdAt) : undefined
}

/**
 * Emet `funnel-first-team` si l'entreprise vient de creer sa premiere equipe.
 *
 * A appeler APRES la creation, en fire-and-forget. Ne leve jamais.
 */
export async function trackFirstTeamIfApplicable(
  companyId: string
): Promise<void> {
  try {
    const teamCount = await prisma.team.count({ where: { companyId } })
    if (teamCount !== 1) return

    await trackFunnelStep('funnel-first-team', {
      accountAgeDays: await companyAgeDays(companyId),
    })
  } catch (error) {
    console.error('[FunnelMilestones] first-team', error)
  }
}

/**
 * Emet `funnel-first-employee` si l'entreprise vient d'enregistrer ses
 * premiers collaborateurs.
 *
 * `method` distingue l'import CSV de la creation a l'unite : les deux chemins
 * n'ont pas le meme cout pour l'utilisateur, et savoir lequel echoue oriente
 * les corrections d'onboarding.
 *
 * `createdCount` est le nombre de collaborateurs enregistres par l'operation,
 * ce qui permet de traiter l'import en lot, ou le premier collaborateur n'est
 * pas le seul.
 */
export async function trackFirstEmployeeIfApplicable(
  companyId: string,
  method: 'import' | 'manual' | 'invitation',
  createdCount = 1
): Promise<void> {
  try {
    const employeeCount = await prisma.employee.count({ where: { companyId } })
    // L'operation vient d'en creer `createdCount` : c'etait une premiere si
    // l'entreprise n'en avait aucun avant.
    if (employeeCount !== createdCount) return

    await trackFunnelStep('funnel-first-employee', {
      method,
      sizeBucket: toSizeBucket(employeeCount),
      accountAgeDays: await companyAgeDays(companyId),
    })
  } catch (error) {
    console.error('[FunnelMilestones] first-employee', error)
  }
}

/**
 * Emet `funnel-first-schedule` si l'entreprise vient de creer son premier
 * planning. C'est le jalon d'activation le plus fort du produit : une
 * entreprise qui publie un planning a compris a quoi il sert.
 */
export async function trackFirstScheduleIfApplicable(
  companyId: string,
  createdCount = 1
): Promise<void> {
  try {
    // `Schedule` ne porte pas de companyId : il reference un Employee, qui le
    // porte. L'isolation passe donc par la relation, et non par une colonne
    // directe comme pour Team et Employee.
    const scheduleCount = await prisma.schedule.count({
      where: { employee: { companyId } },
    })
    // `createSchedule` cree plusieurs plannings en une transaction : un premier
    // lot de trois donnerait un total de 3, pas de 1. On compare donc au nombre
    // reellement cree par l'operation, comme pour les collaborateurs.
    if (scheduleCount !== createdCount) return

    await trackFunnelStep('funnel-first-schedule', {
      accountAgeDays: await companyAgeDays(companyId),
    })
  } catch (error) {
    console.error('[FunnelMilestones] first-schedule', error)
  }
}

/**
 * Emet une etape du tunnel sans condition de premiere fois.
 *
 * Sert aux etapes qui sont uniques par nature : une souscription confirmee,
 * une invitation acceptee.
 */
export async function trackCompanyMilestone(
  step: Parameters<typeof trackFunnelStep>[0],
  companyId: string,
  data: FunnelEventData = {}
): Promise<void> {
  try {
    await trackFunnelStep(step, {
      ...data,
      accountAgeDays: await companyAgeDays(companyId),
    })
  } catch (error) {
    console.error(`[FunnelMilestones] ${step}`, error)
  }
}
