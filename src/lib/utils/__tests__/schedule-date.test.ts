import { describe, expect, it } from 'vitest'

import {
  formatScheduleDateLong,
  formatScheduleDateShort,
} from '../schedule-date'

/**
 * SP-603 : les deux conventions de stockage coexistent en production.
 * Un clic dans la grille écrit minuit Paris (22:00 UTC la veille en été),
 * la saisie groupée écrit 00:00 UTC. Les deux doivent afficher le même jour,
 * quel que soit le fuseau du processus.
 */
describe('formatScheduleDate', () => {
  // Valeurs relevées en production le 28 septembre 2026
  const clicGrilleDimanche = new Date('2026-10-03T22:00:00.000Z')
  const clicGrilleLundi = new Date('2026-09-27T22:00:00.000Z')
  const saisieGroupeeLundi = new Date('2026-09-28T00:00:00.000Z')

  it('rend le jour Paris et non le jour UTC pour un créneau à 22:00 UTC', () => {
    expect(formatScheduleDateLong(clicGrilleDimanche)).toBe('4 octobre 2026')
    expect(formatScheduleDateShort(clicGrilleLundi)).toBe('28/09/2026')
  })

  it('donne le même jour pour les deux conventions de stockage', () => {
    expect(formatScheduleDateShort(clicGrilleLundi)).toBe(
      formatScheduleDateShort(saisieGroupeeLundi)
    )
  })

  it("gère l'heure d'hiver, où minuit Paris vaut 23:00 UTC", () => {
    expect(
      formatScheduleDateLong(new Date('2026-12-14T23:00:00.000Z'))
    ).toBe('15 décembre 2026')
  })

  it('accepte une chaîne ISO', () => {
    expect(formatScheduleDateShort('2026-10-03T22:00:00.000Z')).toBe(
      '04/10/2026'
    )
  })

  it('respecte un fuseau explicite', () => {
    expect(
      formatScheduleDateShort(clicGrilleDimanche, 'America/New_York')
    ).toBe('03/10/2026')
  })
})
