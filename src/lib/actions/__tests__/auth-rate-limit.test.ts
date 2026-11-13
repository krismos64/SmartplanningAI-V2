/**
 * Tests négatifs : limites de débit de l'authentification (SP-610)
 *
 * Le limiteur n'est pas mocké : il tourne sur son repli mémoire, Redis étant
 * coupé pour toute la suite (`__tests__/setup.ts`). Un mock prouverait que le
 * code lit une réponse, pas que la onzième tentative est refusée.
 *
 * Chaque cas utilise sa propre adresse, et le cache du limiteur est vidé
 * avant chaque test.
 *
 * @ticket SP-610
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks (hoistés via vi.hoisted)
// ============================================================================

const {
  mockUserFindUnique,
  mockVerifyPassword,
  mockHeaders,
  mockSendResetPasswordEmail,
  mockTokenDeleteMany,
  mockTokenCreate,
  mockTransaction,
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockVerifyPassword: vi.fn(),
  mockHeaders: vi.fn(),
  mockSendResetPasswordEmail: vi.fn(),
  mockTokenDeleteMany: vi.fn(),
  mockTokenCreate: vi.fn(),
  mockTransaction: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}))

vi.mock('next-auth', () => ({
  default: () => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: (config: any) => config,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
      update: vi.fn().mockResolvedValue({}),
    },
    company: { findUnique: vi.fn().mockResolvedValue(null) },
    verificationToken: {
      deleteMany: (...args: any[]) => mockTokenDeleteMany(...args),
      create: (...args: any[]) => mockTokenCreate(...args),
    },
    $transaction: (...args: any[]) => mockTransaction(...args),
  },
}))

vi.mock('@/lib/password', () => ({
  verifyPassword: (...args: any[]) => mockVerifyPassword(...args),
  hashPassword: vi.fn().mockResolvedValue('hashed'),
}))

vi.mock('@/lib/services/audit', () => ({
  logAuditAction: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/session-store', () => ({
  registerSession: vi.fn().mockResolvedValue(undefined),
  removeSession: vi.fn(),
}))

vi.mock('@/lib/auth.config', () => ({
  authConfig: { providers: [], callbacks: {} },
}))

vi.mock('@/lib/email/templates/reset-password', () => ({
  sendResetPasswordEmail: (...args: any[]) =>
    mockSendResetPasswordEmail(...args),
}))

vi.mock('@/lib/email/templates/welcome', () => ({ sendWelcomeEmail: vi.fn() }))
vi.mock('@/lib/email/templates/new-registration', () => ({
  sendNewRegistrationEmail: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/email/auth/log-auth-email', () => ({
  AuthEmailType: { WELCOME: 'WELCOME' },
  logAuthEmail: vi.fn(),
}))
vi.mock('@/lib/services/verification.service', () => ({
  sendVerificationEmailCore: vi.fn().mockResolvedValue({ status: 'SENT' }),
}))
vi.mock('@/lib/services/admin-notification.service', () => ({
  createAdminNotification: vi.fn().mockResolvedValue(undefined),
}))

// ============================================================================
// Imports (après les mocks)
// ============================================================================

import { authorizeCredentials } from '@/lib/auth'
import { checkEmailVerificationStatus } from '@/lib/actions/verification-actions'
import { forgotPasswordAction } from '@/lib/actions/password-actions'
import { registerAction } from '@/lib/actions/auth-actions'
import { AUTH_RATE_LIMITS, getTrustedClientIp } from '@/lib/auth-rate-limit'
import { resetRateLimitCache } from '@/lib/rate-limit'

// ============================================================================
// Fixtures
// ============================================================================

const GOOD_PASSWORD = 'Password123!'
const BAD_PASSWORD = 'MauvaisMotDePasse1!'

/** Utilisateur tel que findUnique le renvoie dans authorize() */
function buildUser(email: string) {
  return {
    id: 'cl000000000000000000user1',
    email,
    name: 'Jane Director',
    password: '$2a$10$hashedpassword',
    role: 'DIRECTOR',
    companyId: 'cl00000000000000000comp1',
    emailVerified: new Date('2026-01-01T00:00:00Z'),
    image: null,
    isActive: true,
    company: {
      id: 'cl00000000000000000comp1',
      isActive: true,
      trialEndsAt: null,
      subscription: { status: 'ACTIVE', currentPeriodEnd: null },
    },
  }
}

function requestFrom(headers: Record<string, string>): Request {
  return new Request('https://smartplanning.fr/api/auth/callback/credentials', {
    method: 'POST',
    headers,
  })
}

