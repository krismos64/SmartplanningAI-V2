/**
 * Tests unitaires pour SubscriptionStatus
 *
 * @ticket SP-360
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubscriptionStatus } from '@/app/app/dashboard/billing/_components/SubscriptionStatus'
import type { SerializedSubscription } from '@/app/app/dashboard/billing/_components/SubscriptionStatus'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('@/lib/animations', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  fadeSlideUpVariants: {},
  useReducedMotion: () => true,
}))

// ============================================================================
// Fixtures
// ============================================================================

const mockSubscriptionActive: SerializedSubscription = {
  plan: 'PER_SEAT',
  status: 'ACTIVE',
  quantity: 10,
  pricePerEmployee: 290,
  planPrice: 2900,
  currentPeriodStart: '2026-01-15T00:00:00.000Z',
  currentPeriodEnd: '2026-02-15T00:00:00.000Z',
  cancelAtPeriodEnd: false,
  canceledAt: null,
  createdAt: '2025-06-01T00:00:00.000Z',
  stripeCustomerId: 'cus_test123',
  stripeSubscriptionId: 'sub_test123',
}

const mockSubscriptionTrial: SerializedSubscription = {
  ...mockSubscriptionActive,
  status: 'TRIAL',
}

/**
 * Ligne Subscription créée à l'inscription pour suivre l'essai : statut TRIAL,
 * plan FREE, aucun identifiant Stripe et 0 siège. Elle ne vaut pas abonnement.
 */
const mockSubscriptionTrialNoStripe: SerializedSubscription = {
  ...mockSubscriptionActive,
  plan: 'FREE',
  status: 'TRIAL',
  quantity: 0,
  planPrice: 0,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
}

const mockSubscriptionPastDue: SerializedSubscription = {
  ...mockSubscriptionActive,
  status: 'PAST_DUE',
}

const mockSubscriptionCanceled: SerializedSubscription = {
  ...mockSubscriptionActive,
  status: 'CANCELED',
  canceledAt: '2026-02-01T00:00:00.000Z',
}

const mockSubscriptionExpired: SerializedSubscription = {
  ...mockSubscriptionActive,
  status: 'EXPIRED',
}

const mockSubscriptionIncomplete: SerializedSubscription = {
  ...mockSubscriptionActive,
  status: 'INCOMPLETE',
}

const mockSubscriptionCancelScheduled: SerializedSubscription = {
  ...mockSubscriptionActive,
  cancelAtPeriodEnd: true,
}

const defaultProps = {
  subscription: mockSubscriptionActive,
  trialEndsAt: null as string | null,
  monthlyAmount: 29,
  onManageSubscription: vi.fn(),
  onCancelSubscription: vi.fn(),
}

// ============================================================================
// Tests
// ============================================================================

