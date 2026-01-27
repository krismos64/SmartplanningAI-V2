/**
 * Styles PDF pour l'export planning
 *
 * @description Styles A4 paysage pour le document PDF de planning.
 * @ticket SP-403
 */

import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
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
  headerDate: {
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
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 22,
    alignItems: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#6B7280',
    minHeight: 24,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  employeeCell: {
    width: 120,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontWeight: 'bold',
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  dayCell: {
    flex: 1,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 7,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  dayCellHeader: {
    flex: 1,
    paddingHorizontal: 3,
    paddingVertical: 4,
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  shiftBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    fontSize: 6,
    textAlign: 'center',
  },

  // Legend
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 7,
    color: '#4B5563',
  },

  // Pagination
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    fontSize: 7,
    color: '#9CA3AF',
  },
})
