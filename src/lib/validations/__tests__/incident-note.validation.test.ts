/**
 * Tests des schémas de validation IncidentNote
 *
 * @ticket SP-424
 * @description Tests unitaires pour les validations Zod des notes d'incident
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { describe, it, expect } from 'vitest'
import {
  incidentNoteCreateSchema,
  incidentNoteUpdateSchema,
  incidentNoteFiltersSchema,
  IncidentNoteVisibilitySchema,
  INCIDENT_NOTE_VISIBILITY_LABELS,
  INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS,
  INCIDENT_NOTE_VISIBILITY_COLORS,
  INCIDENT_NOTE_VISIBILITY_ICONS,
  incidentNoteVisibilityOptions,
} from '../incident-note'

// Génère un CUID valide pour les tests
const validCuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx'

const validCreateInput = {
  title: 'Retard répété',
  content: "L'employé est arrivé en retard 3 fois cette semaine.",
  date: new Date('2026-01-15'),
  visibility: 'DIRECTOR_ONLY' as const,
  subjectId: validCuid,
}

describe('IncidentNote Validations', () => {
  // ─── incidentNoteCreateSchema ───────────────────────────────────

  describe('incidentNoteCreateSchema', () => {
    it('valide une note correcte', () => {
      const result = incidentNoteCreateSchema.safeParse(validCreateInput)
      expect(result.success).toBe(true)
    })

    it('applique la visibilité par défaut DIRECTOR_ONLY', () => {
      const input = {
        title: 'Test',
        content: 'Contenu test',
        date: new Date(),
        subjectId: validCuid,
      }
      const result = incidentNoteCreateSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.visibility).toBe('DIRECTOR_ONLY')
      }
    })

    it('refuse si titre vide', () => {
      const result = incidentNoteCreateSchema.safeParse({
        ...validCreateInput,
        title: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]!.path).toContain('title')
        expect(result.error.issues[0]!.message).toBe('Le titre est requis')
      }
    })

    it('refuse si titre trop long (>200 caractères)', () => {
      const result = incidentNoteCreateSchema.safeParse({
        ...validCreateInput,
        title: 'A'.repeat(201),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]!.path).toContain('title')
        expect(result.error.issues[0]!.message).toContain('200 caractères')
      }
    })

    it('refuse si contenu vide', () => {
      const result = incidentNoteCreateSchema.safeParse({
        ...validCreateInput,
        content: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]!.path).toContain('content')
        expect(result.error.issues[0]!.message).toBe('Le contenu est requis')
      }
    })

    it('refuse si contenu trop long (>5000 caractères)', () => {
      const result = incidentNoteCreateSchema.safeParse({
        ...validCreateInput,
        content: 'A'.repeat(5001),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]!.path).toContain('content')
        expect(result.error.issues[0]!.message).toContain('5000 caractères')
      }
    })

    it('refuse si subjectId invalide', () => {
      const result = incidentNoteCreateSchema.safeParse({
        ...validCreateInput,
        subjectId: 'invalid-id',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]!.path).toContain('subjectId')
      }
    })

    it('refuse si visibilité invalide', () => {
      const result = incidentNoteCreateSchema.safeParse({
        ...validCreateInput,
        visibility: 'INVALID_VISIBILITY',
      })
      expect(result.success).toBe(false)
    })

    it('accepte toutes les visibilités valides', () => {
      const visibilities = ['DIRECTOR_ONLY', 'MANAGER_DIRECTOR', 'ALL'] as const
      for (const visibility of visibilities) {
        const result = incidentNoteCreateSchema.safeParse({
          ...validCreateInput,
          visibility,
        })
        expect(result.success).toBe(true)
      }
    })

    it('coerce les dates string en Date', () => {
      const result = incidentNoteCreateSchema.safeParse({
        ...validCreateInput,
        date: '2026-01-15',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date)
      }
    })

    it('refuse une date invalide', () => {
      const result = incidentNoteCreateSchema.safeParse({
        ...validCreateInput,
        date: 'not-a-date',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]!.message).toContain('invalide')
      }
    })
  })

  // ─── incidentNoteUpdateSchema ───────────────────────────────────

  describe('incidentNoteUpdateSchema', () => {
    it('accepte un objet vide (tous les champs optionnels)', () => {
      const result = incidentNoteUpdateSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('valide une mise à jour partielle du titre', () => {
      const result = incidentNoteUpdateSchema.safeParse({
        title: 'Nouveau titre',
      })
      expect(result.success).toBe(true)
    })

    it('valide une mise à jour partielle du contenu', () => {
      const result = incidentNoteUpdateSchema.safeParse({
        content: 'Nouveau contenu détaillé',
      })
      expect(result.success).toBe(true)
    })

    it('valide une mise à jour de la visibilité', () => {
      const result = incidentNoteUpdateSchema.safeParse({
        visibility: 'MANAGER_DIRECTOR',
      })
      expect(result.success).toBe(true)
    })

    it('refuse un titre vide en mise à jour', () => {
      const result = incidentNoteUpdateSchema.safeParse({
        title: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]!.message).toBe(
          'Le titre ne peut pas être vide'
        )
      }
    })

    it('refuse un contenu vide en mise à jour', () => {
      const result = incidentNoteUpdateSchema.safeParse({
        content: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]!.message).toBe(
          'Le contenu ne peut pas être vide'
        )
      }
    })
  })

  // ─── incidentNoteFiltersSchema ──────────────────────────────────

  describe('incidentNoteFiltersSchema', () => {
    it('accepte un objet vide', () => {
      const result = incidentNoteFiltersSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('valide les filtres par subjectId', () => {
      const result = incidentNoteFiltersSchema.safeParse({
        subjectId: validCuid,
      })
      expect(result.success).toBe(true)
    })

    it('valide les filtres par authorId', () => {
      const result = incidentNoteFiltersSchema.safeParse({
        authorId: validCuid,
      })
      expect(result.success).toBe(true)
    })

    it('valide les filtres par visibilité', () => {
      const result = incidentNoteFiltersSchema.safeParse({
        visibility: 'ALL',
      })
      expect(result.success).toBe(true)
    })

    it('valide les filtres par plage de dates', () => {
      const result = incidentNoteFiltersSchema.safeParse({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      })
      expect(result.success).toBe(true)
    })

    it('valide les filtres par recherche textuelle', () => {
      const result = incidentNoteFiltersSchema.safeParse({
        search: 'retard',
      })
      expect(result.success).toBe(true)
    })

    it('valide tous les filtres combinés', () => {
      const result = incidentNoteFiltersSchema.safeParse({
        subjectId: validCuid,
        authorId: validCuid,
        visibility: 'DIRECTOR_ONLY',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        search: 'retard',
      })
      expect(result.success).toBe(true)
    })
  })

  // ─── IncidentNoteVisibilitySchema ───────────────────────────────

  describe('IncidentNoteVisibilitySchema', () => {
    it('valide DIRECTOR_ONLY', () => {
      const result = IncidentNoteVisibilitySchema.safeParse('DIRECTOR_ONLY')
      expect(result.success).toBe(true)
    })

    it('valide MANAGER_DIRECTOR', () => {
      const result = IncidentNoteVisibilitySchema.safeParse('MANAGER_DIRECTOR')
      expect(result.success).toBe(true)
    })

    it('valide ALL', () => {
      const result = IncidentNoteVisibilitySchema.safeParse('ALL')
      expect(result.success).toBe(true)
    })

    it('refuse une valeur invalide', () => {
      const result = IncidentNoteVisibilitySchema.safeParse('EMPLOYEE_ONLY')
      expect(result.success).toBe(false)
    })
  })

  // ─── Labels, Descriptions, Couleurs et Icônes ───────────────────

  describe('Labels et metadata UI', () => {
    it('contient les labels pour toutes les visibilités', () => {
      expect(INCIDENT_NOTE_VISIBILITY_LABELS.DIRECTOR_ONLY).toBe(
        'Directeur uniquement'
      )
      expect(INCIDENT_NOTE_VISIBILITY_LABELS.MANAGER_DIRECTOR).toBe(
        'Managers & Directeurs'
      )
      expect(INCIDENT_NOTE_VISIBILITY_LABELS.ALL).toBe('Tous les rôles')
    })

    it('contient les descriptions pour toutes les visibilités', () => {
      expect(INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS.DIRECTOR_ONLY).toContain(
        'directeurs'
      )
      expect(INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS.MANAGER_DIRECTOR).toContain(
        'managers'
      )
      expect(INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS.ALL).toContain('tous')
    })

    it('contient les couleurs Tailwind pour toutes les visibilités', () => {
      expect(INCIDENT_NOTE_VISIBILITY_COLORS.DIRECTOR_ONLY).toContain('red')
      expect(INCIDENT_NOTE_VISIBILITY_COLORS.MANAGER_DIRECTOR).toContain(
        'amber'
      )
      expect(INCIDENT_NOTE_VISIBILITY_COLORS.ALL).toContain('green')
    })

    it('contient les icônes Lucide pour toutes les visibilités', () => {
      expect(INCIDENT_NOTE_VISIBILITY_ICONS.DIRECTOR_ONLY).toBe('ShieldAlert')
      expect(INCIDENT_NOTE_VISIBILITY_ICONS.MANAGER_DIRECTOR).toBe('Users')
      expect(INCIDENT_NOTE_VISIBILITY_ICONS.ALL).toBe('Globe')
    })
  })

  // ─── Options pour select UI ─────────────────────────────────────

  describe('incidentNoteVisibilityOptions', () => {
    it('contient 3 options', () => {
      expect(incidentNoteVisibilityOptions).toHaveLength(3)
    })

    it('chaque option a value, label et description', () => {
      for (const option of incidentNoteVisibilityOptions) {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('description')
      }
    })

    it('les valeurs correspondent aux enums', () => {
      const values = incidentNoteVisibilityOptions.map((o) => o.value)
      expect(values).toContain('DIRECTOR_ONLY')
      expect(values).toContain('MANAGER_DIRECTOR')
      expect(values).toContain('ALL')
    })
  })
})
