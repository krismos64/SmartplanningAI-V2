/**
 * Tests du parseur de messages de non-remise
 *
 * SP-579 : les cas nominaux reprennent mot pour mot les deux bounces reçus le
 * 31 août 2026 sur contact@smartplanning.fr, pour l'invitation puis pour la
 * notification de planning envoyées à un collaborateur de Sunlight dont
 * l'adresse comportait une typo.
 */

import { describe, it, expect } from 'vitest'

import { parseBounce } from '../parse-bounce'

/** Bounce Gmail réellement reçu, relayé par MailChannels. */
const REAL_BOUNCE = `This is the mail system at host relay.mailchannels.net.

I'm sorry to have to inform you that your message could not
be delivered to one or more recipients. It's attached below.

                  The mail system

<cassybouson@gmail.com>: host gmail-smtp-in.l.google.com[192.178.163.27] said:
   550-5.1.1 The email account that you tried to reach does not exist. Please
   try 550-5.1.1 double-checking the recipient's address for typos or
   550-5.1.1 unnecessary spaces. For more information, go to 550 5.1.1
   https://support.google.com/mail/?p=NoSuchUser
   d9443c01a7336-2d75962dd09si154729955ad.42 - gsmtp (in reply to RCPT TO
   command)
Reporting-MTA: dns; relay.mailchannels.net
X-Postfix-Queue-ID: F09F38C3146
X-Postfix-Sender: rfc822; contact@smartplanning.fr
Arrival-Date: Mon, 31 Aug 2026 00:37:10 +0000 (UTC)

Final-Recipient: rfc822; cassybouson@gmail.com
Original-Recipient: rfc822;cassybouson@gmail.com
Action: failed
Status: 5.1.1
Remote-MTA: dns; gmail-smtp-in.l.google.com
Diagnostic-Code: smtp; 550-5.1.1 The email account that you tried to reach does
   not exist.`

describe('parseBounce (SP-579)', () => {
  it('extrait le destinataire et le statut du bounce Gmail réel', () => {
    const parsed = parseBounce(REAL_BOUNCE)

    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      recipient: 'cassybouson@gmail.com',
      status: '5.1.1',
      kind: 'PERMANENT',
    })
    expect(parsed[0]?.diagnosticCode).toContain('550-5.1.1')
  })

  it('ne compte le destinataire qu une fois malgré Final et Original', () => {
    // Le message réel porte l'adresse sur les deux champs, plus une fois dans
    // le corps cité. Sans dédoublonnage, un bounce produirait trois écritures.
    const parsed = parseBounce(REAL_BOUNCE)
    expect(
      parsed.filter((b) => b.recipient === 'cassybouson@gmail.com')
    ).toHaveLength(1)
  })

  it('classe un statut 4.x.x en refus temporaire', () => {
    const transient = `Final-Recipient: rfc822; plein@example.com
Action: failed
Status: 4.2.2
Diagnostic-Code: smtp; 452 4.2.2 Mailbox full`

    const parsed = parseBounce(transient)

    expect(parsed[0]).toMatchObject({
      recipient: 'plein@example.com',
      status: '4.2.2',
      kind: 'TRANSIENT',
    })
  })

  it('gère plusieurs destinataires avec leurs statuts respectifs', () => {
    const multi = `Final-Recipient: rfc822; un@example.com
Action: failed
Status: 5.1.1

Final-Recipient: rfc822; deux@example.com
Action: failed
Status: 4.2.2`

    const parsed = parseBounce(multi)

    expect(parsed).toHaveLength(2)
    expect(parsed[0]?.kind).toBe('PERMANENT')
    expect(parsed[1]?.kind).toBe('TRANSIENT')
  })

  it('normalise la casse et retire les chevrons', () => {
    const cased = `Final-Recipient: rfc822; <Inconnu@Example.COM>
Status: 5.1.1`

    expect(parseBounce(cased)[0]?.recipient).toBe('inconnu@example.com')
  })

  it('renvoie un tableau vide pour un email ordinaire', () => {
    // La boîte de contact reçoit surtout des messages qui ne sont pas des
    // bounces. Ils ne doivent produire aucune écriture.
    const ordinary = `From: client@example.com
Subject: Question sur votre offre

Bonjour, je souhaite en savoir plus sur vos tarifs.`

    expect(parseBounce(ordinary)).toEqual([])
  })

  it('renvoie un tableau vide sans champ Status exploitable', () => {
    const noStatus = `Final-Recipient: rfc822; inconnu@example.com
Action: failed`

    expect(parseBounce(noStatus)).toEqual([])
  })

  it('ignore un Final-Recipient qui n est pas une adresse', () => {
    const malformed = `Final-Recipient: rfc822; pas-une-adresse
Status: 5.1.1`

    expect(parseBounce(malformed)).toEqual([])
  })

  it('ne lève pas sur une entrée vide', () => {
    expect(parseBounce('')).toEqual([])
  })
})
