/**
 * Styles PDF pour l'export des statistiques admin
 *
 * @description Styles A4 portrait pour le document PDF stats admin.
 * @ticket SP-475
 */

import { StyleSheet } from '@react-pdf/renderer'

export const adminStatsPdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },

  // Header
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 9,
    color: '#9CA3AF',
  },

  // Section titles
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 18,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },

  // KPI Grid
  kpiGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  kpiLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  kpiTrend: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
  },

  // Table
  table: {
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 2,
    borderBottomColor: '#9CA3AF',
    minHeight: 24,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 20,
    alignItems: 'center',
  },
  tableCellHeader: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontWeight: 'bold',
    fontSize: 8,
    color: '#374151',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 8,
    color: '#4B5563',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    fontSize: 7,
    color: '#9CA3AF',
  },

  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    fontSize: 7,
    color: '#9CA3AF',
  },
})
