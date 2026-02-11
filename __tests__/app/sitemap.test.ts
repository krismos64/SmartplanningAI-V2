/**
 * Tests unitaires pour sitemap.ts
 *
 * @ticket SP-462
 */

import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'

describe('sitemap.ts', () => {
  const result = sitemap()

  it('retourne exactement 8 URLs', () => {
    expect(result).toHaveLength(8)
  })

  it('contient les 8 URLs publiques attendues', () => {
    const urls = result.map((entry) => entry.url)
    expect(urls).toContain('https://smartplanning.fr')
    expect(urls).toContain('https://smartplanning.fr/tarifs')
    expect(urls).toContain('https://smartplanning.fr/a-propos')
    expect(urls).toContain('https://smartplanning.fr/cgu')
    expect(urls).toContain('https://smartplanning.fr/cgv')
    expect(urls).toContain('https://smartplanning.fr/confidentialite')
    expect(urls).toContain('https://smartplanning.fr/mentions-legales')
    expect(urls).toContain('https://smartplanning.fr/cookies')
  })

  it('donne la priorite la plus haute a la homepage', () => {
    const homepage = result.find(
      (entry) => entry.url === 'https://smartplanning.fr'
    )
    expect(homepage?.priority).toBe(1.0)
  })

  it('donne une haute priorite a la page tarifs', () => {
    const tarifs = result.find(
      (entry) => entry.url === 'https://smartplanning.fr/tarifs'
    )
    expect(tarifs?.priority).toBe(0.9)
  })

  it('donne une basse priorite aux pages legales', () => {
    const legalUrls = [
      'https://smartplanning.fr/cgu',
      'https://smartplanning.fr/cgv',
      'https://smartplanning.fr/confidentialite',
      'https://smartplanning.fr/mentions-legales',
      'https://smartplanning.fr/cookies',
    ]
    legalUrls.forEach((url) => {
      const entry = result.find((e) => e.url === url)
      expect(entry?.priority).toBe(0.3)
    })
  })

  it('utilise les bonnes frequences de mise a jour', () => {
    const homepage = result.find(
      (entry) => entry.url === 'https://smartplanning.fr'
    )
    expect(homepage?.changeFrequency).toBe('weekly')

    const tarifs = result.find(
      (entry) => entry.url === 'https://smartplanning.fr/tarifs'
    )
    expect(tarifs?.changeFrequency).toBe('monthly')

    const cgu = result.find(
      (entry) => entry.url === 'https://smartplanning.fr/cgu'
    )
    expect(cgu?.changeFrequency).toBe('yearly')
  })

  it('contient un lastModified valide pour chaque entree', () => {
    result.forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date)
    })
  })
})