/** Plafond serré : échecs d'une même IP sur une même adresse */
const LOGIN_MAX = AUTH_RATE_LIMITS.loginPerEmailAndIp.maxRequests
/** Plafond large : échecs sur une même adresse, toutes IP confondues */
const LOGIN_EMAIL_MAX = AUTH_RATE_LIMITS.loginPerEmail.maxRequests
const LOGIN_IP_MAX = AUTH_RATE_LIMITS.loginPerIp.maxRequests

beforeEach(() => {
  vi.clearAllMocks()
  resetRateLimitCache()
  // Par défaut : pas d'en-tête x-real-ip, comme en développement
  mockHeaders.mockResolvedValue(new Headers())
  // Le mot de passe n'est valide que s'il est le bon
  mockVerifyPassword.mockImplementation((password: string) =>
    Promise.resolve(password === GOOD_PASSWORD)
  )
  mockUserFindUnique.mockImplementation(
    ({ where }: { where: { email: string } }) =>
      Promise.resolve(buildUser(where.email))
  )
  mockSendResetPasswordEmail.mockResolvedValue({ success: true })
  mockTokenDeleteMany.mockResolvedValue({ count: 0 })
  mockTokenCreate.mockResolvedValue({})
})

// ============================================================================
// 1. Pré-contrôle de connexion (Server Action appelée par le formulaire)
// ============================================================================

describe('checkEmailVerificationStatus : plafond d échecs (SP-610)', () => {
  it('refuse la tentative suivante une fois le plafond atteint, même avec le bon mot de passe', async () => {
    const email = 'precheck-plafond@exemple.fr'

    for (let i = 0; i < LOGIN_MAX; i++) {
      const result = await checkEmailVerificationStatus({
        email,
        password: BAD_PASSWORD,
      })
      expect(result.status).toBe('INVALID_CREDENTIALS')
    }
    mockVerifyPassword.mockClear()

    const blocked = await checkEmailVerificationStatus({
      email,
      password: GOOD_PASSWORD,
    })

    expect(blocked.status).toBe('RATE_LIMITED')
    // Le mot de passe n'est même plus comparé : plus d'oracle
    expect(mockVerifyPassword).not.toHaveBeenCalled()
  })

  it('laisse passer le bon mot de passe juste sous le plafond', async () => {
    const email = 'precheck-sous-plafond@exemple.fr'

    for (let i = 0; i < LOGIN_MAX - 1; i++) {
      await checkEmailVerificationStatus({ email, password: BAD_PASSWORD })
    }

    const result = await checkEmailVerificationStatus({
      email,
      password: GOOD_PASSWORD,
    })

    expect(result.status).toBe('VERIFIED')
  })

  it('une connexion réussie efface les échecs de l adresse', async () => {
    const email = 'precheck-reussite@exemple.fr'

    for (let i = 0; i < LOGIN_MAX - 1; i++) {
      await checkEmailVerificationStatus({ email, password: BAD_PASSWORD })
    }
    await checkEmailVerificationStatus({ email, password: GOOD_PASSWORD })
    for (let i = 0; i < LOGIN_MAX - 1; i++) {
      await checkEmailVerificationStatus({ email, password: BAD_PASSWORD })
    }

    const result = await checkEmailVerificationStatus({
      email,
      password: GOOD_PASSWORD,
    })

    expect(result.status).toBe('VERIFIED')
  })

  it('plafonne de la même façon une adresse sans compte (pas d énumération)', async () => {
    const email = 'precheck-inconnu@exemple.fr'
    mockUserFindUnique.mockResolvedValue(null)

    const statuses: string[] = []
    for (let i = 0; i < LOGIN_MAX + 1; i++) {
      const result = await checkEmailVerificationStatus({
        email,
        password: BAD_PASSWORD,
      })
      statuses.push(result.status)
    }

    expect(statuses.slice(0, LOGIN_MAX)).toEqual(
      Array(LOGIN_MAX).fill('INVALID_CREDENTIALS')
    )
    expect(statuses[LOGIN_MAX]).toBe('RATE_LIMITED')
  })

  it('ne bloque pas une autre adresse', async () => {
    for (let i = 0; i < LOGIN_MAX; i++) {
      await checkEmailVerificationStatus({
        email: 'precheck-victime@exemple.fr',
        password: BAD_PASSWORD,
      })
    }

    const other = await checkEmailVerificationStatus({
      email: 'precheck-voisin@exemple.fr',
      password: GOOD_PASSWORD,
    })

    expect(other.status).toBe('VERIFIED')
  })
})

