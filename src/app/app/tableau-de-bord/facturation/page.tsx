/**
 * Page Dashboard Billing — Facturation
 *
 * Server Component qui récupère les données de facturation Stripe
 * via getBillingDataAction() et les passe sérialisées au client.
 * Accessible uniquement au rôle DIRECTOR.
 *
 * @ticket SP-360, SP-440
 */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { getBillingDataAction } from '@/lib/actions/stripe'
import type { BillingData } from '@/types/stripe'
import { BillingPageContent } from './_components'
import type { SerializedBillingData } from './_components'

export const metadata = {
  title: 'Facturation | SmartPlanning',
  description:
    'Gérez votre abonnement, consultez vos factures et suivez votre utilisation.',
}

/**
 * Composant d'erreur pour les cas d'échec
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-destructive"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Erreur de chargement</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * Sérialise les dates d'un objet BillingData pour le transfert Server → Client.
 * Les Date natives ne sont pas sérialisables par React entre Server et Client Components.
 */
function serializeBillingData(data: BillingData): SerializedBillingData {
  return {
    subscription: data.subscription
      ? {
          plan: data.subscription.plan,
          status: data.subscription.status,
          quantity: data.subscription.quantity,
          pricePerEmployee: data.subscription.pricePerEmployee,
          planPrice: data.subscription.planPrice,
          currentPeriodStart:
            data.subscription.currentPeriodStart?.toISOString() ?? null,
          currentPeriodEnd:
            data.subscription.currentPeriodEnd?.toISOString() ?? null,
          cancelAtPeriodEnd: data.subscription.cancelAtPeriodEnd,
          canceledAt: data.subscription.canceledAt?.toISOString() ?? null,
          createdAt: data.subscription.createdAt.toISOString(),
          stripeCustomerId: data.subscription.stripeCustomerId,
        }
      : null,
    payments: data.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      stripeInvoiceId: p.stripeInvoiceId,
      paymentMethod: p.paymentMethod,
      invoiceUrl: p.invoiceUrl,
    })),
    employeeCount: data.employeeCount,
    monthlyAmount: data.monthlyAmount,
    trialEndsAt: data.trialEndsAt?.toISOString() ?? null,
    paymentMethod: data.paymentMethod,
  }
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
  const session = await auth()

  if (!session?.user) {
    redirect('/connexion')
  }

  // Vérification du rôle DIRECTOR (ou supérieur)
  if (!hasRequiredRole(session.user.role, 'DIRECTOR')) {
    redirect('/app/tableau-de-bord')
  }

  // Récupérer les données de facturation
  const result = await getBillingDataAction()

  if (!result.success) {
    return <ErrorState message={result.error} />
  }

  // Sérialiser les dates pour le transfert Server → Client
  const serializedData = serializeBillingData(result.data)

  return (
    <div className="space-y-6">
      {/* Titre page */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Facturation</h1>
        <p className="text-muted-foreground">
          Gérez votre abonnement et consultez vos factures.
        </p>
      </div>

      {/* Contenu billing */}
      <BillingPageContent
        billingData={serializedData}
        blockingReason={reason}
      />
    </div>
  )
}
