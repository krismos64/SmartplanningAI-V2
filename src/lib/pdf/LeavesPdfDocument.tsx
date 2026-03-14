/**
 * Document PDF pour l'export de la liste des congés
 *
 * @description Tableau A4 paysage avec les colonnes du tableau web.
 * Colonnes : Employé, Type, Début, Fin, Jours, Statut, Motif
 * Utilise @react-pdf/renderer.
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ============================================================================
// Types
// ============================================================================

export interface LeaveForPdf {
  employeeName: string
  type: string
  startDate: Date
  endDate: Date
  days: number
  halfDay: boolean
  halfDayPeriod: string | null
  status: string
  reason: string | null
}

export interface LeavesPdfDocumentProps {
  leaves: LeaveForPdf[]
  companyName: string
  generatedAt: Date
  activeFilters?: string
}

// ============================================================================
// Styles
// ============================================================================

const s = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
    fontFamily: 'Helvetica',
    orientation: 'landscape',
  },
  // Header
  header: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  headerMeta: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Table
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#6B7280',
    minHeight: 22,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 20,
    alignItems: 'center',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 20,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  // Cells — 7 colonnes = 100%
  cellEmployee: {
    width: '18%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontWeight: 'bold',
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellType: {
    width: '14%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellDate: {
    width: '12%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellDays: {
    width: '8%',
    paddingHorizontal: 4,
    paddingVertical: 3,
    fontSize: 7,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellStatus: {
    width: '12%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellReason: {
    width: '24%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 7,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 7,
    color: '#374151',
  },
  // Footer
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    fontSize: 7,
    color: '#9CA3AF',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 30,
    fontSize: 7,
    color: '#9CA3AF',
  },
  // Status colors
  statusPending: { color: '#D97706' },
  statusApproved: { color: '#059669' },
  statusRejected: { color: '#DC2626' },
  statusCancelled: { color: '#6B7280' },
})

// ============================================================================
// Helpers
// ============================================================================

function formatDateFr(date: Date | null): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const TYPE_LABELS: Record<string, string> = {
  PAID_LEAVE: 'Congés payés',
  RTT: 'RTT',
  SICK_LEAVE: 'Arrêt maladie',
  UNPAID_LEAVE: 'Sans solde',
  FAMILY_EVENT: 'Évén. familial',
  PARENTAL_LEAVE: 'Congé parental',
  OTHER: 'Autre',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
  CANCELLED: 'Annulé',
}

const HALF_DAY_LABELS: Record<string, string> = {
  AM: 'Matin',
  PM: 'Après-midi',
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'PENDING':
      return s.statusPending
    case 'APPROVED':
      return s.statusApproved
    case 'REJECTED':
      return s.statusRejected
    case 'CANCELLED':
      return s.statusCancelled
    default:
      return {}
  }
}

function formatDays(days: number, halfDay: boolean, halfDayPeriod: string | null): string {
  if (halfDay && halfDayPeriod) {
    return `${days} (${HALF_DAY_LABELS[halfDayPeriod] ?? halfDayPeriod})`
  }
  return String(days)
}

// ============================================================================
// Composant
// ============================================================================

export function LeavesPdfDocument({
  leaves,
  companyName,
  generatedAt,
  activeFilters,
}: LeavesPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Demandes de congés</Text>
          <Text style={s.headerSubtitle}>
            {companyName} — {leaves.length} demande
            {leaves.length > 1 ? 's' : ''}
          </Text>
          {activeFilters && (
            <Text style={s.headerMeta}>Filtres : {activeFilters}</Text>
          )}
          <Text style={s.headerMeta}>
            Généré le{' '}
            {generatedAt.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Table header */}
        <View style={[s.table, { borderBottomWidth: 0 }]} fixed>
          <View style={s.tableHeaderRow}>
            <Text style={[s.cellEmployee, s.headerCell]}>Employé</Text>
            <Text style={[s.cellType, s.headerCell]}>Type</Text>
            <Text style={[s.cellDate, s.headerCell]}>Début</Text>
            <Text style={[s.cellDate, s.headerCell]}>Fin</Text>
            <Text style={[s.cellDays, s.headerCell]}>Jours</Text>
            <Text style={[s.cellStatus, s.headerCell]}>Statut</Text>
            <Text style={[s.cellReason, s.headerCell]}>Motif</Text>
          </View>
        </View>

        {/* Table data rows */}
        <View style={[s.table, { borderTopWidth: 0 }]}>
          {leaves.map((leave, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? s.tableRow : s.tableRowAlt}
              wrap={false}
            >
              <Text style={s.cellEmployee}>{leave.employeeName}</Text>
              <Text style={s.cellType}>
                {TYPE_LABELS[leave.type] ?? leave.type}
              </Text>
              <Text style={s.cellDate}>{formatDateFr(leave.startDate)}</Text>
              <Text style={s.cellDate}>{formatDateFr(leave.endDate)}</Text>
              <Text style={s.cellDays}>
                {formatDays(leave.days, leave.halfDay, leave.halfDayPeriod)}
              </Text>
              <Text style={[s.cellStatus, getStatusStyle(leave.status)]}>
                {STATUS_LABELS[leave.status] ?? leave.status}
              </Text>
              <Text style={s.cellReason}>{leave.reason || '-'}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={s.footer} fixed>
          SmartPlanning — {companyName}
        </Text>
        <Text
          style={s.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
