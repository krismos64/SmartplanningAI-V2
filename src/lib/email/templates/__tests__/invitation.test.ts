/**
 * Tests de l'envoi d'invitation et de sa journalisation
 *
 * SP-579 : `sendInvitationEmail` n'appelait pas `logAuthEmail`, donc aucune
 * invitation n'apparaissait dans EmailLog. Chez Sunlight, l'invitation qui a
 * rebondi chez Gmail était absente du journal censé servir au diagnostic de
 * délivrabilité, alors que les deux emails du dirigeant y figuraient.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSendEmail, mockLogAuthEmail, mockRender } = vi.hoisted(() => ({
  mockSendEmail: vi.fn(),
  mockLogAuthEmail: vi.fn(),
  mockRender: vi.fn(),
}))

vi.mock('@/lib/email', () => ({
  sendEmail: (...args: any[]) => mockSendEmail(...args),
}))

vi.mock('@/lib/email/auth/log-auth-email', () => ({
  logAuthEmail: (...args: any[]) => mockLogAuthEmail(...args),
  AuthEmailType: {
    WELCOME: 'WELCOME',
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    INVITATION: 'INVITATION',
  },
}))

// Mock partiel : le composant InvitationEmail utilise d'autres exports de la
// librairie (Text, Section...), qu'un mock total ferait disparaitre.
vi.mock('@react-email/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@react-email/components')>()),
  render: (...args: any[]) => mockRender(...args),
}))

import { sendInvitationEmail } from '../invitation'

const baseParams = {
  firstName: 'Cassy',
  email: 'cassy@example.com',
  token: 'token-123',
  companyName: 'Sunlight',
  roleName: 'Employé',
  companyId: 'company_1',
}

describe('sendInvitationEmail (SP-579)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogAuthEmail.mockResolvedValue(undefined)
    mockRender.mockResolvedValue('<html>invitation</html>')
  })

  it('journalise un envoi accepté avec le type INVITATION', async () => {
    mockSendEmail.mockResolvedValue({
      success: true,
      outcome: 'SENT',
      messageId: '<abc@smartplanning.fr>',
    })

    const result = await sendInvitationEmail(baseParams)

    expect(result.success).toBe(true)
    expect(mockLogAuthEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company_1',
        emailType: 'INVITATION',
        recipientEmail: 'cassy@example.com',
        outcome: 'SENT',
      })
    )
  })

  it('journalise un destinataire refusé en BOUNCED, le cas Sunlight', async () => {
    mockSendEmail.mockResolvedValue({
      success: false,
      outcome: 'BOUNCED',
      rejected: ['cassy@example.com'],
      smtpResponse: '550 5.1.1 No Such User',
      error: 'Adresse refusée par le serveur destinataire',
    })

    const result = await sendInvitationEmail(baseParams)

    expect(result.outcome).toBe('BOUNCED')
    expect(mockLogAuthEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: 'INVITATION',
        outcome: 'BOUNCED',
        rejected: ['cassy@example.com'],
        smtpResponse: '550 5.1.1 No Such User',
      })
    )
  })

  it("n'écrit aucun log quand companyId est absent", async () => {
    // La colonne companyId de EmailLog est NOT NULL : sans elle, la création
    // échouerait. Mieux vaut ne pas journaliser que faire échouer l'envoi.
    mockSendEmail.mockResolvedValue({ success: true, outcome: 'SENT' })

    const { companyId: _omit, ...withoutCompany } = baseParams
    const result = await sendInvitationEmail(withoutCompany)

    expect(result.success).toBe(true)
    expect(mockLogAuthEmail).not.toHaveBeenCalled()
  })

  it("l'échec du log ne fait jamais échouer l'envoi", async () => {
    mockSendEmail.mockResolvedValue({ success: true, outcome: 'SENT' })
    mockLogAuthEmail.mockRejectedValue(new Error('DB down'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await sendInvitationEmail(baseParams)

    expect(result.success).toBe(true)
    errorSpy.mockRestore()
  })

  it('journalise en FAILED quand le rendu du template lève', async () => {
    mockSendEmail.mockResolvedValue({ success: true, outcome: 'SENT' })
    mockRender.mockRejectedValueOnce(new Error('render cassé'))

    const result = await sendInvitationEmail(baseParams)

    expect(result.success).toBe(false)
    expect(mockLogAuthEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: 'INVITATION',
        outcome: 'FAILED',
      })
    )
  })
})
