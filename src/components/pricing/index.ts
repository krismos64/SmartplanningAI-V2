/**
 * Pricing Components - Barrel Export
 *
 * @ticket SP-355
 */

export {
  PricingSimulator,
  type PricingSimulatorProps,
} from './PricingSimulator'
export {
  PRICING,
  INCLUDED_FEATURES,
  calculateMonthlyPrice,
  calculateYearlyPrice,
  formatPrice,
} from '@/lib/config/pricing'
