/**
 * Tests unitaires pour les helpers de formatage de date/heure
 *
 * @ticket SP-276 - Préférences Affichage
 */

import { describe, it, expect } from 'vitest'

import {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeDate,
  formatShortDate,
  formatLongDate,
  formatWeekday,
  formatMonthYear,
  createFormatter,
} from '../date-format'

// Date de référence : 31 décembre 2026 à 14:30:45
const REFERENCE_DATE = new Date(2026, 11, 31, 14, 30, 45)
// ISO string de la date de référence
const REFERENCE_ISO = '2026-12-31T14:30:45'
// Timestamp de la date de référence
const REFERENCE_TIMESTAMP = REFERENCE_DATE.getTime()

describe('date-format helpers', () => {
  // ==========================================================================
  // formatDate
  // ==========================================================================
  describe('formatDate', () => {
    it('formate en DD/MM/YYYY par défaut', () => {
      expect(formatDate(REFERENCE_DATE)).toBe('31/12/2026')
    })

    it('formate en DD/MM/YYYY (FR)', () => {
      expect(formatDate(REFERENCE_DATE, { dateFormat: 'DD/MM/YYYY' })).toBe(
        '31/12/2026'
      )
    })

    it('formate en MM/DD/YYYY (US)', () => {
      expect(formatDate(REFERENCE_DATE, { dateFormat: 'MM/DD/YYYY' })).toBe(
        '12/31/2026'
      )
    })

    it('formate en YYYY-MM-DD (ISO)', () => {
      expect(formatDate(REFERENCE_DATE, { dateFormat: 'YYYY-MM-DD' })).toBe(
        '2026-12-31'
      )
    })

    it('accepte une string ISO', () => {
      expect(formatDate(REFERENCE_ISO)).toBe('31/12/2026')
    })

    it('accepte un timestamp', () => {
      expect(formatDate(REFERENCE_TIMESTAMP)).toBe('31/12/2026')
    })

    it('retourne une chaîne vide pour une date invalide', () => {
      expect(formatDate('invalid-date')).toBe('')
      expect(formatDate(NaN)).toBe('')
    })

    it('retourne une chaîne vide pour null/undefined', () => {
      expect(formatDate(null as unknown as Date)).toBe('')
      expect(formatDate(undefined as unknown as Date)).toBe('')
    })
  })

  // ==========================================================================
  // formatTime
  // ==========================================================================
  describe('formatTime', () => {
    it('formate en 24h par défaut', () => {
      expect(formatTime(REFERENCE_DATE)).toBe('14:30')
    })

    it('formate en 24h explicitement', () => {
      expect(formatTime(REFERENCE_DATE, { timeFormat: '24h' })).toBe('14:30')
    })

    it('formate en 12h', () => {
      expect(formatTime(REFERENCE_DATE, { timeFormat: '12h' })).toBe('2:30 PM')
    })

    it('formate minuit en 12h', () => {
      const midnight = new Date(2026, 11, 31, 0, 0, 0)
      expect(formatTime(midnight, { timeFormat: '12h' })).toBe('12:00 AM')
    })

    it('formate midi en 12h', () => {
      const noon = new Date(2026, 11, 31, 12, 0, 0)
      expect(formatTime(noon, { timeFormat: '12h' })).toBe('12:00 PM')
    })

    it('accepte une string ISO', () => {
      expect(formatTime(REFERENCE_ISO)).toBe('14:30')
    })

    it('retourne une chaîne vide pour une date invalide', () => {
      expect(formatTime('invalid')).toBe('')
    })
  })

  // ==========================================================================
  // formatDateTime
  // ==========================================================================
  describe('formatDateTime', () => {
    it('combine date et heure par défaut', () => {
      expect(formatDateTime(REFERENCE_DATE)).toBe('31/12/2026 14:30')
    })

    it('combine date US et heure 12h', () => {
      expect(
        formatDateTime(REFERENCE_DATE, {
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
        })
      ).toBe('12/31/2026 2:30 PM')
    })

    it('combine date ISO et heure 24h', () => {
      expect(
        formatDateTime(REFERENCE_DATE, {
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
        })
      ).toBe('2026-12-31 14:30')
    })

    it('retourne une chaîne vide pour une date invalide', () => {
      expect(formatDateTime('invalid')).toBe('')
    })
  })

  // ==========================================================================
  // formatRelativeDate
  // ==========================================================================
  describe('formatRelativeDate', () => {
    it('retourne une date relative en français', () => {
      // La fonction formatRelative dépend de la date actuelle
      // On vérifie juste que ça retourne quelque chose de non vide
      const result = formatRelativeDate(new Date(), { language: 'fr' })
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('retourne une date relative en anglais', () => {
      const result = formatRelativeDate(new Date(), { language: 'en' })
      expect(result).toBeTruthy()
    })

    it('retourne une chaîne vide pour une date invalide', () => {
      expect(formatRelativeDate('invalid')).toBe('')
    })
  })

  // ==========================================================================
  // formatShortDate
  // ==========================================================================
  describe('formatShortDate', () => {
    it('formate en français (jour mois)', () => {
      expect(formatShortDate(REFERENCE_DATE, { language: 'fr' })).toBe(
        '31 déc.'
      )
    })

    it('formate en anglais (mois jour)', () => {
      expect(formatShortDate(REFERENCE_DATE, { language: 'en' })).toBe('Dec 31')
    })

    it('retourne une chaîne vide pour une date invalide', () => {
      expect(formatShortDate('invalid')).toBe('')
    })
  })

  // ==========================================================================
  // formatLongDate
  // ==========================================================================
  describe('formatLongDate', () => {
    it('formate en français (jour mois année)', () => {
      expect(formatLongDate(REFERENCE_DATE, { language: 'fr' })).toBe(
        '31 décembre 2026'
      )
    })

    it('formate en anglais (mois jour, année)', () => {
      expect(formatLongDate(REFERENCE_DATE, { language: 'en' })).toBe(
        'December 31, 2026'
      )
    })

    it('retourne une chaîne vide pour une date invalide', () => {
      expect(formatLongDate('invalid')).toBe('')
    })
  })

  // ==========================================================================
  // formatWeekday
  // ==========================================================================
  describe('formatWeekday', () => {
    it('retourne le jour abrégé en français', () => {
      // 31 décembre 2026 est un jeudi
      expect(formatWeekday(REFERENCE_DATE, { language: 'fr' })).toBe('jeu.')
    })

    it('retourne le jour complet en français', () => {
      expect(formatWeekday(REFERENCE_DATE, { language: 'fr' }, true)).toBe(
        'jeudi'
      )
    })

    it('retourne le jour abrégé en anglais', () => {
      expect(formatWeekday(REFERENCE_DATE, { language: 'en' })).toBe('Thu')
    })

    it('retourne le jour complet en anglais', () => {
      expect(formatWeekday(REFERENCE_DATE, { language: 'en' }, true)).toBe(
        'Thursday'
      )
    })

    it('retourne une chaîne vide pour une date invalide', () => {
      expect(formatWeekday('invalid')).toBe('')
    })
  })

  // ==========================================================================
  // formatMonthYear
  // ==========================================================================
  describe('formatMonthYear', () => {
    it('retourne mois année en français', () => {
      expect(formatMonthYear(REFERENCE_DATE, { language: 'fr' })).toBe(
        'décembre 2026'
      )
    })

    it('retourne mois année en anglais', () => {
      expect(formatMonthYear(REFERENCE_DATE, { language: 'en' })).toBe(
        'December 2026'
      )
    })

    it('retourne une chaîne vide pour une date invalide', () => {
      expect(formatMonthYear('invalid')).toBe('')
    })
  })

  // ==========================================================================
  // createFormatter
  // ==========================================================================
  describe('createFormatter', () => {
    it('crée un formateur avec options par défaut', () => {
      const fmt = createFormatter()

      expect(fmt.date(REFERENCE_DATE)).toBe('31/12/2026')
      expect(fmt.time(REFERENCE_DATE)).toBe('14:30')
    })

    it('crée un formateur avec options personnalisées', () => {
      const fmt = createFormatter({
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '12h',
        language: 'en',
      })

      expect(fmt.date(REFERENCE_DATE)).toBe('2026-12-31')
      expect(fmt.time(REFERENCE_DATE)).toBe('2:30 PM')
      expect(fmt.dateTime(REFERENCE_DATE)).toBe('2026-12-31 2:30 PM')
    })

    it('permet de surcharger les options par appel', () => {
      const fmt = createFormatter({ dateFormat: 'DD/MM/YYYY' })

      expect(fmt.date(REFERENCE_DATE)).toBe('31/12/2026')
      expect(fmt.date(REFERENCE_DATE, { dateFormat: 'YYYY-MM-DD' })).toBe(
        '2026-12-31'
      )
    })

    it('expose toutes les fonctions de formatage', () => {
      const fmt = createFormatter()

      expect(typeof fmt.date).toBe('function')
      expect(typeof fmt.time).toBe('function')
      expect(typeof fmt.dateTime).toBe('function')
      expect(typeof fmt.relative).toBe('function')
      expect(typeof fmt.shortDate).toBe('function')
      expect(typeof fmt.longDate).toBe('function')
      expect(typeof fmt.weekday).toBe('function')
      expect(typeof fmt.monthYear).toBe('function')
    })
  })

  // ==========================================================================
  // Edge cases
  // ==========================================================================
  describe('edge cases', () => {
    it('gère le 1er janvier', () => {
      const jan1 = new Date(2026, 0, 1, 0, 0, 0)
      expect(formatDate(jan1)).toBe('01/01/2026')
      expect(formatTime(jan1)).toBe('00:00')
    })

    it('gère les années bissextiles (29 février)', () => {
      // 2028 est une année bissextile
      const feb29 = new Date(2028, 1, 29, 12, 0, 0)
      expect(formatDate(feb29)).toBe('29/02/2028')
    })

    it('gère les fuseaux horaires via ISO string', () => {
      // Une date ISO avec timezone est parsée puis formatée
      const isoWithTz = '2026-12-31T14:30:00.000Z'
      const result = formatDate(isoWithTz)
      // Le résultat dépend du fuseau local, on vérifie juste que c'est une date valide
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    })
  })
})
