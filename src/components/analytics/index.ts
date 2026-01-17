/**
 * Module Analytics - Exports publics
 *
 * @description Composants et hooks pour le tracking analytics
 * avec Umami (solution privacy-friendly).
 *
 * @see SP-345 - Intégration Umami Analytics
 */

export { UmamiAnalytics } from './UmamiAnalytics'
export { UmamiAnalyticsWrapper } from './UmamiAnalyticsWrapper'
export { useUmamiTrack } from '@/hooks/useUmamiTrack'
export type { UmamiEventData, UseUmamiTrackReturn } from '@/hooks/useUmamiTrack'
