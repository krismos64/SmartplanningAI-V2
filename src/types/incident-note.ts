/**
 * Types TypeScript pour les notes d'incident
 *
 * @ticket SP-424
 * @description Types pour le module de suivi comportemental avec visibilité RBAC
 */

import type {
  IncidentNote,
  IncidentNoteVisibility,
  User,
  Employee,
  Company,
} from '@prisma/client'

// ─── Types de visibilité ────────────────────────────────────────────

export type { IncidentNoteVisibility } from '@prisma/client'

// ─── Relations étendues ─────────────────────────────────────────────

/**
 * Note d'incident avec l'employé concerné (sujet)
 */
export type IncidentNoteWithSubject = IncidentNote & {
  subject: Pick<Employee, 'id' | 'firstName' | 'lastName'>
}

/**
 * Note d'incident avec l'auteur (manager/directeur)
 */
export type IncidentNoteWithAuthor = IncidentNote & {
  author: Pick<User, 'id' | 'name' | 'email'>
}

/**
 * Note d'incident complète avec toutes les relations
 */
export type IncidentNoteWithRelations = IncidentNote & {
  subject: Pick<Employee, 'id' | 'firstName' | 'lastName'>
  author: Pick<User, 'id' | 'name' | 'email'>
  company: Pick<Company, 'id' | 'name'>
}

/**
 * Note d'incident pour l'affichage en liste
 */
export type IncidentNoteListItem = {
  id: string
  title: string
  date: Date
  visibility: IncidentNoteVisibility
  subjectName: string
  authorName: string
  createdAt: Date
}

// ─── Labels français ────────────────────────────────────────────────

export const INCIDENT_NOTE_VISIBILITY_LABELS: Record<
  IncidentNoteVisibility,
  string
> = {
  DIRECTOR_ONLY: 'Directeur uniquement',
  MANAGER_DIRECTOR: 'Managers & Directeurs',
  ALL: 'Tous les rôles',
}

// ─── Descriptions pour tooltips UI ──────────────────────────────────

export const INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS: Record<
  IncidentNoteVisibility,
  string
> = {
  DIRECTOR_ONLY: "Visible uniquement par les directeurs de l'entreprise",
  MANAGER_DIRECTOR: 'Visible par les managers et directeurs',
  ALL: "Visible par tous les membres de l'entreprise",
}

// ─── Icônes Lucide React ────────────────────────────────────────────

export const INCIDENT_NOTE_VISIBILITY_ICONS: Record<
  IncidentNoteVisibility,
  string
> = {
  DIRECTOR_ONLY: 'ShieldAlert',
  MANAGER_DIRECTOR: 'Users',
  ALL: 'Globe',
}

// ─── Couleurs Tailwind pour badges ──────────────────────────────────

export const INCIDENT_NOTE_VISIBILITY_COLORS: Record<
  IncidentNoteVisibility,
  string
> = {
  DIRECTOR_ONLY: 'bg-red-100 text-red-800',
  MANAGER_DIRECTOR: 'bg-amber-100 text-amber-800',
  ALL: 'bg-green-100 text-green-800',
}
