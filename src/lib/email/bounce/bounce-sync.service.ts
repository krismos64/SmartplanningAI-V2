/**
 * Rapprochement des bounces avec le journal EmailLog
 *
 * SP-579, lot 2. Relève la boîte d'expédition en IMAP, identifie les messages
 * de non-remise et bascule en `BOUNCED` la ligne `EmailLog` correspondante.
 *
 * Pourquoi IMAP plutôt qu'un webhook : le SMTP de production est
 * `smtp.hostinger.com`, un service mutualisé qui n'expose aucune API
 * d'événements de délivrabilité. MailChannels n'apparaît dans les messages que
 * comme relais sortant d'Hostinger, sans compte de notre côté.
 *
 * Deux garde-fous portent la correction :
 *
 * 1. **Isolation.** La boîte est commune à toutes les entreprises. Le
 *    rapprochement se fait sur `recipientEmail`, jamais sur un identifiant
 *    fourni par le message : une ligne d'une entreprise ne peut donc être
 *    modifiée qu'à partir d'un bounce portant l'adresse qu'elle a réellement
 *    reçue.
 * 2. **Idempotence.** Les messages traités sont marqués `\Seen` et la relève
 *    ne lit que les non lus. Une ligne déjà en `BOUNCED` n'est pas réécrite.
 */

import { ImapFlow } from 'imapflow'

import { prisma } from '@/lib/prisma'

import { parseBounce, type ParsedBounce } from './parse-bounce'

/**
 * Fenêtre de relève.
 *
 * Le filtre `unseen` suffit à l'idempotence, mais une borne temporelle évite de
 * parcourir un historique entier au premier passage, ou après une longue
 * interruption du cron.
 */
const LOOKBACK_DAYS = 7

/** Nombre maximum de messages analysés par passage, garde-fou mémoire. */
const MAX_MESSAGES_PER_RUN = 200

/**
 * Un bounce ne peut mettre à jour qu'une ligne envoyée avant lui, et pas trop
 * ancienne : une adresse corrigée puis réutilisée ne doit pas voir un vieux
 * refus rouvrir un envoi récent et valide.
 */
const MATCH_WINDOW_DAYS = 30

export interface BounceSyncResult {
  /** Messages non lus examinés */
  examined: number
  /** Messages reconnus comme bounces exploitables */
  bounces: number
  /** Lignes EmailLog basculées en BOUNCED sur ce passage */
  updated: number
  /** Bounces sans ligne correspondante dans le journal */
  unmatched: number
  /** Bounces dont la ligne était déjà en BOUNCED */
  alreadyMarked: number
  /** Anomalies rencontrées, sans interrompre le passage */
  errors: string[]
}

export interface ImapCredentials {
  host: string
  port: number
  user: string
  pass: string
}

/**
 * Lit la configuration IMAP depuis l'environnement.
 *
 * Renvoie `null` quand elle est absente, ce qui rend la relève inopérante sans
 * la faire échouer : l'environnement de développement n'a pas de boîte.
 */
export function getImapCredentials(): ImapCredentials | null {
  const host = process.env.IMAP_HOST
  const user = process.env.IMAP_USER
  const pass = process.env.IMAP_PASSWORD

  if (!host || !user || !pass) return null

  return {
    host,
    port: parseInt(process.env.IMAP_PORT || '993', 10),
    user,
    pass,
  }
}

/**
 * Bascule en `BOUNCED` la ligne `EmailLog` correspondant à un bounce.
 *
 * Le rapprochement retient l'envoi le plus récent vers cette adresse, dans la
 * fenêtre autorisée et antérieur au bounce lui-même.
 */
async function applyBounce(
  bounce: ParsedBounce,
  receivedAt: Date,
  result: BounceSyncResult
): Promise<void> {
  const windowStart = new Date(
    receivedAt.getTime() - MATCH_WINDOW_DAYS * 86_400_000
  )

  const candidate = await prisma.emailLog.findFirst({
    where: {
      recipientEmail: bounce.recipient,
      sentAt: { gte: windowStart, lte: receivedAt },
    },
    orderBy: { sentAt: 'desc' },
    select: { id: true, status: true },
  })

  if (!candidate) {
    // Cas normal tant que tous les emails ne sont pas journalisés : un bounce
    // peut porter sur un envoi dont aucune ligne n'existe.
    result.unmatched++
    return
  }

  if (candidate.status === 'BOUNCED') {
    result.alreadyMarked++
    return
  }

  await prisma.emailLog.update({
    where: { id: candidate.id },
    data: {
      status: 'BOUNCED',
      metadata: {
        bounce: {
          status: bounce.status,
          kind: bounce.kind,
          ...(bounce.diagnosticCode
            ? { diagnosticCode: bounce.diagnosticCode }
            : {}),
          detectedAt: receivedAt.toISOString(),
        },
      },
    },
  })

  result.updated++
}

/**
 * Relève la boîte et rapproche les bounces trouvés du journal.
 *
 * Ne lève pas sur un message isolé : une anomalie de parsing ou une écriture
 * refusée est consignée dans `errors` et le passage se poursuit, pour qu'un
 * message malformé ne bloque pas la relève entière.
 */
export async function syncBounces(
  credentials: ImapCredentials
): Promise<BounceSyncResult> {
  const result: BounceSyncResult = {
    examined: 0,
    bounces: 0,
    updated: 0,
    unmatched: 0,
    alreadyMarked: 0,
    errors: [],
  }

  const client = new ImapFlow({
    host: credentials.host,
    port: credentials.port,
    secure: true,
    auth: { user: credentials.user, pass: credentials.pass },
    // La bibliothèque journalise chaque commande IMAP par défaut, ce qui
    // ferait fuiter le contenu des messages dans les logs applicatifs.
    logger: false,
  })

  await client.connect()

  try {
    const lock = await client.getMailboxLock('INBOX')

    try {
      const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000)
      // `seen: false` est la forme typée de « non lus » chez ImapFlow.
      const uids = await client.search({ seen: false, since }, { uid: true })

      if (!uids || uids.length === 0) {
        return result
      }

      const batch = uids.slice(-MAX_MESSAGES_PER_RUN)
      const processed: number[] = []

      for await (const message of client.fetch(
        batch,
        { source: true, envelope: true },
        { uid: true }
      )) {
        result.examined++

        try {
          const source = message.source?.toString() ?? ''
          const bounces = parseBounce(source)

          if (bounces.length === 0) {
            // Message ordinaire : laissé non lu pour ne pas masquer un
            // courrier que personne n'aurait encore vu.
            continue
          }

          const receivedAt = message.envelope?.date ?? new Date()

          for (const bounce of bounces) {
            result.bounces++
            await applyBounce(bounce, receivedAt, result)
          }

          processed.push(message.uid)
        } catch (error) {
          result.errors.push(
            `uid ${message.uid}: ${error instanceof Error ? error.message : 'erreur inconnue'}`
          )
        }
      }

      // Marquer lus uniquement les bounces traités : c'est ce qui garantit
      // qu'un second passage ne les recompte pas.
      if (processed.length > 0) {
        await client.messageFlagsAdd(processed, ['\\Seen'], { uid: true })
      }
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
  }

  return result
}
