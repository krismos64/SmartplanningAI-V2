/**
 * sitemap.test.ts - Tests du plan de site /sitemap.xml
 *
 * @description Anti-regression SP-550 : les lastModified doivent etre des
 * dates reelles maintenues a la main, pas new Date() regenere a chaque
 * requete (signal lastmod ignore par Google sinon).
 *
 * @ticket SP-550
 */

import { describe, expect, it } from 'vitest'

import sitemap from '../sitemap'
import { getAllSectors } from '../(sectors)/solutions/data'

const TEST_START = new Date()

describe('sitemap', () => {
  it('liste toutes les pages publiques avec leurs priorites', () => {
    const entries = sitemap()
    const urls = entries.map((e) => e.url)

    expect(urls).toEqual([
      'https://smartplanning.fr',
      'https://smartplanning.fr/tarifs',
      ...getAllSectors().map(
        (sector) => `https://smartplanning.fr/solutions/${sector.slug}`
      ),
      'https://smartplanning.fr/a-propos',
      'https://smartplanning.fr/cgu',
      'https://smartplanning.fr/cgv',
      'https://smartplanning.fr/confidentialite',
      'https://smartplanning.fr/mentions-legales',
      'https://smartplanning.fr/cookies',
    ])
    expect(entries[0]?.priority).toBe(1.0)
    entries.slice(-5).forEach((e) => expect(e.priority).toBe(0.3))
  })

  it('inclut chaque page secteur avec sa date propre et la priorite 0.8', () => {
    const entries = sitemap()

    for (const sector of getAllSectors()) {
      const entry = entries.find(
        (e) => e.url === `https://smartplanning.fr/solutions/${sector.slug}`
      )
      expect(entry).toBeDefined()
      expect(entry?.priority).toBe(0.8)
      expect((entry?.lastModified as Date).getTime()).toBe(
        new Date(sector.lastModified).getTime()
      )
    }
  })

  it('utilise des dates lastModified fixes, jamais new Date() a la volee', () => {
    for (const entry of sitemap()) {
      const lastModified = entry.lastModified as Date
      expect(lastModified).toBeInstanceOf(Date)
      // Une date generee a la requete serait >= au demarrage du test
      expect(lastModified.getTime()).toBeLessThan(TEST_START.getTime())
    }
  })

  it('retourne des lastModified identiques entre deux appels', () => {
    const first = sitemap().map((e) => (e.lastModified as Date).getTime())
    const second = sitemap().map((e) => (e.lastModified as Date).getTime())

    expect(second).toEqual(first)
  })
})
