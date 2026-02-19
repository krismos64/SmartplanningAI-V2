/**
 * Tests unitaires pour la fonction sendLeaveRequestedEmail
 *
 * @ticket SP-415
 * @description Tests de l'envoi des emails de nouvelle demande de congé
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
import { sendLeaveRequestedEmail } from '@/lib/email/templates/leave-requested'

describe('leave-requested', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // sendLeaveRequestedEmail
  // ==========================================================================

  describe('sendLeaveRequestedEmail', () => {
    it('devrait appeler sendEmail avec le bon destinataire et sujet', async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-requested-123',
      })

      const result = await sendLeaveRequestedEmail({
        managerEmail: 'manager@test.com',
        managerName: 'Pierre',
        employeeName: 'Marie Dupont',
        leaveType: 'PAID_LEAVE',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-20'),
        totalDays: 4,
        reason: 'Vacances familiales',
        requestId: 'leave-123',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'manager@test.com',
          subject: 'Nouvelle demande de congé - Marie Dupont',
        })
      )
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-requested-123')
    })

    it("devrait générer l'URL de la demande correctement", async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      })

      await sendLeaveRequestedEmail({
        managerEmail: 'test@test.com',
        managerName: 'Test',
        employeeName: 'Employee Test',
        leaveType: 'RTT',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-02'),
        totalDays: 1,
        requestId: 'leave-abc-123',
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            'https://smartplanning.fr/app/dashboard/leaves/leave-abc-123'
          ),
        })
      )
    })

    it('devrait inclure le type de congé traduit', async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-789',
      })

      await sendLeaveRequestedEmail({
        managerEmail: 'test@test.com',
        managerName: 'Test',
        employeeName: 'Employee',
        leaveType: 'SICK_LEAVE',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-05'),
        totalDays: 5,
        requestId: 'leave-sick',
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Arrêt maladie'),
        })
      )
    })

    it('devrait gérer une demande sans motif', async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-no-reason',
      })

      const result = await sendLeaveRequestedEmail({
        managerEmail: 'test@test.com',
        managerName: 'Test',
        employeeName: 'Employee',
        leaveType: 'RTT',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-01'),
        totalDays: 1,
        requestId: 'leave-no-reason',
        // reason non fourni
      })

      expect(result.success).toBe(true)
      expect(mockSendEmail).toHaveBeenCalled()
    })

    it('devrait retourner une erreur si sendEmail échoue', async () => {
      mockSendEmail.mockResolvedValue({
        success: false,
        error: 'SMTP connection failed',
      })

      const result = await sendLeaveRequestedEmail({
        managerEmail: 'test@test.com',
        managerName: 'Test',
        employeeName: 'Employee',
        leaveType: 'PAID_LEAVE',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-02'),
        totalDays: 2,
        requestId: 'leave-fail',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('SMTP connection failed')
    })

    it('devrait gérer les exceptions de sendEmail', async () => {
      mockSendEmail.mockRejectedValue(new Error('Network error'))

      const result = await sendLeaveRequestedEmail({
        managerEmail: 'test@test.com',
        managerName: 'Test',
        employeeName: 'Employee',
        leaveType: 'PAID_LEAVE',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-02'),
        totalDays: 2,
        requestId: 'leave-exception',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('devrait formater les dates en français', async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-dates',
      })

      await sendLeaveRequestedEmail({
        managerEmail: 'test@test.com',
        managerName: 'Test',
        employeeName: 'Employee',
        leaveType: 'PAID_LEAVE',
        startDate: new Date('2026-12-25'),
        endDate: new Date('2026-12-31'),
        totalDays: 5,
        requestId: 'leave-dates',
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('25 décembre 2026'),
        })
      )
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('31 décembre 2026'),
        })
      )
    })
  })
})
