/**
 * Tests unitaires pour les fonctions sendLeaveApprovedEmail et sendLeaveRejectedEmail
 *
 * @ticket SP-300
 * @description Tests de l'envoi des emails de décision de congé
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock statique — évite le resetModules + doMock + import dynamique
// qui causait des timeouts (résolution de @react-email à chaque test)
const mockSendEmail = vi.fn()

vi.mock('@/lib/email', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

vi.mock('@/lib/email/config', () => ({
  getBaseUrl: () => 'https://smartplanning.fr',
}))

// Import statique — résolu une seule fois
import {
  formatDateFr,
  getLeaveTypeLabel,
  sendLeaveApprovedEmail,
  sendLeaveRejectedEmail,
} from '@/lib/email/templates/leave-decision'

describe('leave-decision', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // formatDateFr
  // ==========================================================================

  describe('formatDateFr', () => {
    it('devrait formater une date en français', () => {
      const date = new Date('2026-01-15')
      const result = formatDateFr(date)

      expect(result).toBe('15 janvier 2026')
    })

    it('devrait formater une date avec mois différent', () => {
      const date = new Date('2026-12-25')
      const result = formatDateFr(date)

      expect(result).toBe('25 décembre 2026')
    })
  })

  // ==========================================================================
  // getLeaveTypeLabel
  // ==========================================================================

  describe('getLeaveTypeLabel', () => {
    it('devrait traduire PAID_LEAVE en Congés payés', () => {
      expect(getLeaveTypeLabel('PAID_LEAVE')).toBe('Congés payés')
    })

    it('devrait traduire RTT correctement', () => {
      expect(getLeaveTypeLabel('RTT')).toBe('RTT')
    })

    it('devrait traduire SICK_LEAVE en Arrêt maladie', () => {
      expect(getLeaveTypeLabel('SICK_LEAVE')).toBe('Arrêt maladie')
    })
  })

  // ==========================================================================
  // sendLeaveApprovedEmail
  // ==========================================================================

  describe('sendLeaveApprovedEmail', () => {
    it('devrait appeler sendEmail avec le bon destinataire et sujet', async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-approved-123',
      })

      const result = await sendLeaveApprovedEmail({
        firstName: 'Marie',
        email: 'marie@test.com',
        leaveType: 'PAID_LEAVE',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-20'),
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'marie@test.com',
          subject: 'Marie, votre demande de congé a été approuvée',
        })
      )
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-approved-123')
    })

    it('devrait utiliser le dashboardUrl par défaut si non fourni', async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      })

      await sendLeaveApprovedEmail({
        firstName: 'Test',
        email: 'test@test.com',
        leaveType: 'RTT',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-02'),
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            'https://smartplanning.fr/dashboard/conges'
          ),
        })
      )
    })

    it('devrait retourner une erreur si sendEmail échoue', async () => {
      mockSendEmail.mockResolvedValue({
        success: false,
        error: 'SMTP connection failed',
      })

      const result = await sendLeaveApprovedEmail({
        firstName: 'Test',
        email: 'test@test.com',
        leaveType: 'PAID_LEAVE',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-02'),
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('SMTP connection failed')
    })

    it('devrait gérer les exceptions de sendEmail', async () => {
      mockSendEmail.mockRejectedValue(new Error('Network error'))

      const result = await sendLeaveApprovedEmail({
        firstName: 'Test',
        email: 'test@test.com',
        leaveType: 'PAID_LEAVE',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-02'),
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  // ==========================================================================
  // sendLeaveRejectedEmail
  // ==========================================================================

  describe('sendLeaveRejectedEmail', () => {
    it('devrait appeler sendEmail avec le bon destinataire et sujet', async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-rejected-789',
      })

      const result = await sendLeaveRejectedEmail({
        firstName: 'Paul',
        email: 'paul@test.com',
        leaveType: 'RTT',
        startDate: new Date('2026-02-10'),
        endDate: new Date('2026-02-12'),
        rejectionReason: 'Période de forte activité.',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'paul@test.com',
          subject: "Paul, votre demande de congé n'a pas été approuvée",
        })
      )
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-rejected-789')
    })

    it('devrait inclure le motif de refus dans le HTML', async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      })

      await sendLeaveRejectedEmail({
        firstName: 'Test',
        email: 'test@test.com',
        leaveType: 'UNPAID_LEAVE',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-05'),
        rejectionReason: 'Chevauchement avec un autre congé.',
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Chevauchement avec un autre congé'),
        })
      )
    })

    it('devrait retourner une erreur si sendEmail échoue', async () => {
      mockSendEmail.mockResolvedValue({
        success: false,
        error: 'SMTP timeout',
      })

      const result = await sendLeaveRejectedEmail({
        firstName: 'Test',
        email: 'test@test.com',
        leaveType: 'RTT',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-02'),
        rejectionReason: 'Test refus',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('SMTP timeout')
    })

    it('devrait gérer les exceptions de sendEmail', async () => {
      mockSendEmail.mockRejectedValue(new Error('Connection refused'))

      const result = await sendLeaveRejectedEmail({
        firstName: 'Test',
        email: 'test@test.com',
        leaveType: 'RTT',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-02'),
        rejectionReason: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Connection refused')
    })
  })
})
