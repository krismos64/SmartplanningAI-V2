'use client'

/**
 * LandingFooter Component
 * Footer for public pages (landing, auth)
 *
 * @description Footer avec liens, réseaux sociaux et newsletter
 * Réutilisable entre landing page et pages d'authentification
 */

import Link from 'next/link'
import { Calendar, Mail, Linkedin, Youtube } from 'lucide-react'
import { CookieSettingsButton } from '@/components/cookies'
import { getAllSectors } from '@/app/(sectors)/solutions/data'

// Pages secteur /solutions/* (maillage interne SEO, SP-552)
const sectorLinks = getAllSectors().map((sector) => ({
  href: `/solutions/${sector.slug}`,
  label: `Planning ${sector.shortName}`,
}))

// Footer links
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
    { href: '/#contact', label: 'Contact' },
  ],
  legal: [
    { href: '/cgu', label: 'CGU' },
    { href: '/cgv', label: 'CGV' },
    { href: '/confidentialite', label: 'Confidentialité' },
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/cookies', label: 'Politique cookies' },
  ],
}

export function LandingFooter() {
  return (
    <footer
      id="contact"
      className="border-t border-border/50 bg-background py-16"
    >
      <div className="container-custom">
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-400">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Smart
                <span className="text-blue-600">
                  Planning
                </span>
              </span>
            </Link>
            <p className="mb-6 text-sm text-muted-foreground">
              La solution intelligente pour gérer vos plannings d&apos;équipe.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/smartplanning-fr"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-card/50 p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@SmartPlanning-x2c"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-card/50 p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Produit
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Entreprise
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Légal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Contact
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:contact@smartplanning.fr"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-blue-500"
              >
                <Mail className="h-4 w-4" />
                contact@smartplanning.fr
              </a>
              <p className="text-sm text-muted-foreground">
                Réponse sous 24h ouvrées
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SmartPlanning. Tous droits
            réservés.
          </p>
          <div className="flex items-center gap-4">
            <CookieSettingsButton
              variant="link"
              className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
            />
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              Made in France
              <span className="text-base">🇫🇷</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
