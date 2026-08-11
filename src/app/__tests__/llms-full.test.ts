/**
 * llms-full.test.ts - Tests du fichier /llms-full.txt
 *
 * @description Garde-fous du format llms-full : le fichier doit porter
 * le CONTENU des pages, pas seulement leurs URL. C'est le defaut corrige
 * par SP-564, ou la version statique de public/ ne listait que des liens.
 *
 * Verifie aussi les regles de contenu public du projet : aucun
 * concurrent nomme, aucun tiret cadratin, orthographe francaise accentuee.
 *
 * @ticket SP-564
 */

import { describe, expect, it } from 'vitest'

import { buildLlmsFullText } from '../llms-full.txt/llms-full.content'
import { GET } from '../llms-full.txt/route'
import { getAllGuides } from '../(guides)/guides/data'
import { getAllSectors } from '../(sectors)/solutions/data'

/** Decision produit : aucun concurrent cite nominativement */
const COMPETITOR_PATTERN =
  /skello|combo|eurecia|planning\s*cong[eé]|snapshift|factorial/i

/** Marqueur de texte genere, interdit dans tout contenu redige */
const EM_DASH_PATTERN = /[—–]/

const content = buildLlmsFullText()

describe('llms-full.txt : reponse HTTP', () => {
  it('sert du texte brut en UTF-8 avec un statut 200', async () => {
    const response = GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe(
      'text/plain; charset=utf-8'
    )
    await expect(response.text()).resolves.toBe(content)
  })
})

describe('llms-full.txt : contenu embarque', () => {
  it('embarque le texte des secteurs et pas seulement leurs URL', () => {
    for (const sector of getAllSectors()) {
      expect(content).toContain(sector.name)
      expect(content).toContain(sector.directAnswer)

      // Le contexte metier, les enjeux et les reponses produit
      sector.intro.forEach((paragraph) => expect(content).toContain(paragraph))
      sector.challenges.forEach((challenge) => {
        expect(content).toContain(challenge.title)
        expect(content).toContain(challenge.description)
      })
      sector.solutions.forEach((solution) => {
        expect(content).toContain(solution.feature)
        expect(content).toContain(solution.benefit)
      })

      // La FAQ, qui porte le schema FAQPage cote page
      sector.faqs.forEach((faq) => {
        expect(content).toContain(faq.question)
        expect(content).toContain(faq.answer)
      })

      expect(content).toContain(`/solutions/${sector.slug}`)
    }
  })

  it('embarque le texte integral des guides, sections comprises', () => {
    for (const guide of getAllGuides()) {
      expect(content).toContain(guide.title)
      expect(content).toContain(guide.directAnswer)

      guide.sections.forEach((section) => {
        expect(content).toContain(section.title)
        section.paragraphs.forEach((paragraph) =>
          expect(content).toContain(paragraph)
        )
        section.bullets?.forEach((bullet) => expect(content).toContain(bullet))
      })

      guide.faqs.forEach((faq) => {
        expect(content).toContain(faq.question)
        expect(content).toContain(faq.answer)
      })

      expect(content).toContain(`/guides/${guide.slug}`)
    }
  })

  it('conserve les references legales datees des guides', () => {
    // Valeur editoriale du guide HCR : sans ces articles, un assistant
    // qui cite le fichier perd ce qui distingue le contenu.
    expect(content).toContain('L3131-1')
    expect(content).toContain('13.5')
    expect(content).toContain('avenant n° 2')
  })

  it('porte le prix au format francais complet', () => {
    // Anti-regression : un formatage naif rendait « 2,9 » au lieu de « 2,90 »
    expect(content).toContain('2,90')
    expect(content).not.toMatch(/\b2,9\s/)
  })

  it('conserve le preambule de presentation et le glossaire', () => {
    expect(content).toContain('## Présentation')
    expect(content).toContain('## Glossaire')
    expect(content).toContain('## Tarification détaillée')
    expect(content).toContain('Multi-tenant')
  })
})

describe('llms-full.txt : garde-fous de contenu public', () => {
  it('ne cite aucun concurrent (decision produit du 17/07/2026)', () => {
    expect(content).not.toMatch(COMPETITOR_PATTERN)
  })

  it("n'utilise aucun tiret cadratin ni demi-cadratin", () => {
    expect(content).not.toMatch(EM_DASH_PATTERN)
  })

  it('porte des accents francais dans le preambule redige a la main', () => {
    expect(content).toContain('hébergée en France')
    expect(content).toContain('Sécurité et conformité')
  })

  it('est nettement plus volumineux quune simple liste de liens', () => {
    // La version statique remplacee faisait 8,7 ko en ne portant que des URL.
    // Seuil bas volontairement : il attrape la regression de format, pas
    // les variations normales du contenu editorial.
    expect(content.length).toBeGreaterThan(30_000)
  })
})
