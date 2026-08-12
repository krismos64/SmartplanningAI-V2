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

import Link from 'next/link'
import { PublicPageShell } from '@/components/public/PublicPageShell'
import { ArrowRight, BookOpen, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PRIMARY_BUTTON_CLASSES,
  HIGHLIGHT_TEXT_CLASSES_PUBLIC,
} from '@/app/(landing)/components'
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

export function SectorsHubContent({ sectors, guides }: SectorsHubContentProps) {
  return (
    <PublicPageShell breadcrumb={[{ label: 'Solutions' }]}>
      <div className="container-custom pb-24 pt-10">
        {/* En-tête */}
        <header className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-6" aria-hidden="true">
            <span className="inline-flex items-center gap-2 border-l-4 border-public-accent bg-public-surface-subtle px-4 py-2 font-geist text-sm font-medium text-public-content">
              <Store className="h-4 w-4" aria-hidden="true" />
              Solutions par secteur
            </span>
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
            Un logiciel de planning adapté à{' '}
            <span className={HIGHLIGHT_TEXT_CLASSES_PUBLIC}>votre métier</span>
          </h1>
          <p className="text-lg leading-relaxed text-public-content-muted">
            Les contraintes de planning d&apos;un restaurant ne sont pas celles
            d&apos;un chantier. Chaque page détaille les règles, les cas
            concrets et le tarif pour un secteur donné : 2,90 € HT par employé
            et par mois, essai gratuit de 21 jours.
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
                className="group flex h-full flex-col border border-public-border bg-public-surface-subtle p-6 transition-colors hover:border-public-accent"
              >
                <h2 className="mb-3 text-xl font-semibold transition-colors group-hover:text-public-accent">
                  {sector.name}
                </h2>
                <p className="mb-6 flex-1 text-public-content-muted">
                  {sector.intro[0]}
                </p>
                <p className="text-sm text-public-content-muted">
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
            className="mb-4 font-geist text-2xl font-bold text-public-content sm:text-3xl"
          >
            Les <span className={HIGHLIGHT_TEXT_CLASSES_PUBLIC}>guides</span>{' '}
            pratiques
          </h2>
          <p className="mb-8 text-public-content-muted">
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
                  className="inline-flex min-h-[2.75rem] items-center gap-2 border border-public-border bg-public-surface px-5 py-3 font-geist text-sm text-public-content transition-colors hover:border-public-accent hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent"
                >
                  <BookOpen
                    className="h-4 w-4 text-public-accent"
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
          className="relative mx-auto mt-24 max-w-3xl border-t-2 border-public-accent bg-public-surface-subtle p-10 text-center"
          role="complementary"
          aria-label="Appel à l'action pour essayer SmartPlanning"
        >
          <h2 className="mb-4 font-geist text-2xl font-bold text-public-content sm:text-3xl">
            Prêt à simplifier vos{' '}
            <span className={HIGHLIGHT_TEXT_CLASSES_PUBLIC}>plannings</span> ?
          </h2>
          <p className="mx-auto mb-8 max-w-xl font-geist text-public-content-muted">
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
    </PublicPageShell>
  )
}
