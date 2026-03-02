/**
 * Tests unitaires pour le composant StructuredData de la page Tarifs
 *
 * @ticket SP-359
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  StructuredData,
  softwareOfferSchema,
  faqPageSchema,
  PRICING_FAQS,
} from '@/app/(about)/tarifs/StructuredData'

describe('StructuredData (Tarifs)', () => {
  describe('JSON-LD SoftwareApplication', () => {
    it('contient le type SoftwareApplication', () => {
      expect(softwareOfferSchema['@type']).toBe('SoftwareApplication')
    })

    it("contient le prix 2.90 EUR dans l'offre", () => {
      expect(softwareOfferSchema.offers.price).toBe('2.9')
      expect(softwareOfferSchema.offers.priceCurrency).toBe('EUR')
    })

    it('contient la specification de prix unitaire', () => {
      const spec = softwareOfferSchema.offers.priceSpecification
      expect(spec['@type']).toBe('UnitPriceSpecification')
      expect(spec.price).toBe('2.9')
      expect(spec.unitText).toBe('employé par mois')
    })

    it('contient la liste des features', () => {
      expect(softwareOfferSchema.featureList.length).toBe(10)
      expect(softwareOfferSchema.featureList).toContain('Plannings drag & drop')
    })

    it("contient les limites d'employes (1-250)", () => {
      expect(softwareOfferSchema.offers.eligibleQuantity.minValue).toBe(1)
      expect(softwareOfferSchema.offers.eligibleQuantity.maxValue).toBe(250)
    })
  })

  describe('JSON-LD FAQPage', () => {
    it('contient le type FAQPage', () => {
      expect(faqPageSchema['@type']).toBe('FAQPage')
    })

    it('contient exactement 8 questions', () => {
      expect(faqPageSchema.mainEntity).toHaveLength(8)
    })

    it('chaque question a le bon format Schema.org', () => {
      faqPageSchema.mainEntity.forEach((q) => {
        expect(q['@type']).toBe('Question')
        expect(q.name).toBeTruthy()
        expect(q.acceptedAnswer['@type']).toBe('Answer')
        expect(q.acceptedAnswer.text).toBeTruthy()
      })
    })
  })

  describe('PRICING_FAQS data', () => {
    it('contient 8 FAQs', () => {
      expect(PRICING_FAQS).toHaveLength(8)
    })

    it('chaque FAQ a question et answer', () => {
      PRICING_FAQS.forEach((faq) => {
        expect(faq.question).toBeTruthy()
        expect(faq.answer).toBeTruthy()
      })
    })
  })

  describe('Rendu du composant', () => {
    it('rend un script JSON-LD dans le DOM', () => {
      const { container } = render(<StructuredData />)
      const script = container.querySelector(
        'script[type="application/ld+json"]'
      )
      expect(script).toBeInTheDocument()
    })

    it('le JSON-LD contient @graph avec 3 schemas', () => {
      const { container } = render(<StructuredData />)
      const script = container.querySelector(
        'script[type="application/ld+json"]'
      )
      const data = JSON.parse(script?.textContent || '{}')
      expect(data['@graph']).toHaveLength(3)
    })
  })
})
