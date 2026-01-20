'use client'

/**
 * LandingFooter Component
 * Footer for public pages (landing, auth)
 *
 * @description Footer avec liens, réseaux sociaux et newsletter
 * Réutilisable entre landing page et pages d'authentification
 */

import Link from 'next/link'
import { Calendar, Mail, Linkedin, Instagram } from 'lucide-react'
import { CookieSettingsButton } from '@/components/cookies'

// Footer links
const footerLinks = {
  product: [
    { href: '/#features', label: 'Fonctionnalités' },
    { href: '/#pricing', label: 'Tarifs' },
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

// TikTok icon (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export function LandingFooter() {
  return (
    <footer id="contact" className="border-t border-white/5 bg-[#030712] py-16">
      <div className="container-custom">
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Smart<span className="text-cyan-400">Planning</span>
              </span>
            </Link>
            <p className="mb-6 text-sm text-white/50">
              La solution intelligente pour gérer vos plannings d&apos;équipe.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="rounded-lg bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-lg bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-lg bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Produit</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Entreprise</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Légal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Contact</h4>
            <div className="space-y-3">
              <a
                href="mailto:contact@smartplanning.fr"
                className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-cyan-400"
              >
                <Mail className="h-4 w-4" />
                contact@smartplanning.fr
              </a>
              <p className="text-sm text-white/50">
                Support disponible 24/7
              </p>
              <p className="text-sm text-white/50">
                Réponse sous 24h ouvrées
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} SmartPlanning. Tous droits
            réservés.
          </p>
          <div className="flex items-center gap-4">
            <CookieSettingsButton
              variant="link"
              className="h-auto p-0 text-sm text-white/40 hover:text-white"
            />
            <p className="flex items-center gap-2 text-sm text-white/40">
              Made in France
              <span className="text-base">🇫🇷</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
