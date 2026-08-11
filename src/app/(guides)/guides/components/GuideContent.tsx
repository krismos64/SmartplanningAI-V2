'use client'

/**
 * GuideContent Component
 * Template des guides pratiques /guides/[slug]
 *
 * @description Article long format optimisé lecture et SEO/GEO :
 * réponse directe en ouverture, sommaire ancré, sections H2, FAQ,
 * date de mise à jour visible. Volontairement sans animations
 * whileInView : prose 100 % statique côté serveur (CLS nul, audit
 * axe stable).
 *
 * @ticket SP-555
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronRight, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AnimatedBackground,
  FAQItem,
  PRIMARY_BUTTON_CLASSES,
  HIGHLIGHT_TEXT_CLASSES_PUBLIC,
} from '@/app/(landing)/components'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { PRICING } from '@/lib/config/pricing'
import type { GuideData } from '../data'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

interface GuideContentProps {
  guide: GuideData
}

export function GuideContent({ guide }: GuideContentProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="public-scope relative min-h-screen bg-background text-foreground">
      {/* Background Effects - Decorative, hidden from screen readers */}
      <div aria-hidden="true">
        <AnimatedBackground />
      </div>

      <LandingHeader isScrolled={isScrolled} />

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>

      <main id="main-content" role="main">
        <article
          aria-labelledby="guide-title"
          className="relative pb-16 pt-28 lg:pt-32"
        >
          <div className="container-custom">
            {/* Fil d'Ariane */}
            <nav aria-label="Fil d'Ariane" className="mb-8">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/"
                    className="transition-colors hover:text-foreground"
                  >
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-4 w-4" />
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="transition-colors hover:text-foreground"
                  >
                    Guides
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-4 w-4" />
                </li>
                <li aria-current="page" className="text-foreground">
                  {guide.title}
                </li>
              </ol>
            </nav>

            <div className="mx-auto max-w-3xl">
              {/* En-tête de l'article */}
              <header className="mb-12">
                <p className="mb-6" aria-hidden="true">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-700">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Guide pratique
                  </span>
                </p>

                <h1
                  id="guide-title"
                  className="mb-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                >
                  {guide.title}
                </h1>

                <p className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                    {guide.readingMinutes} min de lecture
                  </span>
                  <span>
                    Mis à jour le{' '}
                    <time dateTime={guide.lastModified}>
                      {dateFormatter.format(new Date(guide.lastModified))}
                    </time>
                  </span>
                </p>

                {/* Réponse directe (GEO) : la réponse à la requête, citable */}
                <p className="border-l-4 border-blue-600 pl-4 text-lg leading-relaxed text-muted-foreground">
                  {guide.directAnswer}
                </p>
              </header>

              {/* Sommaire */}
              <nav
                aria-label="Sommaire du guide"
                className="mb-12 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
              >
                <h2 className="mb-4 text-lg font-semibold">Sommaire</h2>
                <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
                  {guide.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="transition-colors hover:text-foreground"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              {/* Sections */}
              {guide.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="mb-12 scroll-mt-28"
                >
                  <h2
                    id={`${section.id}-title`}
                    className="mb-4 text-2xl font-bold sm:text-3xl"
                  >
                    {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4 text-lg leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="mb-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-muted-foreground">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {/* FAQ */}
              <section
                id="faq"
                aria-labelledby="faq-title"
                className="mb-16 scroll-mt-28"
              >
                <h2
                  id="faq-title"
                  className="mb-6 text-2xl font-bold sm:text-3xl"
                >
                  Questions fréquentes
                </h2>
                <div className="space-y-4">
                  {guide.faqs.map((faq, index) => (
                    <FAQItem
                      key={faq.question}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFaqIndex === index}
                      onClick={() =>
                        setOpenFaqIndex(openFaqIndex === index ? null : index)
                      }
                    />
                  ))}
                </div>
              </section>

              {/* CTA final */}
              <aside
                className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-blue-600/10 via-blue-500/10 to-blue-400/10 p-10 text-center"
                role="complementary"
                aria-label="Appel à l'action pour essayer SmartPlanning"
              >
                <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
                  Passez de la théorie à la{' '}
                  <span className={HIGHLIGHT_TEXT_CLASSES_PUBLIC}>pratique</span>
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                  Plannings, congés et messagerie d&apos;équipe dans un seul
                  outil. Essai gratuit {PRICING.TRIAL_DAYS} jours, sans carte
                  bancaire.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button size="lg" className={PRIMARY_BUTTON_CLASSES} asChild>
                    <Link
                      href="/register"
                      aria-label="Créer un compte SmartPlanning gratuitement"
                    >
                      Essayer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base"
                    asChild
                  >
                    <Link
                      href="/guides"
                      aria-label="Voir tous les guides pratiques"
                    >
                      Tous les guides
                    </Link>
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </article>
      </main>

      <LandingFooter />
    </div>
  )
}
