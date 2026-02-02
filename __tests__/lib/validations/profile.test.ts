/**
 * Tests unitaires pour le schéma de validation editProfileSchema
 *
 * @ticket SP-271
 * @description Tests Zod pour le formulaire d'édition du profil
 */

import { describe, it, expect } from 'vitest'
import {
  editProfileSchema,
  type EditProfileInput,
  EDIT_PROFILE_LABELS,
  EDIT_PROFILE_PLACEHOLDERS,
} from '@/lib/validations/profile'

describe('editProfileSchema', () => {
  // ==========================================================================
  // CAS VALIDES
  // ==========================================================================
  describe('Cas valides', () => {
    it('devrait valider un formulaire complet valide', () => {
      const validData: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '0612345678',
      }

      const result = editProfileSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.firstName).toBe('Jean')
        expect(result.data.lastName).toBe('Dupont')
        expect(result.data.phone).toBe('0612345678')
      }
    })

    it('devrait accepter un téléphone vide', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter un téléphone undefined (optionnel)', () => {
      const data = {
        firstName: 'Jean',
        lastName: 'Dupont',
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter un prénom avec 2 caractères (minimum)', () => {
      const data: EditProfileInput = {
        firstName: 'Jo',
        lastName: 'Dupont',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter un nom avec 50 caractères (maximum)', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'A'.repeat(50),
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter un téléphone au format +33', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '+33612345678',
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter les caractères accentués français (é, è, ç, etc.)', () => {
      const data: EditProfileInput = {
        firstName: 'François',
        lastName: 'Régnier-Côté',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter les noms composés avec trait d\'union', () => {
      const data: EditProfileInput = {
        firstName: 'Jean-Pierre',
        lastName: 'De La Fontaine',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter les apostrophes dans les noms', () => {
      const data: EditProfileInput = {
        firstName: "Marie-Anne",
        lastName: "D'Artagnan",
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait trimmer les espaces', () => {
      const data = {
        firstName: '  Jean  ',
        lastName: '  Dupont  ',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.firstName).toBe('Jean')
        expect(result.data.lastName).toBe('Dupont')
      }
    })
  })

  // ==========================================================================
  // CAS INVALIDES - PRÉNOM
  // ==========================================================================
  describe('Validation prénom (firstName)', () => {
    it('devrait rejeter un prénom trop court (< 2 caractères)', () => {
      const data: EditProfileInput = {
        firstName: 'J',
        lastName: 'Dupont',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('firstName')
        expect(result.error.errors[0].message).toBe('Minimum 2 caractères')
      }
    })

    it('devrait rejeter un prénom vide', () => {
      const data: EditProfileInput = {
        firstName: '',
        lastName: 'Dupont',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('firstName')
      }
    })

    it('devrait rejeter un prénom avec des chiffres', () => {
      const data: EditProfileInput = {
        firstName: 'Jean123',
        lastName: 'Dupont',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('firstName')
        expect(result.error.errors[0].message).toBe('Caractères invalides détectés')
      }
    })

    it('devrait rejeter un prénom avec des caractères spéciaux non autorisés', () => {
      const data: EditProfileInput = {
        firstName: 'Jean@Dupont',
        lastName: 'Dupont',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('firstName')
      }
    })
  })

  // ==========================================================================
  // CAS INVALIDES - NOM
  // ==========================================================================
  describe('Validation nom (lastName)', () => {
    it('devrait rejeter un nom trop long (> 50 caractères)', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'A'.repeat(51),
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('lastName')
        expect(result.error.errors[0].message).toBe('Maximum 50 caractères')
      }
    })

    it('devrait rejeter un nom vide', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: '',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('lastName')
      }
    })

    it('devrait rejeter un nom avec des emojis', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'Dupont 😀',
        phone: '',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('lastName')
      }
    })
  })

  // ==========================================================================
  // CAS INVALIDES - TÉLÉPHONE
  // ==========================================================================
  describe('Validation téléphone (phone)', () => {
    it('devrait rejeter un téléphone au format invalide', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '123456',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('phone')
        expect(result.error.errors[0].message).toContain('Numéro invalide')
      }
    })

    it('devrait rejeter un téléphone avec des lettres', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '06ABCDEFGH',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('phone')
      }
    })

    it('devrait rejeter un téléphone trop court', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '061234567', // 9 chiffres au lieu de 10
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('devrait rejeter un téléphone trop long', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '06123456789', // 11 chiffres au lieu de 10
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('devrait rejeter un téléphone avec espaces', () => {
      const data: EditProfileInput = {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '06 12 34 56 78',
      }

      const result = editProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
    })
  })
})

// ==========================================================================
// LABELS ET PLACEHOLDERS
// ==========================================================================
describe('EDIT_PROFILE_LABELS', () => {
  it('devrait contenir tous les labels requis', () => {
    expect(EDIT_PROFILE_LABELS).toHaveProperty('firstName')
    expect(EDIT_PROFILE_LABELS).toHaveProperty('lastName')
    expect(EDIT_PROFILE_LABELS).toHaveProperty('phone')
  })

  it('devrait avoir des labels en français', () => {
    expect(EDIT_PROFILE_LABELS.firstName).toBe('Prénom')
    expect(EDIT_PROFILE_LABELS.lastName).toBe('Nom')
    expect(EDIT_PROFILE_LABELS.phone).toBe('Téléphone')
  })
})

describe('EDIT_PROFILE_PLACEHOLDERS', () => {
  it('devrait contenir tous les placeholders requis', () => {
    expect(EDIT_PROFILE_PLACEHOLDERS).toHaveProperty('firstName')
    expect(EDIT_PROFILE_PLACEHOLDERS).toHaveProperty('lastName')
    expect(EDIT_PROFILE_PLACEHOLDERS).toHaveProperty('phone')
  })

  it('devrait avoir des exemples pertinents', () => {
    expect(EDIT_PROFILE_PLACEHOLDERS.firstName).toBe('Jean')
    expect(EDIT_PROFILE_PLACEHOLDERS.lastName).toBe('Dupont')
    expect(EDIT_PROFILE_PLACEHOLDERS.phone).toBe('0612345678')
  })
})
