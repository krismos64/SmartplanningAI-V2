/**
 * Tests unitaires pour LandingPageContent
 *
 * @ticket SP-462
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import LandingPageContent from '@/app/LandingPageContent'

// Mock des composants lourds pour isoler le test
vi.mock('@/app/(landing)/components', () => ({
  AnimatedBackground: () => <div data-testid="animated-bg" />,
  TopBanner: () => <div data-testid="top-banner" />,
}))

vi.mock('@/app/(landing)/components/sections', () => ({
  Header: ({ isScrolled }: { isScrolled: boolean }) => (
    <header data-testid="header" data-scrolled={isScrolled} />
  ),
  HeroSection: () => <div data-testid="hero" />,
  VideoSection: () => <div data-testid="video" />,
  FeaturesSection: () => <div data-testid="features" />,
  HowItWorksSection: () => <div data-testid="how-it-works" />,
  BenefitsSection: () => <div data-testid="benefits" />,
  StatsSection: () => <div data-testid="stats" />,
  PricingSection: () => <div data-testid="pricing" />,
  FAQSection: () => <div data-testid="faq" />,
  ContactSection: () => <div data-testid="contact" />,
  CTASection: () => <div data-testid="cta" />,
  Footer: () => <footer data-testid="footer" />,
}))

describe('LandingPageContent', () => {
  it('rend le composant sans erreur', () => {
    const { container } = render(<LandingPageContent />)
    expect(container).toBeTruthy()
  })

  it('rend toutes les sections principales', () => {
    const { getByTestId } = render(<LandingPageContent />)
    expect(getByTestId('hero')).toBeInTheDocument()
    expect(getByTestId('features')).toBeInTheDocument()
    expect(getByTestId('pricing')).toBeInTheDocument()
    expect(getByTestId('faq')).toBeInTheDocument()
    expect(getByTestId('footer')).toBeInTheDocument()
  })
})
