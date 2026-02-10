/**
 * Tests unitaires pour UmamiAnalyticsWrapper
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UmamiAnalyticsWrapper } from '@/components/analytics/UmamiAnalyticsWrapper'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('@/components/analytics/UmamiAnalytics', () => ({
  UmamiAnalytics: (props: {
    disabled: boolean
    websiteId: string
    scriptUrl: string
    domains: string
  }) => (
    <div
      data-testid="umami-analytics"
      data-disabled={String(props.disabled)}
      data-website-id={props.websiteId}
      data-script-url={props.scriptUrl}
      data-domains={props.domains}
    />
  ),
}))

// ============================================================================
// Tests
// ============================================================================

describe('UmamiAnalyticsWrapper', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('rend le composant UmamiAnalytics', () => {
    render(<UmamiAnalyticsWrapper />)
    expect(screen.getByTestId('umami-analytics')).toBeInTheDocument()
  })

  it('passe disabled=false par defaut', () => {
    render(<UmamiAnalyticsWrapper />)
    expect(screen.getByTestId('umami-analytics')).toHaveAttribute(
      'data-disabled',
      'false'
    )
  })

  it('passe disabled=true quand specifie', () => {
    render(<UmamiAnalyticsWrapper disabled />)
    expect(screen.getByTestId('umami-analytics')).toHaveAttribute(
      'data-disabled',
      'true'
    )
  })

  it('utilise les valeurs hardcodees par defaut', () => {
    render(<UmamiAnalyticsWrapper />)
    const el = screen.getByTestId('umami-analytics')
    expect(el).toHaveAttribute(
      'data-website-id',
      '3a177239-31b0-4201-a1cb-e9938326d52b'
    )
    expect(el).toHaveAttribute(
      'data-script-url',
      'https://analytics.smartplanning.fr/script.js'
    )
    expect(el).toHaveAttribute('data-domains', 'smartplanning.fr')
  })

  it('utilise les variables d environnement quand definies', () => {
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = 'custom-id'
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL = 'https://custom.script.js'
    process.env.NEXT_PUBLIC_UMAMI_DOMAINS = 'custom.fr'

    render(<UmamiAnalyticsWrapper />)
    const el = screen.getByTestId('umami-analytics')
    expect(el).toHaveAttribute('data-website-id', 'custom-id')
    expect(el).toHaveAttribute('data-script-url', 'https://custom.script.js')
    expect(el).toHaveAttribute('data-domains', 'custom.fr')
  })
})
