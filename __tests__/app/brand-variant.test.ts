/**
 * brand-variant.test.ts - Garde-fou sur la variante de marque « Smart Planning »
 *
 * @description Google traite `smartplanning` et `smart planning` comme deux
 * requetes distinctes. Au 26 aout 2026, la forme accolee sortait en position
 * 6,5 quand la forme espacee tombait en position 41 sur 191 impressions : la
 * variante n'existait que dans un `alternateName` du JSON-LD, signal faible,
 * et nulle part dans le contenu visible.
 *
 * Ces assertions empechent une refonte de retirer la variante en silence. Le
 * scan de contenu public ne la verrait pas passer : « Smart Planning » est une
 * chaine parfaitement valide, simplement absente.
 */

import { describe, expect, it } from 'vitest'

import { organizationSchema, webSiteSchema } from '@/app/StructuredData'
import { faqs } from '@/app/(landing)/data'

/** Forme espacee, insensible a la casse, bornee sur les mots */
const SPACED_VARIANT = /\bsmart\s+planning\b/i

describe('Variante de marque « Smart Planning »', () => {
  describe('donnees structurees', () => {
    it("l'Organization porte la variante espacee en alternateName", () => {
      const alternates = organizationSchema.alternateName
      expect(Array.isArray(alternates)).toBe(true)
      expect(alternates.some((name) => SPACED_VARIANT.test(name))).toBe(true)
    })

    it('le WebSite porte lui aussi la variante espacee', () => {
      const alternates = webSiteSchema.alternateName
      expect(Array.isArray(alternates)).toBe(true)
      expect(alternates.some((name) => SPACED_VARIANT.test(name))).toBe(true)
    })
  })

  describe('contenu visible', () => {
    it('la FAQ de la landing mentionne la variante espacee', () => {
      // La FAQ alimente aussi le schema FAQPage : la variante y gagne un
      // signal dans le contenu rendu, pas seulement dans les metadonnees.
      const answers = faqs.map((faq) => faq.answer).join(' ')
      expect(SPACED_VARIANT.test(answers)).toBe(true)
    })
  })
})
