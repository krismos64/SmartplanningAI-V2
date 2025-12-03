/**
 * Page "Coming Soon" - SmartPlanning V2
 *
 * ✅ SP-129 : Page temporaire professionnelle
 *
 * OBJECTIF (CDA) :
 * Page d'accueil "En construction" pour valider le déploiement.
 * Design moderne avec animation Lottie et Framer Motion.
 *
 * FONCTIONNALITÉS :
 * - Animation Lottie centrale
 * - Animations Framer Motion (fade-in, stagger)
 * - Responsive mobile-first
 * - Dark mode supporté
 * - SEO optimisé
 */

'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Calendar, Users, Palmtree, LayoutDashboard } from 'lucide-react'

/**
 * Import dynamique du Lottie Player (SSR disabled)
 *
 * Le Player Lottie utilise `document` qui n'existe pas côté serveur.
 * On désactive le SSR pour ce composant uniquement.
 */
const Player = dynamic(
  () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
  { ssr: false }
)

/**
 * Features à venir - Liste des fonctionnalités principales
 */
const features = [
  {
    icon: Calendar,
    title: 'Plannings automatisés',
    description: 'Création et gestion intelligente des plannings',
  },
  {
    icon: Users,
    title: 'Multi-équipes',
    description: 'Gestion multi-équipes et multi-sites',
  },
  {
    icon: Palmtree,
    title: 'Congés simplifiés',
    description: 'Demandes et validations en quelques clics',
  },
  {
    icon: LayoutDashboard,
    title: 'Tableaux de bord',
    description: 'Dashboards personnalisés par rôle',
  },
]

/**
 * Variants Framer Motion pour les animations
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const, // easeOut cubic-bezier
    },
  },
}

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
}

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-950">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        <motion.div
          className="flex w-full max-w-4xl flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div
            className="mb-6 flex items-center gap-3"
            variants={logoVariants}
            whileHover="hover"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm sm:h-14 sm:w-14">
              <Calendar className="h-7 w-7 text-white sm:h-8 sm:w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Smart<span className="text-cyan-300">Planning</span>
            </h2>
          </motion.div>

          {/* Badge version */}
          <motion.span
            className="mb-8 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
            variants={itemVariants}
          >
            Version 2.0 - En développement
          </motion.span>

          {/* Lottie Animation */}
          <motion.div variants={itemVariants} className="mb-6 w-full max-w-sm">
            <Player
              autoplay
              loop
              src="/animations/planning-animation.json"
              style={{ height: '250px', width: '100%' }}
            />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="mb-4 text-center text-3xl font-bold text-white sm:text-4xl md:text-5xl"
            variants={itemVariants}
          >
            SmartPlanning arrive bientôt !
          </motion.h1>

          <motion.p
            className="mb-10 max-w-2xl text-center text-lg text-white/80 sm:text-xl"
            variants={itemVariants}
          >
            La solution intelligente de gestion des plannings d&apos;entreprise
          </motion.p>

          {/* Features grid */}
          <motion.div
            className="mb-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                className="group rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm transition-colors hover:bg-white/20"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <feature.icon className="mb-3 h-8 w-8 text-cyan-300 transition-transform group-hover:scale-110" />
                <h3 className="mb-1 font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Status badge */}
          <motion.div
            className="flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/20 px-4 py-2 backdrop-blur-sm"
            variants={itemVariants}
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400" />
            </span>
            <span className="text-sm font-medium text-green-300">
              Infrastructure opérationnelle
            </span>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center">
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} SmartPlanning - Tous droits réservés
        </p>
        <p className="mt-1 text-xs text-white/40">
          Projet CDA - Christophe Dev
        </p>
      </footer>
    </div>
  )
}
