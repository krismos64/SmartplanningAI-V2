/**
 * Tests unitaires pour les Server Actions Stripe
 *
 * @description Tests des 5 actions (checkout, portal, quantity, cancel, billing)
 * avec mocks RBAC, validation Zod et conversion ServiceResult → CrudActionResult.
 *
 * @ticket SP-352
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../mocks/prisma'

// ============================================================================
// Mocks
// ============================================================================

const mockCheckPermission = vi.hoisted(() => vi.fn())
const mockAuth = vi.hoisted(() => vi.fn())
const mockCreateCheckoutSession = vi.hoisted(() => vi.fn())
const mockUpdateSubscriptionQuantity = vi.hoisted(() => vi.fn())
const mockCancelSubscription = vi.hoisted(() => vi.fn())
const mockCreateBillingPortalSession = vi.hoisted(() => vi.fn())
const mockRevalidatePath = vi.hoisted(() => vi.fn())

vi.mock('@/lib/actions/crud-utils', () => ({
  checkPermission: mockCheckPermission,
}))

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}))

vi.mock('@/lib/services/stripe', () => ({
  createCheckoutSession: mockCreateCheckoutSession,
  updateSubscriptionQuantity: mockUpdateSubscriptionQuantity,
  cancelSubscription: mockCancelSubscription,
  createBillingPortalSession: mockCreateBillingPortalSession,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

const mockStripeCustomersRetrieve = vi.hoisted(() => vi.fn())

vi.mock('@/lib/stripe', () => ({
  stripe: {
    customers: {
      retrieve: mockStripeCustomersRetrieve,
    },
  },
}))

// Import après les mocks
import {
  createCheckoutAction,
  createBillingPortalAction,
  updateSubscriptionQuantityAction,
  cancelSubscriptionAction,
  getBillingDataAction,
} from '@/lib/actions/stripe'

// ============================================================================
// Fixtures
// ============================================================================

const COMPANY_ID = 'cltest00000000000company1'
const USER_ID = 'cltest000000000000user001'

const mockDirector = {
  success: true as const,
  data: { id: USER_ID, role: 'DIRECTOR' as const, companyId: COMPANY_ID },
}

const mockSystemAdmin = {
  success: true as const,
  data: {
    id: 'admin-1',
    role: 'SYSTEM_ADMIN' as const,
    companyId: null,
  },
}

const mockAuthDenied = {
  success: false as const,
  error: 'Vous devez être connecté pour effectuer cette action',
}

const mockRbacDenied = {
  success: false as const,
  error: "Vous n'avez pas les permissions nécessaires",
}

const mockSubscription = {
  id: 'sub-1',
  companyId: COMPANY_ID,
  stripeCustomerId: 'cus_test123',
  stripeSubscriptionId: 'sub_test123',
  stripePriceId: 'price_test',
  stripeProductId: 'prod_test',
  plan: 'PER_SEAT',
  quantity: 10,
  pricePerEmployee: 290,
  planPrice: 2900,
  currency: 'EUR',
  billingInterval: 'month',
  metadata: null,
  status: 'ACTIVE',
  currentPeriodStart: new Date('2026-01-01'),
  currentPeriodEnd: new Date('2026-02-01'),
  cancelAtPeriodEnd: false,
  canceledAt: null,
  createdAt: new Date('2025-06-01'),
  updatedAt: new Date('2026-01-01'),
}

const mockPayment = {
  id: 'pay-1',
  companyId: COMPANY_ID,
  subscriptionId: 'sub-1',
  stripePaymentId: 'pi_test123',
  stripeInvoiceId: 'in_test123',
  amount: 2900,
  currency: 'EUR',
  status: 'SUCCEEDED',
  paymentMethod: 'card',
  failureReason: null,
  failureMessage: null,
  metadata: null,
  paidAt: new Date('2026-01-01'),
  createdAt: new Date('2026-01-01'),
}

// ============================================================================
// Setup
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks()
  // Par défaut, le retrieve customer retourne un customer sans payment method
  mockStripeCustomersRetrieve.mockResolvedValue({
    id: 'cus_test123',
    deleted: false,
    invoice_settings: { default_payment_method: null },
  })
})

// ============================================================================
// createCheckoutAction
// ============================================================================

describe('createCheckoutAction', () => {
  it('retourne une erreur si non authentifié', async () => {
    mockCheckPermission.mockResolvedValue(mockAuthDenied)

    const result = await createCheckoutAction({ quantity: 10 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('connecté')
    }
  })

  it('retourne une erreur si rôle insuffisant (EMPLOYEE)', async () => {
    mockCheckPermission.mockResolvedValue(mockRbacDenied)

    const result = await createCheckoutAction({ quantity: 10 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('permissions')
    }
  })

  it('retourne une erreur si companyId est null (SYSTEM_ADMIN)', async () => {
    mockCheckPermission.mockResolvedValue(mockSystemAdmin)

    const result = await createCheckoutAction({ quantity: 10 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('entreprise')
    }
  })

  it('retourne une erreur de validation Zod si quantity invalide', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)

    const result = await createCheckoutAction({ quantity: 0 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeDefined()
    }
  })

  it('retourne une erreur si email introuvable dans la session', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    mockAuth.mockResolvedValue({ user: { id: USER_ID, email: null } })

    const result = await createCheckoutAction({ quantity: 10 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Email')
    }
  })

  it('retourne une erreur si entreprise introuvable', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: 'director@acme.com' },
    })
    prismaMock.company.findUnique.mockResolvedValue(null)

    const result = await createCheckoutAction({ quantity: 10 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('introuvable')
    }
  })

  it('forwarde une erreur du service Stripe', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: 'director@acme.com' },
    })
    prismaMock.company.findUnique.mockResolvedValue({
      name: 'Acme Corp',
    } as never)
    mockCreateCheckoutSession.mockResolvedValue({
      success: false,
      error: 'Stripe API error',
    })

    const result = await createCheckoutAction({ quantity: 10 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Stripe API error')
    }
  })

  it('retourne sessionId et url en cas de succès', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: 'director@acme.com' },
    })
    prismaMock.company.findUnique.mockResolvedValue({
      name: 'Acme Corp',
    } as never)
    mockCreateCheckoutSession.mockResolvedValue({
      success: true,
      data: {
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      },
    })

    const result = await createCheckoutAction({ quantity: 10 })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sessionId).toBe('cs_test_123')
      expect(result.data.url).toContain('checkout.stripe.com')
    }
  })

  it('passe les bons paramètres au service Stripe', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: 'director@acme.com' },
    })
    prismaMock.company.findUnique.mockResolvedValue({
      name: 'Acme Corp',
    } as never)
    mockCreateCheckoutSession.mockResolvedValue({
      success: true,
      data: { sessionId: 'cs_test', url: 'https://checkout.stripe.com' },
    })

    await createCheckoutAction({
      quantity: 15,
      successUrl: 'https://app.test/success',
      cancelUrl: 'https://app.test/cancel',
    })

    expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
      companyId: COMPANY_ID,
      email: 'director@acme.com',
      companyName: 'Acme Corp',
      quantity: 15,
      successUrl: 'https://app.test/success',
      cancelUrl: 'https://app.test/cancel',
    })
  })
})

// ============================================================================
// createBillingPortalAction
// ============================================================================

describe('createBillingPortalAction', () => {
  it('retourne une erreur si non authentifié', async () => {
    mockCheckPermission.mockResolvedValue(mockAuthDenied)

    const result = await createBillingPortalAction({})

    expect(result.success).toBe(false)
  })

  it('retourne une erreur si companyId est null', async () => {
    mockCheckPermission.mockResolvedValue(mockSystemAdmin)

    const result = await createBillingPortalAction({})

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('entreprise')
    }
  })

  it('retourne une erreur si pas de stripeCustomerId', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue(null)

    const result = await createBillingPortalAction({})

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('abonnement')
    }
  })

  it('forwarde une erreur du service Stripe', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_test123',
    } as never)
    mockCreateBillingPortalSession.mockResolvedValue({
      success: false,
      error: 'Portal config missing',
    })

    const result = await createBillingPortalAction({})

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Portal config missing')
    }
  })

  it('retourne l\'url du portail en cas de succès', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_test123',
    } as never)
    mockCreateBillingPortalSession.mockResolvedValue({
      success: true,
      data: { url: 'https://billing.stripe.com/portal/test' },
    })

    const result = await createBillingPortalAction({})

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toContain('billing.stripe.com')
    }
  })

  it('utilise le returnUrl par défaut si non fourni', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_test123',
    } as never)
    mockCreateBillingPortalSession.mockResolvedValue({
      success: true,
      data: { url: 'https://billing.stripe.com/portal/test' },
    })

    await createBillingPortalAction({})

    expect(mockCreateBillingPortalSession).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'cus_test123',
        returnUrl: expect.stringContaining('/app/tableau-de-bord/facturation'),
      })
    )
  })
})

// ============================================================================
// updateSubscriptionQuantityAction
// ============================================================================

describe('updateSubscriptionQuantityAction', () => {
  it('retourne une erreur si non authentifié', async () => {
    mockCheckPermission.mockResolvedValue(mockAuthDenied)

    const result = await updateSubscriptionQuantityAction({ quantity: 20 })

    expect(result.success).toBe(false)
  })

  it('retourne une erreur de validation si quantity > 250', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)

    const result = await updateSubscriptionQuantityAction({ quantity: 300 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeDefined()
    }
  })

  it('retourne une erreur si pas d\'abonnement actif', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue(null)

    const result = await updateSubscriptionQuantityAction({ quantity: 20 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('abonnement')
    }
  })

  it('retourne une erreur si subscription sans stripeSubscriptionId', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: null,
    } as never)

    const result = await updateSubscriptionQuantityAction({ quantity: 20 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('abonnement')
    }
  })

  it('retourne succès et appelle revalidatePath', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: 'sub_test123',
    } as never)
    mockUpdateSubscriptionQuantity.mockResolvedValue({ success: true })

    const result = await updateSubscriptionQuantityAction({ quantity: 20 })

    expect(result.success).toBe(true)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/app/tableau-de-bord/facturation')
  })

  it('passe les bons paramètres au service', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: 'sub_test123',
    } as never)
    mockUpdateSubscriptionQuantity.mockResolvedValue({ success: true })

    await updateSubscriptionQuantityAction({ quantity: 25 })

    expect(mockUpdateSubscriptionQuantity).toHaveBeenCalledWith({
      subscriptionId: 'sub_test123',
      newQuantity: 25,
    })
  })
})

// ============================================================================
// cancelSubscriptionAction
// ============================================================================

describe('cancelSubscriptionAction', () => {
  it('retourne une erreur si non authentifié', async () => {
    mockCheckPermission.mockResolvedValue(mockAuthDenied)

    const result = await cancelSubscriptionAction()

    expect(result.success).toBe(false)
  })

  it('retourne une erreur si pas d\'abonnement', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue(null)

    const result = await cancelSubscriptionAction()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('abonnement')
    }
  })

  it('annule en fin de période par défaut', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: 'sub_test123',
    } as never)
    mockCancelSubscription.mockResolvedValue({ success: true })

    const result = await cancelSubscriptionAction()

    expect(result.success).toBe(true)
    expect(mockCancelSubscription).toHaveBeenCalledWith({
      subscriptionId: 'sub_test123',
      cancelImmediately: false,
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/app/tableau-de-bord/facturation')
  })

  it('annule immédiatement si cancelImmediately = true', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: 'sub_test123',
    } as never)
    mockCancelSubscription.mockResolvedValue({ success: true })

    await cancelSubscriptionAction(true)

    expect(mockCancelSubscription).toHaveBeenCalledWith({
      subscriptionId: 'sub_test123',
      cancelImmediately: true,
    })
  })

  it('forwarde une erreur du service Stripe', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: 'sub_test123',
    } as never)
    mockCancelSubscription.mockResolvedValue({
      success: false,
      error: 'Subscription already canceled',
    })

    const result = await cancelSubscriptionAction()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Subscription already canceled')
    }
  })
})

// ============================================================================
// getBillingDataAction
// ============================================================================

describe('getBillingDataAction', () => {
  it('retourne une erreur si non authentifié', async () => {
    mockCheckPermission.mockResolvedValue(mockAuthDenied)

    const result = await getBillingDataAction()

    expect(result.success).toBe(false)
  })

  it('retourne une erreur si companyId est null', async () => {
    mockCheckPermission.mockResolvedValue(mockSystemAdmin)

    const result = await getBillingDataAction()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('entreprise')
    }
  })

  it('retourne subscription null si aucune subscription', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue(null)
    prismaMock.payment.findMany.mockResolvedValue([])
    prismaMock.employee.count.mockResolvedValue(5 as never)

    const result = await getBillingDataAction()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.subscription).toBeNull()
      expect(result.data.payments).toEqual([])
      expect(result.data.employeeCount).toBe(5)
      expect(result.data.monthlyAmount).toBe(0)
    }
  })

  it('retourne les données complètes avec subscription active', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue(
      mockSubscription as never
    )
    prismaMock.payment.findMany.mockResolvedValue([mockPayment] as never)
    prismaMock.employee.count.mockResolvedValue(10 as never)

    const result = await getBillingDataAction()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.subscription).not.toBeNull()
      expect(result.data.subscription!.plan).toBe('PER_SEAT')
      expect(result.data.subscription!.status).toBe('ACTIVE')
      expect(result.data.subscription!.quantity).toBe(10)
      expect(result.data.subscription!.stripeCustomerId).toBe('cus_test123')
      expect(result.data.payments).toHaveLength(1)
      expect(result.data.employeeCount).toBe(10)
    }
  })

  it('calcule correctement le monthlyAmount', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockResolvedValue(
      mockSubscription as never
    )
    prismaMock.payment.findMany.mockResolvedValue([])
    prismaMock.employee.count.mockResolvedValue(10 as never)

    const result = await getBillingDataAction()

    expect(result.success).toBe(true)
    if (result.success) {
      // 10 employés × 290 centimes / 100 = 29.00€
      expect(result.data.monthlyAmount).toBe(29)
    }
  })

  it('gère une erreur Prisma gracieusement', async () => {
    mockCheckPermission.mockResolvedValue(mockDirector)
    prismaMock.subscription.findUnique.mockRejectedValue(
      new Error('DB connection failed')
    )

    const result = await getBillingDataAction()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('facturation')
    }
  })
})
