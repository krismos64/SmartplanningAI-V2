/**
 * Limites de débit de l'authentification (SP-610)
 *
 * Connexion, inscription et mot de passe oublié n'avaient aucune limite
 * applicative : seule la zone Nginx `general` (10 requêtes par seconde et par
 * IP) les couvrait.
 *
 * Deux familles :
 * - la connexion ne retient que les ÉCHECS. Chaque tentative est réservée
 *   avant la comparaison du mot de passe, puis rendue si elle réussit.
 *   Retenir aussi les réussites bloquerait un bureau entier derrière une
 *   même IP le lundi matin, et les E2E qui se connectent des centaines de
 *   fois
 * - l'inscription et le mot de passe oublié comptent chaque appel, puisque
 *   chacun produit un effet (compte créé, email envoyé)
 *
 * Ce fichier n'est pas un fichier 'use server' : il exporte des constantes.
 */
import { createHash } from 'node:crypto'

import { headers } from 'next/headers'

import {
  checkRateLimit,
  releaseRateLimit,
  resetRateLimit,
} from '@/lib/rate-limit'
import type { RateLimitConfig } from '@/types/contact'

const MINUTE = 60 * 1000

export const AUTH_RATE_LIMITS = {
  /**
   * Échecs d'une même IP sur une même adresse. C'est le plafond serré, et il
   * est lié à l'IP : un tiers qui s'acharne sur un compte se bloque lui-même,
   * sans empêcher le titulaire de se connecter depuis chez lui.
   */
  loginPerEmailAndIp: { maxRequests: 10, windowMs: 15 * MINUTE },
  /** Échecs depuis une même IP, toutes adresses confondues */
  loginPerIp: { maxRequests: 30, windowMs: 15 * MINUTE },
  /**
   * Échecs sur une même adresse, toutes IP confondues. Plafond large : il ne
   * sert qu'à arrêter une attaque répartie sur de nombreuses IP, chacune
   * restant sous le plafond serré. Une IP ne peut y contribuer que pour 10
   * essais : verrouiller un compte à distance demande au moins cinq IP.
   */
  loginPerEmail: { maxRequests: 50, windowMs: 15 * MINUTE },
  /**
   * Mots de passe erronés saisis par un utilisateur connecté pour confirmer
   * une action sensible (changement de mot de passe, suppression de compte).
   * Sans plafond, une session volée servirait à deviner le mot de passe.
   */
  passwordConfirmPerUser: { maxRequests: 5, windowMs: 15 * MINUTE },
  /** Demandes de réinitialisation pour une même adresse */
  forgotPerEmail: { maxRequests: 3, windowMs: 60 * MINUTE },
  forgotPerIp: { maxRequests: 10, windowMs: 60 * MINUTE },
  /** Inscriptions */
  registerPerEmail: { maxRequests: 5, windowMs: 60 * MINUTE },
  registerPerIp: { maxRequests: 10, windowMs: 60 * MINUTE },
} as const satisfies Record<string, RateLimitConfig>

/**
 * Les deux points d'entrée de la connexion ont chacun leur compteur. Une
 * soumission du formulaire les traverse tous les deux : avec un compteur
 * commun, chaque erreur de saisie compterait double.
 */
export type LoginEntryPoint = 'login-precheck' | 'login-authorize'

/** Clé par adresse : normalisée puis hachée, Redis ne stocke pas l'email. */
export function emailRateLimitKey(scope: string, email: string): string {
  const normalized = email.toLowerCase().trim()
  const hash = createHash('sha256').update(normalized).digest('hex')
  return `${scope}:email:${hash}`
}

/**
 * Ramène une IP à la source qu'elle désigne.
 *
 * Un abonné IPv6 reçoit un préfixe /64 entier, soit 2^64 adresses : compter
 * par adresse lui donnerait autant de quotas. On compte donc par /64. Une
 * IPv4 encapsulée (`::ffff:203.0.113.7`) est ramenée à l'IPv4.
 */
export function rateLimitSource(ip: string): string {
  const value = ip.trim().toLowerCase()
  if (!value.includes(':')) return value

  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(value)
  if (mapped?.[1]) return mapped[1]

  // Développer « :: » pour retrouver les huit groupes
  const [head = '', tail] = value.split('::')
  const headGroups = head ? head.split(':') : []
  const tailGroups = tail ? tail.split(':') : []
  const groups =
    tail === undefined
      ? headGroups
      : [
          ...headGroups,
          ...Array<string>(
            Math.max(0, 8 - headGroups.length - tailGroups.length)
          ).fill('0'),
          ...tailGroups,
        ]

  const prefix = groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ''))
    .join(':')
  return `${prefix}::/64`
}

export function ipRateLimitKey(scope: string, ip: string): string {
  return `${scope}:ip:${rateLimitSource(ip)}`
}

/**
 * IP du client telle que Nginx la certifie, ou null.
 *
 * Seul `x-real-ip` est lu : Nginx l'écrit depuis `$remote_addr`. La première
 * valeur de `x-forwarded-for` vient du client, s'y fier lui laisserait
 * choisir son quota. Sans cet en-tête (développement, E2E, appel direct au
 * conteneur), la limite par IP ne s'applique pas : toutes les requêtes
 * partageraient sinon un seul compteur, et la première rafale bloquerait
 * tout le monde. La limite par adresse, elle, s'applique toujours.
 */