// ============================================================================
// 2. authorize() : la barrière réelle, appelée par NextAuth
// ============================================================================

describe('authorizeCredentials : plafond d échecs (SP-610)', () => {
  it('refuse la tentative suivante une fois le plafond atteint, même avec le bon mot de passe', async () => {
    const email = 'authorize-plafond@exemple.fr'

    for (let i = 0; i < LOGIN_MAX; i++) {
      expect(
        await authorizeCredentials({ email, password: BAD_PASSWORD })
      ).toBeNull()
    }
    mockVerifyPassword.mockClear()
    mockUserFindUnique.mockClear()

    const blocked = await authorizeCredentials({
      email,
      password: GOOD_PASSWORD,
    })

    expect(blocked).toBeNull()
    expect(mockUserFindUnique).not.toHaveBeenCalled()
    expect(mockVerifyPassword).not.toHaveBeenCalled()
  })

  it('plafonne de la même façon une adresse sans compte (pas d énumération)', async () => {
    const email = 'authorize-inconnu@exemple.fr'
    mockUserFindUnique.mockResolvedValue(null)

    for (let i = 0; i < LOGIN_MAX; i++) {
      await authorizeCredentials({ email, password: BAD_PASSWORD })
    }
    mockUserFindUnique.mockClear()

    await authorizeCredentials({ email, password: BAD_PASSWORD })

    // Bloqué avant la lecture en base, comme pour un compte existant
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })

  it('autorise le bon mot de passe juste sous le plafond', async () => {
    const email = 'authorize-sous-plafond@exemple.fr'

    for (let i = 0; i < LOGIN_MAX - 1; i++) {
      await authorizeCredentials({ email, password: BAD_PASSWORD })
    }

    const user = await authorizeCredentials({ email, password: GOOD_PASSWORD })

    expect(user?.email).toBe(email)
  })

  it('une soumission du formulaire ne compte pas double', async () => {
    // Le formulaire appelle le pré-contrôle puis signIn() : LOGIN_MAX - 1
    // soumissions erronées doivent laisser passer la suivante des deux côtés.
    const email = 'deux-points-entree@exemple.fr'

    for (let i = 0; i < LOGIN_MAX - 1; i++) {
      await checkEmailVerificationStatus({ email, password: BAD_PASSWORD })
      await authorizeCredentials({ email, password: BAD_PASSWORD })
    }

    const precheck = await checkEmailVerificationStatus({
      email,
      password: GOOD_PASSWORD,
    })
    const user = await authorizeCredentials({ email, password: GOOD_PASSWORD })

    expect(precheck.status).toBe('VERIFIED')
    expect(user?.email).toBe(email)
  })

  it('plafonne une IP qui essaie beaucoup d adresses différentes', async () => {
    const request = requestFrom({ 'x-real-ip': '203.0.113.7' })

    for (let i = 0; i < LOGIN_IP_MAX; i++) {
      await authorizeCredentials(
        { email: `cible-${i}@exemple.fr`, password: BAD_PASSWORD },
        request
      )
    }

    const blocked = await authorizeCredentials(
      { email: 'cible-neuve@exemple.fr', password: GOOD_PASSWORD },
      request
    )
    const otherIp = await authorizeCredentials(
      { email: 'cible-neuve@exemple.fr', password: GOOD_PASSWORD },
      requestFrom({ 'x-real-ip': '198.51.100.9' })
    )

    expect(blocked).toBeNull()
    expect(otherIp?.email).toBe('cible-neuve@exemple.fr')
  })

  it('un x-forwarded-for inventé ne fait pas changer de quota', async () => {
    for (let i = 0; i < LOGIN_IP_MAX; i++) {
      await authorizeCredentials(
        { email: `usurpe-${i}@exemple.fr`, password: BAD_PASSWORD },
        requestFrom({
          'x-real-ip': '203.0.113.50',
          'x-forwarded-for': `10.0.0.${i}, 203.0.113.50`,
        })
      )
    }

    const blocked = await authorizeCredentials(
      { email: 'usurpe-neuve@exemple.fr', password: GOOD_PASSWORD },
      requestFrom({
        'x-real-ip': '203.0.113.50',
        'x-forwarded-for': '10.9.9.9, 203.0.113.50',
      })
    )

    expect(blocked).toBeNull()
  })
})

