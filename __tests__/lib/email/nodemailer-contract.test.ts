/**
 * Contrat de Nodemailer, sans mock (SP-596)
 *
 * `sendEmail` distingue un envoi accepté d'une adresse refusée (SP-579) en
 * lisant trois choses que Nodemailer fournit : `info.rejected` sur un retour
 * normal, et, quand tous les destinataires sont refusés, une erreur de code
 * `EENVELOPE` portant `err.rejected`. La version 8 a « centralisé les codes
 * d'erreur », et le passage de la 7 à la 10 ne doit pas casser ce contrat
 * sans que rien ne rougisse : les tests de `send.test.ts` mockent le
 * transporteur et ne le verraient pas.
 *
 * Le test ouvre un vrai serveur SMTP minimal sur la boucle locale, qui
 * accepte une adresse et refuse l'autre en 550, et fait passer `sendEmail`
 * par le transporteur réel.
 *
 * @ticket SP-596
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import net from 'node:net'
import type { AddressInfo } from 'node:net'

const REFUSED = 'refuse@exemple.test'
const ACCEPTED = 'accepte@exemple.test'

/** Serveur SMTP réduit au dialogue d'un envoi authentifié. */
function startFakeSmtp(): Promise<net.Server> {
  const server = net.createServer((socket) => {
    let inData = false
    let buffer = ''
    socket.write('220 faux-smtp ESMTP\r\n')
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
      let index: number
      while ((index = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, index)
        buffer = buffer.slice(index + 2)
        if (inData) {
          if (line === '.') {
            inData = false
            socket.write('250 2.0.0 Ok: queued as FAUX123\r\n')
          }
          continue
        }
        const verb = line.slice(0, 4).toUpperCase()
        if (verb === 'EHLO') {
          socket.write('250-faux-smtp\r\n250 AUTH PLAIN LOGIN\r\n')
        } else if (verb === 'HELO') {
          socket.write('250 faux-smtp\r\n')
        } else if (verb === 'AUTH') {
          socket.write('235 2.7.0 Authentication successful\r\n')
        } else if (verb === 'MAIL') {
          socket.write('250 2.1.0 Ok\r\n')
        } else if (verb === 'RCPT') {
          socket.write(
            line.includes(REFUSED)
              ? '550 5.1.1 <refuse@exemple.test>: Recipient address rejected\r\n'
              : '250 2.1.5 Ok\r\n'
          )
        } else if (verb === 'DATA') {
          inData = true
          socket.write('354 End data with <CR><LF>.<CR><LF>\r\n')
        } else if (verb === 'RSET' || verb === 'NOOP') {
          socket.write('250 2.0.0 Ok\r\n')
        } else if (verb === 'QUIT') {
          socket.end('221 2.0.0 Bye\r\n')
        } else {
          socket.write('502 5.5.2 Error: command not recognized\r\n')
        }
      }
    })
    socket.on('error', () => {})
  })
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(server))
  )
}

let server: net.Server
let sendEmail: typeof import('@/lib/email/send').sendEmail
let closeTransporter: typeof import('@/lib/email/transporter').closeTransporter

beforeAll(async () => {
  server = await startFakeSmtp()
  const { port } = server.address() as AddressInfo
  process.env.SMTP_HOST = '127.0.0.1'
  process.env.SMTP_PORT = String(port)
  process.env.SMTP_USER = 'test@exemple.test'
  process.env.SMTP_PASSWORD = 'mot-de-passe-de-test'
  process.env.SMTP_FROM = 'SmartPlanning <test@exemple.test>'
  ;({ sendEmail } = await import('@/lib/email/send'))
  ;({ closeTransporter } = await import('@/lib/email/transporter'))
})

afterAll(async () => {
  closeTransporter()
  await new Promise((resolve) => server.close(resolve))
})

const message = (to: string) => ({
  to,
  subject: 'Contrat Nodemailer',
  html: '<p>Bonjour</p>',
})

describe('SP-596, contrat de Nodemailer avec sendEmail', () => {
  it('un destinataire accepté ressort en SENT', async () => {
    const result = await sendEmail(message(ACCEPTED))

    expect(result.success).toBe(true)
    expect(result.outcome).toBe('SENT')
  })

  it('un destinataire refusé ressort en BOUNCED, avec son adresse', async () => {
    const result = await sendEmail(message(REFUSED))

    // FAILED signifierait que EENVELOPE ou err.rejected a changé de forme :
    // l'adresse serait retentée trois fois et jamais marquée invalide
    expect(result.success).toBe(false)
    expect(result.outcome).toBe('BOUNCED')
    expect(result.rejected).toEqual([REFUSED])
  })
})
