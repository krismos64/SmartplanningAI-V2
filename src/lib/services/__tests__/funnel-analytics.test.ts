/**
 * Tests de l'emission serveur du tunnel de conversion
 *
 * @description SP-591. Deux proprietes comptent ici, et aucune des deux ne se
 * verifie en lisant le code :
 *
 * 1. Les jalons de « premiere fois » ne se declenchent qu'une fois. Emettre a
 *    chaque creation d'equipe noierait l'etape 4 sous l'usage courant, et le
 *    tunnel ne mesurerait plus l'activation.
 * 2. Aucune donnee personnelle ne sort. C'est la condition qui rend ce chemin
 *    serveur licite sans consentement cookies : ni identifiant d'entreprise,
 *    ni email, ni identifiant utilisateur ne doivent figurer dans la charge
 *    envoyee a Umami.
 *
 * @ticket SP-591
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    team: { count: vi.fn() },
    employee: { count: vi.fn() },
    schedule: { count: vi.fn() },
    company: { findUnique: vi.fn() },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

// L'emission est coupee hors production : on la force pour les tests, sinon
// trackFunnelStep sortirait avant tout appel reseau.
vi.mock('../funnel-analytics.config', () => ({
  UMAMI_SERVER_CONFIG: {
    websiteId: 'test-website-id',
    sendUrl: 'https://analytics.exemple.fr/api/send',
    hostname: 'smartplanning.fr',
    enabled: true,
  },
}))

import {
  trackFunnelStep,
  accountAgeInDays,
  toSizeBucket,
  FUNNEL_STEPS,
} from '../funnel-analytics.service'
import {
  trackFirstTeamIfApplicable,
  trackFirstEmployeeIfApplicable,
  trackFirstScheduleIfApplicable,
} from '../funnel-milestones.service'

const COMPANY_ID = 'cl00000000000000000comp1'

/** Forme de la charge envoyee a Umami, telle que le service la construit. */
interface UmamiPayload {
  type: string
  payload: {
    website: string
    hostname: string
    url: string
    name: string
    data: Record<string, string | number | boolean>
  }
}

/** Recupere le corps JSON du dernier POST simule vers Umami. */
function lastPayload(fetchMock: ReturnType<typeof vi.fn>): UmamiPayload {
  const call = fetchMock.mock.calls.at(-1)
  if (!call) throw new Error('aucun appel fetch enregistre')
  const body = (call[1] as RequestInit).body
  if (typeof body !== 'string') {
    throw new Error('le corps de la requete devrait etre une chaine JSON')
  }
  return JSON.parse(body) as UmamiPayload
}

