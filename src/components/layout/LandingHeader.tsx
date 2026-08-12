'use client'

/**
 * LandingHeader Component
 * Navigation header for public pages (landing, auth)
 *
 * @description Header avec logo, navigation et CTA pour pages publiques
 * Réutilisable entre landing page et pages d'authentification
 */

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Building2,
  ChevronDown,
  CircleHelp,
  Mail,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Flat navigation kept for the mobile menu.
// Inclut les pages secteur et le hub des guides : sans elles, les pages de
// contenu SEO/GEO n'étaient atteignables que par le footer sur mobile.
const mobileNavLinks = [
  { href: '/#role-demos', label: 'Démos par rôle' },
  { href: '/#features', label: 'Fonctionnalités' },
  { href: '/#how-it-works', label: 'Comment ça marche' },
  { href: '/#benefits', label: 'Avantages' },
  { href: '/solutions', label: 'Solutions par secteur' },
  {
    href: '/solutions/planning-restaurant',
    label: 'Restauration et hôtellerie',
  },
  { href: '/solutions/planning-commerce', label: 'Commerce et retail' },
  { href: '/solutions/planning-btp', label: 'BTP et chantiers' },
  { href: '/guides', label: 'Guides pratiques' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/a-propos', label: 'À propos' },
]

const productLinks = [
  {
    href: '/#role-demos',
    label: 'Démos par rôle',
    description: 'Découvrez SmartPlanning selon votre rôle.',
  },
  {
    href: '/#features',
    label: 'Fonctionnalités',
    description: 'Tout ce qu’il faut pour gérer vos équipes.',
  },
  {
    href: '/#how-it-works',
    label: 'Comment ça marche',
    description: 'Une prise en main simple et rapide.',
  },
  {
    href: '/#benefits',
    label: 'Avantages',
    description: 'Les bénéfices concrets au quotidien.',
  },
]

const solutionLinks = [
  { href: '/solutions', label: 'Tous les secteurs' },
  {
    href: '/solutions/planning-restaurant',
    label: 'Restauration et hôtellerie',
  },
  { href: '/solutions/planning-commerce', label: 'Commerce et retail' },
  { href: '/solutions/planning-btp', label: 'BTP et chantiers' },
]

// Guides exposés individuellement dans le menu Ressources. Liste tenue à la
// main plutôt qu'importée depuis `(guides)/guides/data` : ce composant est
// un Client Component, et importer le registre embarquerait le texte complet
// de chaque guide dans le bundle client. Même choix que LandingFooter.
// À mettre à jour à chaque nouveau guide publié.
const guideLinks = [
  {
    href: '/guides/faire-un-planning-equipe',
    label: "Faire un planning d'équipe",
  },
  {
    href: '/guides/gerer-conges-payes-tpe-pme',
    label: 'Gérer les congés payés',
  },
  {
    href: '/guides/coupure-amplitude-restauration-hcr',
    label: 'Coupure et amplitude en HCR',
  },
]

type DesktopMenu = 'product' | 'solutions' | 'resources' | null

interface LandingHeaderProps {
  /** Whether to show navigation links (false for auth pages) */
  showNavLinks?: boolean
  /** Whether the header is fixed or static */
  isFixed?: boolean
}

export function LandingHeader({
  showNavLinks = true,
  isFixed = true,
}: LandingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDesktopMenu, setOpenDesktopMenu] = useState<DesktopMenu>(null)
  const [mounted, setMounted] = useState(false)
  const desktopNavRef = useRef<HTMLDivElement>(null)
  const closeMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)

    const handlePointerDown = (event: PointerEvent) => {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        setOpenDesktopMenu(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      if (closeMenuTimeoutRef.current) {
        clearTimeout(closeMenuTimeoutRef.current)
      }
    }
  }, [])

  const openMenu = (menu: Exclude<DesktopMenu, null>) => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current)
    }
    setOpenDesktopMenu(menu)
  }

  const scheduleMenuClose = () => {
    closeMenuTimeoutRef.current = setTimeout(() => {
      setOpenDesktopMenu(null)
    }, 200)
  }

  const toggleMenu = (menu: Exclude<DesktopMenu, null>) => {
    setOpenDesktopMenu((current) => (current === menu ? null : menu))
  }

  const closeDesktopMenu = () => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current)
    }
    setOpenDesktopMenu(null)
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        // Fond opaque en permanence, y compris en haut de page.
        // Le header transparent se superposait au hero, desormais en aplat
        // bleu nuit : les liens et le logo, poses en couleurs sombres,
        // tombaient a 1:1 de contraste (SP-569). Un fond creme constant
        // evite d'avoir a decliner le header selon la section survolee.
        className={cn(
          'left-0 right-0 z-50 border-b border-public-border bg-public-surface font-geist transition-all duration-300',
          isFixed ? 'fixed top-0 py-4' : 'relative top-0 py-4'
        )}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2">
              <Image
                src="/images/logo-sp.png"
                alt="SmartPlanning"
                width={48}
                height={48}
                priority
                className="h-11 w-11 object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-geist text-xl font-bold tracking-tight text-public-content">
                Smart
                <span className="text-public-brand-on-light">Planning</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            {showNavLinks && (
              <div
                ref={desktopNavRef}
                className="hidden items-center gap-3 lg:flex xl:gap-5"
              >
                <DesktopMenuItem
                  label="Produit"
                  menu="product"
                  isOpen={openDesktopMenu === 'product'}
                  onOpen={openMenu}
                  onClose={scheduleMenuClose}
                  onCloseImmediate={closeDesktopMenu}
                  onToggle={toggleMenu}
                >
                  <div className="w-80 p-2">
                    {productLinks.map((link) => (
                      <MenuLink
                        key={link.href}
                        {...link}
                        onClick={closeDesktopMenu}
                      />
                    ))}
                  </div>
                </DesktopMenuItem>

                <DesktopMenuItem
                  label="Solutions"
                  menu="solutions"
                  isOpen={openDesktopMenu === 'solutions'}
                  onOpen={openMenu}
                  onClose={scheduleMenuClose}
                  onCloseImmediate={closeDesktopMenu}
                  onToggle={toggleMenu}
                >
                  <div className="w-64 p-2">
                    {solutionLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeDesktopMenu}
                        className="block px-3 py-2.5 font-geist text-sm font-medium text-public-content transition-colors hover:bg-public-surface focus-visible:bg-public-surface focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </DesktopMenuItem>

                <DesktopMenuItem
                  label="Ressources"
                  menu="resources"
                  isOpen={openDesktopMenu === 'resources'}
                  onOpen={openMenu}
                  onClose={scheduleMenuClose}
                  onCloseImmediate={closeDesktopMenu}
                  onToggle={toggleMenu}
                  align="right"
                >
                  <div className="grid w-[34rem] grid-cols-2 gap-2 p-3">
                    <div>
                      <p className="px-3 pb-2 pt-1 font-geist text-xs font-semibold uppercase tracking-[0.14em] text-public-accent">
                        Apprendre
                      </p>
                      <MenuLink
                        href="/guides"
                        label="Guides pratiques"
                        description="Conseils concrets pour vos plannings et vos RH."
                        icon={<BookOpen />}
                        onClick={closeDesktopMenu}
                      />
                      <ul className="mb-1 ml-[3.25rem] space-y-0.5">
                        {guideLinks.map((guide) => (
                          <li key={guide.href}>
                            <Link
                              href={guide.href}
                              onClick={closeDesktopMenu}
                              className="block px-3 py-1.5 font-geist text-xs text-public-content-muted transition-colors hover:bg-public-surface hover:text-public-content focus-visible:bg-public-surface focus-visible:outline-none"
                            >
                              {guide.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <MenuLink
                        href="/#faq"
                        label="Questions fréquentes"
                        description="Les réponses aux questions les plus courantes."
                        icon={<CircleHelp />}
                        onClick={closeDesktopMenu}
                      />
                    </div>
                    <div className="border-l border-public-border pl-2">
                      <p className="px-3 pb-2 pt-1 font-geist text-xs font-semibold uppercase tracking-[0.14em] text-public-accent">
                        SmartPlanning
                      </p>
                      <MenuLink
                        href="/a-propos"
                        label="À propos"
                        description="Notre vision et l’histoire de SmartPlanning."
                        icon={<Building2 />}
                        onClick={closeDesktopMenu}
                      />
                      <MenuLink
                        href="/contact"
                        label="Contact"
                        description="Échangez directement avec notre équipe."
                        icon={<Mail />}
                        onClick={closeDesktopMenu}
                      />
                    </div>
                  </div>
                </DesktopMenuItem>

                <Link
                  href="/tarifs"
                  className="inline-flex min-h-[2.75rem] items-center whitespace-nowrap font-geist text-sm font-medium text-public-content-muted transition-colors hover:text-public-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface"
                >
                  Tarifs
                </Link>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="hidden items-center gap-4 lg:flex">
              <Link
                href="/login"
                className="inline-flex min-h-[2.75rem] items-center font-geist text-sm font-medium text-public-content-muted transition-colors hover:text-public-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-[2.75rem] items-center gap-2 border border-public-content px-5 font-geist text-sm font-semibold text-public-content transition-colors hover:bg-public-content hover:text-public-content-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface"
              >
                Essayer 21 jours
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Mobile Menu Button - WCAG 2.5.5: 44px minimum touch target */}
            <button
              className="flex h-11 min-h-[44px] w-11 min-w-[44px] touch-manipulation items-center justify-center text-public-content transition-colors hover:bg-public-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={
                isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'
              }
              data-testid="landing-mobile-menu-button"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu - Portail dans body pour éviter le stacking context du header */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="public-scope fixed inset-0 z-[200] flex flex-col overflow-hidden bg-public-surface font-geist lg:hidden"
              >
                {/* Close button - Fixed top right - WCAG 2.5.5: 44px minimum touch target */}
                <motion.button
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute right-4 top-4 z-10 flex h-12 min-h-[44px] w-12 min-w-[44px] touch-manipulation items-center justify-center border border-public-border bg-public-surface text-public-content transition-colors hover:bg-public-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Fermer le menu"
                  data-testid="landing-mobile-menu-close"
                >
                  <X className="h-6 w-6" />
                </motion.button>

                {/* Logotype, en typographie plutot qu'en image : le logo
                    pastel jure avec la palette editoriale, et c'est deja le
                    traitement retenu dans la barre du header. */}
                <div className="mt-6 flex justify-center">
                  <span className="font-geist text-2xl font-bold tracking-tight text-public-content">
                    Smart
                    <span className="text-public-accent">Planning</span>
                  </span>
                </div>

                {/* Menu content centered */}
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-6 py-1">
                  {showNavLinks &&
                    mobileNavLinks.map((link, index) => {
                      // Les ancres (/#section) restent en <a> natif : la
                      // navigation par fragment n'a pas besoin du routeur.
                      // Les vraies pages passent par Link (navigation client,
                      // préchargement) plutôt que par un rechargement complet.
                      const isAnchor = link.href.startsWith('/#')
                      // min-h-[44px] : les liens mesuraient environ 20 px de
                      // haut, sous le minimum tactile WCAG 2.5.5
                      const className =
                        'flex min-h-[44px] items-center font-geist text-[15px] font-medium text-public-content transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent'
                      const closeMenu = () => setIsMobileMenuOpen(false)

                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {isAnchor ? (
                            <a
                              href={link.href}
                              className={className}
                              onClick={closeMenu}
                            >
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className={className}
                              onClick={closeMenu}
                            >
                              {link.label}
                            </Link>
                          )}
                        </motion.div>
                      )
                    })}

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: showNavLinks
                        ? mobileNavLinks.length * 0.05 + 0.05
                        : 0.05,
                    }}
                    className="mt-2 flex w-full max-w-xs flex-col gap-2"
                  >
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex min-h-[2.75rem] w-full items-center justify-center border border-public-content font-geist text-sm font-semibold text-public-content transition-colors hover:bg-public-content hover:text-public-content-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex min-h-[2.75rem] w-full items-center justify-center gap-2 bg-public-highlight-surface font-geist text-sm font-semibold text-public-content-on-vivid transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2"
                    >
                      Essayer 21 jours
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

interface DesktopMenuItemProps {
  label: string
  menu: Exclude<DesktopMenu, null>
  isOpen: boolean
  children: ReactNode
  align?: 'left' | 'right'
  onOpen: (menu: Exclude<DesktopMenu, null>) => void
  /** Fermeture différée (survol souris) : laisse le temps de rejoindre le panneau */
  onClose: () => void
  /** Fermeture immédiate (Échap, sortie de focus clavier) */
  onCloseImmediate: () => void
  onToggle: (menu: Exclude<DesktopMenu, null>) => void
}

/**
 * Élément de navigation desktop en pattern « disclosure » (bouton + panneau).
 *
 * Choix d'accessibilité (SP-558) :
 * - Pas de `role="menu"` : ce ne sont que des liens, pas un menu applicatif
 *   APG. On expose donc `aria-expanded` + `aria-controls`, et les liens du
 *   panneau restent dans l'ordre naturel de tabulation.
 * - Le panneau est TOUJOURS monté dans le DOM (SSR) pour le maillage interne
 *   SEO/GEO et pour les crawlers qui n'exécutent aucune interaction. À l'état
 *   fermé, `inert` le retire de la tabulation, coupe les événements pointeur
 *   et le masque aux technologies d'assistance ; l'animation ne joue que sur
 *   l'opacité/translation, sans démontage.
 * - Fermeture sur sortie de focus réelle (`onBlur` + `relatedTarget`) et sur
 *   Échap, qui restaure le focus sur le bouton déclencheur.
 */
function DesktopMenuItem({
  label,
  menu,
  isOpen,
  children,
  align = 'left',
  onOpen,
  onClose,
  onCloseImmediate,
  onToggle,
}: DesktopMenuItemProps) {
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  // Empêche la réouverture parasite quand Échap rend le focus au bouton :
  // le `onFocus` du bouton consomme ce drapeau au lieu de rouvrir le panneau.
  const skipNextFocusOpenRef = useRef(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => onOpen(menu)}
      onMouseLeave={onClose}
      onBlur={(event) => {
        // Ne ferme que si le focus quitte réellement le disclosure
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onCloseImmediate()
        }
      }}
      // Échap depuis n'importe quel élément du disclosure (bouton ou lien du
      // panneau) ferme et rend le focus au bouton déclencheur. Le handler est
      // sur le conteneur : l'event bubble naturellement depuis la cible focusée.
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onCloseImmediate()
          if (document.activeElement !== buttonRef.current) {
            // Focus sur un lien du panneau : on le rend au bouton sans rouvrir.
            skipNextFocusOpenRef.current = true
            buttonRef.current?.focus()
          }
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => onToggle(menu)}
        onFocus={() => {
          if (skipNextFocusOpenRef.current) {
            skipNextFocusOpenRef.current = false
            return
          }
          onOpen(menu)
        }}
        className={cn(
          'flex min-h-[2.75rem] items-center gap-1 whitespace-nowrap font-geist text-sm font-medium text-public-content-muted transition-colors hover:text-public-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface',
          isOpen && 'text-public-content'
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/*
        `inert` (état fermé) coupe tabulation + pointeur + exposition a11y.
        Le contenu reste dans le DOM (SEO/GEO). Le masquage visuel se fait par
        l'opacité, animée par Framer Motion sans démontage.
      */}
      <motion.div
        id={panelId}
        inert={!isOpen}
        initial={false}
        animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className={cn(
          'absolute top-full z-50 pt-3',
          align === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div className="overflow-hidden border border-public-border bg-public-surface-subtle shadow-xl shadow-black/5">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

interface MenuLinkProps {
  href: string
  label: string
  description: string
  icon?: ReactNode
  onClick: () => void
}

function MenuLink({ href, label, description, icon, onClick }: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex gap-3 px-3 py-2.5 transition-colors hover:bg-public-surface focus-visible:bg-public-surface focus-visible:outline-none"
    >
      {icon && (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-public-accent/10 text-public-accent [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      )}
      <span>
        <span className="block font-geist text-sm font-medium text-public-content">
          {label}
        </span>
        <span className="mt-0.5 block font-geist text-xs leading-relaxed text-public-content-muted">
          {description}
        </span>
      </span>
    </Link>
  )
}
