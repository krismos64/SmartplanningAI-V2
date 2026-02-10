/**
 * Helpers et fixtures pour les tests E2E billing
 *
 * Fournit des données mock de billing sérialisées pour les différents
 * scénarios d'abonnement (TRIAL, ACTIVE, PAST_DUE, CANCELED, EXPIRED).
 *
 * Les tests E2E billing interceptent les Server Actions Next.js via
 * page.route() pour simuler les différents états sans modifier la DB.
 *
 * @ticket SP-373
 */

// =============================================================================
// Types (miroir de SerializedBillingData)
// =============================================================================

interface SerializedSubscription {
  plan: string
  status: string
  quantity: number
  pricePerEmployee: number
  planPrice: number
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  createdAt: string
  stripeCustomerId: string
}

interface SerializedPayment {
  id: string
  amount: number
  currency: string
  status: string
  paidAt: string | null
  createdAt: string
  stripeInvoiceId: string | null
  paymentMethod: string | null
}

export interface MockBillingData {
  subscription: SerializedSubscription | null
  payments: SerializedPayment[]
  employeeCount: number
  monthlyAmount: number
  trialEndsAt: string | null
}

// =============================================================================
// Helpers de dates
// =============================================================================

function daysFromNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function daysAgo(days: number): string {
  return daysFromNow(-days)
}

// =============================================================================
// Données mock pour chaque statut
// =============================================================================

const BASE_SUBSCRIPTION: SerializedSubscription = {
  plan: 'PER_SEAT',
  status: 'ACTIVE',
  quantity: 10,
  pricePerEmployee: 290,
  planPrice: 2900,
  currentPeriodStart: daysAgo(15),
  currentPeriodEnd: daysFromNow(15),
  cancelAtPeriodEnd: false,
  canceledAt: null,
  createdAt: daysAgo(90),
  stripeCustomerId: 'cus_test_e2e',
}

const SAMPLE_PAYMENT: SerializedPayment = {
  id: 'pay_test_1',
  amount: 2900,
  currency: 'EUR',
  status: 'SUCCEEDED',
  paidAt: daysAgo(15),
  createdAt: daysAgo(15),
  stripeInvoiceId: 'in_test_1',
  paymentMethod: 'STRIPE',
}

/**
 * Company en TRIAL avec jours restants configurables
 */
export function mockTrialBilling(daysRemaining = 14): MockBillingData {
  return {
    subscription: {
      ...BASE_SUBSCRIPTION,
      status: 'TRIAL',
      planPrice: 0,
    },
    payments: [],
    employeeCount: 10,
    monthlyAmount: 0,
    trialEndsAt: daysFromNow(daysRemaining),
  }
}

/**
 * Company en ACTIVE avec paiements
 */
export function mockActiveBilling(employees = 10): MockBillingData {
  const monthlyAmount = (employees * 290) / 100
  return {
    subscription: {
      ...BASE_SUBSCRIPTION,
      status: 'ACTIVE',
      quantity: employees,
      planPrice: employees * 290,
    },
    payments: [
      SAMPLE_PAYMENT,
      {
        ...SAMPLE_PAYMENT,
        id: 'pay_test_2',
        paidAt: daysAgo(45),
        createdAt: daysAgo(45),
        stripeInvoiceId: 'in_test_2',
      },
    ],
    employeeCount: employees,
    monthlyAmount,
    trialEndsAt: null,
  }
}

/**
 * Company en PAST_DUE (paiement echoue)
 * @param daysOverdue - jours depuis la fin de la periode
 */
export function mockPastDueBilling(daysOverdue = 3): MockBillingData {
  return {
    subscription: {
      ...BASE_SUBSCRIPTION,
      status: 'PAST_DUE',
      currentPeriodEnd: daysAgo(daysOverdue),
    },
    payments: [
      {
        ...SAMPLE_PAYMENT,
        status: 'FAILED',
        paidAt: null,
      },
    ],
    employeeCount: 10,
    monthlyAmount: 29,
    trialEndsAt: null,
  }
}

/**
 * Company CANCELED
 */
export function mockCanceledBilling(): MockBillingData {
  return {
    subscription: {
      ...BASE_SUBSCRIPTION,
      status: 'CANCELED',
      cancelAtPeriodEnd: true,
      canceledAt: daysAgo(5),
    },
    payments: [SAMPLE_PAYMENT],
    employeeCount: 10,
    monthlyAmount: 29,
    trialEndsAt: null,
  }
}

/**
 * Company EXPIRED
 */
export function mockExpiredBilling(): MockBillingData {
  return {
    subscription: {
      ...BASE_SUBSCRIPTION,
      status: 'EXPIRED',
      currentPeriodEnd: daysAgo(30),
      canceledAt: daysAgo(30),
    },
    payments: [SAMPLE_PAYMENT],
    employeeCount: 10,
    monthlyAmount: 29,
    trialEndsAt: null,
  }
}

/**
 * Company trial expire (0 jours restants)
 */
export function mockTrialExpiredBilling(): MockBillingData {
  return {
    subscription: {
      ...BASE_SUBSCRIPTION,
      status: 'TRIAL',
      planPrice: 0,
    },
    payments: [],
    employeeCount: 10,
    monthlyAmount: 0,
    trialEndsAt: daysAgo(1),
  }
}

/**
 * Aucun abonnement
 */
export function mockNoSubscriptionBilling(): MockBillingData {
  return {
    subscription: null,
    payments: [],
    employeeCount: 0,
    monthlyAmount: 0,
    trialEndsAt: null,
  }
}
