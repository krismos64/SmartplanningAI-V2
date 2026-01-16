/**
 * Tests unitaires pour le composant UmamiAnalytics
 *
 * @description Vérifie le chargement conditionnel du script Umami
 * basé sur le consentement cookies RGPD.
 *
 * @see SP-345 - Intégration Umami Analytics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { UmamiAnalytics } from '@/components/analytics/UmamiAnalytics'

// Mock du module cookies
const mockIsCategoryAccepted = vi.fn()

vi.mock('@/lib/cookies', () => ({
  isCategoryAccepted: () => mockIsCategoryAccepted(),
}))

// Mock de next/script
vi.mock('next/script', () => ({
  default: ({
    src,
    'data-website-id': websiteId,
    'data-domains': domains,
  }: {
    src: string
    'data-website-id': string
    'data-domains': string
  }) => (
    <script
      data-testid="umami-script"
      src={src}
      data-website-id={websiteId}
      data-domains={domains}
    />
  ),
}))

describe('UmamiAnalytics', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    // Configure les variables d'environnement pour les tests
    vi.stubEnv('NEXT_PUBLIC_UMAMI_WEBSITE_ID', 'test-website-id-123')
    vi.stubEnv('NEXT_PUBLIC_UMAMI_SCRIPT_URL', '/analytics/script.js')
    vi.stubEnv('NEXT_PUBLIC_UMAMI_DOMAINS', 'smartplanning.fr')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('ne charge pas le script si le consentement analytics est refusé', async () => {
    mockIsCategoryAccepted.mockReturnValue(false)

    render(<UmamiAnalytics />)

    // Le script ne doit pas être présent
    expect(screen.queryByTestId('umami-script')).not.toBeInTheDocument()
  })

  it('charge le script si le consentement analytics est accepté', async () => {
    mockIsCategoryAccepted.mockReturnValue(true)

    render(<UmamiAnalytics />)

    await waitFor(() => {
      const script = screen.getByTestId('umami-script')
      expect(script).toBeInTheDocument()
      expect(script).toHaveAttribute('data-website-id', 'test-website-id-123')
    })
  })

  it('ne charge pas le script si disabled est true', async () => {
    mockIsCategoryAccepted.mockReturnValue(true)

    render(<UmamiAnalytics disabled={true} />)

    expect(screen.queryByTestId('umami-script')).not.toBeInTheDocument()
  })

  it('écoute les changements de consentement via custom event', async () => {
    // Commence sans consentement
    mockIsCategoryAccepted.mockReturnValue(false)

    render(<UmamiAnalytics />)

    expect(screen.queryByTestId('umami-script')).not.toBeInTheDocument()

    // Simule un changement de consentement
    mockIsCategoryAccepted.mockReturnValue(true)
    window.dispatchEvent(new CustomEvent('cookie-consent-changed'))

    await waitFor(() => {
      expect(screen.getByTestId('umami-script')).toBeInTheDocument()
    })
  })

  it('utilise le domaine configuré', async () => {
    mockIsCategoryAccepted.mockReturnValue(true)

    render(<UmamiAnalytics />)

    await waitFor(() => {
      const script = screen.getByTestId('umami-script')
      expect(script).toHaveAttribute('data-domains', 'smartplanning.fr')
    })
  })
})
