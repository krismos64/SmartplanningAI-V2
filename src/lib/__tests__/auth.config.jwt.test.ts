/**
 * Tests unitaires pour le callback jwt() d'auth.config.ts — bloc impersonation
 *
 * Ce callback n'avait aucun test avant ce fichier, ce qui a permis à deux bugs
 * de passer inaperçus en prod :
 * - SP-514 : `?? false` transformait `undefined` en `false` dans session()
 * - Ce bug : démarrer une impersonation alors qu'une autre est déjà active
 *   écrasait `originalAdminId`/`originalId` avec l'identité impersonnée
 *   précédente au lieu de préserver l'admin d'origine (message "Entreprise
 *   non configurée" au stop suivant).
 *
 * @ticket SP-548
 */

import { describe, it, expect } from 'vitest'
import type { JWT } from 'next-auth/jwt'

import { authConfig } from '../auth.config'

type JWTCallbackFn = NonNullable<
  NonNullable<typeof authConfig.callbacks>['jwt']
>

const jwtCallback = authConfig.callbacks?.jwt as JWTCallbackFn

if (!jwtCallback) {
  throw new Error('authConfig.callbacks.jwt doit être défini')
}

/** Le callback jwt() d'Auth.js type son retour en JWT | null, mais notre
 * implémentation retourne toujours `token` (jamais null) — ce wrapper évite
 * de parsemer les tests d'assertions de non-nullité. */
async function callJwt(...args: Parameters<JWTCallbackFn>): Promise<JWT> {
  const result = await jwtCallback(...args)
  if (!result)
    throw new Error('jwt callback a retourné null de façon inattendue')
  return result
}

function baseAdminToken(): JWT {
  return {
    id: 'admin-1',
    role: 'SYSTEM_ADMIN',
    companyId: null,
    subscriptionCheckedAt: Date.now(),
  } as JWT
}

describe('auth.config jwt callback — impersonation', () => {
  it('démarrage simple : sauvegarde originalId/originalAdminId depuis un token admin', async () => {
    const token = baseAdminToken()

    const result = await callJwt({
      token,
      trigger: 'update',
      session: {
        isImpersonating: true,
        originalAdminId: 'admin-1',
        impersonatedUserId: 'user-A',
        impersonatedCompanyId: 'company-A',
        impersonatedRole: 'DIRECTOR',
        impersonatedUserEmail: 'a@company-a.test',
        impersonatedCompanyName: 'Company A',
      },
      // @ts-expect-error signature partielle suffisante pour le test
      user: undefined,
    })

    expect(result.isImpersonating).toBe(true)
    expect(result.id).toBe('user-A')
    expect(result.originalId).toBe('admin-1')
    expect(result.originalAdminId).toBe('admin-1')
    expect(result.companyId).toBe('company-A')
  })

  it('switch direct A→B sans stop intermédiaire : préserve originalId/originalAdminId de l\'admin réel (régression bug "Entreprise non configurée")', async () => {
    // Token déjà en impersonation de l'entreprise A
    const token: JWT = {
      ...baseAdminToken(),
      isImpersonating: true,
      originalAdminId: 'admin-1',
      originalId: 'admin-1',
      id: 'user-A',
      role: 'DIRECTOR',
      companyId: 'company-A',
      impersonatedUserId: 'user-A',
      impersonatedCompanyId: 'company-A',
    } as JWT

    // Deuxième démarrage vers l'entreprise B, sans passer par un stop
    const result = await callJwt({
      token,
      trigger: 'update',
      session: {
        isImpersonating: true,
        originalAdminId: 'admin-1',
        impersonatedUserId: 'user-B',
        impersonatedCompanyId: 'company-B',
        impersonatedRole: 'MANAGER',
        impersonatedUserEmail: 'b@company-b.test',
        impersonatedCompanyName: 'Company B',
      },
      // @ts-expect-error signature partielle suffisante pour le test
      user: undefined,
    })

    // La cible courante doit bien être B
    expect(result.id).toBe('user-B')
    expect(result.companyId).toBe('company-B')
    expect(result.role).toBe('MANAGER')

    // L'admin d'origine ne doit JAMAIS devenir "user-A" (l'ancienne cible)
    expect(result.originalId).toBe('admin-1')
    expect(result.originalAdminId).toBe('admin-1')
  })

  it("switch A→B puis stop : restaure bien l'admin d'origine, pas l'ancienne cible A", async () => {
    let token: JWT = {
      ...baseAdminToken(),
      isImpersonating: true,
      originalAdminId: 'admin-1',
      originalId: 'admin-1',
      id: 'user-A',
      role: 'DIRECTOR',
      companyId: 'company-A',
      impersonatedUserId: 'user-A',
      impersonatedCompanyId: 'company-A',
    } as JWT

    // Switch vers B
    token = await callJwt({
      token,
      trigger: 'update',
      session: {
        isImpersonating: true,
        originalAdminId: 'admin-1',
        impersonatedUserId: 'user-B',
        impersonatedCompanyId: 'company-B',
        impersonatedRole: 'MANAGER',
        impersonatedUserEmail: 'b@company-b.test',
        impersonatedCompanyName: 'Company B',
      },
      // @ts-expect-error signature partielle suffisante pour le test
      user: undefined,
    })

    // Stop
    const stopped = await callJwt({
      token,
      trigger: 'update',
      session: { isImpersonating: false },
      // @ts-expect-error signature partielle suffisante pour le test
      user: undefined,
    })

    expect(stopped.isImpersonating).toBe(false)
    expect(stopped.id).toBe('admin-1')
    expect(stopped.role).toBe('SYSTEM_ADMIN')
    expect(stopped.companyId).toBeNull()
  })

  it("arrêt : nettoie toutes les données d'impersonation et restaure SYSTEM_ADMIN", async () => {
    const token: JWT = {
      ...baseAdminToken(),
      isImpersonating: true,
      originalAdminId: 'admin-1',
      originalId: 'admin-1',
      id: 'user-A',
      role: 'DIRECTOR',
      companyId: 'company-A',
      impersonatedUserId: 'user-A',
      impersonatedCompanyId: 'company-A',
      impersonatedUserEmail: 'a@company-a.test',
      impersonatedCompanyName: 'Company A',
    } as JWT

    const result = await callJwt({
      token,
      trigger: 'update',
      session: { isImpersonating: false },
      // @ts-expect-error signature partielle suffisante pour le test
      user: undefined,
    })

    expect(result.isImpersonating).toBe(false)
    expect(result.id).toBe('admin-1')
    expect(result.role).toBe('SYSTEM_ADMIN')
    expect(result.companyId).toBeNull()
    expect(result.impersonatedUserId).toBeUndefined()
    expect(result.impersonatedCompanyId).toBeUndefined()
    expect(result.originalAdminId).toBeUndefined()
  })

  it('persistance : re-applique companyId/id impersonnés à chaque refresh sans trigger update', async () => {
    const token: JWT = {
      ...baseAdminToken(),
      isImpersonating: true,
      originalAdminId: 'admin-1',
      originalId: 'admin-1',
      id: 'user-A',
      role: 'DIRECTOR',
      companyId: 'company-A',
      impersonatedUserId: 'user-A',
      impersonatedCompanyId: 'company-A',
    } as JWT

    const result = await callJwt({
      token,
      trigger: undefined,
      session: undefined,
      // @ts-expect-error signature partielle suffisante pour le test
      user: undefined,
    })

    expect(result.id).toBe('user-A')
    expect(result.companyId).toBe('company-A')
    expect(result.originalId).toBe('admin-1')
  })
})
