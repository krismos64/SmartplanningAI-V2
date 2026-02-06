'use client'

/**
 * NotFoundPage Component - SP-302
 *
 * Custom 404 page with animated illustration and navigation options.
 * Designed with Shadcn/ui components and Framer Motion animations.
 *
 * @see Context7 Documentation:
 * - Next.js 15: not-found.tsx for custom 404 UI in App Router
 * - Framer Motion: staggerChildren for cascading entry animations
 * - Accessibility: role="main", aria-label, aria-labelledby, aria-describedby
 *
 * @ticket SP-302
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, LayoutDashboard } from 'lucide-react'
import { NotFoundIllustration } from './NotFoundIllustration'
import { motion, staggerContainer, staggerItem } from '@/lib/animations'

/**
 * Quick links for additional navigation
 */
const quickLinks = [
  { href: '/#features', label: 'Fonctionnalités' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/#contact', label: 'Contact' },
]

/**
 * NotFoundPage - Custom 404 page component
 *
 * Features:
 * - Animated illustration with floating effect
 * - Large "404" with gradient text
 * - Clear messaging in French
 * - Navigation buttons: Home (primary) + Dashboard (outline)
 * - Quick links for common destinations
 * - Fully responsive (mobile-first)
 * - Dark mode support via Tailwind/Shadcn
 * - WCAG 2.1 AA accessible
 *
 * @returns Complete 404 page UI
 */
export function NotFoundPage() {
  return (
    <motion.div
      role="region"
      aria-label="Page non trouvée"
      aria-labelledby="not-found-title"
      aria-describedby="not-found-description"
      className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      data-testid="not-found-page"
    >
      {/* Animated Illustration */}
      <motion.div variants={staggerItem}>
        <NotFoundIllustration className="mb-6" />
      </motion.div>

      {/* 404 Number with Gradient */}
      <motion.div variants={staggerItem} className="text-center">
        <span
          className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-6xl font-bold text-transparent sm:text-7xl md:text-8xl"
          aria-hidden="true"
        >
          404
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        id="not-found-title"
        variants={staggerItem}
        className="mt-4 text-center text-xl font-semibold text-foreground sm:text-2xl md:text-3xl"
      >
        Page non trouvée
      </motion.h1>

      {/* Description */}
      <motion.p
        id="not-found-description"
        variants={staggerItem}
        className="mt-3 max-w-md px-4 text-center text-muted-foreground"
      >
        Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        Retournez à l&apos;accueil ou explorez d&apos;autres sections.
      </motion.p>

      {/* Navigation Buttons */}
      <motion.div
        variants={staggerItem}
        className="mt-8 flex flex-col gap-4 sm:flex-row"
      >
        <Button asChild size="lg" className="min-w-[160px]">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
            Accueil
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="min-w-[160px]">
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
      </motion.div>

      {/* Quick Links */}
      <motion.nav
        variants={staggerItem}
        className="mt-10 flex flex-wrap justify-center gap-4"
        aria-label="Liens rapides"
      >
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-sm text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {link.label}
          </Link>
        ))}
      </motion.nav>
    </motion.div>
  )
}
