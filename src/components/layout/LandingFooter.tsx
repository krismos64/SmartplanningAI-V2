/**
 * LandingFooter Component
 *
 * Pied de page des pages publiques, direction editoriale SP-569 : aplat
 * bleu nuit, colonnes en filets, angles francs.
 *
 * Server Component depuis SP-569. La version precedente etait marquee
 * `'use client'` sans porter d'interactivite : seul le bouton de reglages
 * cookies en a besoin, et il est deja client de son cote. Le registre des
 * secteurs, importe ici pour le maillage interne, n'a donc plus a traverser
 * la frontiere client.
 *
 * L'attribut `id="contact"` a ete retire : la landing porte deja cet
 * identifiant sur sa section contact. Deux elements partageant un meme id
 * rendent l'ancre `#contact` ambigue, et le HTML l'interdit.
 *
 * @see SP-569 - Header et footer publics
 */

import Link from 'next/link'
import { Mail, Linkedin, Youtube } from 'lucide-react'
import { CookieSettingsButton } from '@/components/cookies'
import { getAllSectors } from '@/app/(sectors)/solutions/data'

/** Pages secteur, maillage interne SEO (SP-552) */
const sectorLinks = getAllSectors().map((sector) => ({
  href: `/solutions/${sector.slug}`,
  label: `Planning ${sector.shortName}`,
}))

const footerLinks = {
  product: [
    { href: '/#features', label: 'Fonctionnalités' },
    { href: '/tarifs', label: 'Tarifs' },
    { href: '/solutions', label: 'Solutions par secteur' },
    ...sectorLinks,
    { href: '/guides', label: 'Guides pratiques' },
  ],
  company: [
    { href: '/a-propos', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/cgu', label: 'CGU' },
    { href: '/cgv', label: 'CGV' },
    { href: '/confidentialite', label: 'Confidentialité' },
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/cookies', label: 'Politique cookies' },
  ],
}

const socialLinks = [
  {
    href: 'https://www.linkedin.com/company/smartplanning-fr',
    label: 'LinkedIn',
    icon: Linkedin,
  },
  {
    href: 'https://www.youtube.com/@SmartPlanning-x2c',
    label: 'YouTube',
    icon: Youtube,
  },
]

/** Colonnes de liens, rendues a l'identique. */
const columns = [
  { title: 'Produit', links: footerLinks.product },
  { title: 'Entreprise', links: footerLinks.company },
  { title: 'Légal', links: footerLinks.legal },
] as const

/**
 * Classes des liens : `min-h-[2.75rem]` garantit la cible tactile de 44 px,
 * absente de la version precedente ou les liens mesuraient environ 20 px.
 */
const LINK_CLASSES =
  'inline-flex min-h-[2.75rem] items-center font-geist text-sm text-public-content-on-dark/75 transition-colors hover:text-public-content-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark'

export function LandingFooter() {
  return (
    <footer className="bg-public-surface-dark py-10 font-geist md:py-16">
      <div className="container-custom">
        {/*
          Deux colonnes des le mobile, quatre a partir de `lg`. La grille n'en
          declarait aucune sous 768 px : les quatre blocs s'empilaient et le
          footer mesurait 1424 px, soit 1,69 ecran de telephone. Les liens
          portent une cible tactile de 44 px (WCAG 2.1 AA, voir LINK_CLASSES)
          qu'il n'est pas question de reduire : c'est la mise en colonnes qui
          rend la hauteur, pas le rognage des zones cliquables.
        */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:gap-10 lg:grid-cols-4 lg:gap-12">
          {/* Marque : pleine largeur tant que la grille n'a que deux colonnes */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex min-h-[2.75rem] items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark"
            >
              <span className="text-lg font-bold tracking-tight text-public-content-on-dark">
                Smart
                <span className="text-public-accent-on-dark">Planning</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-public-content-on-dark/75">
              Le planning d&rsquo;équipe qui laisse moins de place aux imprévus.
            </p>

            <ul className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center border border-public-border-on-dark text-public-content-on-dark/75 transition-colors hover:border-public-accent-on-dark hover:text-public-accent-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark"
                  >
                    <social.icon aria-hidden="true" className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/*
            Produit compte 7 liens, Entreprise 2 et Legal 5. Sur deux colonnes,
            les empiler dans l'ordre du registre laisse Entreprise seule face a
            Produit, donc un vide a droite et Legal repartant en pleine largeur.
            Produit occupe donc les deux rangees de la colonne de gauche, et les
            deux autres se suivent a droite : 7 liens de chaque cote. A partir
            de `lg`, la grille passe a quatre colonnes et ce placement tombe.
          */}
          {columns.map((column) => (
            <nav
              key={column.title}
              aria-labelledby={`footer-${column.title}`}
              className={
                column.title === 'Produit' ? 'row-span-2 lg:row-span-1' : ''
              }
            >
              <h2
                id={`footer-${column.title}`}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-public-highlight"
              >
                {column.title}
              </h2>
              <ul className="mt-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={LINK_CLASSES}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 border-t border-public-border-on-dark pt-6 md:mt-12 md:pt-8">
          <a
            href="mailto:contact@smartplanning.fr"
            className="inline-flex min-h-[2.75rem] items-center gap-2 text-sm font-semibold text-public-content-on-dark underline underline-offset-4 transition-colors hover:text-public-accent-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark"
          >
            <Mail aria-hidden="true" className="h-4 w-4" />
            contact@smartplanning.fr
          </a>
          <p className="text-sm text-public-content-on-dark/75">
            Réponse sous 24 h ouvrées
          </p>
        </div>

        {/* Mentions */}
        <div className="mt-6 flex flex-col gap-4 border-t border-public-border-on-dark pt-6 md:mt-8 md:flex-row md:items-center md:justify-between md:pt-8">
          <p className="text-sm text-public-content-on-dark/75">
            &copy; {new Date().getFullYear()} SmartPlanning. Tous droits
            réservés.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <CookieSettingsButton
              variant="link"
              className="h-auto min-h-[2.75rem] p-0 text-sm text-public-content-on-dark/75 hover:text-public-content-on-dark"
            />
            <p className="flex items-center gap-2 text-sm text-public-content-on-dark/75">
              Conçu et hébergé en France
              <span aria-hidden="true" className="text-base">
                🇫🇷
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
