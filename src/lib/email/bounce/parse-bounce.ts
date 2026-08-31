/**
 * Analyse des messages de non-remise (bounces) au format DSN
 *
 * SP-579, lot 2. Un bounce asynchrone arrive après que le relais a accepté le
 * message : le serveur du destinataire se prononce plus tard, et son refus
 * revient sous forme d'email sur la boîte d'expédition. Le lot 1 ne pouvait pas
 * le voir, `sendMail` ayant déjà rendu la main sur un succès.
 *
 * Le format est normalisé par la RFC 3464 (Delivery Status Notification), donc
 * l'extraction se fait par champs et non par heuristique sur le texte. Les
 * bounces reçus de Gmail via MailChannels portent exactement :
 *
 *   Final-Recipient: rfc822; destinataire@example.com
 *   Action: failed
 *   Status: 5.1.1
 *   Diagnostic-Code: smtp; 550-5.1.1 The email account that you tried to reach…
 *
 * Aucune dépendance : le découpage MIME complet n'apporterait rien ici, les
 * champs recherchés vivant en clair dans le corps du message.
 */

/** Nature du refus, déduite de la classe du code `Status`. */
export type BounceKind =
  /**
   * Refus définitif (5.x.x) : l'adresse n'existe pas ou est bloquée.
   * Réémettre vers la même adresse échouera de nouveau.
   */
  | 'PERMANENT'
  /**
   * Refus temporaire (4.x.x) : boîte pleine, serveur indisponible.
   * L'adresse reste potentiellement valide.
   */
  | 'TRANSIENT'

export interface ParsedBounce {
  /** Adresse ayant refusé le message, en minuscules */
  recipient: string
  /** Code d'état RFC 3463, par exemple « 5.1.1 » */
  status: string
  /** Permanent ou temporaire, selon la classe du code */
  kind: BounceKind
  /** Diagnostic SMTP brut, conservé pour l'affichage et le diagnostic */
  diagnosticCode?: string
}

/**
 * Adresse d'un `Final-Recipient` ou `Original-Recipient`.
 *
 * Le champ porte un type d'adresse suivi d'un point-virgule, presque toujours
 * `rfc822`. La valeur peut être encadrée de chevrons.
 */
const RECIPIENT_PATTERN = /^(?:Final|Original)-Recipient:\s*[^;]+;\s*(.+)$/gim

/** Code d'état RFC 3463, `4.x.x` ou `5.x.x`. */
const STATUS_PATTERN = /^Status:\s*([245]\.\d{1,3}\.\d{1,3})\s*$/gim

/** Diagnostic SMTP, dont la valeur peut se poursuivre sur les lignes suivantes. */
const DIAGNOSTIC_PATTERN = /^Diagnostic-Code:\s*[^;]+;\s*(.+)$/im

/**
 * Retire les chevrons et espaces autour d'une adresse.
 */
function cleanAddress(raw: string): string {
  return raw.trim().replace(/^<|>$/g, '').trim().toLowerCase()
}

/**
 * Vérifie qu'une chaîne ressemble à une adresse email exploitable.
 *
 * Volontairement permissif : le but est d'écarter le bruit de parsing, pas de
 * valider une adresse que le serveur distant a de toute façon déjà jugée.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Extrait les destinataires refusés d'un message de non-remise.
 *
 * Renvoie un tableau vide quand le message n'est pas un bounce exploitable,
 * ce qui est le cas courant : la boîte de contact reçoit surtout des messages
 * ordinaires.
 *
 * Un même message peut porter plusieurs destinataires, chacun avec son propre
 * `Status`. Les blocs sont appariés dans l'ordre d'apparition, conformément à
 * la structure du rapport DSN.
 */
export function parseBounce(source: string): ParsedBounce[] {
  if (!source) return []

  const recipients = [...source.matchAll(RECIPIENT_PATTERN)]
    .map((match) => cleanAddress(match[1] ?? ''))
    .filter(looksLikeEmail)

  if (recipients.length === 0) return []

  const statuses = [...source.matchAll(STATUS_PATTERN)].map(
    (match) => match[1] ?? ''
  )

  const diagnostic = DIAGNOSTIC_PATTERN.exec(source)?.[1]?.trim()

  // Dédoublonnage : `Final-Recipient` et `Original-Recipient` portent souvent
  // la même adresse, et le message d'origine est fréquemment cité en pièce
  // jointe, ce qui la fait apparaître une troisième fois.
  const seen = new Set<string>()
  const parsed: ParsedBounce[] = []

  recipients.forEach((recipient, index) => {
    if (seen.has(recipient)) return
    seen.add(recipient)

    // Quand un seul statut est présent pour plusieurs destinataires, il
    // s'applique à tous : c'est la forme des rapports mono-cause.
    const status = statuses[index] ?? statuses[0]
    if (!status) return

    parsed.push({
      recipient,
      status,
      kind: status.startsWith('5') ? 'PERMANENT' : 'TRANSIENT',
      ...(diagnostic ? { diagnosticCode: diagnostic } : {}),
    })
  })

  return parsed
}
