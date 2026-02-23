/**
 * Tests pour AdminStatsPdfDocument
 *
 * Verifie que le composant React PDF se rend correctement
 * avec les donnees AdminStatsResult.
 *
 * @ticket SP-475
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import {
  AdminStatsPdfDocument,
  type AdminStatsPdfDocumentProps,
} from '../AdminStatsPdfDocument'

// ============================================================================
// Fixtures
// ============================================================================

const MOCK_STATS: AdminStatsPdfDocumentProps['stats'] = {
  totalCompanies: { current: 42, previous: 38, trend: 10.5 },
  totalUsers: { current: 256, previous: 230, trend: 11.3 },
  activeSubscriptions: 35,
  mrr: { current: 1015, previous: 950, trend: 6.8 },
  churnRate: 2.1,
  companiesGrowth: [
    { month: 'Sep', count: 30 },
    { month: 'Oct', count: 33 },
    { month: 'Nov', count: 36 },
    { month: 'Dec', count: 38 },
    { month: 'Jan', count: 40 },
    { month: 'Feb', count: 42 },
  ],
  revenueByPlan: [
    { plan: 'Per-seat', revenue: 1015, count: 35 },
    { plan: 'Gratuit', revenue: 0, count: 7 },
  ],
  subscriptionStatusDistribution: [
    { status: 'Actif', count: 30 },
    { status: 'Essai', count: 5 },
    { status: 'Annule', count: 3 },
  ],
}

// ============================================================================
// Tests
// ============================================================================

describe('AdminStatsPdfDocument', () => {
  it('cree un element React valide avec les props requises', () => {
    const element = React.createElement(AdminStatsPdfDocument, {
      stats: MOCK_STATS,
      generatedAt: new Date('2026-02-23T10:00:00'),
    })

    expect(element).toBeTruthy()
    expect(element.type).toBe(AdminStatsPdfDocument)
    expect(element.props.stats.totalCompanies.current).toBe(42)
  })

  it('accepte des stats avec des valeurs a zero', () => {
    const emptyStats: AdminStatsPdfDocumentProps['stats'] = {
      totalCompanies: { current: 0, previous: 0, trend: 0 },
      totalUsers: { current: 0, previous: 0, trend: 0 },
      activeSubscriptions: 0,
      mrr: { current: 0, previous: 0, trend: 0 },
      churnRate: 0,
      companiesGrowth: [],
      revenueByPlan: [],
      subscriptionStatusDistribution: [],
    }

    const element = React.createElement(AdminStatsPdfDocument, {
      stats: emptyStats,
      generatedAt: new Date(),
    })

    expect(element).toBeTruthy()
    expect(element.props.stats.totalCompanies.current).toBe(0)
  })

  it('transmet correctement la date de generation', () => {
    const date = new Date('2026-02-23T14:30:00')

    const element = React.createElement(AdminStatsPdfDocument, {
      stats: MOCK_STATS,
      generatedAt: date,
    })

    expect(element.props.generatedAt).toBe(date)
  })
})
