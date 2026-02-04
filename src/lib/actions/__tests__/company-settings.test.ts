/**
 * Tests unitaires pour company-settings server actions
 *
 * @ticket SP-435
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Note: expect.objectContaining() returns 'any' type, which is expected in test assertions

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCompanySettings,
  updateCompanySettings,
  resetCompanySettings,
} from '../company-settings'
import { DEFAULT_COMPANY_SETTINGS, DEFAULT_LUNCH_BREAK } from '@/types/company'

// Mocks
const mockAuth = vi.fn()
const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: (): Promise<unknown> => mockAuth() as Promise<unknown>,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (): Promise<unknown> => mockFindUnique() as Promise<unknown>,
    },
    company: {
      findUnique: (): Promise<unknown> => mockFindUnique() as Promise<unknown>,
      update: (args: unknown): Promise<unknown> =>
        mockUpdate(args) as Promise<unknown>,
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('company-settings actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCompanySettings', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getCompanySettings()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Non authentifié')
      }
    })

    it('should return error if user role is not allowed', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'EMPLOYEE' },
      })
      mockFindUnique.mockResolvedValue({ companyId: 'company-1' })

      const result = await getCompanySettings()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Accès non autorisé')
      }
    })

    it('should return error if user has no company', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      mockFindUnique.mockResolvedValue({ companyId: null })

      const result = await getCompanySettings()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Entreprise non trouvée')
      }
    })

    it('should return company settings for DIRECTOR', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      // First call for user check, second for company
      mockFindUnique
        .mockResolvedValueOnce({ companyId: 'company-1' })
        .mockResolvedValueOnce({
          name: 'Test Company',
          address: '123 Rue Test',
          workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          defaultOpeningHours: {
            lunchBreak: { enabled: true, start: '12:00', end: '14:00' },
          },
        })

      const result = await getCompanySettings()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Test Company')
        expect(result.data.address).toBe('123 Rue Test')
        expect(result.data.workingDays).toEqual([
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
        ])
        expect(result.data.lunchBreak.enabled).toBe(true)
      }
    })

    it('should return company settings for SYSTEM_ADMIN', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'SYSTEM_ADMIN' },
      })
      mockFindUnique
        .mockResolvedValueOnce({ companyId: 'company-1' })
        .mockResolvedValueOnce({
          name: 'Admin Company',
          address: null,
          workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
          workingHoursStart: '08:00',
          workingHoursEnd: '17:00',
          defaultOpeningHours: null,
        })

      const result = await getCompanySettings()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Admin Company')
        expect(result.data.address).toBeNull()
        expect(result.data.lunchBreak).toEqual(DEFAULT_LUNCH_BREAK)
      }
    })

    it('should return default lunch break if not set', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      mockFindUnique
        .mockResolvedValueOnce({ companyId: 'company-1' })
        .mockResolvedValueOnce({
          name: 'No Lunch Company',
          address: null,
          workingDays: ['MONDAY'],
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          defaultOpeningHours: {},
        })

      const result = await getCompanySettings()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.lunchBreak).toEqual(DEFAULT_LUNCH_BREAK)
      }
    })
  })

  describe('updateCompanySettings', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await updateCompanySettings({ name: 'New Name' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Non authentifié')
      }
    })

    it('should return error if user role is not allowed', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'MANAGER' },
      })
      mockFindUnique.mockResolvedValue({ companyId: 'company-1' })

      const result = await updateCompanySettings({ name: 'New Name' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Accès non autorisé')
      }
    })

    it('should validate name length', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      mockFindUnique.mockResolvedValue({ companyId: 'company-1' })

      const result = await updateCompanySettings({ name: '' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('requis')
      }
    })

    it('should validate time format', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      mockFindUnique.mockResolvedValue({ companyId: 'company-1' })

      const result = await updateCompanySettings({
        workingHoursStart: 'invalid',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('HH:mm')
      }
    })

    it('should validate working days not empty', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      mockFindUnique.mockResolvedValue({ companyId: 'company-1' })

      const result = await updateCompanySettings({ workingDays: [] })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('jour travaillé')
      }
    })

    it('should update company name', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      mockFindUnique
        .mockResolvedValueOnce({ companyId: 'company-1' })
        .mockResolvedValueOnce({
          name: 'Old Name',
          address: '123 Rue Test',
          workingDays: ['MONDAY'],
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          defaultOpeningHours: null,
        })
        .mockResolvedValueOnce({
          name: 'New Name',
          address: '123 Rue Test',
          workingDays: ['MONDAY'],
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          defaultOpeningHours: null,
        })
      mockUpdate.mockResolvedValue({})

      const result = await updateCompanySettings({ name: 'New Name' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('New Name')
      }
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('should update working days', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      const newWorkingDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      mockFindUnique
        .mockResolvedValueOnce({ companyId: 'company-1' })
        .mockResolvedValueOnce({
          name: 'Test',
          address: null,
          workingDays: ['MONDAY'],
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          defaultOpeningHours: null,
        })
        .mockResolvedValueOnce({
          name: 'Test',
          address: null,
          workingDays: newWorkingDays,
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          defaultOpeningHours: null,
        })
      mockUpdate.mockResolvedValue({})

      const result = await updateCompanySettings({ workingDays: newWorkingDays as ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.workingDays).toEqual(newWorkingDays)
      }
    })

    it('should update lunch break settings', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      const newLunchBreak = { enabled: true, start: '12:30', end: '13:30' }
      mockFindUnique
        .mockResolvedValueOnce({ companyId: 'company-1' })
        .mockResolvedValueOnce({
          name: 'Test',
          address: null,
          workingDays: ['MONDAY'],
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          defaultOpeningHours: null,
        })
        .mockResolvedValueOnce({
          name: 'Test',
          address: null,
          workingDays: ['MONDAY'],
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          defaultOpeningHours: { lunchBreak: newLunchBreak },
        })
      mockUpdate.mockResolvedValue({})

      const result = await updateCompanySettings({ lunchBreak: newLunchBreak })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.lunchBreak).toEqual(newLunchBreak)
      }
    })

    it('should reject lunch break with end before start', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      mockFindUnique.mockResolvedValue({ companyId: 'company-1' })

      const result = await updateCompanySettings({
        lunchBreak: { enabled: true, start: '14:00', end: '12:00' },
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('fin')
      }
    })
  })

  describe('resetCompanySettings', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await resetCompanySettings()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Non authentifié')
      }
    })

    it('should return error if user role is not allowed', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'EMPLOYEE' },
      })
      mockFindUnique.mockResolvedValue({ companyId: 'company-1' })

      const result = await resetCompanySettings()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Accès non autorisé')
      }
    })

    it('should reset settings to defaults but keep company name', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      mockFindUnique
        .mockResolvedValueOnce({ companyId: 'company-1' })
        .mockResolvedValueOnce({ name: 'My Company' })
      mockUpdate.mockResolvedValue({})

      const result = await resetCompanySettings()

      expect(result.success).toBe(true)
      if (result.success) {
        // Name should be preserved
        expect(result.data.name).toBe('My Company')
        // Other fields should be defaults
        expect(result.data.address).toBe(DEFAULT_COMPANY_SETTINGS.address)
        expect(result.data.workingDays).toEqual(
          DEFAULT_COMPANY_SETTINGS.workingDays
        )
        expect(result.data.workingHoursStart).toBe(
          DEFAULT_COMPANY_SETTINGS.workingHoursStart
        )
        expect(result.data.workingHoursEnd).toBe(
          DEFAULT_COMPANY_SETTINGS.workingHoursEnd
        )
        expect(result.data.lunchBreak).toEqual(DEFAULT_LUNCH_BREAK)
      }
    })

    it('should call prisma update with default values', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR' },
      })
      mockFindUnique
        .mockResolvedValueOnce({ companyId: 'company-1' })
        .mockResolvedValueOnce({ name: 'My Company' })
      mockUpdate.mockResolvedValue({})

      await resetCompanySettings()

      expect(mockUpdate).toHaveBeenCalled()
      const calls = mockUpdate.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      const updateCall = calls[0]![0] as {
        where: { id: string }
        data: {
          address: string | null
          workingDays: string[]
          workingHoursStart: string
          workingHoursEnd: string
        }
      }
      expect(updateCall.where.id).toBe('company-1')
      expect(updateCall.data.workingDays).toEqual(
        DEFAULT_COMPANY_SETTINGS.workingDays
      )
    })
  })
})
