'use client'

/**
 * SectorsHubContent Component
 * Hub /solutions : index des pages secteur
 *
 * @description Index des secteurs couverts avec cartes (nom, promesse,
 * date de mise à jour) et maillage vers les guides. Prose statique,
 * sans animations whileInView, sur le modèle de GuidesHubContent.
 *
 * @ticket SP-563
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronRight, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AnimatedBackground,
  PRIMARY_BUTTON_CLASSES,
  HIGHLIGHT_TEXT_CLASSES,
} from '@/app/(landing)/components'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import type { SectorData } from '../data'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

/**
 * Lien de guide réduit au strict nécessaire. Le registre complet n'est pas
 * importé ici : ce composant est un Client Component, et `getAllGuides()`
 * embarquerait le texte intégral de chaque guide dans le bundle client.
 * Même choix que LandingHeader et LandingFooter.
 */
interface GuideLink {
  slug: string
  title: string
}

interface SectorsHubContentProps {
  sectors: readonly SectorData[]
  guides: readonly GuideLink[]
}

export function SectorsHubContent({
  sectors,
  guides,
}: SectorsHubContentProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen bg-background text-foreground">
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
                Solutions
              </li>
            </ol>
          </nav>

          {/* En-tête */}
          <header className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-6" aria-hidden="true">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-700 dark:border-blue-500/20 dark:text-blue-400">
                <Store className="h-4 w-4" aria-hidden="true" />
                Solutions par secteur
              </span>
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
              Un logiciel de planning adapté à{' '}
              <span className={HIGHLIGHT_TEXT_CLASSES}>votre métier</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Les contraintes de planning d&apos;un restaurant ne sont pas
              celles d&apos;un chantier. Chaque page détaille les règles, les
              cas concrets et le tarif pour un secteur donné : 2,90 € HT par
              employé et par mois, essai gratuit de 21 jours.
            </p>
          </header>

          {/* Liste des secteurs */}
          <ul
            className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2"
            role="list"
            aria-label="Liste des secteurs couverts"
          >
            {sectors.map((sector) => (
              <li key={sector.slug} className="h-full">
                <Link
                  href={`/solutions/${sector.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card"
                >
                  <h2 className="mb-3 text-xl font-semibold transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-400">
                    {sector.name}
                  </h2>
                  <p className="mb-6 flex-1 text-muted-foreground">
                    {sector.intro[0]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mis à jour le{' '}
                    <time dateTime={sector.lastModified}>
                      {dateFormatter.format(new Date(sector.lastModified))}
                    </time>
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Maillage vers les guides */}
          <section
            aria-labelledby="guides-title"
            className="mx-auto mt-24 max-w-3xl text-center"
          >
            <h2
              id="guides-title"
              className="mb-4 text-2xl font-bold sm:text-3xl"
            >
              Les <span className={HIGHLIGHT_TEXT_CLASSES}>guides</span>{' '}
              pratiques
            </h2>
            <p className="mb-8 text-muted-foreground">
              Les méthodes et les règles légales qui s&apos;appliquent quel que
              soit votre secteur.
            </p>
            <ul
              className="flex flex-wrap justify-center gap-4"
              role="list"
              aria-label="Guides pratiques"
            >
              {guides.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-3 text-sm transition-all hover:border-border hover:bg-card"
                  >
                    <BookOpen
                      className="h-4 w-4 text-blue-700 dark:text-blue-400"
                      aria-hidden="true"
                    />
                    {guide.title}
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
              <span className={HIGHLIGHT_TEXT_CLASSES}>plannings</span> ?
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
