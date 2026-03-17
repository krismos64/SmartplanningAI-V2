/**
 * Tests unitaires pour src/components/layout/SubscriptionBanner.tsx
 *
 * Teste le rendu conditionnel, les variants visuels, les CTA,
 * le dismiss localStorage et l'accessibilité.
 *
 * @ticket SP-441
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubscriptionBanner } from '@/components/layout/SubscriptionBanner'

// ============================================================================
// Mocks
// ============================================================================

// Mock next/navigation
const mockPathname = vi.fn(() => '/app/dashboard')
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// ============================================================================
// Helpers
// ============================================================================

function futureDate(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString()
}

function pastDate(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

const defaultProps = {
  subscriptionStatus: 'ACTIVE' as string | null,
  trialEndsAt: null as string | null,
  currentPeriodEnd: null as string | null,
  role: 'DIRECTOR',
}

// ============================================================================
// Tests
// ============================================================================

describe('SubscriptionBanner', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    mockPathname.mockReturnValue('/app/dashboard')
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  // --------------------------------------------------------------------------
  // Rendu conditionnel
  // --------------------------------------------------------------------------

  describe('Rendu conditionnel', () => {
    it('ne rend rien pour ACTIVE', () => {
      const { container } = render(
        <SubscriptionBanner {...defaultProps} subscriptionStatus="ACTIVE" />
      )
      expect(container.innerHTML).toBe('')
    })

    it('ne rend rien pour SYSTEM_ADMIN', () => {
      const { container } = render(
        <SubscriptionBanner
          {...defaultProps}
          role="SYSTEM_ADMIN"
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(5)}
        />
      )
      expect(container.innerHTML).toBe('')
    })

    it('ne rend rien sur la page billing', () => {
      mockPathname.mockReturnValue('/app/dashboard/billing')
      const { container } = render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(5)}
        />
      )
      expect(container.innerHTML).toBe('')
    })

    it('ne rend rien sur une sous-route billing', () => {
      mockPathname.mockReturnValue('/app/dashboard/billing/invoices')
      const { container } = render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(5)}
        />
      )
      expect(container.innerHTML).toBe('')
    })

    it('rend la bannière info pour TRIAL 10 jours restants', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      expect(screen.getByTestId('subscription-banner')).toBeInTheDocument()
      expect(screen.getByTestId('subscription-banner')).toHaveAttribute('data-tier', 'info')
    })

    it('rend la bannière warning pour TRIAL 5 jours restants', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(5)}
        />
      )
      expect(screen.getByTestId('subscription-banner')).toHaveAttribute('data-tier', 'warning')
    })

    it('rend la bannière urgent pour TRIAL 2 jours restants', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(2)}
        />
      )
      expect(screen.getByTestId('subscription-banner')).toHaveAttribute('data-tier', 'urgent')
    })

    it('rend la bannière payment pour PAST_DUE', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="PAST_DUE"
          currentPeriodEnd={pastDate(3)}
        />
      )
      expect(screen.getByTestId('subscription-banner')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // Variants visuels
  // --------------------------------------------------------------------------

  describe('Variants visuels', () => {
    it('utilise les classes info pour le palier info', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      const banner = screen.getByTestId('subscription-banner')
      expect(banner.className).toContain('info')
    })

    it('utilise les classes warning pour le palier warning', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(5)}
        />
      )
      const banner = screen.getByTestId('subscription-banner')
      expect(banner.className).toContain('warning')
    })

    it('utilise les classes destructive pour le palier urgent', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(2)}
        />
      )
      const banner = screen.getByTestId('subscription-banner')
      expect(banner.className).toContain('destructive')
    })
  })

  // --------------------------------------------------------------------------
  // CTA
  // --------------------------------------------------------------------------

  describe('CTA', () => {
    it('affiche le lien "Voir les offres" pour info', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      expect(screen.getByTestId('subscription-banner-cta')).toHaveTextContent('Voir les offres')
    })

    it('affiche le bouton "S\'abonner" pour warning', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(5)}
        />
      )
      expect(screen.getByTestId('subscription-banner-cta')).toHaveTextContent("S'abonner")
    })

    it('affiche le bouton "S\'abonner maintenant" pour urgent', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(2)}
        />
      )
      expect(screen.getByTestId('subscription-banner-cta')).toHaveTextContent("S'abonner maintenant")
    })

    it('le CTA pointe vers /app/dashboard/billing', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      const cta = screen.getByTestId('subscription-banner-cta')
      expect(cta).toHaveAttribute('href', '/app/dashboard/billing')
    })

    it('affiche "Mettre à jour" pour PAST_DUE', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="PAST_DUE"
          currentPeriodEnd={pastDate(3)}
        />
      )
      expect(screen.getByTestId('subscription-banner-cta')).toHaveTextContent('Mettre à jour')
    })
  })

  // --------------------------------------------------------------------------
  // Dismiss
  // --------------------------------------------------------------------------

  describe('Dismiss', () => {
    it('affiche le bouton dismiss pour info', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      expect(screen.getByTestId('subscription-banner-dismiss')).toBeInTheDocument()
    })

    it('affiche le bouton dismiss pour warning', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(5)}
        />
      )
      expect(screen.getByTestId('subscription-banner-dismiss')).toBeInTheDocument()
    })

    it('ne affiche PAS le bouton dismiss pour urgent', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(2)}
        />
      )
      expect(screen.queryByTestId('subscription-banner-dismiss')).not.toBeInTheDocument()
    })

    it('ne affiche PAS le bouton dismiss pour PAST_DUE', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="PAST_DUE"
          currentPeriodEnd={pastDate(3)}
        />
      )
      expect(screen.queryByTestId('subscription-banner-dismiss')).not.toBeInTheDocument()
    })

    it('cache la bannière après dismiss', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      fireEvent.click(screen.getByTestId('subscription-banner-dismiss'))
      expect(screen.queryByTestId('subscription-banner')).not.toBeInTheDocument()
    })

    it('stocke le tier dans localStorage au dismiss', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      fireEvent.click(screen.getByTestId('subscription-banner-dismiss'))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sp-banner-dismissed-tier', 'info')
    })
  })

  // --------------------------------------------------------------------------
  // Accessibilité
  // --------------------------------------------------------------------------

  describe('Accessibilité', () => {
    it('a role="alert" pour urgent', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(2)}
        />
      )
      expect(screen.getByTestId('subscription-banner')).toHaveAttribute('role', 'alert')
    })

    it('a role="status" pour info', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      expect(screen.getByTestId('subscription-banner')).toHaveAttribute('role', 'status')
    })

    it('a role="status" pour warning', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(5)}
        />
      )
      expect(screen.getByTestId('subscription-banner')).toHaveAttribute('role', 'status')
    })

    it('le bouton dismiss a un aria-label', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      expect(screen.getByTestId('subscription-banner-dismiss')).toHaveAttribute(
        'aria-label',
        'Fermer la bannière'
      )
    })

    it('a un data-testid', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(5)}
        />
      )
      expect(screen.getByTestId('subscription-banner')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // Messages
  // --------------------------------------------------------------------------

  describe('Messages', () => {
    it('affiche le message trial pour info', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="TRIAL"
          trialEndsAt={futureDate(10)}
        />
      )
      expect(screen.getByText(/jours restants/)).toBeInTheDocument()
    })

    it('affiche le message payment pour PAST_DUE', () => {
      render(
        <SubscriptionBanner
          {...defaultProps}
          subscriptionStatus="PAST_DUE"
          currentPeriodEnd={pastDate(3)}
        />
      )
      expect(screen.getByText(/Paiement en retard/)).toBeInTheDocument()
    })
  })
})