export function getTrustedClientIp(source: Headers): string | null {
  const realIp = source.get('x-real-ip')?.trim()
  return realIp ? realIp : null
}

/** IP du client dans une Server Action. */
export async function getServerActionClientIp(): Promise<string | null> {
  try {
    return getTrustedClientIp(await headers())
  } catch {
    // Hors d'une requête (test, script)
    return null
  }
}

function loginKeys(
  entryPoint: LoginEntryPoint,
  email: string,
  ip: string | null
): { pair: string; email: string; ip: string | null } {
  const emailKey = emailRateLimitKey(entryPoint, email)
  return {
    // Sans IP certifiée (développement, E2E), la paire se réduit à l'adresse
    pair: `${emailKey}:from:${ip === null ? 'sans-ip' : rateLimitSource(ip)}`,
    email: emailKey,
    ip: ip === null ? null : ipRateLimitKey(entryPoint, ip),
  }
}

/**
 * Réserve une tentative de connexion et dit si elle peut avoir lieu.
 *
 * Les compteurs avancent AVANT la comparaison du mot de passe. Lire le
 * plafond puis compter l'échec après coup laissait une fenêtre : vingt
 * requêtes simultanées se lisaient toutes sous le plafond. Ici, chacune
 * prend son rang de façon atomique (INCR), et celles qui dépassent sont
 * refusées sans que le mot de passe soit comparé.
 *
 * Une tentative refusée reste comptée. Une tentative réussie se rend par
 * releaseLoginAttempt.
 */
export async function reserveLoginAttempt(
  entryPoint: LoginEntryPoint,
  email: string,
  ip: string | null
): Promise<boolean> {
  const keys = loginKeys(entryPoint, email, ip)

  // D'abord les deux compteurs qui ne pénalisent que l'appelant : sa paire
  // adresse et IP, et son IP.
  const [byPair, byIp] = await Promise.all([
    checkRateLimit(keys.pair, AUTH_RATE_LIMITS.loginPerEmailAndIp),
    keys.ip === null
      ? null
      : checkRateLimit(keys.ip, AUTH_RATE_LIMITS.loginPerIp),
  ])
  if (!byPair.allowed || byIp?.allowed === false) {
    // Le compteur de l'adresse seule n'avance pas : sinon une IP déjà
    // bloquée continuerait à le remplir, et suffirait à elle seule à
    // verrouiller le titulaire depuis partout.
    return false
  }

  const byEmail = await checkRateLimit(
    keys.email,
    AUTH_RATE_LIMITS.loginPerEmail
  )
  return byEmail.allowed
}

/**
 * Rend la tentative après une connexion réussie.
 *
 * Le compteur de la paire adresse et IP repart de zéro : depuis cette IP, le
 * titulaire vient de prouver qui il est. Les compteurs de l'IP seule et de
 * l'adresse seule ne rendent que cette tentative : une IP qui devine un
 * compte parmi d'autres ne repart pas de zéro.
 */
export async function releaseLoginAttempt(
  entryPoint: LoginEntryPoint,
  email: string,
  ip: string | null
): Promise<void> {
  const keys = loginKeys(entryPoint, email, ip)

  await Promise.all([
    resetRateLimit(keys.pair),
    releaseRateLimit(keys.email),
    keys.ip === null ? null : releaseRateLimit(keys.ip),
  ])
}

/**
 * Compte un appel et dit s'il est autorisé, par IP puis par adresse.
 *
 * L'IP d'abord : quand elle est refusée, le compteur de l'adresse n'avance
 * pas. Une IP déjà bloquée ne peut donc pas épuiser le quota d'une adresse
 * qui n'est pas la sienne, par exemple pour priver quelqu'un de son email de
 * réinitialisation.
 */
export async function consumeAuthAttempt(
  scope: 'forgot-password' | 'register',
  email: string,
  ip: string | null,
  limits: { perEmail: RateLimitConfig; perIp: RateLimitConfig }
): Promise<boolean> {
  if (ip !== null) {
    const byIp = await checkRateLimit(ipRateLimitKey(scope, ip), limits.perIp)
    if (!byIp.allowed) return false
  }

  const byEmail = await checkRateLimit(
    emailRateLimitKey(scope, email),
    limits.perEmail
  )
  return byEmail.allowed
}

/**
 * Réserve une confirmation par mot de passe pour un utilisateur connecté.
 * Même principe que la connexion : compté avant la comparaison, rendu par
 * releasePasswordConfirmation si le mot de passe est le bon.
 */
export async function reservePasswordConfirmation(
  userId: string
): Promise<boolean> {
  const result = await checkRateLimit(
    `password-confirm:user:${userId}`,
    AUTH_RATE_LIMITS.passwordConfirmPerUser
  )
  return result.allowed
}

export async function releasePasswordConfirmation(
  userId: string
): Promise<void> {
  await resetRateLimit(`password-confirm:user:${userId}`)
}
