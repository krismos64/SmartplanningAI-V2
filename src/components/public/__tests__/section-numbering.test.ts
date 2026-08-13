/**
 * Garde-fou de la numerotation des sections publiques
 *
 * `SectionLabel` affiche un rang (« 01 · LE PRODUIT ») qui doit suivre
 * l'ordre de lecture de la page. Rien ne le verifiait : l'index est un
 * nombre ecrit en dur dans chaque section, et la page qui les monte ne le
 * voit pas. Un reordonnancement de sections laisse donc une numerotation
 * fausse sans qu'aucun outil ne bronche, ni le type-check, ni axe-core, ni
 * un coup d'oeil rapide, la suite ne sautant aux yeux qu'en scrollant la
 * page entiere.
 *
 * C'est ce qui est arrive apres la refonte SP-565 a SP-573 : la landing
 * lisait 01, 03, 02, 03, 04, 05, 07, 08, 09, avec une inversion et un
 * doublon, et /a-propos lisait 01, 02, 03, 05, 04.
 *
 * Ce test lit l'ordre de montage dans la page, resout l'index declare par
 * chaque section, et exige une suite continue depuis 1.
 *
 * @ticket SP-574
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()

/**
 * Pages verifiees, et sections numerotees qu'elles montent dans l'ordre.
 *
 * La liste des sections est explicite plutot que deduite du JSX : elle
 * force a declarer tout ajout, exactement comme la liste d'URL du test de
 * sitemap. Une section montee sans etre listee ici passerait inapercue,
 * l'ordre du fichier reste donc verifie separement ci-dessous.
 */
const PAGES = [
  {
    label: 'landing',
    page: 'src/app/LandingPageContent.tsx',
    sections: [
      'HeroSection',
      'RoleDemosSection',
      'FeaturesSection',
      'MobileSection',
      'HowItWorksSection',
      'BenefitsSection',
      'PricingSection',
      'FAQSection',
      'ContactSection',
    ],
    dir: 'src/app/(landing)/components/sections',
  },
] as const

/**
 * Index declare par une section, lu dans son appel a `SectionLabel`.
 *
 * Retourne `null` quand la section rend un index variable (`index={index}`),
 * son rang etant alors decide par la page qui la monte.
 */
function declaredIndex(file: string): number | null {
  const content = readFileSync(join(ROOT, file), 'utf-8')
  const match = content.match(/<SectionLabel[^>]*\bindex=\{(\d+)\}/)

  if (!match) return null
  return Number(match[1])
}

describe('numerotation des sections publiques', () => {
  for (const { label, page, sections, dir } of PAGES) {
    describe(label, () => {
      it('monte les sections numerotees dans l ordre attendu', () => {
        const content = readFileSync(join(ROOT, page), 'utf-8')

        // Position de chaque balise de section dans le JSX rendu, en
        // ignorant les imports dynamiques declares plus haut.
        const rendered = [...content.matchAll(/<([A-Z][A-Za-z]*Section)\s*\/>/g)]
          .map((m) => m[1])
          .filter((name): name is string => Boolean(name))

        expect(
          rendered.filter((name) => sections.includes(name as never)),
          'ordre de montage different de la liste declaree dans ce test'
        ).toEqual([...sections])
      })

      it('numerote les sections en suite continue depuis 01', () => {
        const found = sections.map((name) => ({
          name,
          index: declaredIndex(join(dir, `${name}.tsx`)),
        }))

        const missing = found.filter((s) => s.index === null)
        expect(
          missing.map((s) => s.name),
          'sections sans index litteral, rang impossible a verifier'
        ).toEqual([])

        expect(
          found.map((s) => `${s.name}=${s.index}`),
          'la numerotation ne suit pas l ordre de lecture'
        ).toEqual(sections.map((name, rank) => `${name}=${rank + 1}`))
      })
    })
  }

  /**
   * /a-propos porte ses labels dans la page elle-meme et non dans des
   * fichiers de section, sauf `VideoSection` qui recoit son rang en prop.
   * Les deux sources sont donc confrontees a la main.
   */
  describe('a-propos', () => {
    const PAGE = 'src/app/(about)/a-propos/AboutContent.tsx'
    const VIDEO = 'src/app/(landing)/components/sections/VideoSection.tsx'

    it('numerote ses sections en suite continue depuis 01', () => {
      const content = readFileSync(join(ROOT, PAGE), 'utf-8')

      // Les labels ecrits dans la page, plus le rang de `VideoSection`
      // pris a sa position de montage.
      const ranks = [...content.matchAll(/<(?:SectionLabel[^>]*\bindex=\{(\d+)\}|VideoSection\b([^/>]*)\/>)/g)].map(
        (match) => {
          if (match[1]) return Number(match[1])

          // `<VideoSection />` sans prop : rang par defaut du composant.
          const prop = match[2]?.match(/index=\{(\d+)\}/)
          if (prop) return Number(prop[1])

          const video = readFileSync(join(ROOT, VIDEO), 'utf-8')
          const fallback = video.match(/index\s*=\s*(\d+)\s*\}:\s*VideoSectionProps/)
          expect(fallback, 'rang par defaut de VideoSection introuvable').not.toBeNull()
          return Number(fallback?.[1])
        }
      )

      expect(ranks.length, 'aucune section numerotee trouvee').toBeGreaterThan(3)
      expect(ranks, 'la numerotation ne suit pas l ordre de lecture').toEqual(
        ranks.map((_, rank) => rank + 1)
      )
    })
  })
})
