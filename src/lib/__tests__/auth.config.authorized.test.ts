/**
 * Tests du callback authorized() d'auth.config.ts, le portier du middleware
 *
 * Ce callback s'exécute à chaque requête HTTP sur /app/*. Il n'avait aucun test
 * avant ce fichier, alors qu'il porte l'authentification, le RBAC, le guard
 * d'impersonation et le guard d'abonnement.
 *
 * SP-589 : la condition d'entrée était `!!auth`, c'est-à-dire « un objet auth
 * existe ». L'avis publié sur next-auth décrit le défaut ainsi :
 * « Configuration errors can cause existence-based auth checks to fail open
 * (auth object populated with an error) ». Auth.js peut peupler `auth` avec un
 * objet porteur d'une erreur, sans `user` exploitable, que le middleware
 * lisait alors comme une session valide.
 *
 * Les cas ci-dessous sont donc des tests négatifs : ils prouvent le refus, et
 * non le chemin nominal. Ils échouent tous sur le code d'origine, ce qui est
 * la seule preuve qui vaille pour un contrôle de sécurité.
 *
 * @ticket SP-589
 */

import { describe, it, expect } from 'vitest'
import type { NextRequest } from 'next/server'
import type { Session } from 'next-auth'

import { authConfig } from '../auth.config'
import { IMPERSONATION_COOKIE_NAME } from '@/types/auth'

type AuthorizedFn = NonNullable<
  NonNullable<typeof authConfig.callbacks>['authorized']
>

const authorized = authConfig.callbacks?.authorized as AuthorizedFn

if (!authorized) {
  throw new Error('authConfig.callbacks.authorized doit être défini')
}

/**
 * Le callback ne lit de la requête que `nextUrl` et `cookies`. On fournit donc
 * le strict nécessaire plutôt qu'un NextRequest complet, impossible à
 * construire hors d'un contexte de requête.
 */
function requestFor(
  pathname: string,
  impersonationCookie?: string
): NextRequest {
  return {
    nextUrl: new URL(`https://smartplanning.fr${pathname}`),
    cookies: {
      get: (name: string) =>
        name === IMPERSONATION_COOKIE_NAME && impersonationCookie !== undefined
          ? { name, value: impersonationCookie }
          : undefined,
    },
  } as unknown as NextRequest
}

/** Une session complète, telle qu'Auth.js la produit pour un DIRECTOR actif. */
function validSession(): Session {
  return {
    user: {
      id: 'cl000000000000000000user1',
      role: 'DIRECTOR',
      companyId: 'cl00000000000000000comp1',
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: null,
      currentPeriodEnd: new Date(Date.now() + 30 * 86400_000).toISOString(),
    },
    expires: new Date(Date.now() + 86400_000).toISOString(),
  } as unknown as Session
}

/**
 * Le callback retourne `true` (autorisé), `false` (refusé) ou une Response de
 * redirection. Pour un test négatif, une redirection vers /login et un `false`
 * valent tous deux refus : ce qui compte est qu'on n'obtienne pas `true`.
 */
function isRefused(result: unknown): boolean {
  if (result === true) return false
  if (result === false) return true
  if (result instanceof Response) {
    const location = result.headers.get('location') ?? ''
    return result.status >= 300 && location.includes('/login')
  }
  return false
}

describe('authorized() — accès à une route protégée sans identité exploitable', () => {
  const PROTECTED_ROUTE = '/app/dashboard'

  it("refuse un objet auth vide, le cas décrit par l'avis next-auth", async () => {
    const result = await authorized({
      auth: {} as Session,
      request: requestFor(PROTECTED_ROUTE),
    })

    expect(isRefused(result)).toBe(true)
  })

  it('refuse un auth sans user', async () => {
    const result = await authorized({
      auth: { expires: new Date().toISOString() } as Session,
      request: requestFor(PROTECTED_ROUTE),
    })

    expect(isRefused(result)).toBe(true)
  })

  it("refuse un user sans id, l'identité n'étant alors pas résoluble", async () => {
    const result = await authorized({
      auth: {
        user: { role: 'DIRECTOR', companyId: 'cl00000000000000000comp1' },
        expires: new Date().toISOString(),
      } as unknown as Session,
      request: requestFor(PROTECTED_ROUTE),
    })

    expect(isRefused(result)).toBe(true)
  })

  it('refuse un user dont l\'id est une chaîne vide', async () => {
    const result = await authorized({
      auth: {
        user: { id: '', role: 'DIRECTOR' },
        expires: new Date().toISOString(),
      } as unknown as Session,
      request: requestFor(PROTECTED_ROUTE),
    })

    expect(isRefused(result)).toBe(true)
  })

  it('refuse une session absente (null)', async () => {
    const result = await authorized({
      auth: null,
      request: requestFor(PROTECTED_ROUTE),
    })

    expect(isRefused(result)).toBe(true)
  })
})

