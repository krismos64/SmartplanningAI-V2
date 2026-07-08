/**
 * Configuration d'affichage des statuts de paiement Stripe
 *
 * Source unique de vérité (SP-547) : était dupliqué byte-identique entre
 * InvoiceHistory.tsx (billing client), PaymentsDataTable.tsx (admin) et
 * CompanySubscriptionTab.tsx (fiche entreprise). Un changement de libellé
 * ou l'arrivée d'un nouveau statut Stripe se fait désormais ici.
 *
 * @ticket SP-547
 */

import type { PaymentStatus } from '@prisma/client'

export type PaymentStatusBadgeVariant =
  | 'success'
  | 'destructive'
  | 'warning'
  | 'secondary'

export interface PaymentStatusConfig {
  label: string
  variant: PaymentStatusBadgeVariant
}

/** Record exhaustif sur l'enum Prisma : un statut ajouté au schéma casse la compilation ici */
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, PaymentStatusConfig> =
  {
    SUCCEEDED: { label: 'Payé', variant: 'success' },
    FAILED: { label: 'Échoué', variant: 'destructive' },
    PENDING: { label: 'En attente', variant: 'warning' },
    REFUNDED: { label: 'Remboursé', variant: 'secondary' },
    REQUIRES_ACTION: { label: 'Action requise', variant: 'warning' },
  }

/**
 * Config d'un statut avec fallback sûr pour une valeur inconnue
 * (colonne String côté Payment historique / données legacy).
 */
export function getPaymentStatusConfig(status: string): PaymentStatusConfig {
  return (
    PAYMENT_STATUS_CONFIG[status as PaymentStatus] ?? {
      label: status,
      variant: 'secondary',
    }
  )
}
