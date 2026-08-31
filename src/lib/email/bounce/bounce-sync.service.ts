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
 * 2. **Idempotence.** Les bounces traités portent un mot-clé applicatif, et la
 *    relève écarte les messages qui le portent déjà. Une ligne déjà en
 *    `BOUNCED` n'est jamais réécrite.
 *
 * La relève couvre INBOX, la corbeille et les indésirables : sur la boîte de
 * production, les 9 bounces reçus depuis le 5 août 2026 étaient tous hors
 * d'INBOX.
 */

import { ImapFlow } from 'imapflow'

import { prisma } from '@/lib/prisma'

import { parseBounce, type ParsedBounce } from './parse-bounce'

/**
 * Fenêtre de relève.
 *
 * Le marqueur applicatif suffit à l'idempotence, mais une borne temporelle
 * évite de parcourir un historique entier au premier passage, ou après une
 * longue interruption du cron.
 */
const LOOKBACK_DAYS = 7

/** Nombre maximum de messages analysés par passage, garde-fou mémoire. */
const MAX_MESSAGES_PER_RUN = 200

/**
 * Dossiers relevés, dans l'ordre.
 *
 * INBOX ne suffit pas. Mesure faite sur la boîte de production le 31 août
 * 2026 : les 9 messages de non-remise reçus depuis le 5 août étaient tous dans
 * la corbeille, et aucun dans INBOX. L'un d'eux y était même arrivé sans avoir
 * été lu, donc sans geste humain, ce qui indique un tri automatique côté
 * fournisseur ou client. Une relève limitée à INBOX n'aurait rien vu.
 *
 * Un dossier absent du serveur est ignoré sans faire échouer le passage : la
 * nomenclature varie d'un fournisseur à l'autre.
 */
const MAILBOXES = ['INBOX', 'INBOX.Trash', 'INBOX.Junk'] as const

/**
 * Marqueur posé sur un bounce déjà traité.
 *
 * Un mot-clé applicatif plutôt que `\\Seen` : un bounce peut arriver déjà lu,
 * et l'état « lu » appartient à la personne qui relève la boîte, pas à
 * l'application. Le marquer lu le ferait disparaître de sa vue.
 */
const PROCESSED_FLAG = 'SmartPlanningBounceSynced'

/**
 * Un bounce ne peut mettre à jour qu'une ligne envoyée avant lui, et pas trop
 * ancienne : une adresse corrigée puis réutilisée ne doit pas voir un vieux
 * refus rouvrir un envoi récent et valide.
 */
const MATCH_WINDOW_DAYS = 30

export interface BounceSyncResult {
  /** Messages examinés, tous dossiers confondus */
  examined: number
  /** Messages reconnus comme bounces exploitables */
  bounces: number
  /** Lignes EmailLog basculées en BOUNCED sur ce passage */
  updated: number
  /** Bounces sans ligne correspondante dans le journal */
  unmatched: number
  /** Bounces dont la ligne était déjà en BOUNCED */
  alreadyMarked: number
  /** Dossiers effectivement relevés sur ce passage */
  mailboxes: string[]
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
 * Relève un dossier et rapproche les bounces trouvés du journal.
 *
 * Renvoie `false` quand le dossier n'existe pas sur le serveur, ce qui n'est
 * pas une erreur : la nomenclature varie d'un fournisseur à l'autre.
 */
async function syncMailbox(
  client: ImapFlow,
  mailbox: string,
  result: BounceSyncResult
): Promise<boolean> {
  let lock: { release: () => void }

  try {
    lock = await client.getMailboxLock(mailbox)
  } catch {
    return false
  }

  try {
    const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000)

    // Le filtre porte sur le marqueur applicatif et non sur `\Seen` : un
    // bounce peut arriver déjà lu, notamment en corbeille, et resterait
    // invisible à une relève qui ne regarderait que les non lus.
    const candidates = await client.search(
      { since, unKeyword: PROCESSED_FLAG },
      { uid: true }
    )

    if (!candidates || candidates.length === 0) return true

    const batch = candidates.slice(-MAX_MESSAGES_PER_RUN)
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
          // Message ordinaire : ni marqué ni modifié. Poser un drapeau ici
          // ferait grossir la boîte de marqueurs inutiles, et le relire à
          // chaque passage coûte moins cher que de risquer d'en masquer un.
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
          `${mailbox} uid ${message.uid}: ${error instanceof Error ? error.message : 'erreur inconnue'}`
        )
      }
    }

    // Marquer uniquement les bounces traités : c'est ce qui garantit qu'un
    // second passage ne les recompte pas.
    if (processed.length > 0) {
      await client.messageFlagsAdd(processed, [PROCESSED_FLAG], { uid: true })
    }

    return true
  } finally {
    lock.release()
  }
}

/**
 * Relève les dossiers configurés et rapproche les bounces trouvés du journal.
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
    mailboxes: [],
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
    for (const mailbox of MAILBOXES) {
      try {
        const opened = await syncMailbox(client, mailbox, result)
        if (opened) result.mailboxes.push(mailbox)
      } catch (error) {
        // Un dossier en échec ne doit pas empêcher les suivants d'être relevés.
        result.errors.push(
          `${mailbox}: ${error instanceof Error ? error.message : 'erreur inconnue'}`
        )
      }
    }
  } finally {
    await client.logout()
  }

  return result
}
