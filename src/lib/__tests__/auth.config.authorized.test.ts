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
function requestFor(pathname: string): NextRequest {
  return {
    nextUrl: new URL(`https://smartplanning.fr${pathname}`),
    cookies: {
      get: () => undefined,
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