describe('connexion : verrouillage ciblé et attaque répartie (SP-610)', () => {
  it('un tiers qui s acharne sur un compte ne bloque pas son titulaire', async () => {
    const email = 'victime@exemple.fr'
    const attacker = requestFrom({ 'x-real-ip': '203.0.113.66' })
    const owner = requestFrom({ 'x-real-ip': '198.51.100.20' })

    // Bien plus d'essais que le plafond large par adresse : une IP bloquée
    // ne doit pas pouvoir le remplir à elle seule
    for (let i = 0; i < LOGIN_EMAIL_MAX + 10; i++) {
      await authorizeCredentials({ email, password: BAD_PASSWORD }, attacker)
    }

    const fromAttacker = await authorizeCredentials(
      { email, password: GOOD_PASSWORD },
      attacker
    )
    const fromOwner = await authorizeCredentials(
      { email, password: GOOD_PASSWORD },
      owner
    )

    // L'attaquant est bloqué, même s'il finit par trouver le mot de passe
    expect(fromAttacker).toBeNull()
    // Le titulaire, depuis une autre IP, se connecte
    expect(fromOwner?.email).toBe(email)
  })

  it('même garantie sur le pré-contrôle du formulaire', async () => {
    const email = 'victime-precheck@exemple.fr'

    mockHeaders.mockResolvedValue(new Headers({ 'x-real-ip': '203.0.113.67' }))
    for (let i = 0; i < LOGIN_EMAIL_MAX + 10; i++) {
      await checkEmailVerificationStatus({ email, password: BAD_PASSWORD })
    }
    const fromAttacker = await checkEmailVerificationStatus({
      email,
      password: GOOD_PASSWORD,
    })

    mockHeaders.mockResolvedValue(new Headers({ 'x-real-ip': '198.51.100.21' }))
    const fromOwner = await checkEmailVerificationStatus({
      email,
      password: GOOD_PASSWORD,
    })

    expect(fromAttacker.status).toBe('RATE_LIMITED')
    expect(fromOwner.status).toBe('VERIFIED')
  })

  it('arrête une attaque répartie sur de nombreuses IP', async () => {
    const email = 'cible-repartie@exemple.fr'

    // Chaque IP reste sous le plafond serré, le total atteint le plafond large
    for (let i = 0; i < LOGIN_EMAIL_MAX; i++) {
      await authorizeCredentials(
        { email, password: BAD_PASSWORD },
        requestFrom({ 'x-real-ip': `203.0.113.${100 + (i % 10)}` })
      )
    }
    mockVerifyPassword.mockClear()

    const fromFreshIp = await authorizeCredentials(
      { email, password: GOOD_PASSWORD },
      requestFrom({ 'x-real-ip': '198.51.100.99' })
    )

    expect(fromFreshIp).toBeNull()
    expect(mockVerifyPassword).not.toHaveBeenCalled()
  })

  it('une rafale simultanée ne compare pas plus de mots de passe que le plafond', async () => {
    const email = 'rafale@exemple.fr'
    const request = requestFrom({ 'x-real-ip': '203.0.113.80' })
    // Comparaison lente, comme bcrypt : toutes les requêtes sont en vol
    // avant que la première ne rende son verdict
    mockVerifyPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(false), 20))
    )

    await Promise.all(
      Array.from({ length: LOGIN_MAX * 3 }, () =>
        authorizeCredentials({ email, password: BAD_PASSWORD }, request)
      )
    )

    expect(mockVerifyPassword).toHaveBeenCalledTimes(LOGIN_MAX)
  })

  it('une réussite ne remet pas à zéro le compteur de l IP', async () => {
    // Une IP qui devine un compte parmi d'autres ne repart pas de zéro
    const request = requestFrom({ 'x-real-ip': '203.0.113.85' })

    for (let i = 0; i < LOGIN_IP_MAX - 1; i++) {
      await authorizeCredentials(
        { email: `devine-${i}@exemple.fr`, password: BAD_PASSWORD },
        request
      )
    }
    await authorizeCredentials(
      { email: 'devine-trouve@exemple.fr', password: GOOD_PASSWORD },
      request
    )
    await authorizeCredentials(
      { email: 'devine-dernier@exemple.fr', password: BAD_PASSWORD },
      request
    )

    const next = await authorizeCredentials(
      { email: 'devine-suivant@exemple.fr', password: GOOD_PASSWORD },
      request
    )

    expect(next).toBeNull()
  })

  it('les connexions réussies ne consomment pas le quota de l IP', async () => {
    // Un bureau entier derrière une même IP : bien plus de connexions que le
    // plafond par IP, toutes correctes
    const request = requestFrom({ 'x-real-ip': '203.0.113.90' })

    const results = []
    for (let i = 0; i < LOGIN_IP_MAX + 10; i++) {
      results.push(
        await authorizeCredentials(
          { email: `collegue-${i}@exemple.fr`, password: GOOD_PASSWORD },
          request
        )
      )
    }

    expect(results.every((user) => user !== null)).toBe(true)
  })
})

