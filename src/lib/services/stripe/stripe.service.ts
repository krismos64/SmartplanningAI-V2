/**
 * Service Stripe — logique métier per-seat
 *
 * @description Fonctions pour checkout, gestion abonnements, billing portal
 * et traitement des événements webhook Stripe.
 *
 * Compatible Stripe SDK v20+ (API 2026-01-28.clover) :
 * - Subscription n'a plus current_period_start/end (utilise billing_cycle_anchor)
 * - Invoice utilise parent.subscription_details pour la subscription
 * - Invoice utilise payments.data[] pour les payment intents
 *
 * @ticket SP-351
 * @see SP-349 pour le client singleton et la configuration
 * @see SP-350 pour le schema Prisma (Subscription, Payment)
 */

import Stripe from 'stripe'

import { prisma } from '@/lib/prisma'
import {
  stripe,
  STRIPE_PRICING,
  STRIPE_STATUS_MAP,
  STRIPE_METADATA_KEYS,
  type StripeSubscriptionStatus,
} from '@/lib/stripe'
import { formatAmountEuros } from '@/lib/email/billing/format'
import {
  sendSubscriptionActivatedEmail,
  sendPaymentConfirmedEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCanceledEmail,
} from '@/lib/email/templates/billing'
import { sendEmail } from '@/lib/email/send'
import type { ServiceResult } from '@/lib/services/dashboard/types'
import type {
  CreateCheckoutSessionInput,
  UpdateSubscriptionQuantityInput,
  CancelSubscriptionInput,
  CreateBillingPortalInput,
  CheckoutSessionResult,
  BillingPortalResult,
  WebhookHandlerResult,
} from '@/types/stripe'

// ============================================================================
// Helpers Stripe SDK v20
// ============================================================================

/** Extrait le subscription ID depuis un Invoice (SDK v20 : parent.subscription_details) */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription
  if (!sub) return null
  return typeof sub === 'string' ? sub : sub.id
}

/** Extrait le payment intent ID depuis un Invoice (SDK v20 : payments.data[].payment) */
function getPaymentIntentIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const invoicePayment = invoice.payments?.data?.[0]
  if (!invoicePayment) return null
  const pi = invoicePayment.payment?.payment_intent
  if (!pi) return null
  return typeof pi === 'string' ? pi : pi.id
}

/**
 * Récupère le director d'une company pour l'envoi d'emails billing.
 * Retourne null si aucun director n'est trouvé.
 */
async function getCompanyDirector(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      name: true,
      users: {
        where: { role: 'DIRECTOR' },
        take: 1,
        select: { email: true, name: true },
      },
    },
  })

  const director = company?.users[0]
  if (!company || !director) return null

  return {
    email: director.email,
    firstName: director.name?.split(' ')[0] ?? 'Dirigeant',
    companyName: company.name,
  }
}

// ============================================================================
// Checkout
// ============================================================================

