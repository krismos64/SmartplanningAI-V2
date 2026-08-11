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

import dynamic from 'next/dynamic'

// Composants above-the-fold : import statique direct (pas via le barrel) pour
// un rendu immédiat du LCP sans tirer le code des sections below-the-fold.
import { LandingHeader as Header } from '@/components/layout/LandingHeader'
import { HeroSection } from './(landing)/components/sections/HeroSection'

/**
 * Sections below-the-fold : import dynamique (code-splitting).
 *
 * Perf (TBT mobile) : ces 9 sections embarquent toutes Framer Motion. En
 * import statique, leur JS était parsé/exécuté dans le bundle initial alors
 * qu'elles ne sont pas visibles au chargement. `next/dynamic` les isole dans
 * des chunks séparés chargés à la demande, ce qui réduit le Total Blocking
 * Time sans toucher au SSR (ssr conservé par défaut → HTML rendu serveur
 * intact pour le SEO et zéro CLS).
 */
const RoleDemosSection = dynamic(() =>
  import('./(landing)/components/sections/RoleDemosSection').then(
    (m) => m.RoleDemosSection
  )
)
const FeaturesSection = dynamic(() =>
  import('./(landing)/components/sections/FeaturesSection').then(
    (m) => m.FeaturesSection
  )
)
const HowItWorksSection = dynamic(() =>
  import('./(landing)/components/sections/HowItWorksSection').then(
    (m) => m.HowItWorksSection
  )
)
const BenefitsSection = dynamic(() =>
  import('./(landing)/components/sections/BenefitsSection').then(
    (m) => m.BenefitsSection
  )
)
const PricingSection = dynamic(() =>
  import('./(landing)/components/sections/PricingSection').then(
    (m) => m.PricingSection
  )
)
const FAQSection = dynamic(() =>
  import('./(landing)/components/sections/FAQSection').then((m) => m.FAQSection)
)
const ContactSection = dynamic(() =>
  import('./(landing)/components/sections/ContactSection').then(
    (m) => m.ContactSection
  )
)
const CTASection = dynamic(() =>
  import('./(landing)/components/sections/CTASection').then((m) => m.CTASection)
)
const Footer = dynamic(() =>
  import('@/components/layout/LandingFooter').then((m) => m.LandingFooter)
)

export default function LandingPageContent() {


  return (
    <div className="public-scope min-h-screen overflow-x-hidden bg-public-surface text-public-content">
      {/* Header */}
      <Header />

      {/* Sections */}
      <HeroSection />
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
