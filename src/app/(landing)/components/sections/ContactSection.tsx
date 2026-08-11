'use client'

/**
 * ContactSection Component
 *
 * Section contact, direction editoriale SP-568 : aplat clair, filets
 * plutot que cartes arrondies et degrades.
 *
 * Reste un Client Component : ContactForm porte l'etat du formulaire.
 *
 * L'ancre `#contact` est referencee depuis le header, la FAQ, la section
 * tarifs et le CTA. Elle ne doit pas disparaitre.
 *
 * Accessibilite, defauts corriges (mesures en SP-567) :
 * - « Reponse rapide » etait en emerald-700 sur fond emerald-500/10, a
 *   2.16:1. Le texte passe sur le fond courant.
 * - Le lien email mesurait 23 px de haut, sous le minimum de 44 px.
 *
 * @ticket SP-287
 * @see SP-568 - Landing, sections basses
 */

import { Fragment } from 'react'
import { Mail, Clock, MapPin, Linkedin, Youtube } from 'lucide-react'
import { ContactForm } from '@/components/public/ContactForm'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'

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
    label: 'Suivez-nous',
    value: 'SmartPlanning sur LinkedIn',
    href: 'https://www.linkedin.com/company/smartplanning-fr',
    ariaLabel: 'Suivez SmartPlanning sur LinkedIn',
  },
  {
    icon: Youtube,
    label: 'Abonnez-vous',
    value: 'SmartPlanning sur YouTube',
    href: 'https://www.youtube.com/@SmartPlanning-x2c',
    ariaLabel: 'Abonnez-vous à SmartPlanning sur YouTube',
  },
] as const

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="bg-public-surface-subtle py-24 lg:py-32"
    >
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Colonne informations */}
          <div>
            <SectionLabel index={9}>Contact</SectionLabel>

            <DisplayTitle
              as="h2"
              id="contact-title"
              accent="Nous répondons."
              className="mt-8 text-public-content"
            >
              Une question ?
            </DisplayTitle>

            <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-muted">
              Notre équipe répond sous 24 h ouvrées, sur la mise en place
              comme sur le produit.
            </p>

            {/* Coordonnees */}
            {/*
              Liste de description : <dt> et <dd> doivent etre enfants directs
              du <dl>, un <div> intermediaire n'est pas admis par la structure
              attendue (axe-core, regles dlitem et only-dlitems).
            */}
            <dl className="mt-10 border-y border-public-border">
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
            <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-6">
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
            <h3 className="mb-6 font-geist text-xl font-semibold text-public-content">
              Envoyez-nous un message
            </h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
