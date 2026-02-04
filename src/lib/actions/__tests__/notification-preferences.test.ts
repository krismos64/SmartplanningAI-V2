/**
 * Tests unitaires pour notification-preferences server actions
 *
 * @ticket SP-275
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Note: expect.objectContaining() returns 'any' type, which is expected in test assertions

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
} from '../notification-preferences'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/preferences'

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
      update: (args: unknown): Promise<unknown> =>
        mockUpdate(args) as Promise<unknown>,
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('notification-preferences actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNotificationPreferences', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getNotificationPreferences()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Non authentifié')
      }
    })

    it('should return error if user not found', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue(null)

      const result = await getNotificationPreferences()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Utilisateur non trouvé')
      }
    })

    it('should return default preferences if user has no preferences', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue({ preferences: null })

      const result = await getNotificationPreferences()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(DEFAULT_NOTIFICATION_PREFERENCES)
      }
    })

    it('should return parsed preferences from database', async () => {
      const customPrefs = {
        notifications: {
          email: { planning: false, leaves: true, tasks: true, system: true },
          inApp: { planning: true, leaves: false, tasks: true, system: true },
        },
      }

      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue({ preferences: customPrefs })

      const result = await getNotificationPreferences()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email.planning).toBe(false)
        expect(result.data.inApp.leaves).toBe(false)
      }
    })
  })

  describe('updateNotificationPreferences', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await updateNotificationPreferences({
        email: { planning: false },
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Non authentifié')
      }
    })

    it('should return error if user not found', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue(null)

      const result = await updateNotificationPreferences({
        email: { planning: false },
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Utilisateur non trouvé')
      }
    })

    it('should merge partial email preferences', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue({
        preferences: { notifications: DEFAULT_NOTIFICATION_PREFERENCES },
      })
      mockUpdate.mockResolvedValue({})

      const result = await updateNotificationPreferences({
        email: { planning: false },
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email.planning).toBe(false)
        expect(result.data.email.leaves).toBe(true) // Unchanged
        expect(result.data.inApp.planning).toBe(true) // Unchanged
      }
    })

    it('should merge partial inApp preferences', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue({
        preferences: { notifications: DEFAULT_NOTIFICATION_PREFERENCES },
      })
      mockUpdate.mockResolvedValue({})

      const result = await updateNotificationPreferences({
        inApp: { leaves: false, tasks: false },
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.inApp.leaves).toBe(false)
        expect(result.data.inApp.tasks).toBe(false)
        expect(result.data.inApp.planning).toBe(true) // Unchanged
      }
    })

    it('should update both email and inApp at once', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue({
        preferences: { notifications: DEFAULT_NOTIFICATION_PREFERENCES },
      })
      mockUpdate.mockResolvedValue({})

      const result = await updateNotificationPreferences({
        email: { planning: false },
        inApp: { system: false },
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email.planning).toBe(false)
        expect(result.data.inApp.system).toBe(false)
      }
    })

    it('should call prisma update with merged preferences', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue({
        preferences: {
          display: { theme: 'dark' },
          notifications: DEFAULT_NOTIFICATION_PREFERENCES,
        },
      })
      mockUpdate.mockResolvedValue({})

      await updateNotificationPreferences({ email: { planning: false } })

      expect(mockUpdate).toHaveBeenCalled()
      // Verify the structure of the update call
      const calls = mockUpdate.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      const updateCall = calls[0]![0] as {
        where: { id: string }
        data: {
          preferences: {
            display: { theme: string }
            notifications: { email: { planning: boolean } }
          }
        }
      }
      expect(updateCall.where.id).toBe('user-1')
      expect(updateCall.data.preferences.display.theme).toBe('dark')
      expect(updateCall.data.preferences.notifications.email.planning).toBe(
        false
      )
    })

    it('should preserve existing display preferences', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue({
        preferences: {
          display: { theme: 'dark', dateFormat: 'YYYY-MM-DD' },
          notifications: DEFAULT_NOTIFICATION_PREFERENCES,
        },
      })
      mockUpdate.mockResolvedValue({})

      await updateNotificationPreferences({ email: { planning: false } })

      expect(mockUpdate).toHaveBeenCalled()
      // Verify display preferences are preserved
      const calls = mockUpdate.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      const updateCall = calls[0]![0] as {
        data: {
          preferences: { display: { theme: string; dateFormat: string } }
        }
      }
      expect(updateCall.data.preferences.display.theme).toBe('dark')
      expect(updateCall.data.preferences.display.dateFormat).toBe('YYYY-MM-DD')
    })
  })

  describe('resetNotificationPreferences', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await resetNotificationPreferences()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Non authentifié')
      }
    })

    it('should return error if user not found', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue(null)

      const result = await resetNotificationPreferences()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Utilisateur non trouvé')
      }
    })

    it('should reset to default preferences', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue({
        preferences: {
          notifications: {
            email: {
              planning: false,
              leaves: false,
              tasks: false,
              system: false,
            },
            inApp: {
              planning: false,
              leaves: false,
              tasks: false,
              system: false,
            },
          },
        },
      })
      mockUpdate.mockResolvedValue({})

      const result = await resetNotificationPreferences()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(DEFAULT_NOTIFICATION_PREFERENCES)
      }
    })

    it('should preserve display preferences when resetting notifications', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
      mockFindUnique.mockResolvedValue({
        preferences: {
          display: { theme: 'dark' },
          notifications: {
            email: {
              planning: false,
              leaves: false,
              tasks: false,
              system: false,
            },
            inApp: {
              planning: false,
              leaves: false,
              tasks: false,
              system: false,
            },
          },
        },
      })
      mockUpdate.mockResolvedValue({})

      await resetNotificationPreferences()

      expect(mockUpdate).toHaveBeenCalled()
      // Verify display preferences are preserved and notifications are reset
      const calls = mockUpdate.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      const updateCall = calls[0]![0] as {
        data: {
          preferences: {
            display: { theme: string }
            notifications: typeof DEFAULT_NOTIFICATION_PREFERENCES
          }
        }
      }
      expect(updateCall.data.preferences.display.theme).toBe('dark')
      expect(updateCall.data.preferences.notifications).toEqual(
        DEFAULT_NOTIFICATION_PREFERENCES
      )
    })
  })
})
