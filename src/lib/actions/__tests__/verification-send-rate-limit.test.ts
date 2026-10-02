/**
 * Tests unitaires : limite d'envoi de l'email de vérification (SP-606)
 *
 * Le limiteur n'est pas mocké : checkRateLimit tourne réellement, sur son
 * repli mémoire (Redis absent) ou sur un faux client Redis qui enregistre les
 * clés. Seul l'envoi (sendVerificationEmailCore) est remplacé, pour compter ce
 * qui part. Un mock du limiteur prouverait seulement que l'action lit sa
 * réponse, pas que la quatrième demande est refusée.
 *
 * Le cache mémoire du limiteur vit au niveau du module : chaque test utilise
 * sa propre adresse pour ne pas hériter du compteur d'un autre.
 *
 * @ticket SP-606
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks (hoistés via vi.hoisted)
// ============================================================================

const { mockSendVerificationEmailCore, mockGetRedisClient } = vi.hoisted(
  () => ({
    mockSendVerificationEmailCore: vi.fn(),
    mockGetRedisClient: vi.fn(),
  })
)

vi.mock('@/lib/services/verification.service', () => ({
  sendVerificationEmailCore: mockSendVerificationEmailCore,
}))

vi.mock('@/lib/redis', () => ({
  getRedisClient: mockGetRedisClient,
}))

// Dépendances du module sans rapport avec l'envoi
vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/lib/password', () => ({ verifyPassword: vi.fn() }))
vi.mock('@/lib/email/templates/welcome', () => ({ sendWelcomeEmail: vi.fn() }))
vi.mock('@/lib/email/auth/log-auth-email', () => ({
  AuthEmailType: { WELCOME: 'WELCOME' },
  logAuthEmail: vi.fn(),
}))

import {
  sendVerificationEmailAction,
  resendVerificationEmailAction,
} from '../verification-actions'

// ============================================================================
// Faux client Redis : compteurs en mémoire, clés enregistrées
// ============================================================================

function createFakeRedis() {
  const counters = new Map<string, number>()
  const keys: string[] = []

  const client = {
    multi() {
      const ops: Array<() => [null, number]> = []
      const chain = {
        incr(key: string) {
          ops.push(() => {
            keys.push(key)
            const next = (counters.get(key) ?? 0) + 1
            counters.set(key, next)
            return [null, next]
          })
          return chain
        },
        expire() {
          ops.push(() => [null, 1])
          return chain
        },
        ttl() {
          ops.push(() => [null, 3600])
          return chain
        },
        exec() {
          return Promise.resolve(ops.map((op) => op()))
        },
      }
      return chain
    },
  }

  return { client, keys }
}

// ============================================================================
// Tests
// ============================================================================

describe('sendVerificationEmailAction : limite par adresse (SP-606)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRedisClient.mockReturnValue(null)
    mockSendVerificationEmailCore.mockResolvedValue({ status: 'SENT' })
  })

  it('envoie les trois premières demandes de l heure', async () => {
    const email = 'trois-envois@exemple.fr'

    for (let i = 0; i < 3; i++) {
      await sendVerificationEmailAction({ email })
    }

    expect(mockSendVerificationEmailCore).toHaveBeenCalledTimes(3)
  })

  it('n envoie rien à la quatrième demande dans l heure', async () => {
    const email = 'quatrieme@exemple.fr'

    for (let i = 0; i < 3; i++) {
      await sendVerificationEmailAction({ email })
    }
    mockSendVerificationEmailCore.mockClear()

    const result = await sendVerificationEmailAction({ email })

    expect(mockSendVerificationEmailCore).not.toHaveBeenCalled()
    // Réponse identique au succès : un refus visible révélerait le compte
    expect(result).toEqual({ success: true })
  })

  it('compte la casse et les espaces comme la même adresse', async () => {
    await sendVerificationEmailAction({ email: 'Casse@Exemple.fr' })
    await sendVerificationEmailAction({ email: '  casse@exemple.fr ' })
    await sendVerificationEmailAction({ email: 'CASSE@EXEMPLE.FR' })
    mockSendVerificationEmailCore.mockClear()

    await sendVerificationEmailAction({ email: 'casse@exemple.fr' })

    expect(mockSendVerificationEmailCore).not.toHaveBeenCalled()
  })

  it('le renvoi partage le quota de l envoi initial', async () => {
    const email = 'quota-partage@exemple.fr'

    // Envoi de l'inscription, puis deux renvois depuis l'écran dédié
    await sendVerificationEmailAction({ email })
    await resendVerificationEmailAction({ email })
    await resendVerificationEmailAction({ email })
    mockSendVerificationEmailCore.mockClear()

    await resendVerificationEmailAction({ email })

    expect(mockSendVerificationEmailCore).not.toHaveBeenCalled()
  })

  it('une adresse épuisée ne bloque pas une autre adresse', async () => {
    for (let i = 0; i < 4; i++) {
      await sendVerificationEmailAction({ email: 'epuisee@exemple.fr' })
    }
    mockSendVerificationEmailCore.mockClear()

    await sendVerificationEmailAction({ email: 'voisine@exemple.fr' })

    expect(mockSendVerificationEmailCore).toHaveBeenCalledTimes(1)
  })

  it('la clé Redis ne contient pas l adresse en clair', async () => {
    const { client, keys } = createFakeRedis()
    mockGetRedisClient.mockReturnValue(client)

    await sendVerificationEmailAction({ email: 'en-clair@exemple.fr' })

    expect(keys).toHaveLength(1)
    expect(keys[0]).toMatch(/^ratelimit:verification-send:[0-9a-f]{64}$/)
    expect(keys[0]).not.toContain('en-clair')
  })

  it('applique aussi la limite quand Redis répond', async () => {
    const { client } = createFakeRedis()
    mockGetRedisClient.mockReturnValue(client)
    const email = 'via-redis@exemple.fr'

    for (let i = 0; i < 4; i++) {
      await sendVerificationEmailAction({ email })
    }

    expect(mockSendVerificationEmailCore).toHaveBeenCalledTimes(3)
  })
})
