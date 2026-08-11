/**
 * SectorContent Component
 * Template reutilisable des pages secteur /solutions/[slug]
 *
 * Structure GEO commune a tous les secteurs, inchangee depuis SP-552 :
 * - Hero avec H1 requete-cible et reponse directe citable (100 premiers mots)
 * - Defis metier du secteur
 * - Reponses produit
 * - Exemple de prix contextualise (per-seat)
 * - FAQ secteur, alimentee aussi dans le JSON-LD FAQPage
 * - CTA essai gratuit
 *
 * Server Component depuis SP-570. La version precedente etait cliente pour
 * deux raisons seulement : suivre le scroll afin de colorer le header, et
 * porter l'etat de l'accordeon de FAQ. Le header n'a plus besoin du scroll
 * (SP-569), et la FAQ est isolee dans FaqAccordion. Toute la prose de la
 * page, qui porte le referencement, est desormais rendue cote serveur sans
 * qu'aucun JavaScript ne l'accompagne.
 *
 * Le contenu vient du registre `data/` : ce fichier ne fait que le mettre en
 * page, il n'en modifie aucun texte.
 *
 * @ticket SP-552
 * @see SP-570 - Pages secteur et guides
 */

import Link from 'next/link'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Clock,
  FileDown,
  HardHat,
  MapPin,
  MessagesSquare,
  Scale,
  Smartphone,
  Store,
  Sun,
  UserPlus,
  Users,
} from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { FaqAccordion } from '@/components/public/FaqAccordion'
import { PublicPageShell } from '@/components/public/PublicPageShell'
import {
  PRICING,
  calculateMonthlyPrice,
  formatPrice,
} from '@/lib/config/pricing'
import type { SectorData, SectorIconName } from '../data'

const SECTOR_ICONS: Record<SectorIconName, LucideIcon> = {
  clock: Clock,
  users: Users,
  alert: AlertTriangle,
  scale: Scale,
  calendar: CalendarDays,
  smartphone: Smartphone,
  bell: Bell,
  message: MessagesSquare,
  'file-down': FileDown,
  'user-plus': UserPlus,
  store: Store,
  sun: Sun,
  'hard-hat': HardHat,
  'map-pin': MapPin,
}

interface SectorContentProps {
  sector: SectorData
}

