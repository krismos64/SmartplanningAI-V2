'use client'

/**
 * ContactPageContent - Page /contact
 *
 * Reste un Client Component : ContactForm porte l'etat du formulaire.
 *
 * Reprend l'ossature des autres pages de contenu, `PublicPageShell` avec son
 * fil d'Ariane, puis un hero sombre et un bloc clair a deux colonnes.
 *
 * @ticket SP-574
 */

import { Fragment } from 'react'
import { Mail, Clock, MapPin, Linkedin, Youtube } from 'lucide-react'
import { ContactForm } from '@/components/public/ContactForm'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { PublicPageShell } from '@/components/public/PublicPageShell'

/** Coordonnees affichees a cote du formulaire. */
const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@smartplanning.fr',
    href: 'mailto:contact@smartplanning.fr',
  },
  {
    icon: MapPin,
    label: 'Localisation',
    value: 'France',
    href: null,
  },
  {
    icon: Clock,
    label: 'Disponibilité',
    value: '24/24 par email, réponse sous 24 h',
    href: null,
  },
] as const

/** Reseaux, ouverts dans un nouvel onglet. */
const socialLinks = [
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'SmartPlanning sur LinkedIn',
    href: 'https://www.linkedin.com/company/smartplanning-fr',
    ariaLabel: 'Suivez SmartPlanning sur LinkedIn',
  },
  {
    icon: Youtube,
    label: 'YouTube',
    value: 'Les démonstrations en vidéo',
    href: 'https://www.youtube.com/@SmartPlanning-fr',
    ariaLabel: 'Voir les démonstrations SmartPlanning sur YouTube',
  },
] as const

export function ContactPageContent() {
  return (
    <PublicPageShell breadcrumb={[{ label: 'Contact' }]}>
      {/* Hero */}
      <section className="mt-8 bg-public-surface-dark py-20 lg:py-28">
        <div className="container-custom">
          <SectionLabel index={1} tone="onDark">
            Parlons de votre organisation
          </SectionLabel>

          <DisplayTitle
            as="h1"
            id="contact-hero-title"
            accent="Une réponse humaine."
            className="mt-8 max-w-4xl text-public-content-on-dark"
          >
            Une question précise ?
          </DisplayTitle>

          <p
            data-testid="contact-hero-description"
            className="mt-6 max-w-2xl font-geist text-lg leading-relaxed text-public-content-on-dark/75"
          >
            Décrivez votre équipe et la façon dont vous organisez les horaires
            aujourd&rsquo;hui. Notre équipe vous répond sous 24 heures
            ouvrées.
          </p>
        </div>
      </section>

      {/* Coordonnees et formulaire */}
      <section
        aria-labelledby="contact-form-title"
        className="bg-public-surface-subtle py-20 lg:py-28"
      >
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Colonne informations */}
            <div>
              <h2 className="font-geist text-2xl font-semibold text-public-content sm:text-3xl">
                Nous joindre
              </h2>

              {/*
                Liste de description : <dt> et <dd> doivent etre enfants
                directs du <dl>, un <div> intermediaire n'est pas admis
                (axe-core, regles dlitem et only-dlitems).
              */}
              <dl className="mt-8 border-y border-public-border">
                {contactInfo.map((item) => (
                  <Fragment key={item.label}>
                    <dt className="flex items-center gap-4 pt-5 font-geist text-xs uppercase tracking-[0.12em] text-public-content-muted">
                      <item.icon
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-public-accent"
                      />
                      {item.label}
                    </dt>
                    <dd className="border-b border-public-border pb-5 pl-9">
                      {item.href ? (
                        <a
                          href={item.href}
                          className="inline-flex min-h-[2.75rem] items-center font-geist text-base font-semibold text-public-content underline underline-offset-4 transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-subtle"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className="font-geist text-base font-semibold text-public-content">
                          {item.value}
                        </span>
                      )}
                    </dd>
                  </Fragment>
                ))}
              </dl>

              {/* Reseaux */}
              <ul className="mt-8 flex flex-col gap-3">
                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.ariaLabel}
                      className="inline-flex min-h-[2.75rem] items-center gap-2 font-geist text-base font-semibold text-public-content underline underline-offset-4 transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-subtle"
                    >
                      <link.icon aria-hidden="true" className="h-5 w-5" />
                      {link.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne formulaire */}
            <div className="border-t-2 border-public-accent bg-public-surface p-6 sm:p-8 lg:p-10">
              <h2
                id="contact-form-title"
                className="mb-6 font-geist text-xl font-semibold text-public-content"
              >
                Envoyez-nous un message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  )
}

export default ContactPageContent