/**
 * Crée une session Stripe Checkout pour un abonnement per-seat.
 *
 * 1. Valide la quantité
 * 2. Crée ou réutilise le customer Stripe
 * 3. Crée la session checkout en mode subscription
 * 4. Persiste le stripeCustomerId si nouveau
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<ServiceResult<CheckoutSessionResult>> {
  try {
    const { companyId, email, companyName, quantity, successUrl, cancelUrl } =
      input

    // Validation quantité
    if (
      quantity < STRIPE_PRICING.MIN_QUANTITY ||
      quantity > STRIPE_PRICING.MAX_QUANTITY
    ) {
      return {
        success: false,
        error: `La quantité doit être entre ${STRIPE_PRICING.MIN_QUANTITY} et ${STRIPE_PRICING.MAX_QUANTITY}`,
      }
    }

    if (!Number.isInteger(quantity)) {
      return { success: false, error: 'La quantité doit être un entier' }
    }

    // Chercher la subscription existante
    const existingSub = await prisma.subscription.findUnique({
      where: { companyId },
      select: { stripeCustomerId: true },
    })

    let customerId = existingSub?.stripeCustomerId

    // Créer le customer Stripe si nécessaire
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: companyName,
        metadata: {
          [STRIPE_METADATA_KEYS.COMPANY_ID]: companyId,
        },
      })
      customerId = customer.id

      // Persister le customerId
      await prisma.subscription.upsert({
        where: { companyId },
        create: {
          companyId,
          stripeCustomerId: customerId,
          plan: 'FREE',
          status: 'TRIAL',
        },
        update: {
          stripeCustomerId: customerId,
        },
      })
    }

    // Créer la session checkout
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: STRIPE_PRICING.CURRENCY,
            product_data: {
              name: 'SmartPlanning Per-Seat',
              description: `Abonnement ${quantity} employé${quantity > 1 ? 's' : ''}`,
            },
            unit_amount: STRIPE_PRICING.UNIT_AMOUNT_CENTS,
            recurring: {
              interval: STRIPE_PRICING.BILLING_INTERVAL,
            },
          },
          quantity,
        },
      ],
      subscription_data: {
        trial_period_days: STRIPE_PRICING.TRIAL_PERIOD_DAYS,
        metadata: {
          [STRIPE_METADATA_KEYS.COMPANY_ID]: companyId,
        },
      },
      success_url: successUrl || `${baseUrl}/app/billing?success=true`,
      cancel_url: cancelUrl || `${baseUrl}/app/billing?canceled=true`,
      metadata: {
        [STRIPE_METADATA_KEYS.COMPANY_ID]: companyId,
      },
    })

    if (!session.url) {
      return {
        success: false,
        error: "Stripe n'a pas retourné d'URL de checkout",
      }
    }

    return {
      success: true,
      data: { sessionId: session.id, url: session.url },
    }
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return { success: false, error: `Erreur Stripe : ${error.message}` }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du checkout',
    }
  }
}

// ============================================================================
// Subscription Management
// ============================================================================

/**
 * Met à jour la quantité d'un abonnement per-seat (prorata automatique).
 *
 * Récupère le subscription item ID côté Stripe puis applique la nouvelle quantité.
 */
export async function updateSubscriptionQuantity(
  input: UpdateSubscriptionQuantityInput
): Promise<ServiceResult<void>> {
  try {
    const { subscriptionId, newQuantity } = input

    // Validation quantité
    if (
      newQuantity < STRIPE_PRICING.MIN_QUANTITY ||
      newQuantity > STRIPE_PRICING.MAX_QUANTITY
    ) {
      return {
        success: false,
        error: `La quantité doit être entre ${STRIPE_PRICING.MIN_QUANTITY} et ${STRIPE_PRICING.MAX_QUANTITY}`,
      }
    }

    if (!Number.isInteger(newQuantity)) {
      return { success: false, error: 'La quantité doit être un entier' }
    }

    // Récupérer la subscription en DB
    const dbSub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      select: { id: true, pricePerEmployee: true },
    })

    if (!dbSub) {
      return { success: false, error: 'Abonnement introuvable en base' }
    }

    // Récupérer la subscription Stripe pour obtenir le subscription item ID
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
    const itemId = stripeSub.items.data[0]?.id

    if (!itemId) {
      return {
        success: false,
        error: "Aucun item trouvé sur l'abonnement Stripe",
      }
    }

    // Mettre à jour chez Stripe avec prorata
    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, quantity: newQuantity }],
      proration_behavior: 'create_prorations',
    })

    // Synchroniser en DB
    await prisma.subscription.update({
      where: { id: dbSub.id },
      data: {
        quantity: newQuantity,
        planPrice: newQuantity * dbSub.pricePerEmployee,
      },
    })

    return { success: true }
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return { success: false, error: `Erreur Stripe : ${error.message}` }
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour',
    }
  }
}

/**
 * Annule un abonnement (fin de période par défaut, ou immédiatement).
 */
