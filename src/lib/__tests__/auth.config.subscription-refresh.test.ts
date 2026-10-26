/**
 * Rafraîchissement d'abonnement du callback jwt(), selon le runtime
 *
 * @ticket SP-612
 * @description En Edge Runtime (middleware), Prisma ne tourne pas. Tenter
 * l'import y écrivait « prisma:error ... edge runtime » à chaque requête
 * dès 5 minutes de session, ce qui noyait les vraies erreurs dans journald.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { JWT } from 'next-auth/jwt'

const { mockFindUnique } = vi.hoisted(() => ({ mockFindUnique: vi.fn() }))

vi.mock('@/lib/prisma', () => ({
  prisma: { company: { findUnique: mockFindUnique } },
}))

import { authConfig } from '../auth.config'

type JWTCallbackFn = NonNullable<
  NonNullable<typeof authConfig.callbacks>['jwt']
>
const jwtCallback = authConfig.callbacks?.jwt as JWTCallbackFn

const SIX_MINUTES = 6 * 60 * 1000

function directorToken(checkedAt: number): JWT {
  return {
    id: 'user-1',
    role: 'DIRECTOR',
    companyId: 'company-1',
    subscriptionStatus: 'TRIAL',
    subscriptionCheckedAt: checkedAt,
  } as JWT
}

async function refresh(token: JWT): Promise<JWT> {
  // @ts-expect-error signature partielle suffisante pour le test
  const result = await jwtCallback({ token, user: undefined })
  if (!result) throw new Error('jwt callback a retourné null')
  return result
}

describe('SP-612, rafraîchissement abonnement et runtime', () => {
  const runtimeAvant = process.env.NEXT_RUNTIME

  beforeEach(() => {
    vi.clearAllMocks()
    mockFindUnique.mockResolvedValue({
      trialEndsAt: new Date('2026-11-10T16:09:36Z'),
      subscription: { status: 'ACTIVE', currentPeriodEnd: null },
    })
  })

  afterEach(() => {
    if (runtimeAvant === undefined) delete process.env.NEXT_RUNTIME
    else process.env.NEXT_RUNTIME = runtimeAvant
  })

  it("en edge, n'interroge pas la base et garde le token tel quel", async () => {
    process.env.NEXT_RUNTIME = 'edge'
    const token = directorToken(Date.now() - SIX_MINUTES)

    const result = await refresh(token)

    expect(mockFindUnique).not.toHaveBeenCalled()
    expect(result.subscriptionStatus).toBe('TRIAL')
  })

  it('en nodejs, rafraîchit après 5 minutes', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'

    const result = await refresh(directorToken(Date.now() - SIX_MINUTES))

    expect(mockFindUnique).toHaveBeenCalledTimes(1)
    expect(result.subscriptionStatus).toBe('ACTIVE')
  })

  it('en nodejs, ne rafraîchit pas avant 5 minutes', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'

    await refresh(directorToken(Date.now() - 60 * 1000))

    expect(mockFindUnique).not.toHaveBeenCalled()
  })
})
