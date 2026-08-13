/**
 * AboutContent Component
 * Page A propos /a-propos
 *
 * Server Component depuis SP-571 : la page ne portait plus aucun etat
 * depuis le retrait de `isScrolled` (SP-570), seules subsistaient des
 * animations d'apparition qui tiraient Framer Motion dans le bundle.
 *
 * L'illustration `manager.webp` avait ete retiree en SP-571, jugee marqueur
 * du registre visuel dont la refonte sortait. Retablie en SP-574 : le
 * prototype de reference la conserve, avec sa legende, aux cotes du texte
 * de mission.
 *
 * Mise en page rapprochee du prototype en SP-575 : hero sur aplat bleu
 * nuit, manifeste sur aplat lime, valeurs en aplats alternes et bande
 * reseaux sur bleu nuit. SP-574 laissait la page en creme d'un bout a
 * l'autre, sans le rythme d'aplats qui porte l'identite ailleurs.
 *
 * Le contenu vient du registre `../data` : ce fichier ne fait que le mettre
 * en page, il n'en modifie aucun texte.
 *
 * @ticket SP-285
 * @see SP-571 - Tarifs, a-propos et pages legales
 * @see SP-574 - Retablissement de l'illustration
 * @see SP-575 - A propos a la mise en page du prototype
 */

import Image from 'next/image'
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
      {/* Hero, aplat bleu nuit pleine largeur comme /solutions et /guides */}
      <section
        aria-labelledby="hero-title"
        className="bg-public-surface-dark py-20 lg:py-28"
      >
        <div className="container-custom">
          <SectionLabel index={1} tone="onDark">
            Notre mission
          </SectionLabel>

          <h1
            id="hero-title"
            className="mt-8 max-w-4xl font-geist text-4xl font-bold leading-[0.95] tracking-[-0.045em] text-public-content-on-dark sm:text-5xl lg:text-6xl"
          >
            {mission.title}
            <span className="mt-1 block font-editorial italic text-public-accent-on-dark">
              {mission.highlight}
            </span>
            <span className="mt-3 block text-3xl text-public-content-on-dark/80 sm:text-4xl">
              {mission.subtitle}
            </span>
          </h1>
        </div>
      </section>

      {/*
        Manifeste sur aplat lime, geste central de la page au prototype :
        le texte y passe en grand corps gras a gauche, l'illustration a
        droite. La version SP-574 le laissait en prose grise sur creme,
        sans rupture d'aplat.

        L'image avait ete retiree en SP-571, jugee marqueur du registre
        visuel dont la refonte sortait, retablie en SP-574 : le prototype
        de reference la conserve, avec sa legende.
      */}
      <section
        aria-label="Notre conviction"
        className="bg-public-highlight-surface py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-20">
            <div className="max-w-2xl">
              <p className="font-geist text-2xl font-bold leading-[1.08] tracking-[-0.04em] text-public-content-on-vivid sm:text-3xl lg:text-[2.625rem]">
                {mission.description}
              </p>
              <p className="mt-6 font-geist text-lg leading-relaxed text-public-content-on-vivid">
                {mission.solution}
              </p>

              <Link
                href="/register"
                aria-label="Créer un compte SmartPlanning gratuitement"
                className="mt-10 inline-flex min-h-[3.5rem] items-center justify-center gap-3 bg-public-surface-dark px-8 font-geist text-base font-semibold text-public-content-on-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-content-on-vivid focus-visible:ring-offset-2 focus-visible:ring-offset-public-highlight-surface"
              >
                Essayer gratuitement
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>

            <figure className="lg:w-[24rem]">
              <Image
                src="/images/manager.webp"
                alt="Une responsable d'équipe organise les plannings de la semaine sur SmartPlanning."
                width={1024}
                height={1024}
                sizes="(min-width: 1024px) 24rem, 90vw"
                className="w-full"
              />
              <figcaption className="mt-3 font-geist text-xs uppercase tracking-[0.12em] text-public-content-on-vivid">
                Un outil pensé pour le quotidien des responsables d&rsquo;équipe
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Valeurs, en aplats alternes comme au prototype */}
      <section
        aria-labelledby="values-title"
        className="bg-public-surface py-20 lg:py-28"
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

          {/* Gouttiere de 12 px plutot qu'un filet d'un pixel : les aplats
              se touchaient et la serie se lisait comme un seul bloc. */}
          <div className="mt-14 grid gap-3 md:grid-cols-3">
            {values.map((value, index) => (
              <ValueCard
                key={value.title}
                title={value.title}
                description={value.description}
                index={index + 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Public vise, sur creme contraste comme la bande audience du
          prototype. Les segments restent en filets : le prototype les pose
          en pastilles, mais il n'y met que leur nom, la ou le registre
          porte une description par segment qu'une pastille ne peut pas
          tenir. */}
      <section
        aria-labelledby="targets-title"
        className="bg-public-surface-subtle py-20 lg:py-28"
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

      {/* Reseaux, bande bleu nuit pleine largeur comme au prototype, la ou
          SP-574 la laissait en cartes creme peu distinctes du fond. */}
      <section
        aria-labelledby="social-title"
        className="bg-public-surface-dark py-20 lg:py-24"
      >
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
            <SectionLabel index={5} tone="onDark">
              Suivez-nous
            </SectionLabel>

            <div>
              <DisplayTitle
                as="h2"
                id="social-title"
                accent="connectés."
                tone="onDark"
                className="text-public-content-on-dark"
              >
                Restons
              </DisplayTitle>

              <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-on-dark/80">
                Retrouvez SmartPlanning sur nos réseaux pour suivre les
                nouveautés, démos produit et conseils RH.
              </p>
            </div>
          </div>

          <ul
            className="mt-14 grid gap-px bg-public-border-on-dark sm:grid-cols-2"
            aria-label="Réseaux sociaux SmartPlanning"
          >
            {socialLinks.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="flex h-full items-start gap-4 bg-public-surface-dark p-6 transition-colors hover:bg-public-border-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight sm:p-8"
                >
                  <social.icon
                    className="mt-1 h-6 w-6 shrink-0 text-public-accent-on-dark"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block font-geist text-xs uppercase tracking-[0.12em] text-public-highlight">
                      {social.network}
                    </span>
                    <span className="mt-1 block font-geist text-lg font-semibold text-public-content-on-dark">
                      {social.handle}
                    </span>
                    <span className="mt-1 block font-geist text-sm text-public-content-on-dark/80">
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
