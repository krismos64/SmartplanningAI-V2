/**
 * Composant React PDF pour l'export du planning
 *
 * @description Genere un document PDF avec le planning des employes
 * sous forme de tableau employes x jours.
 * @ticket SP-403
 */

import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { format, eachDayOfInterval, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  scheduleTypeColors,
  scheduleTypeLabels,
} from '@/lib/validations/schedule'
import type { ScheduleType } from '@prisma/client'
import { styles } from './styles'

// ============================================================================
// Types
// ============================================================================

export interface ScheduleForPdf {
  id: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  type: string
  title: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    weeklyHours: number
  }
}

export interface SchedulePdfDocumentProps {
  schedules: ScheduleForPdf[]
  period: { start: Date; end: Date }
  viewMode: 'week' | 'month'
  companyName: string
  generatedAt: Date
}

// ============================================================================
// Helpers
// ============================================================================

type GroupedByEmployee = Record<
  string,
  {
    name: string
    schedules: ScheduleForPdf[]
    weeklyHours: number
    totalPlanned: number
  }
>

function computeDuration(startTime: string, endTime: string): number {
  const [sh = 0, sm = 0] = startTime.split(':').map(Number)
  const [eh = 0, em = 0] = endTime.split(':').map(Number)
  const diff = eh * 60 + em - (sh * 60 + sm)
  return diff > 0 ? diff / 60 : 0
}

function groupByEmployee(schedules: ScheduleForPdf[]): GroupedByEmployee {
  const grouped: GroupedByEmployee = {}
  for (const s of schedules) {
    const key = s.employee.id
    if (!grouped[key]) {
      grouped[key] = {
        name: `${s.employee.lastName} ${s.employee.firstName}`,
        schedules: [],
        weeklyHours: s.employee.weeklyHours,
        totalPlanned: 0,
      }
    }
    grouped[key].schedules.push(s)
    // Ne pas compter les repos dans le total heures
    if (s.type !== 'REST') {
      grouped[key].totalPlanned += computeDuration(s.startTime, s.endTime)
    }
  }
  return grouped
}

function getDaysInPeriod(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end })
}

function getSchedulesForDay(
  schedules: ScheduleForPdf[],
  day: Date
): ScheduleForPdf[] {
  return schedules.filter(
    (s) =>
      isSameDay(new Date(s.startDate), day) ||
      (new Date(s.startDate) <= day && new Date(s.endDate) >= day)
  )
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result?.[1] || !result[2] || !result[3]) {
    return { r: 200, g: 200, b: 200 }
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function getBgColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const lr = Math.round(r + (255 - r) * 0.8)
  const lg = Math.round(g + (255 - g) * 0.8)
  const lb = Math.round(b + (255 - b) * 0.8)
  return `rgb(${lr}, ${lg}, ${lb})`
}

// ============================================================================
// Composant
// ============================================================================

export function SchedulePdfDocument({
  schedules,
  period,
  viewMode,
  companyName,
  generatedAt,
}: SchedulePdfDocumentProps) {
  const days = getDaysInPeriod(period.start, period.end)
  const grouped = groupByEmployee(schedules)
  const employees = Object.entries(grouped).sort(([, a], [, b]) =>
    a.name.localeCompare(b.name)
  )
  const periodLabel =
    viewMode === 'week'
      ? `Semaine du ${format(period.start, 'd MMM', { locale: fr })} au ${format(period.end, 'd MMM yyyy', { locale: fr })}`
      : format(period.start, 'MMMM yyyy', { locale: fr })

  const allTypes = Object.keys(scheduleTypeLabels) as ScheduleType[]

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Planning - {companyName}</Text>
          <Text style={styles.headerSubtitle}>{periodLabel}</Text>
          <Text style={styles.headerDate}>
            Généré le{' '}
            {format(generatedAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.tableHeaderRow}>
            <Text style={styles.employeeCell}>Employé</Text>
            {days.map((day) => (
              <Text key={day.toISOString()} style={styles.dayCellHeader}>
                {format(day, 'EEE d', { locale: fr })}
              </Text>
            ))}
            <Text style={styles.hoursCell}>Heures</Text>
          </View>

          {/* Employee rows */}
          {employees.length === 0 ? (
            <View style={styles.tableRow}>
              <Text
                style={{
                  ...styles.dayCell,
                  flex: undefined,
                  width: '100%',
                  textAlign: 'center',
                  paddingVertical: 10,
                }}
              >
                Aucun créneau pour cette période
              </Text>
            </View>
          ) : (
            employees.map(
              ([
                empId,
                { name, schedules: empSchedules, weeklyHours, totalPlanned },
              ]) => {
                const diff = totalPlanned - weeklyHours
                const diffLabel =
                  diff === 0
                    ? '0h'
                    : diff > 0
                      ? `+${diff.toFixed(1).replace('.0', '')}h`
                      : `${diff.toFixed(1).replace('.0', '')}h`
                const diffColor =
                  diff === 0 ? '#16A34A' : diff > 0 ? '#DC2626' : '#EA580C'

                return (
                  <View key={empId} style={styles.tableRow}>
                    <Text style={styles.employeeCell}>{name}</Text>
                    {days.map((day) => {
                      const daySchedules = getSchedulesForDay(empSchedules, day)
                      return (
                        <View key={day.toISOString()} style={styles.dayCell}>
                          {daySchedules.map((s) => {
                            const color =
                              scheduleTypeColors[s.type as ScheduleType] ||
                              '#9CA3AF'
                            return (
                              <Text
                                key={s.id}
                                style={{
                                  ...styles.shiftBadge,
                                  backgroundColor: getBgColor(color),
                                  color,
                                }}
                              >
                                {s.type === 'REST'
                                  ? 'Repos'
                                  : `${s.startTime}-${s.endTime}`}
                              </Text>
                            )
                          })}
                        </View>
                      )
                    })}
                    <View style={styles.hoursCell}>
                      <Text style={{ fontSize: 7 }}>
                        {totalPlanned.toFixed(1).replace('.0', '')}h /{' '}
                        {weeklyHours}h
                      </Text>
                      <Text
                        style={{
                          fontSize: 6,
                          color: diffColor,
                          fontWeight: 'bold',
                        }}
                      >
                        {diffLabel}
                      </Text>
                    </View>
                  </View>
                )
              }
            )
          )}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {allTypes.map((type) => (
            <View key={type} style={styles.legendItem}>
              <View
                style={{
                  ...styles.legendColor,
                  backgroundColor: scheduleTypeColors[type],
                }}
              />
              <Text style={styles.legendText}>{scheduleTypeLabels[type]}</Text>
            </View>
          ))}
        </View>

        {/* Page number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