describe('getTrustedClientIp (SP-610)', () => {
  it('ne lit que x-real-ip', () => {
    expect(
      getTrustedClientIp(
        new Headers({
          'x-real-ip': ' 203.0.113.7 ',
          'x-forwarded-for': '1.2.3.4',
        })
      )
    ).toBe('203.0.113.7')
  })

  it('renvoie null sans x-real-ip, même avec x-forwarded-for', () => {
    expect(
      getTrustedClientIp(new Headers({ 'x-forwarded-for': '1.2.3.4' }))
    ).toBeNull()
  })
})

// ============================================================================
// 3. Mot de passe oublié : rien ne part au-delà, réponse identique
// ============================================================================

describe('forgotPasswordAction : plafond par adresse et par IP (SP-610)', () => {
  it('n envoie plus rien au-delà du plafond, avec une réponse identique', async () => {
    const email = 'oubli-plafond@exemple.fr'
    const max = AUTH_RATE_LIMITS.forgotPerEmail.maxRequests

    const responses = []
    for (let i = 0; i < max + 2; i++) {
      responses.push(await forgotPasswordAction({ email }))
    }

    expect(mockSendResetPasswordEmail).toHaveBeenCalledTimes(max)
    expect(mockTokenCreate).toHaveBeenCalledTimes(max)
    // La demande refusée est indiscernable de la première
    expect(responses[max]).toEqual(responses[0])
    expect(responses[max + 1]).toEqual({ success: true })
  })

  it('la casse de l adresse ne donne pas un second quota', async () => {
    const max = AUTH_RATE_LIMITS.forgotPerEmail.maxRequests

    for (let i = 0; i < max; i++) {
      await forgotPasswordAction({ email: 'oubli-casse@exemple.fr' })
    }
    await forgotPasswordAction({ email: 'OUBLI-CASSE@exemple.fr' })

    expect(mockSendResetPasswordEmail).toHaveBeenCalledTimes(max)
  })

  it('plafonne une IP qui vise beaucoup d adresses', async () => {
    mockHeaders.mockResolvedValue(new Headers({ 'x-real-ip': '203.0.113.20' }))
    const max = AUTH_RATE_LIMITS.forgotPerIp.maxRequests

    for (let i = 0; i < max + 3; i++) {
      await forgotPasswordAction({ email: `oubli-ip-${i}@exemple.fr` })
    }

    expect(mockSendResetPasswordEmail).toHaveBeenCalledTimes(max)
  })
})

// ============================================================================
// 4. Inscription
// ============================================================================

describe('registerAction : plafond par adresse et par IP (SP-610)', () => {
  const VALID_INPUT = {
    name: 'Camille Martin',
    companyName: 'Boulangerie Martin',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    acceptTerms: true as const,
  }

  beforeEach(() => {
    // Adresse déjà prise : l'action s'arrête juste après le plafond, sans
    // transaction. Seul compte ici le message renvoyé.
    mockUserFindUnique.mockResolvedValue({ id: 'cl000000000000000000user1' })
  })

  it('refuse l inscription au-delà du plafond par adresse', async () => {
    const email = 'inscription-plafond@exemple.fr'
    const max = AUTH_RATE_LIMITS.registerPerEmail.maxRequests

    const results = []
    for (let i = 0; i < max + 1; i++) {
      results.push(await registerAction({ ...VALID_INPUT, email } as any))
    }

    // Sous le plafond : l'action va jusqu'à la recherche du compte
    expect(results[max - 1]).toMatchObject({ success: false, field: 'email' })
    // Au-delà : refus du limiteur, avant toute lecture en base
    expect(results[max]?.success).toBe(false)
    expect((results[max] as { error: string }).error).toMatch(
      /Trop de tentatives/
    )
    expect(mockUserFindUnique).toHaveBeenCalledTimes(max)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('refuse au-delà du plafond par IP, adresses différentes', async () => {
    mockHeaders.mockResolvedValue(new Headers({ 'x-real-ip': '203.0.113.30' }))
    const max = AUTH_RATE_LIMITS.registerPerIp.maxRequests

    let last
    for (let i = 0; i < max + 1; i++) {
      last = await registerAction({
        ...VALID_INPUT,
        email: `inscription-ip-${i}@exemple.fr`,
      } as any)
    }

    expect((last as { error: string }).error).toMatch(/Trop de tentatives/)
    expect(mockUserFindUnique).toHaveBeenCalledTimes(max)
  })
})
