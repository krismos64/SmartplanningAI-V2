/**
 * Composant React PDF pour l'export des statistiques admin
 *
 * @description Genere un document PDF A4 portrait avec :
 * - Header SmartPlanning + date de generation
 * - 6 KPIs principaux en grille 3x2
 * - Tableau croissance entreprises (6 mois)
 * - Tableau revenus par plan
 * - Tableau distribution abonnements
 * @ticket SP-475
 */

import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { adminStatsPdfStyles as s } from './admin-stats-pdf-styles'
import type { AdminStatsResult } from '@/lib/services/dashboard/types'

// ============================================================================
// Types
// ============================================================================

export interface AdminStatsPdfDocumentProps {
  stats: AdminStatsResult
  generatedAt: Date
}

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} EUR`
}

function formatTrend(trend: number): string {
  const sign = trend > 0 ? '+' : ''
  return `${sign}${trend.toFixed(1)}%`
}

// ============================================================================
// Composant
// ============================================================================

export function AdminStatsPdfDocument({
  stats,
  generatedAt,
}: AdminStatsPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>SmartPlanning - Statistiques globales</Text>
          <Text style={s.headerDate}>
            {format(generatedAt, "d MMMM yyyy 'a' HH:mm", { locale: fr })}
          </Text>
        </View>

        {/* KPIs Grid (3x2) */}
        <Text style={s.sectionTitle}>Indicateurs cles</Text>
        <View style={s.kpiGrid}>
          {/* Row 1 */}
          <View style={s.kpiRow}>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>Entreprises</Text>
              <Text style={s.kpiValue}>{stats.totalCompanies.current}</Text>
              <Text style={s.kpiTrend}>
                {formatTrend(stats.totalCompanies.trend)}
              </Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>Utilisateurs</Text>
              <Text style={s.kpiValue}>{stats.totalUsers.current}</Text>
              <Text style={s.kpiTrend}>
                {formatTrend(stats.totalUsers.trend)}
              </Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>Abonnements actifs</Text>
              <Text style={s.kpiValue}>{stats.activeSubscriptions}</Text>
            </View>
          </View>
          {/* Row 2 */}
          <View style={s.kpiRow}>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>MRR</Text>
              <Text style={s.kpiValue}>{formatCurrency(stats.mrr.current)}</Text>
              <Text style={s.kpiTrend}>{formatTrend(stats.mrr.trend)}</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>Taux de churn</Text>
              <Text style={s.kpiValue}>{stats.churnRate}%</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>Abo. actifs / Total</Text>
              <Text style={s.kpiValue}>
                {stats.activeSubscriptions} / {stats.totalCompanies.current}
              </Text>
            </View>
          </View>
        </View>

        {/* Tableau — Croissance entreprises (6 mois) */}
        <Text style={s.sectionTitle}>Croissance entreprises (6 mois)</Text>
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={s.tableCellHeader}>Mois</Text>
            <Text style={s.tableCellHeader}>Nombre</Text>
          </View>
          {stats.companiesGrowth.map((row) => (
            <View key={row.month} style={s.tableRow}>
              <Text style={s.tableCell}>{row.month}</Text>
              <Text style={s.tableCell}>{row.count}</Text>
            </View>
          ))}
        </View>

        {/* Tableau — Revenus par plan */}
        <Text style={s.sectionTitle}>Revenus par plan</Text>
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={s.tableCellHeader}>Plan</Text>
            <Text style={s.tableCellHeader}>Abonnes</Text>
            <Text style={s.tableCellHeader}>MRR</Text>
          </View>
          {stats.revenueByPlan.map((row) => (
            <View key={row.plan} style={s.tableRow}>
              <Text style={s.tableCell}>{row.plan}</Text>
              <Text style={s.tableCell}>{row.count}</Text>
              <Text style={s.tableCell}>{formatCurrency(row.revenue)}</Text>
            </View>
          ))}
        </View>

        {/* Tableau — Distribution abonnements */}
        <Text style={s.sectionTitle}>Distribution des abonnements</Text>
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={s.tableCellHeader}>Statut</Text>
            <Text style={s.tableCellHeader}>Nombre</Text>
          </View>
          {stats.subscriptionStatusDistribution.map((row) => (
            <View key={row.status} style={s.tableRow}>
              <Text style={s.tableCell}>{row.status}</Text>
              <Text style={s.tableCell}>{row.count}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          SmartPlanning SaaS - Rapport confidentiel
        </Text>

        {/* Page number */}
        <Text
          style={s.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
