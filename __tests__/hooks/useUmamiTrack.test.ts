/**
 * Tests unitaires pour le hook useUmamiTrack
 *
 * @description Vérifie le tracking d'events Umami avec respect
 * du consentement cookies RGPD.
 *
 * @see SP-345 - Intégration Umami Analytics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUmamiTrack } from '@/hooks/useUmamiTrack'

// Mock du module cookies
const mockIsCategoryAccepted = vi.fn()

vi.mock('@/lib/cookies', () => ({
  isCategoryAccepted: () => mockIsCategoryAccepted(),
}))

describe('useUmamiTrack', () => {
  let mockUmamiTrack: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock window.umami
    mockUmamiTrack = vi.fn()
    Object.defineProperty(window, 'umami', {
      value: { track: mockUmamiTrack },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    // Clean up
    delete (window as { umami?: unknown }).umami
  })

  it('retourne isEnabled=true si le consentement analytics est accepté', async () => {
    mockIsCategoryAccepted.mockReturnValue(true)

    const { result } = renderHook(() => useUmamiTrack())

    await waitFor(() => {
      expect(result.current.isEnabled).toBe(true)
    })
  })

  it('retourne isEnabled=false si le consentement analytics est refusé', async () => {
    mockIsCategoryAccepted.mockReturnValue(false)

    const { result } = renderHook(() => useUmamiTrack())

    await waitFor(() => {
      expect(result.current.isEnabled).toBe(false)
    })
  })

  it("n'envoie pas d'event si le consentement est refusé", () => {
    mockIsCategoryAccepted.mockReturnValue(false)

    const { result } = renderHook(() => useUmamiTrack())

    act(() => {
      result.current.track('test-event', { foo: 'bar' })
    })

    expect(mockUmamiTrack).not.toHaveBeenCalled()
  })

  it('envoie un event si le consentement est accepté', () => {
    mockIsCategoryAccepted.mockReturnValue(true)

    const { result } = renderHook(() => useUmamiTrack())

    act(() => {
      result.current.track('cta-click', { location: 'hero' })
    })

    expect(mockUmamiTrack).toHaveBeenCalledWith('cta-click', {
      location: 'hero',
    })
  })

  it('envoie un event sans données additionnelles', () => {
    mockIsCategoryAccepted.mockReturnValue(true)

    const { result } = renderHook(() => useUmamiTrack())

    act(() => {
      result.current.track('page-view')
    })

    expect(mockUmamiTrack).toHaveBeenCalledWith('page-view', undefined)
  })

  it("ne plante pas si window.umami n'est pas défini", () => {
    mockIsCategoryAccepted.mockReturnValue(true)
    delete (window as { umami?: unknown }).umami

    const { result } = renderHook(() => useUmamiTrack())

    // Ne doit pas lever d'erreur
    expect(() => {
      act(() => {
        result.current.track('test-event')
      })
    }).not.toThrow()
  })

  it('réagit aux changements de consentement via custom event', async () => {
    // Commence sans consentement
    mockIsCategoryAccepted.mockReturnValue(false)

    const { result } = renderHook(() => useUmamiTrack())

    await waitFor(() => {
      expect(result.current.isEnabled).toBe(false)
    })

    // Simule un changement de consentement
    mockIsCategoryAccepted.mockReturnValue(true)

    act(() => {
      window.dispatchEvent(new CustomEvent('cookie-consent-changed'))
    })

    await waitFor(() => {
      expect(result.current.isEnabled).toBe(true)
    })
  })

  it('vérifie le consentement à chaque appel de track()', () => {
    // Consentement initial accepté
    mockIsCategoryAccepted.mockReturnValue(true)

    const { result } = renderHook(() => useUmamiTrack())

    // Premier appel - devrait tracker
    act(() => {
      result.current.track('event-1')
    })
    expect(mockUmamiTrack).toHaveBeenCalledTimes(1)

    // Consentement retiré entre-temps
    mockIsCategoryAccepted.mockReturnValue(false)

    // Deuxième appel - ne devrait PAS tracker
    act(() => {
      result.current.track('event-2')
    })
    expect(mockUmamiTrack).toHaveBeenCalledTimes(1) // Toujours 1
  })
})
