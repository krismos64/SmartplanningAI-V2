/**
 * Tests unitaires pour BillingPageContent
 *
 * @ticket SP-360
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BillingPageContent } from '@/app/app/tableau-de-bord/facturation/_components/BillingPageContent'
import type { SerializedBillingData } from '@/app/app/tableau-de-bord/facturation/_components/BillingPageContent'

// ============================================================================
// Mocks
// ============================================================================

const mockCreateBillingPortalAction = vi.hoisted(() => vi.fn())
const mockCancelSubscriptionAction = vi.hoisted(() => vi.fn())
const mockRouterRefresh = vi.hoisted(() => vi.fn())

vi.mock('@/lib/actions/stripe', () => ({
  createBillingPortalAction: mockCreateBillingPortalAction,
  cancelSubscriptionAction: mockCancelSubscriptionAction,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh,
    push: vi.fn(),
  }),
}))

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

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Tooltip: ({ children }: React.PropsWithChildren) => <>{children}</>,
  TooltipTrigger: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span {...props}>{children}</span>
  ),
  TooltipContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}))

// ============================================================================
// Fixtures
// ============================================================================

const mockBillingData: SerializedBillingData = {
  subscription: {
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
  },
  payments: [
    {
      id: 'pay_001',
      amount: 2900,
      currency: 'eur',
      status: 'SUCCEEDED',
      paidAt: '2026-02-01T10:00:00.000Z',
      createdAt: '2026-02-01T09:00:00.000Z',
      stripeInvoiceId: 'in_test_abc',
      paymentMethod: 'card',
    },
  ],
  employeeCount: 8,
  monthlyAmount: 29,
  trialEndsAt: null,
}

const mockBillingDataNoSub: SerializedBillingData = {
  subscription: null,
  payments: [],
  employeeCount: 0,
  monthlyAmount: 0,
  trialEndsAt: null,
}

// ============================================================================
// Tests
// ============================================================================

describe('BillingPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendu', () => {
    it('rend les 3 sous-composants quand subscription existe', () => {
      render(<BillingPageContent billingData={mockBillingData} />)
      expect(screen.getByTestId('subscription-status')).toBeInTheDocument()
      expect(screen.getByTestId('usage-indicator')).toBeInTheDocument()
      expect(screen.getByTestId('invoice-history')).toBeInTheDocument()
    })

    it('gère subscription=null sans crash', () => {
      render(<BillingPageContent billingData={mockBillingDataNoSub} />)
      expect(screen.getByTestId('subscription-empty-state')).toBeInTheDocument()
      expect(screen.getByText('Aucun abonnement')).toBeInTheDocument()
    })

    it('masque UsageIndicator et InvoiceHistory si pas d\'abonnement', () => {
      render(<BillingPageContent billingData={mockBillingDataNoSub} />)
      expect(screen.queryByTestId('usage-indicator')).not.toBeInTheDocument()
      expect(screen.queryByTestId('invoice-history')).not.toBeInTheDocument()
    })

    it('a le data-testid billing-page-content', () => {
      render(<BillingPageContent billingData={mockBillingData} />)
      expect(screen.getByTestId('billing-page-content')).toBeInTheDocument()
    })
  })

  describe('Action Gérer', () => {
    it('appelle createBillingPortalAction et ouvre dans un nouvel onglet', async () => {
      const mockOpen = vi.fn()
      vi.stubGlobal('open', mockOpen)

      mockCreateBillingPortalAction.mockResolvedValue({
        success: true,
        data: { url: 'https://billing.stripe.com/session/test' },
      })

      render(<BillingPageContent billingData={mockBillingData} />)
      fireEvent.click(screen.getByTestId('manage-subscription-btn'))

      await waitFor(() => {
        expect(mockCreateBillingPortalAction).toHaveBeenCalledWith({})
      })

      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith(
          'https://billing.stripe.com/session/test',
          '_blank',
          'noopener,noreferrer'
        )
      })

      vi.unstubAllGlobals()
    })

    it('affiche une erreur si l\'action échoue', async () => {
      mockCreateBillingPortalAction.mockResolvedValue({
        success: false,
        error: 'Aucun abonnement Stripe trouvé',
      })

      render(<BillingPageContent billingData={mockBillingData} />)
      fireEvent.click(screen.getByTestId('manage-subscription-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('billing-error')).toHaveTextContent(
          'Aucun abonnement Stripe trouvé'
        )
      })
    })
  })
})
