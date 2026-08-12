/**
 * ContactSection Component
 *
 * Bloc d'appel vers `/contact`, et non plus le formulaire lui-meme.
 *
 * Le formulaire vivait ici, a l'ancre `#contact`. Depuis SP-574 il a sa page
 * dediee : le garder aux deux endroits aurait duplique le contenu au crawl
 * et fait exister deux points d'entree pour la meme conversion.
 *
 * Server Component : plus aucun etat local, ContactForm etant parti sur la
 * page. L'`id="contact"` reste pour que les anciens liens `/#contact`
 * atterrissent au bon endroit de la landing plutot qu'en haut de page.
 *
 * @ticket SP-287
 * @see SP-574 - Page contact dediee
 */

import Link from 'next/link'
import { ArrowUpRight, Mail, Clock } from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'

/** Ce que le visiteur sait avant de cliquer : delai et canal. */
const REASSURANCE = [
  {
    icon: Clock,
    text: 'Réponse sous 24 h ouvrées',
  },
  {
    icon: Mail,
    text: 'contact@smartplanning.fr',
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
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
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
              Décrivez votre équipe et la façon dont vous organisez les horaires
              aujourd&rsquo;hui. Notre équipe répond sur la mise en place comme
              sur le produit.
            </p>

            <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-8">
              {REASSURANCE.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-2 font-geist text-base text-public-content-muted"
                >
                  <item.icon
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-public-accent"
                  />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/contact"
            data-testid="contact-cta"
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 border border-public-content px-8 font-geist text-base font-semibold text-public-content transition-colors hover:bg-public-content hover:text-public-content-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-subtle"
          >
            Nous écrire
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
