/**
 * Tests d'intégration : email QuantityUpdated dans la sync employés
 *
 * @ticket SP-370
 * @description Vérifie que sendQuantityUpdatedEmail est appelé
 * après un changement de quantité Stripe réussi
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

// ============================================================================
// Mocks hoistés
// ============================================================================

const { mockSendQuantityUpdated } = vi.hoisted(() => ({
  mockSendQuantityUpdated: vi.fn().mockResolvedValue({ success: true }),
}))

const mockStripe = vi.hoisted(() => ({
  subscriptions: {
    retrieve: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
}))

vi.mock('@/lib/email/billing/format', () => ({
  formatAmountEuros: (cents: number) =>
    `${(cents / 100).toFixed(2).replace('.', ',')} €`,
}))

vi.mock('@/lib/email/templates/billing', () => ({
  sendQuantityUpdatedEmail: mockSendQuantityUpdated,
}))

// ============================================================================
// Imports
// ============================================================================

import { prisma } from '@/lib/prisma'
import { syncEmployeeCountToStripe } from '@/lib/services/stripe/subscription-sync.service'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// ============================================================================
// Helpers
// ============================================================================

const COMPANY_ID = 'company-test-1'
const SUBSCRIPTION_ID = 'sub_test_123'
const ITEM_ID = 'si_test_456'

function setupSyncMocks(
  currentQuantity: number,
  activeEmployees: number,
  withDirector = true
) {
  ;(prismaMock.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: 'sub-db-1',
    stripeSubscriptionId: SUBSCRIPTION_ID,
    status: 'ACTIVE',
    quantity: currentQuantity,
    pricePerEmployee: 290,
  })
  ;(prismaMock.employee.count as ReturnType<typeof vi.fn>).mockResolvedValue(
    activeEmployees
  )

  mockStripe.subscriptions.retrieve.mockResolvedValue({
    id: SUBSCRIPTION_ID,
    items: { data: [{ id: ITEM_ID, quantity: currentQuantity }] },
  })
  mockStripe.subscriptions.update.mockResolvedValue({})
  ;(prismaMock.subscription.update as ReturnType<typeof vi.fn>).mockResolvedValue({})

  if (withDirector) {
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [{ email: 'director@acme.fr', name: 'Jean Dupont' }],
    })
  } else {
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [],
    })
  }
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 50))
}

// ============================================================================
// Tests
// ============================================================================

describe('syncEmployeeCountToStripe — email integration (SP-370)', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.clearAllMocks()
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('Quantité changée (5→8) → sendQuantityUpdatedEmail appelé', async () => {
    setupSyncMocks(5, 8)

    const result = await syncEmployeeCountToStripe(COMPANY_ID)
    await flushPromises()

    expect(result.synced).toBe(true)
    expect(mockSendQuantityUpdated).toHaveBeenCalledOnce()
    expect(mockSendQuantityUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        oldQuantity: 5,
        newQuantity: 8,
        recipientEmail: 'director@acme.fr',
      })
    )
  })

  it('Quantité identique (5→5) → aucun email envoyé', async () => {
    setupSyncMocks(5, 5)

    const result = await syncEmployeeCountToStripe(COMPANY_ID)
    await flushPromises()

    expect(result.synced).toBe(false)
    expect(result.reason).toBe('quantity_unchanged')
    expect(mockSendQuantityUpdated).not.toHaveBeenCalled()
  })

  it('Quantité diminuée (8→5) → email envoyé avec bons params', async () => {
    setupSyncMocks(8, 5)

    const result = await syncEmployeeCountToStripe(COMPANY_ID)
    await flushPromises()

    expect(result.synced).toBe(true)
    expect(mockSendQuantityUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        oldQuantity: 8,
        newQuantity: 5,
        newMonthlyAmount: '14,50 €',
      })
    )
  })

  it('Échec email → sync Stripe pas affectée', async () => {
    setupSyncMocks(5, 10)
    mockSendQuantityUpdated.mockRejectedValue(new Error('SMTP down'))

    const result = await syncEmployeeCountToStripe(COMPANY_ID)
    await flushPromises()

    // La sync Stripe doit quand même réussir
    expect(result.synced).toBe(true)
    expect(result.newQuantity).toBe(10)
  })

  it('newMonthlyAmount calculé correctement (10 employees × 290 centimes)', async () => {
    setupSyncMocks(5, 10)

    await syncEmployeeCountToStripe(COMPANY_ID)
    await flushPromises()

    expect(mockSendQuantityUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        newMonthlyAmount: '29,00 €',
      })
    )
  })
})
