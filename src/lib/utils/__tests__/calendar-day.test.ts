import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  addCalendarDays,
  addCalendarMonths,
  differenceInCalendarDaysUtc,
  endOfCalendarDay,
  toCalendarDay,
} from '../schedule-date'

/**
 * SP-609 : une seule convention de stockage, 00:00 UTC du jour calendaire à
 * Paris. Chaque cas reprend une forme relevée en production le 2 octobre
 * 2026. Les tests tournent sous les deux fuseaux de processus : UTC comme le
 * conteneur, Paris comme un poste de développement. Un résultat qui changerait
 * avec le fuseau du processus serait précisément le défaut à corriger.
 */
describe.each(['UTC', 'Europe/Paris'])('jour calendaire (TZ=%s)', (tz) => {
  const previousTz = process.env.TZ

  beforeAll(() => {
    process.env.TZ = tz
  })

  afterAll(() => {
    process.env.TZ = previousTz
  })

  describe('toCalendarDay', () => {
    it('garde le jour d une date déjà à 00:00 UTC (saisie groupée)', () => {
      expect(
        toCalendarDay(new Date('2026-09-28T00:00:00Z')).toISOString()
      ).toBe('2026-09-28T00:00:00.000Z')
    })

    it('rend le lendemain pour minuit Paris en été, stocké à 22:00 UTC', () => {
      expect(
        toCalendarDay(new Date('2026-10-03T22:00:00Z')).toISOString()
      ).toBe('2026-10-04T00:00:00.000Z')
    })

    it('rend le lendemain pour minuit Paris en hiver, stocké à 23:00 UTC', () => {
      expect(
        toCalendarDay(new Date('2026-12-14T23:00:00Z')).toISOString()
      ).toBe('2026-12-15T00:00:00.000Z')
    })

    it('garde le jour d une heure courante en soirée (bouton Nouveau créneau)', () => {
      // Trasco, 30 septembre 2026 à 20:51 heure de Paris
      expect(
        toCalendarDay(new Date('2026-09-30T18:51:45.853Z')).toISOString()
      ).toBe('2026-09-30T00:00:00.000Z')
    })

    it('rend le jour Paris d un instant posé après minuit Paris', () => {
      // 00:30 à Paris le 5 octobre, encore le 4 en UTC
      expect(
        toCalendarDay(new Date('2026-10-04T22:30:00Z')).toISOString()
      ).toBe('2026-10-05T00:00:00.000Z')
    })

    it('garde le jour d un instant réel de créneau (glisser-déposer)', () => {
      // Distri Shop, 12 mai 2026, 10:00 heure de Paris
      expect(
        toCalendarDay(new Date('2026-05-12T08:00:00Z')).toISOString()
      ).toBe('2026-05-12T00:00:00.000Z')
    })

    it('franchit le changement d heure de mars sans perdre de jour', () => {
      // Nuit du 28 au 29 mars 2026 : minuit Paris passe de 23:00 à 22:00 UTC
      expect(
        toCalendarDay(new Date('2026-03-28T23:00:00Z')).toISOString()
      ).toBe('2026-03-29T00:00:00.000Z')
      expect(
        toCalendarDay(new Date('2026-03-29T22:00:00Z')).toISOString()
      ).toBe('2026-03-30T00:00:00.000Z')
    })

    it('est idempotent', () => {
      const day = toCalendarDay(new Date('2026-10-03T22:00:00Z'))
      expect(toCalendarDay(day).getTime()).toBe(day.getTime())
    })

    it('accepte une chaîne ISO', () => {
      expect(toCalendarDay('2026-10-03T22:00:00.000Z').toISOString()).toBe(
        '2026-10-04T00:00:00.000Z'
      )
    })
  })

  describe('arithmétique des jours calendaires', () => {
    it('ajoute des jours à travers le changement d heure', () => {
      const samedi = new Date('2026-03-28T00:00:00Z')
      expect(addCalendarDays(samedi, 2).toISOString()).toBe(
        '2026-03-30T00:00:00.000Z'
      )
    })

    it('ramène au dernier jour du mois quand le jour n existe pas', () => {
      const trenteEtUnJanvier = new Date('2026-01-31T00:00:00Z')
      expect(addCalendarMonths(trenteEtUnJanvier, 1).toISOString()).toBe(
        '2026-02-28T00:00:00.000Z'
      )
    })

    it('borne la journée à sa dernière milliseconde', () => {
      expect(
        endOfCalendarDay(new Date('2026-10-04T00:00:00Z')).toISOString()
      ).toBe('2026-10-04T23:59:59.999Z')
    })

    it('compte les jours entre deux jours calendaires', () => {
      expect(
        differenceInCalendarDaysUtc(
          new Date('2026-03-30T00:00:00Z'),
          new Date('2026-03-28T00:00:00Z')
        )
      ).toBe(2)
    })
  })
})
