/**
 * Tests du rapprochement des bounces avec EmailLog
 *
 * SP-579, lot 2. La boîte relevée est commune à toutes les entreprises, ce qui
 * en fait un point d'isolation : un bounce ne doit pouvoir modifier que la
 * ligne de l'entreprise ayant réellement écrit à cette adresse.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFindFirst, mockUpdate, mockImapFlow, imapState } = vi.hoisted(
  () => {
    const imapState = {
      searchResult: [] as number[],
      messages: [] as any[],
      flagsAdded: [] as unknown[][],
      loggedOut: false,
      lockReleased: false,
    }

    const mockImapFlow = vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      getMailboxLock: vi.fn().mockResolvedValue({
        release: () => {
          imapState.lockReleased = true
        },
      }),
      search: vi
        .fn()
        .mockImplementation(() => Promise.resolve(imapState.searchResult)),
      fetch: vi.fn().mockImplementation(function* () {
        for (const message of imapState.messages) {
          yield message
        }
      }),
      messageFlagsAdd: vi.fn().mockImplementation((range: unknown[]) => {
        imapState.flagsAdded.push(range)
        return Promise.resolve(true)
      }),
      logout: vi.fn().mockImplementation(() => {
        imapState.loggedOut = true
        return Promise.resolve()
      }),
    }))

    return {
      mockFindFirst: vi.fn(),
      mockUpdate: vi.fn(),
      mockImapFlow,
      imapState,
    }
  }
)

vi.mock('imapflow', () => ({
  ImapFlow: mockImapFlow,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    emailLog: {
      findFirst: (...args: any[]) => mockFindFirst(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}))

import { syncBounces, getImapCredentials } from '../bounce-sync.service'

const CREDENTIALS = {
  host: 'imap.test.com',
  port: 993,
  user: 'contact@smartplanning.fr',
  pass: 'secret',
}

const BOUNCE_SOURCE = `Final-Recipient: rfc822; inconnu@gmail.com
Action: failed
Status: 5.1.1
Diagnostic-Code: smtp; 550-5.1.1 No Such User`

/** Forme du `where` passé à findFirst, pour des assertions typées. */
interface FindFirstWhere {
  recipientEmail?: string
  sentAt?: { gte: Date; lte: Date }
}

/** Lit le `where` du premier appel à findFirst. */
function whereOfFirstCall(): FindFirstWhere {
  return (
    mockFindFirst.mock.calls[0]?.[0] as { where: FindFirstWhere } | undefined
  )?.where as FindFirstWhere
}

const makeMessage = (
  uid: number,
  source: string,
  date = new Date('2026-08-31T00:37:00Z')
) => ({
  uid,
  source: Buffer.from(source),
  envelope: { date },
})

