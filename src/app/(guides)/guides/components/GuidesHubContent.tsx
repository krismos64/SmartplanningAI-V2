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

import Link from 'next/link'
import { PublicPageShell } from '@/components/public/PublicPageShell'
import { ArrowRight, BookOpen, Clock3, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PRIMARY_BUTTON_CLASSES,
  HIGHLIGHT_TEXT_CLASSES_PUBLIC,
} from '@/app/(landing)/components'
import { getAllSectors } from '@/app/(sectors)/solutions/data'
import type { GuideData } from '../data'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

interface GuidesHubContentProps {
  guides: readonly GuideData[]
}

export function GuidesHubContent({ guides }: GuidesHubContentProps) {
  return (
    <PublicPageShell breadcrumb={[{ label: 'Guides' }]}>
      <div className="container-custom pb-24 pt-10">
        {/* En-tête */}
        <header className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-6" aria-hidden="true">
            <span className="inline-flex items-center gap-2 border-l-4 border-public-accent bg-public-surface-subtle px-4 py-2 font-geist text-sm font-medium text-public-content">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Ressources
            </span>
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
            Guides pratiques{' '}
            <span className={HIGHLIGHT_TEXT_CLASSES_PUBLIC}>
              planning et RH
            </span>
          </h1>
          <p className="text-lg leading-relaxed text-public-content-muted">
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
                className="group flex h-full flex-col border border-public-border bg-public-surface-subtle p-6 transition-colors hover:border-public-accent"
              >
                <h2 className="mb-3 text-xl font-semibold transition-colors group-hover:text-public-accent">
                  {guide.title}
                </h2>
                <p className="mb-6 flex-1 text-public-content-muted">
                  {guide.excerpt}
                </p>
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-public-content-muted">
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
            className="mb-4 font-geist text-2xl font-bold text-public-content sm:text-3xl"
          >
            SmartPlanning dans votre{' '}
            <span className={HIGHLIGHT_TEXT_CLASSES_PUBLIC}>secteur</span>
          </h2>
          <p className="mb-8 text-public-content-muted">
            Découvrez comment SmartPlanning répond aux contraintes concrètes de
            votre métier.
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
                  className="inline-flex min-h-[2.75rem] items-center gap-2 border border-public-border bg-public-surface px-5 py-3 font-geist text-sm text-public-content transition-colors hover:border-public-accent hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent"
                >
                  <Store
                    className="h-4 w-4 text-public-accent"
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
