/**
 * FAQSection Component
 *
 * Questions frequentes, direction editoriale SP-568.
 *
 * Server Component depuis SP-572 : l'etat de l'accordeon vit dans
 * FaqAccordion, seul ilot client. La reponse de chaque question demeure
 * dans le DOM, seule sa hauteur est animee, ce qui preserve le schema
 * FAQPage pour les moteurs et les assistants.
 *
 * Les donnees viennent du registre `faqs`, leur contenu n'est pas modifie.
 *
 * @see SP-568 - Landing, sections basses
 */

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { FaqAccordion } from '@/components/public/FaqAccordion'
import { faqs } from '../../data'

export function FAQSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-public-surface py-24 lg:py-32"
    >
      <div className="container-custom">
        <div className="grid items-start gap-12 lg:grid-cols-[24rem_1fr] lg:gap-20">
          {/* Colonne titre */}
          <div className="lg:sticky lg:top-32">
            <SectionLabel index={9}>Questions fréquentes</SectionLabel>

            <DisplayTitle
              as="h2"
              id="faq-title"
              accent="réponses directes."
              className="mt-8 text-public-content"
            >
              Questions courantes,
            </DisplayTitle>

            <p className="mt-6 font-geist text-base leading-relaxed text-public-content-muted">
              Vous ne trouvez pas votre réponse ? Notre équipe répond
              directement.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex min-h-[3rem] items-center gap-2 font-geist text-base font-semibold text-public-accent underline underline-offset-8 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface"
            >
              Nous contacter
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Colonne questions */}
          <FaqAccordion items={[...faqs]} idPrefix="landing-faq" />
        </div>
      </div>
    </section>
  )
}