export function SectorContent({ sector }: SectorContentProps) {
  const monthlyPrice = calculateMonthlyPrice(sector.pricingExample.headcount)

  return (
    <PublicPageShell breadcrumb={[{ label: sector.name }]}>
      {/* Hero : H1 et reponse directe citable */}
      <article aria-labelledby="hero-title" className="pb-16 pt-10">
        <div className="container-custom">
          <SectionLabel index={1}>{sector.badge}</SectionLabel>

          <h1
            id="hero-title"
            className="mt-8 max-w-4xl font-geist text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-public-content sm:text-5xl lg:text-6xl"
          >
            {sector.h1}{' '}
            <span className="font-editorial italic text-public-accent">
              {sector.h1Highlight}
            </span>
          </h1>

          {/*
            Reponse directe : la reponse a la requete, citable, dans les 100
            premiers mots de la page. Elle contient le prix, fait verifiable.
          */}
          <p className="mt-8 max-w-3xl font-geist text-lg leading-relaxed text-public-content-muted">
            {sector.directAnswer}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              aria-label="Créer un compte SmartPlanning gratuitement"
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-3 bg-public-surface-dark px-8 font-geist text-base font-semibold text-public-content-on-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface"
            >
              Essayer gratuitement
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>

            <Link
              href="/tarifs"
              aria-label="Consulter les tarifs de SmartPlanning"
              className="inline-flex min-h-[3.5rem] items-center justify-center border border-public-content px-8 font-geist text-base font-semibold text-public-content transition-colors hover:bg-public-content hover:text-public-content-inverted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface"
            >
              Voir les tarifs
            </Link>
          </div>

          {/* Introduction metier */}
          <div className="mt-16 max-w-3xl space-y-6 border-t border-public-border pt-10">
            {sector.intro.map((paragraph, index) => (
              <p
                key={index}
                className="font-geist text-lg leading-relaxed text-public-content-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>

      {/* Defis du secteur */}
      <section
        aria-labelledby="challenges-title"
        className="bg-public-surface-subtle py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
            <SectionLabel index={2}>Votre quotidien</SectionLabel>

            <div>
              <DisplayTitle
                as="h2"
                id="challenges-title"
                accent={`en ${sector.shortName}.`}
                className="text-public-content"
              >
                Les défis du planning
              </DisplayTitle>

              <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-muted">
                Ce qui rend la gestion des horaires si chronophage en{' '}
                {sector.shortName}.
              </p>
            </div>
          </div>

          <ul
            className="mt-14 grid gap-px bg-public-border sm:grid-cols-2"
            aria-label={`Défis du planning en ${sector.shortName}`}
          >
            {sector.challenges.map((challenge, index) => {
              const Icon = SECTOR_ICONS[challenge.icon]
              return (
                <li
                  key={challenge.title}
                  className="flex h-full flex-col gap-3 bg-public-surface p-6 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="text-xs font-semibold tabular-nums text-public-accent"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="flex items-center gap-3 font-geist text-lg font-semibold text-public-content">
                    <Icon
                      className="h-5 w-5 shrink-0 text-public-accent"
                      aria-hidden="true"
                    />
                    {challenge.title}
                  </h3>
                  <p className="font-geist leading-relaxed text-public-content-muted">
                    {challenge.description}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Reponses produit */}
      <section
        aria-labelledby="solutions-title"
        className="bg-public-surface py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
            <SectionLabel index={3}>La réponse SmartPlanning</SectionLabel>

            <div>
              <DisplayTitle
                as="h2"
                id="solutions-title"
                accent="chaque semaine."
                className="text-public-content"
              >
                Du concret,
              </DisplayTitle>

              <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-muted">
                Des fonctionnalités pensées pour le quotidien du terrain.
              </p>
            </div>
          </div>

          <ul
            className="mt-14 grid gap-px bg-public-border md:grid-cols-2 lg:grid-cols-3"
            aria-label={`Fonctionnalités SmartPlanning pour la ${sector.shortName}`}
          >
            {sector.solutions.map((solution) => {
              const Icon = SECTOR_ICONS[solution.icon]
              return (
                <li
                  key={solution.feature}
                  className="flex h-full flex-col gap-3 bg-public-surface-subtle p-6 sm:p-8"
                >
                  <h3 className="flex items-center gap-3 font-geist text-lg font-semibold text-public-content">
                    <Icon
                      className="h-5 w-5 shrink-0 text-public-accent"
                      aria-hidden="true"
                    />
                    {solution.feature}
                  </h3>
                  <p className="font-geist leading-relaxed text-public-content-muted">
                    {solution.benefit}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Prix contextualise */}
      <section
        aria-labelledby="pricing-title"
        className="bg-public-brand-surface py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
            <SectionLabel index={4} tone="onBrand">
              Tarif transparent
            </SectionLabel>

            <div>
              <DisplayTitle as="h2" id="pricing-title" className="text-white">
                {formatPrice(monthlyPrice)} HT / mois
              </DisplayTitle>

              <p className="mt-6 font-geist text-lg text-white">
                {sector.pricingExample.headcount} employés &times;{' '}
                {formatPrice(PRICING.PRICE_PER_EMPLOYEE)} HT, pour{' '}
                {sector.pricingExample.teamLabel}.
              </p>

              <p className="mt-4 max-w-xl font-geist leading-relaxed text-white">
                {sector.pricingExample.description}
              </p>

              <Link
                href="/tarifs"
                aria-label="Voir le détail des tarifs SmartPlanning"
                className="mt-8 inline-flex min-h-[3rem] items-center gap-2 font-geist text-base font-semibold text-white underline underline-offset-8 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-public-brand-surface"
              >
                Voir le détail des tarifs
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ secteur, alimente le schema FAQPage */}
      <section
        id="faq"
        aria-labelledby="faq-title"
        className="bg-public-surface py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="grid items-start gap-12 lg:grid-cols-[24rem_1fr] lg:gap-20">
            <div className="lg:sticky lg:top-32">
              <SectionLabel index={5}>Questions fréquentes</SectionLabel>

              <DisplayTitle
                as="h2"
                id="faq-title"
                accent={sector.shortName + '.'}
                className="mt-8 text-public-content"
              >
                Vos questions en
              </DisplayTitle>
            </div>

            <FaqAccordion items={[...sector.faqs]} idPrefix="sector-faq" />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section
        aria-labelledby="cta-title"
        className="bg-public-accent-surface py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <DisplayTitle
              as="h2"
              id="cta-title"
              accent="votre établissement."
              tone="onVivid"
              className="max-w-2xl text-public-content-on-vivid"
            >
              Testez SmartPlanning dans
            </DisplayTitle>

            <div className="lg:shrink-0">
              <Link
                href="/register"
                aria-label="Créer un compte et démarrer gratuitement avec SmartPlanning"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-3 bg-public-surface-dark px-8 font-geist text-base font-semibold text-public-content-on-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-surface-dark focus-visible:ring-offset-2 focus-visible:ring-offset-public-accent-surface"
              >
                Démarrer gratuitement
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </Link>

              <p className="mt-4 max-w-xs font-geist text-sm text-public-content-on-vivid">
                {PRICING.TRIAL_DAYS} jours gratuits, sans carte bancaire.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  )
}