describe('authorized() — le chemin nominal reste ouvert', () => {
  it('autorise une session complète sur une route protégée', async () => {
    const result = await authorized({
      auth: validSession(),
      request: requestFor('/app/dashboard'),
    })

    expect(result).toBe(true)
  })

  it('laisse passer les routes publiques sans session', async () => {
    const result = await authorized({
      auth: null,
      request: requestFor('/'),
    })

    expect(result).toBe(true)
  })

  it('laisse passer /login sans session, sinon la connexion serait impossible', async () => {
    const result = await authorized({
      auth: null,
      request: requestFor('/login'),
    })

    expect(result).toBe(true)
  })

  it("laisse passer les endpoints d'Auth.js sans session", async () => {
    const result = await authorized({
      auth: null,
      request: requestFor('/api/auth/session'),
    })

    expect(result).toBe(true)
  })

  it("n'accorde pas /login à un auth vide, qui doit rester traité comme déconnecté", async () => {
    // Un auth vide sur /login ne doit pas déclencher la redirection
    // « déjà connecté » vers le dashboard : sans identité, il n'y a pas de
    // dashboard vers lequel rediriger, et getDefaultDashboardForRole
    // recevrait un rôle indéfini.
    const result = await authorized({
      auth: {} as Session,
      request: requestFor('/login'),
    })

    expect(result).toBe(true)
  })
})

describe('authorized() — garde d\'impersonation sur /app/admin (SP-592)', () => {
  // Ces deux branches n'etaient couvertes par aucun test : les cas de SP-589
  // passaient un `cookies.get` qui retournait toujours undefined, le corps du
  // `if` n'etait donc jamais atteint. Ce sont pourtant des branches
  // d'autorisation, et la regle du projet impose de prouver le refus.
  const adminSession = (): Session =>
    ({
      user: {
        id: 'cl000000000000000000admin',
        role: 'SYSTEM_ADMIN',
        companyId: null,
      },
      expires: new Date(Date.now() + 86400_000).toISOString(),
    }) as unknown as Session

  const impersonationCookie = JSON.stringify({
    originalAdminId: 'cl000000000000000000admin',
    impersonatedCompanyId: 'cl00000000000000000comp1',
  })

  it("detourne un SYSTEM_ADMIN hors de /app/admin pendant une impersonation", () => {
    const result = authorized({
      auth: adminSession(),
      request: requestFor('/app/admin/companies', impersonationCookie),
    })

    expect(result).toBeInstanceOf(Response)
    const location = (result as Response).headers.get('location') ?? ''
    expect(location).toContain('/app/dashboard')
  })

  it('laisse le meme admin acceder a /app/admin hors impersonation', () => {
    const result = authorized({
      auth: adminSession(),
      request: requestFor('/app/admin/companies'),
    })

    expect(result).toBe(true)
  })

  it("laisse passer quand le cookie est illisible, le RBAC prenant le relais", () => {
    // Un cookie corrompu ne doit pas bloquer l'admin : le JSON.parse leve, et
    // le catch laisse continuer. Sans ce test, la branche d'erreur n'est
    // jamais exercee.
    const result = authorized({
      auth: adminSession(),
      request: requestFor('/app/admin/companies', 'ceci-nest-pas-du-json'),
    })

    expect(result).toBe(true)
  })

  it("ignore un cookie JSON valide mais sans originalAdminId", () => {
    // Un objet JSON quelconque ne doit pas etre pris pour une impersonation.
    const result = authorized({
      auth: adminSession(),
      request: requestFor('/app/admin/companies', JSON.stringify({ a: 1 })),
    })

    expect(result).toBe(true)
  })
})

describe('authorized() — le guard d\'abonnement est court-circuite en impersonation (SP-592)', () => {
  // SP-456 : en impersonation, les donnees d'abonnement du JWT sont celles de
  // l'admin et non de l'entreprise consultee. Appliquer le guard bloquerait a
  // tort. Cette branche n'etait pas couverte non plus.
  const expiredDirector = (): Session =>
    ({
      user: {
        id: 'cl000000000000000000user1',
        role: 'DIRECTOR',
        companyId: 'cl00000000000000000comp1',
        subscriptionStatus: 'CANCELED',
        trialEndsAt: new Date(Date.now() - 30 * 86400_000).toISOString(),
        currentPeriodEnd: new Date(Date.now() - 30 * 86400_000).toISOString(),
      },
      expires: new Date(Date.now() + 86400_000).toISOString(),
    }) as unknown as Session

  it('redirige vers billing un abonnement expire, hors impersonation', () => {
    const result = authorized({
      auth: expiredDirector(),
      request: requestFor('/app/dashboard/employees'),
    })

    expect(result).toBeInstanceOf(Response)
    const location = (result as Response).headers.get('location') ?? ''
    expect(location).toContain('/app/dashboard/billing')
  })

  it("ne le redirige pas quand une impersonation est en cours", () => {
    const result = authorized({
      auth: expiredDirector(),
      request: requestFor(
        '/app/dashboard/employees',
        JSON.stringify({ originalAdminId: 'cl000000000000000000admin' })
      ),
    })

    expect(result).toBe(true)
  })
})
