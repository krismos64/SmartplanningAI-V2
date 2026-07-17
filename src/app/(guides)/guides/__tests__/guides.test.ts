/**
 * guides.test.ts - Tests du registre des guides /guides/[slug]
 *
 * @description Garde-fous SEO/GEO sur les donnees de chaque guide :
 * longueur des metadata, reponse directe citable, volume long format
 * (1 200+ mots), sections ancrees uniques, FAQ, dates reelles, et
 * interdiction produit de citer des concurrents (decision 17/07/2026).
 *
 * @ticket SP-555
 */

import { describe, expect, it } from 'vitest'

import { getAllGuides, getGuideBySlug } from '../data'

/** Decision produit : aucun concurrent cite nominativement */
const COMPETITOR_PATTERN =
  /skello|combo|eurecia|planning\s*cong[eé](?!s)|snapshift|factorial/i

function collectTexts(guide: ReturnType<typeof getAllGuides>[number]) {
  return [
    guide.title,
    guide.metaTitle,
    guide.metaDescription,
    guide.excerpt,
    guide.directAnswer,
    ...guide.keywords,
    ...guide.sections.flatMap((section) => [
      section.title,
      ...section.paragraphs,
      ...(section.bullets ?? []),
      section.stepName ?? '',
    ]),
    ...guide.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ]
}

function countWords(texts: string[]): number {
  return texts.join(' ').split(/\s+/).filter(Boolean).length
}

describe('registre des guides', () => {
  it('expose au moins deux guides avec des slugs uniques et propres', () => {
    const guides = getAllGuides()
    expect(guides.length).toBeGreaterThanOrEqual(2)

    const slugs = guides.map((guide) => guide.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9-]+$/))
  })

  it('getGuideBySlug retrouve un guide et rejette les slugs inconnus', () => {
    expect(getGuideBySlug('faire-un-planning-equipe')?.title).toContain(
      'planning'
    )
    expect(getGuideBySlug('guide-inconnu')).toBeUndefined()
  })
})

describe.each(getAllGuides().map((guide) => [guide.slug, guide] as const))(
  'guide %s',
  (_slug, guide) => {
    it('respecte les contraintes de longueur des metadata', () => {
      // Le layout ajoute « | SmartPlanning » (16 chars) : viser <= 60 au total
      expect(guide.metaTitle.length).toBeLessThanOrEqual(44 + 16)
      expect(guide.metaTitle.length).toBeGreaterThanOrEqual(30)
      expect(guide.metaDescription.length).toBeLessThanOrEqual(165)
      expect(guide.metaDescription.length).toBeGreaterThanOrEqual(120)
      expect(guide.keywords.length).toBeGreaterThanOrEqual(5)
    })

    it('a une reponse directe citable (regle GEO des 100 premiers mots)', () => {
      const words = countWords([guide.directAnswer])
      expect(words).toBeGreaterThanOrEqual(40)
      expect(words).toBeLessThanOrEqual(120)
    })

    it('a un volume long format (1 200+ mots)', () => {
      expect(countWords(collectTexts(guide))).toBeGreaterThanOrEqual(1200)
    })

    it('a des sections ancrees uniques (5 minimum)', () => {
      expect(guide.sections.length).toBeGreaterThanOrEqual(5)
      const ids = guide.sections.map((section) => section.id)
      expect(new Set(ids).size).toBe(ids.length)
      ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/))
    })

    it('a une FAQ complete pour le schema FAQPage', () => {
      expect(guide.faqs.length).toBeGreaterThanOrEqual(4)
      for (const faq of guide.faqs) {
        expect(faq.question.trim().length).toBeGreaterThan(10)
        expect(faq.question.trim()).toMatch(/\?$/)
        expect(faq.answer.trim().length).toBeGreaterThan(50)
      }
    })

    it('ne cite aucun concurrent (decision produit du 17/07/2026)', () => {
      for (const text of collectTexts(guide)) {
        expect(text).not.toMatch(COMPETITOR_PATTERN)
      }
    })

    it('a des dates reelles et coherentes', () => {
      for (const value of [guide.datePublished, guide.lastModified]) {
        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(Number.isNaN(new Date(value).getTime())).toBe(false)
        expect(new Date(value).getTime()).toBeLessThanOrEqual(
          Date.now() + 86_400_000
        )
      }
      expect(new Date(guide.lastModified).getTime()).toBeGreaterThanOrEqual(
        new Date(guide.datePublished).getTime()
      )
      expect(guide.readingMinutes).toBeGreaterThanOrEqual(3)
      expect(guide.readingMinutes).toBeLessThanOrEqual(30)
    })
  }
)