export async function cancelSubscription(
  input: CancelSubscriptionInput
): Promise<ServiceResult<void>> {
  try {
    const { subscriptionId, cancelImmediately = false } = input

    // Récupérer la subscription en DB
    const dbSub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      select: { id: true, companyId: true },
    })

    if (!dbSub) {
      return { success: false, error: 'Abonnement introuvable en base' }
    }

    if (cancelImmediately) {
      await stripe.subscriptions.cancel(subscriptionId)
      await prisma.subscription.update({
        where: { id: dbSub.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
          cancelAtPeriodEnd: false,
        },
      })
    } else {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
      await prisma.subscription.update({
        where: { id: dbSub.id },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
        },
      })
    }

    // Fire-and-forget : notifier les SYSTEM_ADMIN (notification + email)
    getCompanyDirector(dbSub.companyId)
      .then((director) => {
        const companyName =
          director?.companyName ??
          `Entreprise #${dbSub.companyId.slice(0, 8)}`

        // Notification in-app admin
        import('@/lib/actions/notifications')
          .then(({ createAdminNotification }) =>
            createAdminNotification({
              title: 'Abonnement annulé',
              message: `${companyName} a résilié son abonnement`,
              type: 'WARNING',
              priority: 'HIGH',
              actionUrl: '/app/admin/companies',
            })
          )
          .catch(console.error)

        // Email aux admins
        import('@/lib/services/admin-notification.service')
          .then(({ getSystemAdminUserIds }) =>
            getSystemAdminUserIds().then((adminIds) => {
              if (adminIds.length === 0) return
              return prisma.user
                .findMany({
                  where: { id: { in: adminIds } },
                  select: { email: true },
                })
                .then((admins) =>
                  Promise.allSettled(
                    admins.map((admin) =>
                      sendEmail({
                        to: admin.email,
                        subject: `[SmartPlanning] Résiliation — ${companyName}`,
                        html: `<p>Bonjour,</p><p>L'entreprise <strong>${companyName}</strong> vient de résilier son abonnement SmartPlanning.</p><p>Connectez-vous au panel admin pour plus de détails.</p><p>— SmartPlanning</p>`,
                      })
                    )
                  )
                )
            })
          )
          .catch(console.error)
      })
      .catch(console.error)

    return { success: true }
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return { success: false, error: `Erreur Stripe : ${error.message}` }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erreur lors de l'annulation",
    }
  }
}

// ============================================================================
// Billing Portal
// ============================================================================

/**
 * Crée une session Stripe Billing Portal pour que le client gère son abonnement.
 */
export async function createBillingPortalSession(
  input: CreateBillingPortalInput
): Promise<ServiceResult<BillingPortalResult>> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: input.customerId,
      return_url: input.returnUrl,
    })

    return { success: true, data: { url: session.url } }
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return { success: false, error: `Erreur Stripe : ${error.message}` }
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de l'ouverture du portail",
    }
  }
}

// ============================================================================
// Webhook Handler
// ============================================================================

/**
 * Traite un événement webhook Stripe.
 *
 * Dispatche vers la fonction appropriée selon event.type.
 * Retourne toujours un résultat (pas d'exception) pour que la route
 * puisse retourner 200 à Stripe dans tous les cas.
 */
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<ServiceResult<WebhookHandlerResult>> {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        return handleCheckoutCompleted(event.data.object)

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        return handleSubscriptionUpdated(event.data.object, event.type)

      case 'customer.subscription.deleted':
        return handleSubscriptionDeleted(event.data.object)

      case 'invoice.paid':
        return handleInvoicePaid(event.data.object)

      case 'invoice.payment_failed':
        return handleInvoicePaymentFailed(event.data.object)

      default:
        return {
          success: true,
          data: {
            handled: false,
            eventType: event.type,
            action: 'ignored',
          },
        }
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erreur traitement webhook',
    }
  }
}

// ============================================================================
// Handlers internes
// ============================================================================

