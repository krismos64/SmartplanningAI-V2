/**
 * Tests unitaires pour onboarding server actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { markWelcomeSeen } from '../onboarding'

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

describe('markWelcomeSeen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return error if not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const result = await markWelcomeSeen()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Non authentifié')
    }
  })

  it('should return error if user not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue(null)

    const result = await markWelcomeSeen()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Utilisateur non trouvé')
    }
  })

  it('should set hasSeenWelcome to true when preferences are empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue({ preferences: null })
    mockUpdate.mockResolvedValue({})

    const result = await markWelcomeSeen()

    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalled()
    const updateCall = mockUpdate.mock.calls[0]![0] as {
      where: { id: string }
      data: { preferences: { onboarding: { hasSeenWelcome: boolean } } }
    }
    expect(updateCall.where.id).toBe('user-1')
    expect(updateCall.data.preferences.onboarding.hasSeenWelcome).toBe(true)
  })

  it('should preserve existing display and notifications preferences', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue({
      preferences: {
        display: { theme: 'dark' },
        onboarding: { hasSeenWelcome: false },
      },
    })
    mockUpdate.mockResolvedValue({})

    await markWelcomeSeen()

    const updateCall = mockUpdate.mock.calls[0]![0] as {
      data: {
        preferences: {
          display: { theme: string }
          onboarding: { hasSeenWelcome: boolean }
        }
      }
    }
    expect(updateCall.data.preferences.display.theme).toBe('dark')
    expect(updateCall.data.preferences.onboarding.hasSeenWelcome).toBe(true)
  })
})
