/**
 * SmartPlanning Landing Page
 *
 * Refactored following best practices:
 * - Separation of concerns (components, data, animations, styles)
 * - Reusable components
 * - CSS Modules for styling
 * - Framer Motion variants for animations
 *
 * @see Context7 docs: Next.js, React, Framer Motion
 */

'use client'

import { useEffect, useState } from 'react'

// Components
import { AnimatedBackground, TopBanner } from './(landing)/components'
import {
  Header,
  HeroSection,
  VideoSection,
  FeaturesSection,
  HowItWorksSection,
  BenefitsSection,
  StatsSection,
  PricingSection,
  FAQSection,
  ContactSection,
  CTASection,
  Footer,
} from './(landing)/components/sections'

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground dark:bg-[#030712] dark:text-white">
      {/* Background */}
      <AnimatedBackground />

      {/* Top Banner */}
      <TopBanner />

      {/* Header */}
      <Header isScrolled={isScrolled} />

      {/* Sections */}
      <HeroSection />
      <VideoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <StatsSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
