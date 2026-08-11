'use client'

/**
 * GuidesHubContent Component
 * Hub éditorial /guides : liste des guides pratiques
 *
 * @description Index des guides avec cartes (titre, résumé, temps de
 * lecture, date de mise à jour) et maillage vers les pages secteur.
 * Prose statique, sans animations whileInView.
 *
 * @ticket SP-555
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronRight, Clock3, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AnimatedBackground,
  PRIMARY_BUTTON_CLASSES,
  HIGHLIGHT_TEXT_CLASSES_PUBLIC,
} from '@/app/(landing)/components'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { getAllSectors } from '@/app/(sectors)/solutions/data'
import type { GuideData } from '../data'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

interface GuidesHubContentProps {
  guides: readonly GuideData[]
}

export function GuidesHubContent({ guides }: GuidesHubContentProps) {
  const [isScrolled, setIsScrolled] = useState(false)

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
        <div className="container-custom relative pb-24 pt-28 lg:pt-32">
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
              <li aria-current="page" className="text-foreground">
                Guides
              </li>
            </ol>
          </nav>

          {/* En-tête */}
          <header className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-6" aria-hidden="true">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-700">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Ressources
              </span>
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
              Guides pratiques{' '}
              <span className={HIGHLIGHT_TEXT_CLASSES_PUBLIC}>planning et RH</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Des méthodes concrètes et les règles légales à jour pour gérer les
              plannings, les congés et les équipes d&apos;une TPE ou d&apos;une
              PME. Rédigés et vérifiés par l&apos;équipe SmartPlanning.
            </p>
          </header>

          {/* Liste des guides */}
          <ul
            className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2"
            role="list"
            aria-label="Liste des guides pratiques"
          >
            {guides.map((guide) => (
              <li key={guide.slug} className="h-full">
                <Link
                  href={`/guides/${guide.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card"
                >
                  <h2 className="mb-3 text-xl font-semibold transition-colors group-hover:text-blue-700">
                    {guide.title}
                  </h2>
                  <p className="mb-6 flex-1 text-muted-foreground">
                    {guide.excerpt}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-4 w-4" aria-hidden="true" />
                      {guide.readingMinutes} min
                    </span>
                    <span>
                      Mis à jour le{' '}
                      <time dateTime={guide.lastModified}>
                        {dateFormatter.format(new Date(guide.lastModified))}
                      </time>
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Maillage vers les pages secteur */}
          <section
            aria-labelledby="sectors-title"
            className="mx-auto mt-24 max-w-3xl text-center"
          >
            <h2
              id="sectors-title"
              className="mb-4 text-2xl font-bold sm:text-3xl"
            >
              SmartPlanning dans votre{' '}
              <span className={HIGHLIGHT_TEXT_CLASSES_PUBLIC}>secteur</span>
            </h2>
            <p className="mb-8 text-muted-foreground">
              Découvrez comment SmartPlanning répond aux contraintes concrètes
              de votre métier.
            </p>
            <ul
              className="flex flex-wrap justify-center gap-4"
              role="list"
              aria-label="Pages solutions par secteur"
            >
              {getAllSectors().map((sector) => (
                <li key={sector.slug}>
                  <Link
                    href={`/solutions/${sector.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-3 text-sm transition-all hover:border-border hover:bg-card"
                  >
                    <Store
                      className="h-4 w-4 text-blue-700"
                      aria-hidden="true"
                    />
                    {sector.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA final */}
          <aside
            className="relative mx-auto mt-24 max-w-3xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-blue-600/10 via-blue-500/10 to-blue-400/10 p-10 text-center"
            role="complementary"
            aria-label="Appel à l'action pour essayer SmartPlanning"
          >
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              Prêt à simplifier vos{' '}
              <span className={HIGHLIGHT_TEXT_CLASSES_PUBLIC}>plannings</span> ?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Essai gratuit 21 jours, sans carte bancaire, sans engagement.
            </p>
            <Button size="lg" className={PRIMARY_BUTTON_CLASSES} asChild>
              <Link
                href="/register"
                aria-label="Créer un compte SmartPlanning gratuitement"
              >
                Essayer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </aside>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