/**
 * Traite checkout.session.completed :
 * Active l'abonnement et lie le stripeSubscriptionId.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<ServiceResult<WebhookHandlerResult>> {
  const companyId = session.metadata?.[STRIPE_METADATA_KEYS.COMPANY_ID]

  if (!companyId) {
    return {
      success: false,
      error: 'companyId manquant dans metadata checkout session',
    }
  }

  const stripeSubscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

  if (!stripeSubscriptionId) {
    return {
      success: false,
      error: 'subscription manquante dans checkout session',
    }
  }

  // Récupérer les détails de la subscription Stripe
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  const quantity = stripeSub.items.data[0]?.quantity ?? 0

  // SDK v20 : billing_cycle_anchor pour la période (current_period_start/end supprimés)
  const periodStart = new Date(stripeSub.billing_cycle_anchor * 1000)

  await prisma.subscription.upsert({
    where: { companyId },
    create: {
      companyId,
      stripeCustomerId:
        typeof session.customer === 'string'
          ? session.customer
          : (session.customer?.id ?? ''),
      stripeSubscriptionId,
      stripePriceId: stripeSub.items.data[0]?.price?.id ?? null,
      plan: 'PER_SEAT',
      status: 'ACTIVE',
      quantity,
      pricePerEmployee: STRIPE_PRICING.UNIT_AMOUNT_CENTS,
      planPrice: quantity * STRIPE_PRICING.UNIT_AMOUNT_CENTS,
      currentPeriodStart: periodStart,
    },
    update: {
      stripeSubscriptionId,
      stripePriceId: stripeSub.items.data[0]?.price?.id ?? null,
      plan: 'PER_SEAT',
      status: 'ACTIVE',
      quantity,
      pricePerEmployee: STRIPE_PRICING.UNIT_AMOUNT_CENTS,
      planPrice: quantity * STRIPE_PRICING.UNIT_AMOUNT_CENTS,
      currentPeriodStart: periodStart,
      cancelAtPeriodEnd: false,
      canceledAt: null,
    },
  })

  // Fire-and-forget : email d'activation (SP-370)
  getCompanyDirector(companyId)
    .then((director) => {
      if (!director) return
      sendSubscriptionActivatedEmail({
        companyId,
        subscriptionId: stripeSubscriptionId,
        recipientEmail: director.email,
        firstName: director.firstName,
        companyName: director.companyName,
        employeeCount: quantity,
        monthlyAmount: formatAmountEuros(
          quantity * STRIPE_PRICING.UNIT_AMOUNT_CENTS
        ),
      }).catch((err) =>
        console.error('[Webhook] Email SubscriptionActivated failed:', err)
      )
    })
    .catch((err) => console.error('[Webhook] Director lookup failed:', err))

  return {
    success: true,
    data: {
      handled: true,
      eventType: 'checkout.session.completed',
      action: 'subscription_activated',
    },
  }
}

/**
 * Traite customer.subscription.created/updated :
 * Synchronise status, quantity, période et prix.
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  eventType: string
): Promise<ServiceResult<WebhookHandlerResult>> {
  const companyId = subscription.metadata?.[STRIPE_METADATA_KEYS.COMPANY_ID]

  if (!companyId) {
    return {
      success: false,
      error: 'companyId manquant dans metadata subscription',
    }
  }

  const stripeStatus = subscription.status as StripeSubscriptionStatus
  const internalStatus = STRIPE_STATUS_MAP[stripeStatus] ?? 'TRIAL'
  const quantity = subscription.items.data[0]?.quantity ?? 0

  // Vérifier si la subscription existe déjà
  const existing = await prisma.subscription.findUnique({
    where: { companyId },
    select: {
      id: true,
      status: true,
      quantity: true,
      pricePerEmployee: true,
    },
  })

  // Idempotence : ne pas écrire si rien n'a changé
  if (
    existing &&
    existing.status === internalStatus &&
    existing.quantity === quantity
  ) {
    return {
      success: true,
      data: {
        handled: true,
        eventType,
        action: 'no_change',
      },
    }
  }

  const pricePerEmployee =
    existing?.pricePerEmployee ?? STRIPE_PRICING.UNIT_AMOUNT_CENTS

  // SDK v20 : billing_cycle_anchor
  const periodStart = new Date(subscription.billing_cycle_anchor * 1000)

  await prisma.subscription.upsert({
    where: { companyId },
    create: {
      companyId,
      stripeCustomerId:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : (subscription.customer?.id ?? ''),
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price?.id ?? null,
      plan: 'PER_SEAT',
      status: internalStatus,
      quantity,
      pricePerEmployee,
      planPrice: quantity * pricePerEmployee,
      currentPeriodStart: periodStart,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price?.id ?? null,
      status: internalStatus,
      quantity,
      planPrice: quantity * pricePerEmployee,
      currentPeriodStart: periodStart,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })

  // Fire-and-forget : notification SYSTEM_ADMIN si abonnement expiré (SP-476)
  if (internalStatus === 'EXPIRED') {
    import('@/lib/actions/notifications')
      .then(({ createAdminNotification }) =>
        createAdminNotification({
          title: 'Abonnement expiré',
          message: `L'abonnement de l'entreprise #${companyId} a expiré`,
          type: 'WARNING',
          actionUrl: '/app/admin/logs',
        })
      )
      .catch(console.error)
  }

  return {
    success: true,
    data: {
      handled: true,
      eventType,
      action: 'subscription_synced',
    },
  }
}

/**
 * Traite customer.subscription.deleted :
 * Marque l'abonnement comme CANCELED.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<ServiceResult<WebhookHandlerResult>> {
  const companyId = subscription.metadata?.[STRIPE_METADATA_KEYS.COMPANY_ID]

  if (!companyId) {
    return {
      success: false,
      error: 'companyId manquant dans metadata subscription',
    }
  }

  // Récupérer la subscription en DB pour le subscriptionId
  const dbSub = await prisma.subscription.findUnique({
    where: { companyId },
    select: { id: true, stripeSubscriptionId: true },
  })

  await prisma.subscription.updateMany({
    where: { companyId },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
      cancelAtPeriodEnd: false,
    },
  })

  // Fire-and-forget : email de confirmation d'annulation (SP-370)
  // SDK v20 : billing_cycle_anchor représente l'ancrage, on utilise canceled_at ou now
  const endTimestamp = subscription.canceled_at ?? Math.floor(Date.now() / 1000)
  const endDate = new Date(endTimestamp * 1000).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  getCompanyDirector(companyId)
    .then((director) => {
      if (!director) return
      sendSubscriptionCanceledEmail({
        companyId,
        subscriptionId: dbSub?.stripeSubscriptionId ?? subscription.id,
        recipientEmail: director.email,
        firstName: director.firstName,
        companyName: director.companyName,
        endDate,
      }).catch((err) =>
        console.error('[Webhook] Email SubscriptionCanceled failed:', err)
      )
    })
    .catch((err) => console.error('[Webhook] Director lookup failed:', err))

  return {
    success: true,
    data: {
      handled: true,
      eventType: 'customer.subscription.deleted',
      action: 'subscription_canceled',
    },
  }
}

/**
 * Traite invoice.paid :
 * Enregistre le paiement réussi.
 *
 * SDK v20 : subscription via parent.subscription_details,
 * payment_intent via payments.data[]
 */
