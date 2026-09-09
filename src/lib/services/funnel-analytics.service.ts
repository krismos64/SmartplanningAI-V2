/**
 * Emission des etapes du tunnel de conversion vers Umami, cote serveur
 *
 * @description Les etapes 1 a 3 du tunnel (CTA, inscription) se declenchent
 * dans le navigateur et passent par le hook client `useUmamiTrack`. Les
 * suivantes vivent dans des Server Actions ou dans le webhook Stripe, ou il
 * n'y a ni `window`, ni hook React, ni cookie de consentement : le webhook
 * n'a meme pas de navigateur a l'autre bout. Ce service est le chemin serveur.
 *
 * IMPORTANT : ce fichier n'a PAS de directive 'use server'. Il est importe
 * depuis des Server Actions et depuis une route API, et Next.js 15 transforme
 * les fichiers 'use server' en endpoints, ce qui provoque un 503 en production
 * lors d'un import dynamique.
 *
 * PROTECTION DES DONNEES
 *
 * Aucune donnee personnelle ne sort d'ici. On envoie le nom de l'etape, son
 * rang dans le tunnel, et des valeurs non identifiantes comme l'anciennete du
 * compte en jours. Jamais de companyId, d'identifiant utilisateur, d'email ni
 * d'adresse IP : l'appel part du serveur, l'IP vue par Umami est donc celle du
 * VPS et non celle de l'utilisateur.
 *
 * Le consentement cookies ne s'applique pas a ce chemin, puisque rien n'est
 * depose sur le poste de l'utilisateur et qu'aucune donnee personnelle n'est
 * transmise. Le chemin client, lui, reste conditionne au consentement.
 *
 * @ticket SP-591
 */

import { UMAMI_SERVER_CONFIG } from './funnel-analytics.config'

/**
 * Les etapes du tunnel, dans l'ordre.
 *
 * Le rang est envoye avec l'evenement pour que les etapes se trient dans
 * Umami, qui classe les evenements par volume et non par sequence.
 */
export const FUNNEL_STEPS = {
  'funnel-cta-click': 1,
  'funnel-signup-start': 2,
  'funnel-signup-complete': 3,
  'funnel-first-team': 4,
  'funnel-first-employee': 5,
  'funnel-first-schedule': 6,
  'funnel-invitation-accepted': 7,
  'funnel-checkout-opened': 8,
  'funnel-subscription-confirmed': 9,
} as const

export type FunnelStep = keyof typeof FUNNEL_STEPS

/**
 * Donnees jointes a une etape.
 *
 * Volontairement etroit : seules des valeurs non identifiantes passent. Ajouter
 * un champ ici demande de verifier qu'il ne permet pas de remonter a une
 * personne ou a une entreprise.
 */
export interface FunnelEventData {
  /** Anciennete du compte en jours, pour situer l'etape dans le cycle d'essai */
  accountAgeDays?: number
  /** Origine de l'action, par exemple 'import' ou 'invitation' */
  method?: string
  /** Tranche de taille, jamais un effectif exact qui identifierait l'entreprise */
  sizeBucket?: '1-5' | '6-20' | '21-50' | '50+'
}

/**
 * Range un effectif en tranche, pour eviter qu'un nombre precis ne serve
 * d'identifiant indirect.
 */
export function toSizeBucket(count: number): NonNullable<FunnelEventData['sizeBucket']> {
  if (count <= 5) return '1-5'
  if (count <= 20) return '6-20'
  if (count <= 50) return '21-50'
  return '50+'
}

/**
 * Calcule une anciennete en jours entiers, bornee a zero.
 */
export function accountAgeInDays(createdAt: Date, now: Date = new Date()): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  const diff = now.getTime() - createdAt.getTime()
  return Math.max(0, Math.floor(diff / MS_PER_DAY))
}

/**
 * Emet une etape du tunnel vers Umami.
 *
 * Ne leve jamais : une panne d'analytics ne doit pas faire echouer la creation
 * d'une equipe ou le traitement d'un paiement. Les erreurs sont journalisees
 * puis avalees.
 *
 * A appeler en fire-and-forget (`.catch(console.error)` n'est meme pas
 * necessaire, la fonction avale deja tout). Sans effet de bord en base, elle
 * n'entre pas en conflit avec une transaction qui suivrait, contrairement au
 * cas de `logAuditAction` corrige en SP-580.
 */
export async function trackFunnelStep(
  step: FunnelStep,
  data: FunnelEventData = {}
): Promise<void> {
  const { websiteId, sendUrl, hostname, enabled } = UMAMI_SERVER_CONFIG

  if (!enabled) {
    return
  }

  try {
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Umami rejette silencieusement une requete dont le User-Agent ne
        // ressemble pas a un navigateur, en repondant HTTP 200 et
        // `{"beep":"boop"}` : ni erreur, ni evenement enregistre.
        //
        // Mesure du 9 septembre 2026 contre l'instance de production. Avec
        // « SmartPlanning-Server/1.0 », reponse `{"beep":"boop"}`, evenement
        // perdu. Avec la chaine ci-dessous, reponse `{"cache":…,"sessionId":…,
        // "visitId":…}`, evenement accepte.
        //
        // D'ou cette chaine de navigateur, qui n'est pas un deguisement mais la
        // seule forme que le parseur d'Umami accepte. Le champ `data.source`
        // vaut 'server' et l'URL commence par /server/, ce qui distingue sans
        // ambiguite ces evenements de ceux du navigateur.
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        type: 'event',
        payload: {
          website: websiteId,
          hostname,
          // Umami exige une URL. On envoie un chemin synthetique qui distingue
          // les evenements serveur des pages reellement visitees.
          url: `/server/funnel/${step}`,
          name: step,
          data: {
            ...data,
            stepRank: FUNNEL_STEPS[step],
            source: 'server',
          },
        },
      }),
      // Une analytics lente ne doit pas retenir une Server Action.
      signal: AbortSignal.timeout(3000),
    })

    if (!response.ok) {
      console.error(
        `[FunnelAnalytics] Umami a refuse l'evenement ${step} (HTTP ${response.status})`
      )
    }
  } catch (error) {
    // Timeout, DNS, instance Umami arretee : on journalise et on continue.
    console.error(`[FunnelAnalytics] Envoi de ${step} impossible`, error)
  }
}