describe('trackFunnelStep', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn(() => Promise.resolve(new Response('{}', { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('poste sur /api/send avec le website id et le nom de l\'etape', async () => {
    await trackFunnelStep('funnel-first-team')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://analytics.exemple.fr/api/send')
    expect(init.method).toBe('POST')

    const body = lastPayload(fetchMock)
    expect(body.type).toBe('event')
    expect(body.payload.website).toBe('test-website-id')
    expect(body.payload.name).toBe('funnel-first-team')
  })

  it('envoie un User-Agent que le parseur d\'Umami accepte', async () => {
    // Ce test a d'abord verifie qu'un User-Agent « existe », et il passait au
    // vert pendant que la production perdait tous ses evenements : avec
    // « SmartPlanning-Server/1.0 », Umami repond HTTP 200 et
    // `{"beep":"boop"}`, sans rien enregistrer.
    //
    // Mesure du 9 septembre 2026 contre l'instance de production : seule une
    // chaine de navigateur obtient une reponse porteuse de sessionId et
    // visitId, qui est la marque d'un evenement accepte. L'assertion porte
    // donc sur la forme, et non sur la simple presence.
    await trackFunnelStep('funnel-first-team')

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    const ua = headers['User-Agent'] ?? ''

    expect(ua).toMatch(/^Mozilla\/5\.0/)
    expect(ua).toMatch(/AppleWebKit|Gecko|Chrome|Safari|Firefox/)
  })

  it('joint le rang de l\'etape, les evenements Umami n\'etant pas ordonnes', async () => {
    await trackFunnelStep('funnel-subscription-confirmed')

    const body = lastPayload(fetchMock)
    expect(body.payload.data.stepRank).toBe(9)
    expect(body.payload.data.source).toBe('server')
  })

  it('ne leve pas quand Umami est injoignable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Une panne d'analytics ne doit pas faire echouer la creation d'equipe ni
    // le traitement d'un paiement.
    await expect(trackFunnelStep('funnel-first-team')).resolves.toBeUndefined()
  })

  it('ne leve pas quand Umami repond une erreur HTTP', async () => {
    fetchMock.mockResolvedValueOnce(new Response('nope', { status: 500 }))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(trackFunnelStep('funnel-first-team')).resolves.toBeUndefined()
  })

  it("n'emet aucune donnee personnelle", async () => {
    await trackFunnelStep('funnel-first-employee', {
      accountAgeDays: 3,
      method: 'import',
      sizeBucket: '6-20',
    })

    const serialized = JSON.stringify(lastPayload(fetchMock))
    // Ni identifiant d'entreprise, ni email, ni identifiant utilisateur.
    expect(serialized).not.toContain(COMPANY_ID)
    expect(serialized).not.toMatch(/@/)
    expect(serialized).not.toMatch(/\bcl[a-z0-9]{20,}\b/)
  })
})

describe('jalons de premiere fois', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn(() => Promise.resolve(new Response('{}', { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)
    prismaMock.company.findUnique.mockResolvedValue({
      createdAt: new Date(Date.now() - 3 * 86_400_000),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('emet funnel-first-team a la premiere equipe', async () => {
    prismaMock.team.count.mockResolvedValue(1)

    await trackFirstTeamIfApplicable(COMPANY_ID)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(lastPayload(fetchMock).payload.name).toBe('funnel-first-team')
  })

  it("n'emet rien a la deuxieme equipe", async () => {
    prismaMock.team.count.mockResolvedValue(2)

    await trackFirstTeamIfApplicable(COMPANY_ID)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("n'emet rien a la quarantieme equipe", async () => {
    prismaMock.team.count.mockResolvedValue(40)

    await trackFirstTeamIfApplicable(COMPANY_ID)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('traite un import en lot comme une seule premiere fois', async () => {
    // 12 collaborateurs importes d'un coup, aucun avant : c'est bien la
    // premiere fois, malgre un total de 12 et non de 1.
    prismaMock.employee.count.mockResolvedValue(12)

    await trackFirstEmployeeIfApplicable(COMPANY_ID, 'import', 12)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const body = lastPayload(fetchMock)
    expect(body.payload.name).toBe('funnel-first-employee')
    expect(body.payload.data.method).toBe('import')
    // La taille est une tranche, jamais un effectif exact.
    expect(body.payload.data.sizeBucket).toBe('6-20')
  })

  it("n'emet rien si l'entreprise avait deja des collaborateurs", async () => {
    // 15 en base, 3 crees : il y en avait 12 avant, ce n'est pas une premiere.
    prismaMock.employee.count.mockResolvedValue(15)

    await trackFirstEmployeeIfApplicable(COMPANY_ID, 'import', 3)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('traite un premier lot de plannings comme une premiere fois', async () => {
    // createSchedule cree plusieurs plannings en une transaction.
    prismaMock.schedule.count.mockResolvedValue(5)

    await trackFirstScheduleIfApplicable(COMPANY_ID, 5)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(lastPayload(fetchMock).payload.name).toBe('funnel-first-schedule')
  })

  it('ne leve pas si la base est indisponible', async () => {
    prismaMock.team.count.mockRejectedValue(new Error('connexion perdue'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      trackFirstTeamIfApplicable(COMPANY_ID)
    ).resolves.toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('helpers', () => {
  it('range les effectifs en tranches', () => {
    expect(toSizeBucket(1)).toBe('1-5')
    expect(toSizeBucket(5)).toBe('1-5')
    expect(toSizeBucket(6)).toBe('6-20')
    expect(toSizeBucket(50)).toBe('21-50')
    expect(toSizeBucket(51)).toBe('50+')
  })

  it('compte une anciennete en jours entiers', () => {
    const now = new Date('2026-09-09T12:00:00Z')
    expect(accountAgeInDays(new Date('2026-09-09T00:00:00Z'), now)).toBe(0)
    expect(accountAgeInDays(new Date('2026-09-06T12:00:00Z'), now)).toBe(3)
  })

  it('ne renvoie jamais une anciennete negative', () => {
    const now = new Date('2026-09-09T12:00:00Z')
    // Horloge decalee, ou date de creation dans le futur.
    expect(accountAgeInDays(new Date('2026-09-10T00:00:00Z'), now)).toBe(0)
  })

  it('numerote les neuf etapes dans l\'ordre du tunnel', () => {
    const ranks = Object.values(FUNNEL_STEPS)
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})
