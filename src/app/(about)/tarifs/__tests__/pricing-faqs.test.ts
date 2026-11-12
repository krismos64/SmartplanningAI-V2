/**
 * Garde-fous de la FAQ tarifs
 *
 * La FAQ alimente à la fois l'accordéon de /tarifs et le JSON-LD FAQPage.
 * La question sur le siège du dirigeant est une chaîne valide : aucun autre
 * contrôle ne verrait sa disparition, et la première facture redeviendrait
 * la seule à l'annoncer.
 *
 * @ticket SP-626
 */

import { describe, expect, it } from 'vitest'

import { PRICING_FAQS } from '../StructuredData'

/** Marqueur de texte généré, interdit dans tout contenu rédigé */
const EM_DASH_PATTERN = /[—–]/

describe('PRICING_FAQS', () => {
  it('répond que le dirigeant compte comme un employé facturé', () => {
    const faq = PRICING_FAQS.find((item) => /dirigeant/i.test(item.question))

    expect(faq).toBeDefined()
    expect(faq?.answer).toMatch(/^Oui\./)
    expect(faq?.answer).toContain('comptez 6 employés')
  })

  it("n'utilise aucun tiret cadratin ni demi-cadratin", () => {
    for (const { question, answer } of PRICING_FAQS) {
      expect(question).not.toMatch(EM_DASH_PATTERN)
      expect(answer).not.toMatch(EM_DASH_PATTERN)
    }
  })
})
