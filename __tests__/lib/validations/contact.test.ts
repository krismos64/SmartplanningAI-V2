/**
 * Tests unitaires pour le schéma de validation contact
 *
 * @ticket SP-287
 * @description Tests Zod pour le formulaire de contact
 */

import { describe, it, expect } from 'vitest'
import { contactSchema, contactDefaultValues } from '@/lib/validations/contact'

describe('contactSchema', () => {
  // ==========================================================================
  // CAS VALIDES
  // ==========================================================================
  describe('Cas valides', () => {
    it('devrait valider un formulaire complet valide', () => {
      const validData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        subject: 'Demande de renseignement',
        message:
          'Bonjour, je souhaite en savoir plus sur votre solution SmartPlanning.',
      }

      const result = contactSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Jean Dupont')
        expect(result.data.email).toBe('jean.dupont@email.com')
        expect(result.data.subject).toBe('Demande de renseignement')
      }
    })

    it('devrait accepter un nom avec 2 caractères (minimum)', () => {
      const data = {
        name: 'Jo',
        email: 'jo@test.com',
        subject: 'Test sujet valide',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter un nom avec 100 caractères (maximum)', () => {
      const data = {
        name: 'A'.repeat(100),
        email: 'test@test.com',
        subject: 'Test sujet valide',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it("devrait accepter un sujet avec 5 caractères (minimum)", () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jean@test.com',
        subject: 'Hello',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter un message avec 20 caractères (minimum)', () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jean@test.com',
        subject: 'Test sujet',
        message: '12345678901234567890', // exactement 20 caractères
      }

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it("devrait convertir l'email en minuscules", () => {
      const data = {
        name: 'Jean Dupont',
        email: 'JEAN.DUPONT@EMAIL.COM',
        subject: 'Test sujet valide',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('jean.dupont@email.com')
      }
    })

    it('devrait trimmer les espaces des champs texte', () => {
      const data = {
        name: '  Jean Dupont  ',
        email: 'jean@test.com', // Email sans espaces (trim fait APRÈS validation)
        subject: '  Test sujet valide  ',
        message:
          '  Ceci est un message de test avec plus de 20 caractères.  ',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Jean Dupont')
        expect(result.data.subject).toBe('Test sujet valide')
        expect(result.data.message).toBe(
          'Ceci est un message de test avec plus de 20 caractères.'
        )
      }
    })
  })

  // ==========================================================================
  // CAS INVALIDES - NOM
  // ==========================================================================
  describe('Validation du nom', () => {
    it('devrait rejeter un nom vide', () => {
      const data = {
        name: '',
        email: 'test@test.com',
        subject: 'Test sujet',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2 caractères')
      }
    })

    it('devrait rejeter un nom avec 1 caractère', () => {
      const data = {
        name: 'J',
        email: 'test@test.com',
        subject: 'Test sujet',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('devrait rejeter un nom avec plus de 100 caractères', () => {
      const data = {
        name: 'A'.repeat(101),
        email: 'test@test.com',
        subject: 'Test sujet',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100 caractères')
      }
    })
  })

  // ==========================================================================
  // CAS INVALIDES - EMAIL
  // ==========================================================================
  describe("Validation de l'email", () => {
    it('devrait rejeter un email vide', () => {
      const data = {
        name: 'Jean Dupont',
        email: '',
        subject: 'Test sujet',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('devrait rejeter un email invalide (sans @)', () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jeandupont.email.com',
        subject: 'Test sujet',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('devrait rejeter un email invalide (sans domaine)', () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jean@',
        subject: 'Test sujet',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
    })
  })

  // ==========================================================================
  // CAS INVALIDES - SUJET
  // ==========================================================================
  describe('Validation du sujet', () => {
    it('devrait rejeter un sujet vide', () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jean@test.com',
        subject: '',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('devrait rejeter un sujet avec moins de 5 caractères', () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jean@test.com',
        subject: 'Test',
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('5 caractères')
      }
    })

    it('devrait rejeter un sujet avec plus de 200 caractères', () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jean@test.com',
        subject: 'A'.repeat(201),
        message: 'Ceci est un message de test avec plus de 20 caractères.',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('200 caractères')
      }
    })
  })

  // ==========================================================================
  // CAS INVALIDES - MESSAGE
  // ==========================================================================
  describe('Validation du message', () => {
    it('devrait rejeter un message vide', () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jean@test.com',
        subject: 'Test sujet',
        message: '',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('devrait rejeter un message avec moins de 20 caractères', () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jean@test.com',
        subject: 'Test sujet',
        message: 'Message court',
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('20 caractères')
      }
    })

    it('devrait rejeter un message avec plus de 2000 caractères', () => {
      const data = {
        name: 'Jean Dupont',
        email: 'jean@test.com',
        subject: 'Test sujet',
        message: 'A'.repeat(2001),
      }

      const result = contactSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2000 caractères')
      }
    })
  })

  // ==========================================================================
  // VALEURS PAR DÉFAUT
  // ==========================================================================
  describe('Valeurs par défaut', () => {
    it('devrait avoir des valeurs par défaut vides', () => {
      expect(contactDefaultValues).toEqual({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    })
  })
})
