/**
 * Document PDF pour l'export de la liste des employés
 *
 * @description Tableau A4 paysage avec les colonnes du tableau web.
 * Utilise @react-pdf/renderer.
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ============================================================================
// Types
// ============================================================================

export interface EmployeeForPdf {
  lastName: string
  firstName: string
  email: string | null
  phone: string | null
  teamName: string | null
  role: string | null
  weeklyHours: number
  hireDate: Date | null
  isActive: boolean
}

export interface EmployeesPdfDocumentProps {
  employees: EmployeeForPdf[]
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
  // Cells
  cellName: {
    width: '15%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontWeight: 'bold',
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellEmail: {
    width: '20%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellPhone: {
    width: '13%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellTeam: {
    width: '14%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellRole: {
    width: '10%',
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellHours: {
    width: '8%',
    paddingHorizontal: 4,
    paddingVertical: 3,
    fontSize: 7,
    textAlign: 'center',
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
  cellStatus: {
    width: '8%',
    paddingHorizontal: 4,
    paddingVertical: 3,
    fontSize: 7,
    textAlign: 'center',
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
  // Status badges
  statusActive: {
    color: '#059669',
    fontWeight: 'bold',
  },
  statusInactive: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
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

function formatRoleFr(role: string | null): string {
  const roles: Record<string, string> = {
    DIRECTOR: 'Directeur',
    MANAGER: 'Manager',
    EMPLOYEE: 'Employé',
    SYSTEM_ADMIN: 'Admin',
  }
  return roles[role ?? ''] ?? 'Employé'
}

function formatPhone(phone: string | null): string {
  if (!phone) return '-'
  // Format français : 06 12 34 56 78
  if (phone.startsWith('+33') && phone.length === 12) {
    const digits = phone.slice(3)
    return `+33 ${digits[0]} ${(digits.slice(1).match(/.{2}/g) ?? []).join(' ')}`
  }
  if (phone.startsWith('0') && phone.length === 10) {
    return (phone.match(/.{2}/g) ?? []).join(' ')
  }
  return phone
}

// ============================================================================
// Composant
// ============================================================================

export function EmployeesPdfDocument({
  employees,
  companyName,
  generatedAt,
  activeFilters,
}: EmployeesPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Liste des employés</Text>
          <Text style={s.headerSubtitle}>
            {companyName} — {employees.length} employé
            {employees.length > 1 ? 's' : ''}
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
            <Text style={[s.cellName, s.headerCell]}>Employé</Text>
            <Text style={[s.cellEmail, s.headerCell]}>Email</Text>
            <Text style={[s.cellPhone, s.headerCell]}>Téléphone</Text>
            <Text style={[s.cellTeam, s.headerCell]}>Équipe</Text>
            <Text style={[s.cellRole, s.headerCell]}>Rôle</Text>
            <Text style={[s.cellHours, s.headerCell]}>H/sem</Text>
            <Text style={[s.cellDate, s.headerCell]}>Embauche</Text>
            <Text style={[s.cellStatus, s.headerCell]}>Statut</Text>
          </View>
        </View>

        {/* Table data rows */}
        <View style={[s.table, { borderTopWidth: 0 }]}>
          {employees.map((emp, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? s.tableRow : s.tableRowAlt}
              wrap={false}
            >
              <Text style={s.cellName}>
                {emp.lastName} {emp.firstName}
              </Text>
              <Text style={s.cellEmail}>{emp.email || '-'}</Text>
              <Text style={s.cellPhone}>{formatPhone(emp.phone)}</Text>
              <Text style={s.cellTeam}>{emp.teamName || '-'}</Text>
              <Text style={s.cellRole}>{formatRoleFr(emp.role)}</Text>
              <Text style={s.cellHours}>{emp.weeklyHours}h</Text>
              <Text style={s.cellDate}>{formatDateFr(emp.hireDate)}</Text>
              <Text
                style={[
                  s.cellStatus,
                  emp.isActive ? s.statusActive : s.statusInactive,
                ]}
              >
                {emp.isActive ? 'Actif' : 'Inactif'}
              </Text>
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