describe('syncBounces (SP-579)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    imapState.searchResult = []
    imapState.messages = []
    imapState.flagsAdded = []
    imapState.loggedOut = false
    imapState.lockReleased = false
    mockUpdate.mockResolvedValue({ id: 'log_1' })
  })

  it('bascule en BOUNCED la ligne correspondant au destinataire', async () => {
    imapState.searchResult = [42]
    imapState.messages = [makeMessage(42, BOUNCE_SOURCE)]
    mockFindFirst.mockResolvedValue({ id: 'log_1', status: 'SENT' })

    const result = await syncBounces(CREDENTIALS)

    expect(result.bounces).toBe(1)
    expect(result.updated).toBe(1)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'log_1' },
        data: expect.objectContaining({ status: 'BOUNCED' }),
      })
    )
  })

  it('rapproche uniquement sur recipientEmail, jamais sur un identifiant du message', async () => {
    // Test négatif d'isolation : la boîte est cross-tenant. Si le rapprochement
    // acceptait un identifiant porté par le message, un bounce forgé pourrait
    // désigner la ligne d'une autre entreprise.
    imapState.searchResult = [42]
    imapState.messages = [
      makeMessage(
        42,
        `X-Company-Id: entreprise-etrangere
X-EmailLog-Id: log_d_une_autre_entreprise
Final-Recipient: rfc822; inconnu@gmail.com
Status: 5.1.1`
      ),
    ]
    mockFindFirst.mockResolvedValue({ id: 'log_1', status: 'SENT' })

    await syncBounces(CREDENTIALS)

    const where = whereOfFirstCall()
    expect(where.recipientEmail).toBe('inconnu@gmail.com')
    // Aucun critere issu du message ne doit entrer dans la requete
    expect(JSON.stringify(where)).not.toContain('entreprise-etrangere')
    expect(JSON.stringify(where)).not.toContain('log_d_une_autre_entreprise')
    // Et c'est bien la ligne trouvee par adresse qui est mise a jour
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'log_1' } })
    )
  })

  it('ne réécrit pas une ligne déjà marquée BOUNCED (idempotence)', async () => {
    imapState.searchResult = [42]
    imapState.messages = [makeMessage(42, BOUNCE_SOURCE)]
    mockFindFirst.mockResolvedValue({ id: 'log_1', status: 'BOUNCED' })

    const result = await syncBounces(CREDENTIALS)

    expect(result.alreadyMarked).toBe(1)
    expect(result.updated).toBe(0)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('compte un bounce sans ligne correspondante sans échouer', async () => {
    imapState.searchResult = [42]
    imapState.messages = [makeMessage(42, BOUNCE_SOURCE)]
    mockFindFirst.mockResolvedValue(null)

    const result = await syncBounces(CREDENTIALS)

    expect(result.unmatched).toBe(1)
    expect(result.updated).toBe(0)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('laisse un email ordinaire non lu et ne touche à rien', async () => {
    // Marquer lu un message ordinaire le masquerait à la personne qui relève
    // réellement la boîte de contact.
    imapState.searchResult = [42]
    imapState.messages = [
      makeMessage(42, 'From: client@example.com\n\nBonjour, une question.'),
    ]

    const result = await syncBounces(CREDENTIALS)

    expect(result.examined).toBe(1)
    expect(result.bounces).toBe(0)
    expect(mockFindFirst).not.toHaveBeenCalled()
    expect(imapState.flagsAdded).toEqual([])
  })

  it('marque lus les bounces traités, pour ne pas les recompter', async () => {
    imapState.searchResult = [42, 43]
    imapState.messages = [
      makeMessage(42, BOUNCE_SOURCE),
      makeMessage(43, 'From: client@example.com\n\nMessage ordinaire.'),
    ]
    mockFindFirst.mockResolvedValue({ id: 'log_1', status: 'SENT' })

    await syncBounces(CREDENTIALS)

    // Seul le bounce est marque lu, pas le message ordinaire
    expect(imapState.flagsAdded).toEqual([[42]])
  })

  it('borne la recherche dans le temps et antérieurement au bounce', async () => {
    const receivedAt = new Date('2026-08-31T00:37:00Z')
    imapState.searchResult = [42]
    imapState.messages = [makeMessage(42, BOUNCE_SOURCE, receivedAt)]
    mockFindFirst.mockResolvedValue({ id: 'log_1', status: 'SENT' })

    await syncBounces(CREDENTIALS)

    const where = whereOfFirstCall()
    // Un envoi postérieur au bounce ne peut pas en être la cause
    expect(where.sentAt?.lte).toEqual(receivedAt)
    expect(where.sentAt?.gte.getTime()).toBeLessThan(receivedAt.getTime())
  })

  it('poursuit le passage malgré une écriture en échec', async () => {
    imapState.searchResult = [42]
    imapState.messages = [makeMessage(42, BOUNCE_SOURCE)]
    mockFindFirst.mockResolvedValue({ id: 'log_1', status: 'SENT' })
    mockUpdate.mockRejectedValue(new Error('DB down'))

    const result = await syncBounces(CREDENTIALS)

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('DB down')
    // La connexion doit être refermée proprement malgré l'erreur
    expect(imapState.loggedOut).toBe(true)
    expect(imapState.lockReleased).toBe(true)
  })

  it('libère le verrou et se déconnecte quand la boîte est vide', async () => {
    imapState.searchResult = []

    const result = await syncBounces(CREDENTIALS)

    expect(result.examined).toBe(0)
    expect(imapState.lockReleased).toBe(true)
    expect(imapState.loggedOut).toBe(true)
  })

  it('désactive le logger IMAP, qui ferait fuiter le contenu des messages', async () => {
    imapState.searchResult = []

    await syncBounces(CREDENTIALS)

    expect(mockImapFlow).toHaveBeenCalledWith(
      expect.objectContaining({ logger: false, secure: true })
    )
  })
})

describe('getImapCredentials (SP-579)', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  it('renvoie null quand la configuration est absente', () => {
    delete process.env.IMAP_HOST
    delete process.env.IMAP_USER
    delete process.env.IMAP_PASSWORD

    expect(getImapCredentials()).toBeNull()
  })

  it('renvoie null si un seul champ manque', () => {
    process.env.IMAP_HOST = 'imap.test.com'
    process.env.IMAP_USER = 'contact@test.com'
    delete process.env.IMAP_PASSWORD

    expect(getImapCredentials()).toBeNull()
  })

  it('applique le port 993 par défaut', () => {
    process.env.IMAP_HOST = 'imap.test.com'
    process.env.IMAP_USER = 'contact@test.com'
    process.env.IMAP_PASSWORD = 'secret'
    delete process.env.IMAP_PORT

    expect(getImapCredentials()).toMatchObject({ port: 993 })
  })
})
