/**
 * LandingPageContent - Composant client de la landing page
 *
 * @description Contenu interactif de la page d'accueil avec animations
 * et scroll tracking. Extrait du page.tsx pour permettre au Server Component
 * parent d'exporter les metadata SEO.
 *
 * @ticket SP-462
 */

'use client'

import { useEffect, useState } from 'react'

// Components
import { AnimatedBackground, TopBanner } from './(landing)/components'
import {
  Header,
  HeroSection,
  VideoSection,
  RoleDemosSection,
  FeaturesSection,
  HowItWorksSection,
  BenefitsSection,
  PricingSection,
  FAQSection,
  ContactSection,
  CTASection,
  Footer,
} from './(landing)/components/sections'

export default function LandingPageContent() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Background */}
      <AnimatedBackground />

      {/* Top Banner */}
      <TopBanner />

      {/* Header */}
      <Header isScrolled={isScrolled} />

      {/* Sections */}
      <HeroSection />
      <VideoSection />
      <RoleDemosSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
