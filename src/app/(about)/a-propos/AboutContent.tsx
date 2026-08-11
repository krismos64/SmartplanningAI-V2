/**
 * AboutContent Component
 * Page A propos /a-propos
 *
 * Server Component depuis SP-571 : la page ne portait plus aucun etat
 * depuis le retrait de `isScrolled` (SP-570), seules subsistaient des
 * animations d'apparition qui tiraient Framer Motion dans le bundle.
 *
 * L'illustration `manager.webp` est retiree : image generee, marqueur du
 * registre visuel dont la refonte cherche a sortir. Le texte de mission
 * porte desormais seul l'ouverture de la page.
 *
 * Le contenu vient du registre `../data` : ce fichier ne fait que le mettre
 * en page, il n'en modifie aucun texte.
 *
 * @ticket SP-285
 * @see SP-571 - Tarifs, a-propos et pages legales
 */

import Link from 'next/link'
import { ArrowUpRight, Linkedin, Youtube } from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { PublicPageShell } from '@/components/public/PublicPageShell'
import { VideoSection } from '@/app/(landing)/components/sections/VideoSection'
import { ValueCard, TargetCard } from '../components'
import { values, targets, mission } from '../data'

/** Reseaux, ouverts dans un nouvel onglet. */
const socialLinks = [
  {
    icon: Linkedin,
    network: 'LinkedIn',
    handle: 'SmartPlanning',
    description: 'Actualités produit et conseils RH',
    href: 'https://www.linkedin.com/company/smartplanning-fr',
    ariaLabel: 'Suivez SmartPlanning sur LinkedIn (nouvel onglet)',
  },
  {
    icon: Youtube,
    network: 'YouTube',
    handle: '@SmartPlanning',
    description: 'Démos produit et tutoriels vidéo',
    href: 'https://www.youtube.com/@SmartPlanning-x2c',
    ariaLabel: 'Abonnez-vous à SmartPlanning sur YouTube (nouvel onglet)',
  },
] as const

export function AboutContent() {
  return (
    <PublicPageShell breadcrumb={[{ label: 'À propos' }]}>
      {/* Mission */}
      <article aria-labelledby="hero-title" className="pb-16 pt-10">
        <div className="container-custom">
          <SectionLabel index={1}>Notre mission</SectionLabel>

          <h1
            id="hero-title"
            className="mt-8 max-w-4xl font-geist text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-public-content sm:text-5xl lg:text-6xl"
          >
            {mission.title}
            <span className="mt-1 block font-editorial italic text-public-accent">
              {mission.highlight}
            </span>
            <span className="mt-3 block text-3xl text-public-content-muted sm:text-4xl">
              {mission.subtitle}
            </span>
          </h1>

          <div className="mt-10 max-w-3xl space-y-6 border-t border-public-border pt-10">
            <p className="font-geist text-lg leading-relaxed text-public-content-muted">
              {mission.description}
            </p>
            <p className="font-geist text-lg leading-relaxed text-public-content-muted">
              {mission.solution}
            </p>
          </div>

          <Link
            href="/register"
            aria-label="Créer un compte SmartPlanning gratuitement"
            className="mt-10 inline-flex min-h-[3.5rem] items-center justify-center gap-3 bg-public-surface-dark px-8 font-geist text-base font-semibold text-public-content-on-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface"
          >
            Essayer gratuitement
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </article>

      {/* Valeurs */}
      <section
        aria-labelledby="values-title"
        className="bg-public-surface-subtle py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
            <SectionLabel index={2}>Nos valeurs</SectionLabel>

            <DisplayTitle
              as="h2"
              id="values-title"
              accent="qui nous guident."
              className="text-public-content"
            >
              Les principes
            </DisplayTitle>
          </div>

          <div className="mt-14 grid gap-px bg-public-border md:grid-cols-3">
            {values.map((value, index) => (
              <ValueCard
                key={value.title}
                icon={value.icon}
                title={value.title}
                description={value.description}
                index={index + 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Public vise */}
      <section
        aria-labelledby="targets-title"
        className="bg-public-surface py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionLabel index={3}>Pour qui</SectionLabel>

              <DisplayTitle
                as="h2"
                id="targets-title"
                accent="qui gèrent des équipes."
                className="mt-8 text-public-content"
              >
                Les structures
              </DisplayTitle>
            </div>

            <div className="border-b border-public-border">
              {targets.map((target) => (
                <TargetCard
                  key={target.title}
                  icon={target.icon}
                  title={target.title}
                  description={target.description}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <VideoSection />

      {/* Reseaux */}
      <section
        aria-labelledby="social-title"
        className="bg-public-surface-subtle py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
            <SectionLabel index={4}>Suivez-nous</SectionLabel>

            <div>
              <DisplayTitle
                as="h2"
                id="social-title"
                accent="connectés."
                className="text-public-content"
              >
                Restons
              </DisplayTitle>

              <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-muted">
                Retrouvez SmartPlanning sur nos réseaux pour suivre les
                nouveautés, démos produit et conseils RH.
              </p>
            </div>
          </div>

          <ul
            className="mt-14 grid gap-px bg-public-border sm:grid-cols-2"
            aria-label="Réseaux sociaux SmartPlanning"
          >
            {socialLinks.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="flex h-full items-start gap-4 bg-public-surface p-6 transition-colors hover:bg-public-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent sm:p-8"
                >
                  <social.icon
                    className="mt-1 h-6 w-6 shrink-0 text-public-accent"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block font-geist text-xs uppercase tracking-[0.12em] text-public-content-muted">
                      {social.network}
                    </span>
                    <span className="mt-1 block font-geist text-lg font-semibold text-public-content">
                      {social.handle}
                    </span>
                    <span className="mt-1 block font-geist text-sm text-public-content-muted">
                      {social.description}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
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
              accent="vos plannings ?"
              tone="onVivid"
              className="max-w-2xl text-public-content-on-vivid"
            >
              Prêt à simplifier
            </DisplayTitle>

            <div className="flex flex-col gap-4 sm:flex-row lg:shrink-0">
              <Link
                href="/register"
                aria-label="Créer un compte et démarrer gratuitement avec SmartPlanning"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-3 bg-public-surface-dark px-8 font-geist text-base font-semibold text-public-content-on-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-surface-dark focus-visible:ring-offset-2 focus-visible:ring-offset-public-accent-surface"
              >
                Démarrer gratuitement
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </Link>

              <Link
                href="/#features"
                aria-label="Voir toutes les fonctionnalités de SmartPlanning"
                className="inline-flex min-h-[3.5rem] items-center justify-center px-6 font-geist text-base font-semibold text-public-content-on-vivid underline underline-offset-8 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-surface-dark focus-visible:ring-offset-2 focus-visible:ring-offset-public-accent-surface"
              >
                Découvrir les fonctionnalités
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  )
}