async function handleInvoicePaid(
  invoice: Stripe.Invoice
): Promise<ServiceResult<WebhookHandlerResult>> {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice)

  // Trouver la subscription en DB pour obtenir le companyId
  const dbSub = subscriptionId
    ? await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
        select: { id: true, companyId: true },
      })
    : null

  if (!dbSub) {
    return {
      success: true,
      data: {
        handled: false,
        eventType: 'invoice.paid',
        action: 'subscription_not_found',
      },
    }
  }

  const paymentIntentId = getPaymentIntentIdFromInvoice(invoice)

  if (!paymentIntentId) {
    return {
      success: true,
      data: {
        handled: false,
        eventType: 'invoice.paid',
        action: 'no_payment_intent',
      },
    }
  }

  const amountPaid = invoice.amount_paid ?? 0

  await prisma.payment.upsert({
    where: { stripePaymentId: paymentIntentId },
    create: {
      companyId: dbSub.companyId,
      subscriptionId: dbSub.id,
      stripePaymentId: paymentIntentId,
      stripeInvoiceId: invoice.id,
      amount: amountPaid,
      currency: (invoice.currency ?? 'eur').toUpperCase(),
      status: 'SUCCEEDED',
      paidAt: new Date(),
    },
    update: {
      status: 'SUCCEEDED',
      paidAt: new Date(),
      amount: amountPaid,
    },
  })

  // Fire-and-forget : email de confirmation de paiement (SP-370)
  if (subscriptionId) {
    getCompanyDirector(dbSub.companyId)
      .then((director) => {
        if (!director) return
        sendPaymentConfirmedEmail({
          companyId: dbSub.companyId,
          subscriptionId: subscriptionId,
          recipientEmail: director.email,
          firstName: director.firstName,
          companyName: director.companyName,
          amount: formatAmountEuros(amountPaid),
          employeeCount:
            Math.round(amountPaid / STRIPE_PRICING.UNIT_AMOUNT_CENTS) || 1,
          invoiceUrl: invoice.hosted_invoice_url ?? undefined,
        }).catch((err) =>
          console.error('[Webhook] Email PaymentConfirmed failed:', err)
        )
      })
      .catch((err) => console.error('[Webhook] Director lookup failed:', err))
  }

  return {
    success: true,
    data: {
      handled: true,
      eventType: 'invoice.paid',
      action: 'payment_recorded',
    },
  }
}

