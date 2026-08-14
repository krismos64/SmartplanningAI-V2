/**
 * sectors.test.ts - Tests du registre des pages secteur /solutions/[slug]
 *
 * @description Garde-fous SEO/GEO sur les donnees de chaque secteur :
 * contraintes de longueur des metadata, reponse directe citable,
 * volume de contenu minimal, et interdiction produit de citer des
 * concurrents (decision du 17/07/2026).
 *
 * @ticket SP-552, SP-553
 */

import { describe, expect, it } from 'vitest'

import { getAllSectors, getSectorBySlug } from '../data'

/** Decision produit : aucun concurrent cite nominativement */
const COMPETITOR_PATTERN =
  /skello|combo|eurecia|planning\s*cong[eé]|snapshift|factorial/i

function collectTexts(sector: ReturnType<typeof getAllSectors>[number]) {
  return [
    sector.name,
    sector.metaTitle,
    sector.metaDescription,
    sector.h1,
    sector.h1Highlight,
    sector.teaser,
    sector.directAnswer,
    ...sector.intro,
    ...sector.keywords,
    ...sector.challenges.flatMap((c) => [c.title, c.description]),
    ...sector.solutions.flatMap((s) => [s.feature, s.benefit]),
    sector.pricingExample.teamLabel,
    sector.pricingExample.description,
    ...sector.faqs.flatMap((f) => [f.question, f.answer]),
  ]
}

function countWords(texts: string[]): number {
  return texts.join(' ').split(/\s+/).filter(Boolean).length
}

describe('registre des secteurs', () => {
  it('expose au moins un secteur avec des slugs uniques et propres', () => {
    const sectors = getAllSectors()
    expect(sectors.length).toBeGreaterThanOrEqual(1)

    const slugs = sectors.map((s) => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9-]+$/))
  })

  it('getSectorBySlug retrouve un secteur et rejette les slugs inconnus', () => {
    expect(getSectorBySlug('planning-restaurant')?.name).toBe(
      'Restauration et hôtellerie'
    )
    expect(getSectorBySlug('secteur-inconnu')).toBeUndefined()
  })
})

describe.each(getAllSectors().map((sector) => [sector.slug, sector] as const))(
  'secteur %s',
  (_slug, sector) => {
    it('respecte les contraintes de longueur des metadata', () => {
      // Le layout ajoute « | SmartPlanning » (16 chars) : viser <= 60 au total
      expect(sector.metaTitle.length).toBeLessThanOrEqual(44 + 16)
      expect(sector.metaTitle.length).toBeGreaterThanOrEqual(30)
      expect(sector.metaDescription.length).toBeLessThanOrEqual(165)
      expect(sector.metaDescription.length).toBeGreaterThanOrEqual(120)
      expect(sector.keywords.length).toBeGreaterThanOrEqual(5)
    })

    it('a un teaser au calibre d une carte de hub', () => {
      // Le teaser alimente la carte du hub /solutions. Il tenait auparavant
      // dans intro[0], le premier paragraphe entier de la page : 88 a 104 mots
      // selon le secteur, soit trois a quatre fois la longueur d un apercu.
      // Bornes calees sur les excerpt des guides, qui rendent bien : 24 a 30
      // mots. La borne haute est le garde-fou reel, la borne basse empeche un
      // teaser vide ou reduit a quelques mots.
      const words = countWords([sector.teaser])
      expect(words).toBeGreaterThanOrEqual(18)
      expect(words).toBeLessThanOrEqual(32)
      // Le titre de la carte porte deja le nom du secteur
      expect(sector.teaser).not.toContain(sector.name)
    })

    it('a une reponse directe citable (regle GEO des 100 premiers mots)', () => {
      const words = countWords([sector.directAnswer])
      expect(words).toBeGreaterThanOrEqual(40)
      expect(words).toBeLessThanOrEqual(110)
      // La reponse directe doit contenir le prix (fait citable)
      expect(sector.directAnswer).toContain('2,90')
    })

    it('a un volume de contenu suffisant pour le SEO (800+ mots)', () => {
      expect(countWords(collectTexts(sector))).toBeGreaterThanOrEqual(800)
    })

    it('a une FAQ complete pour le schema FAQPage', () => {
      expect(sector.faqs.length).toBeGreaterThanOrEqual(4)
      for (const faq of sector.faqs) {
        expect(faq.question.trim().length).toBeGreaterThan(10)
        expect(faq.question.trim()).toMatch(/\?$/)
        expect(faq.answer.trim().length).toBeGreaterThan(50)
      }
    })

    it('ne cite aucun concurrent (decision produit du 17/07/2026)', () => {
      for (const text of collectTexts(sector)) {
        expect(text).not.toMatch(COMPETITOR_PATTERN)
      }
    })

    it('a une date de derniere modification reelle et valide', () => {
      expect(sector.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      const date = new Date(sector.lastModified)
      expect(Number.isNaN(date.getTime())).toBe(false)
      // Marge d'un jour pour les fuseaux : la date ne doit pas etre future
      expect(date.getTime()).toBeLessThanOrEqual(Date.now() + 86_400_000)
    })
  }
)
