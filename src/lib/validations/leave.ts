/**
 * Schémas de validation Zod pour le module Leave Management
 *
 * @ticket SP-409
 * @description Validation des demandes de congés, soldes, et filtres
 */

import { z } from 'zod'
import { LeaveType, LeaveRequestStatus } from '@prisma/client'

// ─── Enums Zod synchronisés avec Prisma ─────────────────────────────

export const LeaveTypeSchema = z.nativeEnum(LeaveType)

export const LeaveRequestStatusSchema = z.nativeEnum(LeaveRequestStatus)

export const HalfDayPeriodSchema = z.enum(['AM', 'PM'])

export const WorkingDaysModeSchema = z.enum(['MON_FRI', 'MON_SAT', 'ALL_DAYS'])

export type HalfDayPeriod = z.infer<typeof HalfDayPeriodSchema>
export type WorkingDaysMode = z.infer<typeof WorkingDaysModeSchema>

// ─── Schéma de création de demande de congé ─────────────────────────

export const createLeaveRequestSchema = z
  .object({
    type: LeaveTypeSchema,
    startDate: z.coerce.date({
      errorMap: () => ({ message: 'Date de début invalide' }),
    }),
    endDate: z.coerce.date({
      errorMap: () => ({ message: 'Date de fin invalide' }),
    }),
    halfDay: z.boolean().default(false),
    halfDayPeriod: HalfDayPeriodSchema.optional().nullable(),
    reason: z.string().max(500, 'La raison ne doit pas dépasser 500 caractères').optional(),
    employeeId: z.string().cuid("ID d'employé invalide"),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date de fin doit être après la date de début',
        path: ['endDate'],
      })
    }

    if (data.halfDay && !data.halfDayPeriod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Précisez matin (AM) ou après-midi (PM) pour une demi-journée',
        path: ['halfDayPeriod'],
      })
    }

    // Délai minimum 48h (sauf SICK_LEAVE et FAMILY_EVENT)
    if (data.type !== LeaveType.SICK_LEAVE && data.type !== LeaveType.FAMILY_EVENT) {
      const now = new Date()
      const minDate = new Date(now.getTime() + 48 * 60 * 60 * 1000)
      if (data.startDate < minDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La demande doit être faite au moins 48h à l\u2019avance',
          path: ['startDate'],
        })
      }
    }
  })

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>

// ─── Schéma de mise à jour (Manager/Director) ──────────────────────

export const updateLeaveRequestSchema = z
  .object({
    status: LeaveRequestStatusSchema,
    reviewComment: z.string().max(500, 'Le commentaire ne doit pas dépasser 500 caractères').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === LeaveRequestStatus.REJECTED && (!data.reviewComment || data.reviewComment.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Un commentaire est obligatoire en cas de refus',
        path: ['reviewComment'],
      })
    }
  })

export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>

// ─── Schéma de mise à jour des soldes (Director) ───────────────────

export const updateLeaveBalanceSchema = z
  .object({
    paidLeaveTotal: z.number().min(0, 'Minimum 0').max(100, 'Maximum 100').optional(),
    paidLeaveUsed: z.number().min(0, 'Minimum 0').optional(),
    rttTotal: z.number().min(0, 'Minimum 0').max(50, 'Maximum 50').optional(),
    rttUsed: z.number().min(0, 'Minimum 0').optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.paidLeaveTotal !== undefined &&
      data.paidLeaveUsed !== undefined &&
      data.paidLeaveUsed > data.paidLeaveTotal
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Les jours CP utilisés ne peuvent pas dépasser le total',
        path: ['paidLeaveUsed'],
      })
    }
    if (data.rttTotal !== undefined && data.rttUsed !== undefined && data.rttUsed > data.rttTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Les RTT utilisés ne peuvent pas dépasser le total',
        path: ['rttUsed'],
      })
    }
  })

export type UpdateLeaveBalanceInput = z.infer<typeof updateLeaveBalanceSchema>

// ─── Schéma de filtrage ─────────────────────────────────────────────

export const leaveRequestFiltersSchema = z.object({
  status: LeaveRequestStatusSchema.optional(),
  type: LeaveTypeSchema.optional(),
  employeeId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export type LeaveRequestFilters = z.infer<typeof leaveRequestFiltersSchema>

// ─── Labels français ────────────────────────────────────────────────

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  PAID_LEAVE: 'Congés payés',
  RTT: 'RTT',
  SICK_LEAVE: 'Arrêt maladie',
  UNPAID_LEAVE: 'Congé sans solde',
  FAMILY_EVENT: 'Événement familial',
  PARENTAL_LEAVE: 'Congé parental',
  OTHER: 'Autre',
}

export const LEAVE_STATUS_LABELS: Record<LeaveRequestStatus, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
  CANCELLED: 'Annulé',
}

// ─── Options pour les selects UI ────────────────────────────────────

export const leaveTypeOptions = Object.values(LeaveType).map((value) => ({
  value,
  label: LEAVE_TYPE_LABELS[value],
}))

export const leaveStatusOptions = Object.values(LeaveRequestStatus).map((value) => ({
  value,
  label: LEAVE_STATUS_LABELS[value],
}))

// ─── Couleurs Tailwind pour l'UI ────────────────────────────────────

export const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  PAID_LEAVE: 'bg-blue-100 text-blue-800',
  RTT: 'bg-purple-100 text-purple-800',
  SICK_LEAVE: 'bg-red-100 text-red-800',
  UNPAID_LEAVE: 'bg-gray-100 text-gray-800',
  FAMILY_EVENT: 'bg-pink-100 text-pink-800',
  PARENTAL_LEAVE: 'bg-amber-100 text-amber-800',
  OTHER: 'bg-slate-100 text-slate-800',
}

export const LEAVE_STATUS_COLORS: Record<LeaveRequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

// ─── Icônes Lucide React ────────────────────────────────────────────

export const LEAVE_TYPE_ICONS: Record<LeaveType, string> = {
  PAID_LEAVE: 'Palmtree',
  RTT: 'Clock',
  SICK_LEAVE: 'Stethoscope',
  UNPAID_LEAVE: 'CalendarOff',
  FAMILY_EVENT: 'Heart',
  PARENTAL_LEAVE: 'Baby',
  OTHER: 'CalendarDays',
}