/**
 * Traite invoice.payment_failed :
 * Enregistre l'échec et passe la subscription en PAST_DUE.
 *
 * SDK v20 : mêmes adaptations que handleInvoicePaid
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<ServiceResult<WebhookHandlerResult>> {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice)

  const dbSub = subscriptionId
    ? await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
        select: { id: true, companyId: true },
      })
    : null

  if (!dbSub) {
    return {
      success: true,
      data: {
        handled: false,
        eventType: 'invoice.payment_failed',
        action: 'subscription_not_found',
      },
    }
  }

  const paymentIntentId = getPaymentIntentIdFromInvoice(invoice)

  const amountDue = invoice.amount_due ?? 0

  // Transaction : créer/update payment + passer subscription en PAST_DUE
  await prisma.$transaction(async (tx) => {
    if (paymentIntentId) {
      await tx.payment.upsert({
        where: { stripePaymentId: paymentIntentId },
        create: {
          companyId: dbSub.companyId,
          subscriptionId: dbSub.id,
          stripePaymentId: paymentIntentId,
          stripeInvoiceId: invoice.id,
          amount: amountDue,
          currency: (invoice.currency ?? 'eur').toUpperCase(),
          status: 'FAILED',
        },
        update: {
          status: 'FAILED',
        },
      })
    }

    await tx.subscription.update({
      where: { id: dbSub.id },
      data: { status: 'PAST_DUE' },
    })
  })

  // Fire-and-forget : notification SYSTEM_ADMIN paiement échoué (SP-476)
  import('@/lib/actions/notifications')
    .then(({ createAdminNotification }) =>
      createAdminNotification({
        title: 'Paiement échoué',
        message: `Paiement échoué pour l'entreprise #${dbSub.companyId} (${formatAmountEuros(amountDue)})`,
        type: 'WARNING',
        priority: 'HIGH',
        actionUrl: '/app/admin/logs',
      })
    )
    .catch(console.error)

  // Fire-and-forget : email d'échec de paiement (SP-370)
  if (subscriptionId) {
    getCompanyDirector(dbSub.companyId)
      .then((director) => {
        if (!director) return
        sendPaymentFailedEmail({
          companyId: dbSub.companyId,
          subscriptionId: subscriptionId,
          recipientEmail: director.email,
          firstName: director.firstName,
          companyName: director.companyName,
          amount: formatAmountEuros(amountDue),
        }).catch((err) =>
          console.error('[Webhook] Email PaymentFailed failed:', err)
        )
      })
      .catch((err) => console.error('[Webhook] Director lookup failed:', err))
  }

  return {
    success: true,
    data: {
      handled: true,
      eventType: 'invoice.payment_failed',
      action: 'payment_failed_recorded',
    },
  }
}
