/**
 * Pose la CSP à nonce sur la réponse du middleware NextAuth (SP-598)
 *
 * Le middleware NextAuth n'est pas enveloppé par `auth(handler)` : avec un
 * handler, NextAuth n'applique plus sa redirection par défaut quand le
 * callback `authorized` rend `false`, et notre callback finit par
 * `return isLoggedIn`. Il est donc appelé tel quel, sa décision est gardée,
 * et la CSP n'est ajoutée qu'après.
 *
 * Deux cas :
 * - NextAuth laisse passer (`x-middleware-next`) : la requête repart vers le
 *   rendu avec le nonce dans ses en-têtes, où Next.js le lit pour l'apposer
 *   sur ses scripts. Les en-têtes posés par NextAuth (cookies de session
 *   rafraîchis) sont recopiés.
 * - NextAuth répond lui-même (redirection) : la CSP est posée telle quelle.
 *
 * @ticket SP-598
 */

import { NextResponse, type NextRequest } from 'next/server'
import { NONCE_HEADER } from './csp'

const CSP_HEADER = 'Content-Security-Policy'

export function applyCsp(
  authResponse: Response | null | undefined,
  request: NextRequest,
  nonce: string,
  csp: string
): Response {
  const passesThrough =
    !authResponse || authResponse.headers.get('x-middleware-next') === '1'

  if (!passesThrough) {
    // Copie : les en-têtes d'une Response.redirect sont immuables
    const response = new Response(authResponse.body, authResponse)
    response.headers.set(CSP_HEADER, csp)
    return response
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(NONCE_HEADER, nonce)
  requestHeaders.set(CSP_HEADER, csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  authResponse?.headers.forEach((value, key) => {
    // Les en-têtes de réécriture de requête viennent de NextResponse.next
    // ci-dessus, ceux de NextAuth ne doivent pas les écraser
    if (key.startsWith('x-middleware-')) return
    if (key === 'set-cookie') return
    response.headers.set(key, value)
  })
  for (const cookie of authResponse?.headers.getSetCookie?.() ?? []) {
    response.headers.append('set-cookie', cookie)
  }
  response.headers.set(CSP_HEADER, csp)
  return response
}