describe('SubscriptionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendu selon le statut', () => {
    it('affiche le badge "Actif" pour le statut ACTIVE', () => {
      render(<SubscriptionStatus {...defaultProps} />)
      expect(screen.getByText('Actif')).toBeInTheDocument()
    })

    it('affiche le badge "Essai gratuit" pour le statut TRIAL', () => {
      render(
        <SubscriptionStatus
          {...defaultProps}
          subscription={mockSubscriptionTrial}
        />
      )
      expect(screen.getByText('Essai gratuit')).toBeInTheDocument()
    })

    it("affiche le countdown des jours d'essai restants", () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      render(
        <SubscriptionStatus
          {...defaultProps}
          subscription={mockSubscriptionTrial}
          trialEndsAt={futureDate.toISOString()}
        />
      )
      expect(screen.getByTestId('trial-subscribed-alert')).toBeInTheDocument()
      expect(screen.getByText(/jour/)).toBeInTheDocument()
    })

    it('affiche le badge "Paiement en retard" pour PAST_DUE', () => {
      render(
        <SubscriptionStatus
          {...defaultProps}
          subscription={mockSubscriptionPastDue}
        />
      )
      expect(screen.getByText('Paiement en retard')).toBeInTheDocument()
    })

    it('affiche le badge "Annulé" pour CANCELED avec date', () => {
      render(
        <SubscriptionStatus
          {...defaultProps}
          subscription={mockSubscriptionCanceled}
        />
      )
      expect(screen.getByText('Annulé')).toBeInTheDocument()
      expect(screen.getByTestId('canceled-at')).toBeInTheDocument()
    })

    it('affiche le badge "Expiré" pour EXPIRED', () => {
      render(
        <SubscriptionStatus
          {...defaultProps}
          subscription={mockSubscriptionExpired}
        />
      )
      expect(screen.getByText('Expiré')).toBeInTheDocument()
    })

    it('affiche le badge "En attente" pour INCOMPLETE', () => {
      render(
        <SubscriptionStatus
          {...defaultProps}
          subscription={mockSubscriptionIncomplete}
        />
      )
      expect(screen.getByText('En attente')).toBeInTheDocument()
    })
  })

  describe('Annulation programmée', () => {
    it('affiche une alerte si cancelAtPeriodEnd est true', () => {
      render(
        <SubscriptionStatus
          {...defaultProps}
          subscription={mockSubscriptionCancelScheduled}
        />
      )
      expect(screen.getByTestId('cancel-alert')).toBeInTheDocument()
      expect(screen.getByText('Annulation programmée')).toBeInTheDocument()
    })

    it('masque le bouton Annuler si annulation déjà programmée', () => {
      render(
        <SubscriptionStatus
          {...defaultProps}
          subscription={mockSubscriptionCancelScheduled}
        />
      )
      expect(
        screen.queryByTestId('cancel-subscription-btn')
      ).not.toBeInTheDocument()
    })
  })

  describe('Aucun abonnement', () => {
    it('affiche un EmptyState avec CTA quand subscription est null', () => {
      render(<SubscriptionStatus {...defaultProps} subscription={null} />)
      expect(screen.getByText('Aucun abonnement')).toBeInTheDocument()
      expect(screen.getByText("S'abonner")).toBeInTheDocument()
    })

    /**
     * Une ligne Subscription locale (TRIAL, sans identifiants Stripe) existe
     * dès l'inscription pour piloter les rappels de fin d'essai. Elle ne doit
     * pas déclencher l'écran « Vous êtes abonné » : le compte affichait alors
     * 0 siège, 0,00 € et un bouton « Gérer mon abonnement » qui échouait.
     */
    it('traite une subscription sans identifiant Stripe comme un essai sans abonnement', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 21)

      render(
        <SubscriptionStatus
          {...defaultProps}
          subscription={mockSubscriptionTrialNoStripe}
          trialEndsAt={futureDate.toISOString()}
        />
      )

      expect(screen.getByTestId('subscription-empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('subscribe-btn')).toBeInTheDocument()
      expect(
        screen.queryByText('Vous êtes abonné, essai gratuit en cours')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('manage-subscription-btn')
      ).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('appelle onManageSubscription au clic sur "Gérer mon abonnement"', () => {
      const onManage = vi.fn()
      render(
        <SubscriptionStatus {...defaultProps} onManageSubscription={onManage} />
      )
      fireEvent.click(screen.getByTestId('manage-subscription-btn'))
      expect(onManage).toHaveBeenCalledTimes(1)
    })

    it('appelle onCancelSubscription au clic sur "Annuler"', () => {
      const onCancel = vi.fn()
      render(
        <SubscriptionStatus {...defaultProps} onCancelSubscription={onCancel} />
      )
      fireEvent.click(screen.getByTestId('cancel-subscription-btn'))
      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Affichage des données', () => {
    it('affiche le montant mensuel formaté', () => {
      render(<SubscriptionStatus {...defaultProps} monthlyAmount={29} />)
      expect(screen.getByTestId('monthly-amount')).toHaveTextContent('29,00')
    })

    it('affiche le nombre de sièges', () => {
      render(<SubscriptionStatus {...defaultProps} />)
      expect(screen.getByTestId('seat-count')).toHaveTextContent('10')
    })

    it('affiche la période de facturation', () => {
      render(<SubscriptionStatus {...defaultProps} />)
      expect(screen.getByTestId('billing-period')).toBeInTheDocument()
    })

    it('affiche le titre Abonnement', () => {
      render(<SubscriptionStatus {...defaultProps} />)
      expect(screen.getByText('Abonnement')).toBeInTheDocument()
    })
  })
})
