/**
 * Tests unitaires pour le composant StructuredData de la homepage
 *
 * @ticket SP-462
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  StructuredData,
  webSiteSchema,
  organizationSchema,
  softwareAppSchema,
  faqPageSchema,
} from '@/app/StructuredData'

describe('StructuredData (Homepage)', () => {
  describe('WebSite schema', () => {
    it('contient le type WebSite', () => {
      expect(webSiteSchema['@type']).toBe('WebSite')
    })

    it('a le bon @id', () => {
      expect(webSiteSchema['@id']).toContain('/#website')
    })

    it('a le nom SmartPlanning', () => {
      expect(webSiteSchema.name).toBe('SmartPlanning')
    })

    it('a la bonne langue', () => {
      expect(webSiteSchema.inLanguage).toBe('fr-FR')
    })

    it('reference le publisher Organization', () => {
      expect(webSiteSchema.publisher['@id']).toContain('/#organization')
    })

    it('ne contient PAS de SearchAction (deprecie)', () => {
      expect(webSiteSchema).not.toHaveProperty('potentialAction')
    })
  })

  describe('Organization schema', () => {
    it('contient le type Organization', () => {
      expect(organizationSchema['@type']).toBe('Organization')
    })

    it('a le bon @id', () => {
      expect(organizationSchema['@id']).toContain('/#organization')
    })

    it('a le nom SmartPlanning', () => {
      expect(organizationSchema.name).toBe('SmartPlanning')
    })

    it('contient un logo avec url, width et height', () => {
      expect(organizationSchema.logo).toBeDefined()
      expect(organizationSchema.logo['@type']).toBe('ImageObject')
      expect(organizationSchema.logo.url).toContain('/images/logo-sp.png')
      expect(organizationSchema.logo.width).toBe(512)
      expect(organizationSchema.logo.height).toBe(512)
    })

    it('cible la France comme zone de service', () => {
      expect(organizationSchema.areaServed.name).toBe('France')
    })
  })

  describe('SoftwareApplication schema', () => {
    it('contient le type SoftwareApplication', () => {
      expect(softwareAppSchema['@type']).toBe('SoftwareApplication')
    })

    it('contient le prix 2.90 EUR', () => {
      expect(softwareAppSchema.offers.price).toBe('2.9')
      expect(softwareAppSchema.offers.priceCurrency).toBe('EUR')
    })

    it('contient la specification de prix unitaire', () => {
      const spec = softwareAppSchema.offers.priceSpecification
      expect(spec['@type']).toBe('UnitPriceSpecification')
      expect(spec.price).toBe('2.9')
    })

    it('contient la liste des features', () => {
      expect(softwareAppSchema.featureList.length).toBeGreaterThan(0)
    })

    it('reference le provider Organization', () => {
      expect(softwareAppSchema.provider['@id']).toContain('/#organization')
    })
  })

  describe('FAQPage schema', () => {
    it('contient le type FAQPage', () => {
      expect(faqPageSchema['@type']).toBe('FAQPage')
    })

    it('contient des questions', () => {
      expect(faqPageSchema.mainEntity.length).toBeGreaterThan(0)
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

  describe('Rendu du composant', () => {
    it('rend un script JSON-LD dans le DOM', () => {
      const { container } = render(<StructuredData />)
      const script = container.querySelector(
        'script[type="application/ld+json"]'
      )
      expect(script).toBeInTheDocument()
    })

    it('le JSON-LD contient @graph avec 4 schemas', () => {
      const { container } = render(<StructuredData />)
      const script = container.querySelector(
        'script[type="application/ld+json"]'
      )
      const data = JSON.parse(script?.textContent || '{}')
      expect(data['@graph']).toHaveLength(4)
    })

    it('le @graph contient les 4 types attendus', () => {
      const { container } = render(<StructuredData />)
      const script = container.querySelector(
        'script[type="application/ld+json"]'
      )
      const data = JSON.parse(script?.textContent || '{}')
      const types = data['@graph'].map(
        (s: Record<string, string>) => s['@type']
      )
      expect(types).toContain('WebSite')
      expect(types).toContain('Organization')
      expect(types).toContain('SoftwareApplication')
      expect(types).toContain('FAQPage')
    })
  })
})
