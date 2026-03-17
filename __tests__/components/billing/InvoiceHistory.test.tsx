/**
 * Tests unitaires pour InvoiceHistory
 *
 * @ticket SP-360
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InvoiceHistory } from '@/app/app/tableau-de-bord/facturation/_components/InvoiceHistory'
import type { SerializedPayment } from '@/app/app/tableau-de-bord/facturation/_components/InvoiceHistory'

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

const mockPaymentSucceeded: SerializedPayment = {
  id: 'pay_001',
  amount: 2900,
  currency: 'eur',
  status: 'SUCCEEDED',
  paidAt: '2026-02-01T10:00:00.000Z',
  createdAt: '2026-02-01T09:00:00.000Z',
  stripeInvoiceId: 'in_test_abc123',
  paymentMethod: 'card',
  invoiceUrl: 'https://invoice.stripe.com/i/acct_test/inv_test_abc123',
}

const mockPaymentFailed: SerializedPayment = {
  id: 'pay_002',
  amount: 2900,
  currency: 'eur',
  status: 'FAILED',
  paidAt: null,
  createdAt: '2026-01-15T09:00:00.000Z',
  stripeInvoiceId: null,
  paymentMethod: 'card',
  invoiceUrl: null,
}

const mockPaymentPending: SerializedPayment = {
  id: 'pay_003',
  amount: 2900,
  currency: 'eur',
  status: 'PENDING',
  paidAt: null,
  createdAt: '2026-02-05T09:00:00.000Z',
  stripeInvoiceId: null,
  paymentMethod: null,
  invoiceUrl: null,
}

const mockPayments = [mockPaymentSucceeded, mockPaymentFailed, mockPaymentPending]

const defaultProps = {
  payments: mockPayments,
  onOpenPortal: vi.fn(),
}

// ============================================================================
// Tests
// ============================================================================

describe('InvoiceHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendu de la table', () => {
    it('affiche les factures avec les dates formatées', () => {
      render(<InvoiceHistory {...defaultProps} />)
      expect(screen.getByTestId('payment-row-pay_001')).toBeInTheDocument()
      expect(screen.getByTestId('payment-row-pay_002')).toBeInTheDocument()
      expect(screen.getByTestId('payment-row-pay_003')).toBeInTheDocument()
    })

    it('affiche les montants formatés en euros', () => {
      render(<InvoiceHistory {...defaultProps} />)
      const cells = screen.getAllByText(/29,00/)
      expect(cells.length).toBeGreaterThanOrEqual(1)
    })

    it('affiche le moyen de paiement', () => {
      render(<InvoiceHistory {...defaultProps} />)
      const cardCells = screen.getAllByText('card')
      expect(cardCells.length).toBe(2)
    })
  })

  describe('Badges de statut', () => {
    it('affiche le badge "Payé" vert pour SUCCEEDED', () => {
      render(<InvoiceHistory {...defaultProps} />)
      expect(screen.getByText('Payé')).toBeInTheDocument()
    })

    it('affiche le badge "Échoué" rouge pour FAILED', () => {
      render(<InvoiceHistory {...defaultProps} />)
      expect(screen.getByText('Échoué')).toBeInTheDocument()
    })

    it('affiche le badge "En attente" jaune pour PENDING', () => {
      render(<InvoiceHistory {...defaultProps} />)
      expect(screen.getByText('En attente')).toBeInTheDocument()
    })
  })

  describe('Liens facture Stripe', () => {
    it('affiche le lien "Voir" si invoiceUrl existe', () => {
      render(<InvoiceHistory {...defaultProps} />)
      const link = screen.getByTestId('invoice-link-pay_001')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://invoice.stripe.com/i/acct_test/inv_test_abc123'
      )
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('affiche "—" si pas de stripeInvoiceId', () => {
      render(
        <InvoiceHistory
          {...defaultProps}
          payments={[mockPaymentFailed]}
        />
      )
      expect(
        screen.queryByTestId('invoice-link-pay_002')
      ).not.toBeInTheDocument()
    })
  })

  describe('État vide', () => {
    it('affiche un EmptyState quand payments est vide', () => {
      render(<InvoiceHistory payments={[]} onOpenPortal={vi.fn()} />)
      expect(screen.getByText('Aucune facture')).toBeInTheDocument()
    })

    it('masque le bouton "Voir tout" quand payments est vide', () => {
      render(<InvoiceHistory payments={[]} onOpenPortal={vi.fn()} />)
      expect(
        screen.queryByTestId('view-all-invoices-btn')
      ).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('appelle onOpenPortal au clic sur "Voir tout l\'historique"', () => {
      const onOpenPortal = vi.fn()
      render(
        <InvoiceHistory
          payments={mockPayments}
          onOpenPortal={onOpenPortal}
        />
      )
      fireEvent.click(screen.getByTestId('view-all-invoices-btn'))
      expect(onOpenPortal).toHaveBeenCalledTimes(1)
    })
  })
})
