/**
 * Pricing Configuration - SmartPlanning V2
 *
 * Source unique de vérité pour toute la tarification.
 * Tarif unique per-seat : 2,90€ / employé / mois.
 *
 * @ticket SP-355
 */

// =============================================================================
// CONSTANTES
// =============================================================================

export const PRICING = {
  PRICE_PER_EMPLOYEE: 2.9,
  CURRENCY: 'EUR',
  MIN_EMPLOYEES: 1,
  MAX_EMPLOYEES: 250,
  DEFAULT_EMPLOYEES: 10,
  TRIAL_DAYS: 21,
  NO_COMMITMENT: true,
  NO_CREDIT_CARD: true,
} as const

// =============================================================================
// FONCTIONS DE CALCUL
// =============================================================================

/**
 * Calcule le prix mensuel pour un nombre d'employés donné.
 *
 * @param employees - Nombre d'employés (clamped entre MIN et MAX)
 * @returns Prix mensuel en euros
 */
export function calculateMonthlyPrice(employees: number): number {
  const clamped = Math.max(
    PRICING.MIN_EMPLOYEES,
    Math.min(PRICING.MAX_EMPLOYEES, Math.round(employees))
  )
  return Math.round(clamped * PRICING.PRICE_PER_EMPLOYEE * 100) / 100
}

/**
 * Calcule le prix annuel pour un nombre d'employés donné.
 *
 * @param employees - Nombre d'employés (clamped entre MIN et MAX)
 * @returns Prix annuel en euros
 */
export function calculateYearlyPrice(employees: number): number {
  return Math.round(calculateMonthlyPrice(employees) * 12 * 100) / 100
}

/**
 * Formate un prix en euros (format français).
 *
 * @param price - Montant en euros
 * @returns Prix formaté (ex: "29,00 €")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: PRICING.CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

// =============================================================================
// FEATURES INCLUSES
// =============================================================================

export const INCLUDED_FEATURES = [
  'Plannings drag & drop',
  'Gestion des congés avec workflow',
  'Tableaux de bord par rôle',
  'Notifications temps réel',
  'Export PDF et Excel',
  'Notes personnelles et incidents',
  'Multi-équipes illimité',
  'Facturation ajustée chaque mois (à la hausse comme à la baisse)',
  'Messagerie interne (direct, équipe, groupe)',
  'Import employés CSV et Excel',
  'Support email réactif',
  'Hébergement sécurisé en France',
  '100 % conforme RGPD',
] as const
