/**
 * Schémas de validation Zod pour les notes d'incident
 *
 * @ticket SP-424
 * @description Validation des notes d'incident avec visibilité RBAC
 */

import { z } from 'zod'

// ─── Valeurs de visibilité (synchronisées avec Prisma enum) ─────────
// Note: On définit les valeurs ici au lieu d'utiliser @prisma/client
// car l'enum Prisma n'est pas disponible côté client (undefined)

export const INCIDENT_NOTE_VISIBILITY_VALUES = [
  'DIRECTOR_ONLY',
  'MANAGER_ONLY',
  'MANAGER_DIRECTOR',
  'ALL',
] as const

export type IncidentNoteVisibility =
  (typeof INCIDENT_NOTE_VISIBILITY_VALUES)[number]

// ─── Enum Zod synchronisé avec Prisma ───────────────────────────────

export const IncidentNoteVisibilitySchema = z.enum(
  INCIDENT_NOTE_VISIBILITY_VALUES
)

// ─── Schéma de création de note d'incident ──────────────────────────

export const incidentNoteCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères'),
  content: z
    .string()
    .min(1, 'Le contenu est requis')
    .max(5000, 'Le contenu ne doit pas dépasser 5000 caractères'),
  date: z.coerce.date({
    errorMap: () => ({ message: "Date de l'incident invalide" }),
  }),
  visibility: IncidentNoteVisibilitySchema.default('DIRECTOR_ONLY'),
  subjectId: z.string().cuid("ID d'employé invalide"),
})

export type IncidentNoteCreateInput = z.infer<typeof incidentNoteCreateSchema>

// ─── Schéma de mise à jour (tous optionnels) ────────────────────────

export const incidentNoteUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre ne peut pas être vide')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères')
    .optional(),
  content: z
    .string()
    .min(1, 'Le contenu ne peut pas être vide')
    .max(5000, 'Le contenu ne doit pas dépasser 5000 caractères')
    .optional(),
  date: z.coerce.date().optional(),
  visibility: IncidentNoteVisibilitySchema.optional(),
})

export type IncidentNoteUpdateInput = z.infer<typeof incidentNoteUpdateSchema>

// ─── Schéma de filtrage ─────────────────────────────────────────────

export const incidentNoteFiltersSchema = z.object({
  subjectId: z.string().cuid().optional(),
  authorId: z.string().cuid().optional(),
  visibility: IncidentNoteVisibilitySchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
})

export type IncidentNoteFilters = z.infer<typeof incidentNoteFiltersSchema>

// ─── Labels français ────────────────────────────────────────────────

export const INCIDENT_NOTE_VISIBILITY_LABELS: Record<
  IncidentNoteVisibility,
  string
> = {
  DIRECTOR_ONLY: 'Directeur uniquement',
  MANAGER_ONLY: 'Manager uniquement',
  MANAGER_DIRECTOR: 'Managers & Directeurs',
  ALL: 'Tous les rôles',
}

// ─── Descriptions pour UI ───────────────────────────────────────────

export const INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS: Record<
  IncidentNoteVisibility,
  string
> = {
  DIRECTOR_ONLY: "Visible uniquement par les directeurs de l'entreprise",
  MANAGER_ONLY: "Visible uniquement par les managers de l'équipe",
  MANAGER_DIRECTOR: 'Visible par les managers et directeurs',
  ALL: "Visible par tous les membres de l'entreprise",
}

// ─── Couleurs Tailwind pour l'UI ────────────────────────────────────

export const INCIDENT_NOTE_VISIBILITY_COLORS: Record<
  IncidentNoteVisibility,
  string
> = {
  DIRECTOR_ONLY: 'bg-red-100 text-red-800',
  MANAGER_ONLY: 'bg-blue-100 text-blue-800',
  MANAGER_DIRECTOR: 'bg-amber-100 text-amber-800',
  ALL: 'bg-green-100 text-green-800',
}

// ─── Icônes Lucide React ────────────────────────────────────────────

export const INCIDENT_NOTE_VISIBILITY_ICONS: Record<
  IncidentNoteVisibility,
  string
> = {
  DIRECTOR_ONLY: 'ShieldAlert',
  MANAGER_ONLY: 'UserCheck',
  MANAGER_DIRECTOR: 'Users',
  ALL: 'Globe',
}

// ─── Options pour les selects UI ────────────────────────────────────

export const incidentNoteVisibilityOptions =
  INCIDENT_NOTE_VISIBILITY_VALUES.map((value) => ({
    value,
    label: INCIDENT_NOTE_VISIBILITY_LABELS[value],
    description: INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS[value],
  }))

// ─── Options filtrées par rôle ──────────────────────────────────────

const MANAGER_VISIBILITY_OPTIONS: IncidentNoteVisibility[] = [
  'MANAGER_ONLY',
  'MANAGER_DIRECTOR',
  'ALL',
]

const DIRECTOR_VISIBILITY_OPTIONS: IncidentNoteVisibility[] = [
  'DIRECTOR_ONLY',
  'MANAGER_DIRECTOR',
  'ALL',
]

export function getVisibilityOptionsForRole(role: string) {
  const allowed =
    role === 'MANAGER'
      ? MANAGER_VISIBILITY_OPTIONS
      : DIRECTOR_VISIBILITY_OPTIONS

  return allowed.map((value) => ({
    value,
    label: INCIDENT_NOTE_VISIBILITY_LABELS[value],
    description: INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS[value],
  }))
}

export function getDefaultVisibilityForRole(
  role: string
): IncidentNoteVisibility {
  return role === 'MANAGER' ? 'MANAGER_ONLY' : 'DIRECTOR_ONLY'
}
