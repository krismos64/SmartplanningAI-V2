/**
 * CSP à nonce et middleware (SP-598)
 *
 * Trois choses à tenir :
 * - la politique de production n'autorise ni script inline sans nonce, ni eval
 * - le nonce change à chaque requête et suit la grammaire CSP
 * - la décision de NextAuth survit à l'ajout de la CSP : un visiteur non
 *   connecté qui demande /app reste redirigé vers la connexion. Le test passe
 *   par le vrai middleware, NextAuth compris.
 *
 * @ticket SP-598
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { NextRequest, type NextFetchEvent } from 'next/server'
import { buildCsp, generateNonce, NONCE_HEADER } from '../csp'
import { applyCsp } from '../csp-response'

function directive(csp: string, name: string): string {
  return csp.split('; ').find((d) => d.startsWith(`${name} `)) ?? ''
}

describe('SP-598, buildCsp', () => {
  const prod = buildCsp('abc123==', { isDev: false, isHttps: true })

  it('en production, script-src n’autorise ni inline ni eval', () => {
    const scriptSrc = directive(prod, 'script-src')

    expect(scriptSrc).toContain(`'nonce-abc123=='`)
    expect(scriptSrc).not.toContain('unsafe-inline')
    expect(scriptSrc).not.toContain('unsafe-eval')
  })

  it('sans strict-dynamic, qui bloquait les préchargements de next/dynamic', () => {
    expect(directive(prod, 'script-src')).not.toContain('strict-dynamic')
  })

  it('accorde eval au seul mode développement', () => {
    const dev = buildCsp('abc123==', { isDev: true, isHttps: false })

    expect(directive(dev, 'script-src')).toContain(`'unsafe-eval'`)
    expect(dev).not.toContain('upgrade-insecure-requests')
    expect(prod).toContain('upgrade-insecure-requests')
  })

  it('garde les directives de verrouillage', () => {
    expect(prod).toContain(`object-src 'none'`)
    expect(prod).toContain(`frame-ancestors 'none'`)
    expect(prod).toContain(`base-uri 'self'`)
  })
})

describe('SP-598, generateNonce', () => {
  it('rend un nonce neuf à chaque appel, au format base64', () => {
    const nonces = new Set(Array.from({ length: 50 }, generateNonce))

    expect(nonces.size).toBe(50)
    for (const nonce of nonces) {
      // Grammaire lue par Next.js pour extraire le nonce de l'en-tête
      expect(nonce).toMatch(/^[A-Za-z0-9+/_-]+={0,2}$/)
      expect(nonce.length).toBeGreaterThanOrEqual(22)
    }
  })
})

describe('SP-598, applyCsp', () => {
  const request = new NextRequest('https://smartplanning.fr/tarifs')

  it('laisse passer la requête avec le nonce dans ses en-têtes', () => {
    const passThrough = new Response(null, {
      headers: { 'x-middleware-next': '1' },
    })
    passThrough.headers.append('set-cookie', 'session=a; Path=/')
    passThrough.headers.append('set-cookie', 'csrf=b; Path=/')

    const response = applyCsp(passThrough, request, 'n0nce==', 'CSP')

    expect(response.headers.get('content-security-policy')).toBe('CSP')
    // Next.js relit ces en-têtes comme ceux de la requête
    expect(response.headers.get(`x-middleware-request-${NONCE_HEADER}`)).toBe(
      'n0nce=='
    )
    expect(
      response.headers.get('x-middleware-request-content-security-policy')
    ).toBe('CSP')
    // Les cookies de session rafraîchis par NextAuth ne sont pas perdus
    expect(response.headers.getSetCookie()).toEqual([
      'session=a; Path=/',
      'csrf=b; Path=/',
    ])
  })

  it('garde une redirection de NextAuth telle quelle', () => {
    const redirect = Response.redirect('https://smartplanning.fr/login', 307)

    const response = applyCsp(redirect, request, 'n0nce==', 'CSP')

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://smartplanning.fr/login'
    )
    expect(response.headers.get('x-middleware-next')).toBeNull()
    expect(response.headers.get('content-security-policy')).toBe('CSP')
  })
})

describe('SP-598, middleware complet', () => {
  type Middleware = (
    request: NextRequest,
    event: NextFetchEvent
  ) => Promise<Response>
  let middleware: Middleware
  const event = { waitUntil: () => {} } as unknown as NextFetchEvent

  beforeAll(async () => {
    process.env.AUTH_SECRET ??= 'secret-de-test-pour-le-middleware-sp598'
    ;({ default: middleware } = (await import('@/middleware')) as {
      default: Middleware
    })
  })

  it('redirige toujours un visiteur non connecté qui demande /app', async () => {
    const response = await middleware(
      new NextRequest('https://smartplanning.fr/app/dashboard'),
      event
    )

    expect([302, 307]).toContain(response.status)
    expect(new URL(response.headers.get('location') ?? '').pathname).toBe(
      '/login'
    )
    expect(response.headers.get('x-middleware-next')).toBeNull()
    expect(response.headers.get('content-security-policy')).toContain(`'nonce-`)
  })

  it('sert une page publique avec un nonce neuf à chaque requête', async () => {
    const nonces = await Promise.all(
      [1, 2].map(async () => {
        const response = await middleware(
          new NextRequest('https://smartplanning.fr/tarifs'),
          event
        )
        expect(response.headers.get('x-middleware-next')).toBe('1')
        return response.headers.get(`x-middleware-request-${NONCE_HEADER}`)
      })
    )

    expect(nonces[0]).toBeTruthy()
    expect(nonces[0]).not.toBe(nonces[1])
  })
})

describe('SP-598, animations sans expressions', () => {
  it('aucune animation Lottie ne demande eval à lottie-web', () => {
    // Une expression After Effects est évaluée par eval, que la CSP de
    // production refuse : l'animation casserait en silence
    const dir = join(process.cwd(), 'public', 'animations')
    const withExpressions = readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .filter((name) =>
        /"x"\s*:\s*"[^"]*\$bm_rt/.test(readFileSync(join(dir, name), 'utf8'))
      )

    expect(withExpressions).toEqual([])
  })
})
