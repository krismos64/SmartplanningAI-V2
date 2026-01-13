/**
 * SmartPlanning Landing Page
 *
 * ✅ SP-XXX : Landing page professionnelle
 *
 * Design direction: Tech-Forward Elegance
 * - Futuristic yet professional aesthetic
 * - Bold gradients with floating 3D elements
 * - Sophisticated scroll-triggered animations
 * - Premium SaaS enterprise feel
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Calendar,
  Users,
  Palmtree,
  LayoutDashboard,
  Bell,
  FileSpreadsheet,
  ChevronRight,
  Check,
  Menu,
  X,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  PlayCircle,
  ChevronDown,
  Mail,
  Twitter,
  Linkedin,
  Github,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
}

// ============================================================================
// DATA
// ============================================================================

const features = [
  {
    icon: Calendar,
    title: 'Plannings automatisés',
    description:
      'Création intelligente de plannings optimisés grâce à notre algorithme IA avancé.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Users,
    title: 'Multi-équipes',
    description:
      'Gérez plusieurs équipes et sites depuis une interface unifiée et intuitive.',
    color: 'from-purple-500 to-pink-400',
  },
  {
    icon: Palmtree,
    title: 'Congés simplifiés',
    description:
      'Demandes et validations de congés en quelques clics avec workflow automatisé.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    icon: LayoutDashboard,
    title: 'Tableaux de bord',
    description: 'Dashboards personnalisés par rôle avec métriques temps réel.',
    color: 'from-orange-500 to-amber-400',
  },
  {
    icon: Bell,
    title: 'Notifications temps réel',
    description:
      'Alertes instantanées pour les changements de planning et événements importants.',
    color: 'from-rose-500 to-red-400',
  },
  {
    icon: FileSpreadsheet,
    title: 'Export & Import',
    description:
      'Compatibilité Excel, PDF et intégrations avec vos outils existants.',
    color: 'from-indigo-500 to-violet-400',
  },
]

const steps = [
  {
    number: '01',
    title: 'Créez votre entreprise',
    description:
      'Inscription gratuite en 2 minutes. Configurez vos équipes et vos paramètres.',
    icon: Zap,
  },
  {
    number: '02',
    title: 'Importez vos données',
    description:
      'Ajoutez vos employés manuellement ou importez depuis Excel/CSV.',
    icon: FileSpreadsheet,
  },
  {
    number: '03',
    title: 'Planifiez intelligemment',
    description:
      'Laissez notre IA générer des plannings optimisés ou créez-les manuellement.',
    icon: Calendar,
  },
]

const stats = [
  { value: 99.9, suffix: '%', label: 'Disponibilité', icon: Clock },
  { value: 24, suffix: '/7', label: 'Support', icon: Bell },
  { value: 256, suffix: '-bit', label: 'Chiffrement', icon: Shield },
  { value: 100, suffix: '%', label: 'RGPD', icon: Users },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Gratuit',
    description: 'Idéal pour démarrer',
    features: [
      "Jusqu'à 10 employés",
      '1 équipe',
      'Plannings basiques',
      'Export PDF',
      'Support email',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'Pro',
    price: '29€',
    period: '/mois',
    description: 'Pour les PME en croissance',
    features: [
      "Jusqu'à 100 employés",
      'Équipes illimitées',
      'Plannings IA',
      'Exports avancés',
      'Support prioritaire',
      'Intégrations API',
      'Rapports analytics',
    ],
    cta: 'Essai gratuit 14 jours',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    description: 'Pour les grandes entreprises',
    features: [
      'Employés illimités',
      'Multi-sites',
      'IA personnalisée',
      'SSO & SAML',
      'Support dédié 24/7',
      'API complète',
      'Formation incluse',
      'SLA garanti',
    ],
    cta: 'Nous contacter',
    popular: false,
  },
]

const faqs = [
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer:
      "L'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités Pro sans engagement. Aucune carte bancaire requise.",
  },
  {
    question: 'Puis-je importer mes données existantes ?',
    answer:
      "Oui ! SmartPlanning supporte l'import Excel, CSV et propose des intégrations avec les principaux outils RH du marché.",
  },
  {
    question: "Comment fonctionne l'IA de planification ?",
    answer:
      'Notre algorithme analyse vos contraintes (disponibilités, compétences, réglementations) pour générer des plannings optimisés automatiquement.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Absolument. Nous utilisons un chiffrement AES-256, hébergement certifié ISO 27001 et conformité RGPD totale.',
  },
  {
    question: 'Quel support est disponible ?',
    answer:
      'Support email pour tous, chat en direct et téléphone pour Pro, et un manager dédié pour Enterprise.',
  },
]

// ============================================================================
// COMPONENTS
// ============================================================================

function AnimatedCounter({
  value,
  suffix = '',
}: {
  value: number
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count.toLocaleString('fr-FR')}
      {suffix}
    </span>
  )
}

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <motion.div className="border-b border-white/10" initial={false}>
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-6 text-left"
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-cyan-400" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-white/70">{answer}</p>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const heroRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030712] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-purple-600/10 blur-[120px] delay-1000" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] animate-pulse rounded-full bg-cyan-500/5 blur-[100px] delay-500" />
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-500',
          isScrolled
            ? 'border-b border-white/5 bg-[#030712]/80 py-4 backdrop-blur-xl'
            : 'bg-transparent py-6'
        )}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-50 blur-lg transition-opacity group-hover:opacity-75" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Smart<span className="text-cyan-400">Planning</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 lg:flex">
              <a
                href="#features"
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                Fonctionnalités
              </a>
              <a
                href="#pricing"
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                Tarifs
              </a>
              <a
                href="#faq"
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                FAQ
              </a>
              <a
                href="#contact"
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                Contact
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden items-center gap-4 lg:flex">
              <Button
                variant="ghost"
                className="text-white/80 hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/login">Connexion</Link>
              </Button>
              <Button
                className="border-0 bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500"
                asChild
              >
                <Link href="/register">
                  Essai gratuit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="p-2 text-white lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </nav>

          {/* Mobile Menu */}
          <motion.div
            initial={false}
            animate={{
              height: mobileMenuOpen ? 'auto' : 0,
              opacity: mobileMenuOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden lg:hidden"
          >
            <div className="space-y-4 py-6">
              <a
                href="#features"
                className="block text-white/70 transition-colors hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fonctionnalités
              </a>
              <a
                href="#pricing"
                className="block text-white/70 transition-colors hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tarifs
              </a>
              <a
                href="#faq"
                className="block text-white/70 transition-colors hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <a
                href="#contact"
                className="block text-white/70 transition-colors hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  asChild
                >
                  <Link href="/register">Essai gratuit</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center pb-20 pt-32"
      >
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="container-custom"
        >
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="mb-6 inline-block">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                  </span>
                  Nouvelle version disponible
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeInUp}
                className="mb-6 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl"
              >
                Planifiez{' '}
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    intelligemment
                  </span>
                  <span className="absolute bottom-2 left-0 h-3 w-full -rotate-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30" />
                </span>
                <br />
                votre équipe
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={fadeInUp}
                className="mx-auto mb-8 max-w-xl text-lg text-white/60 sm:text-xl lg:mx-0"
              >
                La solution SaaS qui révolutionne la gestion des plannings
                d&apos;entreprise. Automatisez, optimisez et simplifiez votre
                organisation.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
              >
                <Button
                  size="lg"
                  className="h-14 border-0 bg-gradient-to-r from-blue-500 to-cyan-400 px-8 text-base text-white shadow-xl shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500"
                  asChild
                >
                  <Link href="/register">
                    Démarrer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-white/20 px-8 text-base text-white hover:bg-white/10"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Voir la démo
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Welcome Illustration */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="relative flex items-center justify-center"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl" />

              {/* Welcome Image */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                <Image
                  src="/images/logo-smartplanning.webp"
                  alt="Bienvenue sur SmartPlanning - Illustration avec personnage et robot IA"
                  width={500}
                  height={400}
                  className="relative z-10 drop-shadow-2xl"
                  priority
                />
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="absolute -right-2 top-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 shadow-xl shadow-emerald-500/30"
              >
                <Check className="h-6 w-6 text-white" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute -left-2 bottom-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 shadow-xl shadow-blue-500/30"
              >
                <Bell className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-white/40">Découvrir</span>
            <ChevronDown className="h-5 w-5 text-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="container-custom">
          {/* Section Header */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center lg:mb-24"
          >
            <motion.span
              variants={fadeInUp}
              className="mb-6 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400"
            >
              Fonctionnalités
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
            >
              Tout ce dont vous avez besoin
              <br />
              <span className="text-white/40">pour vos plannings</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mx-auto max-w-2xl text-lg text-white/60"
            >
              Des outils puissants pour automatiser et optimiser la gestion de
              vos équipes au quotidien.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/10"
              >
                {/* Icon */}
                <div
                  className={cn(
                    'mb-6 inline-flex rounded-2xl bg-gradient-to-br p-4',
                    feature.color
                  )}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold text-white transition-colors group-hover:text-cyan-400">
                  {feature.title}
                </h3>
                <p className="text-white/50">{feature.description}</p>

                {/* Hover Arrow */}
                <div className="absolute bottom-8 right-8 opacity-0 transition-opacity group-hover:opacity-100">
                  <ChevronRight className="h-5 w-5 text-cyan-400" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-b from-transparent via-blue-950/20 to-transparent py-24 lg:py-32">
        <div className="container-custom">
          {/* Section Header */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center lg:mb-24"
          >
            <motion.span
              variants={fadeInUp}
              className="mb-6 inline-block rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-400"
            >
              Comment ça marche
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
            >
              Démarrez en{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                3 étapes simples
              </span>
            </motion.h2>
          </motion.div>

          {/* Steps */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative grid gap-8 md:grid-cols-3 lg:gap-12"
          >
            {/* Connection Line */}
            <div className="absolute left-1/4 right-1/4 top-24 hidden h-0.5 bg-gradient-to-r from-purple-500/50 via-cyan-500/50 to-blue-500/50 md:block" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative text-center"
              >
                {/* Number */}
                <div className="relative z-10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-2xl font-bold">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-6 inline-flex rounded-full bg-white/5 p-4">
                  <step.icon className="h-8 w-8 text-cyan-400" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                <p className="mx-auto max-w-xs text-white/50">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 lg:py-32">
        <div className="container-custom">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 lg:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center"
              >
                <stat.icon className="mx-auto mb-4 h-8 w-8 text-cyan-400" />
                <div className="mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/50">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="bg-gradient-to-b from-transparent via-purple-950/10 to-transparent py-24 lg:py-32"
      >
        <div className="container-custom">
          {/* Section Header */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center lg:mb-24"
          >
            <motion.span
              variants={fadeInUp}
              className="mb-6 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400"
            >
              Tarifs
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
            >
              Des tarifs{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                transparents
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mx-auto max-w-2xl text-lg text-white/60"
            >
              Commencez gratuitement et évoluez selon vos besoins. Pas de frais
              cachés.
            </motion.p>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3"
          >
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className={cn(
                  'relative rounded-2xl border p-8 transition-all duration-300',
                  plan.popular
                    ? 'border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-purple-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-1 text-sm font-semibold text-white">
                      Populaire
                    </span>
                  </div>
                )}

                {/* Plan Info */}
                <div className="mb-8 text-center">
                  <h3 className="mb-2 text-xl font-semibold">{plan.name}</h3>
                  <p className="mb-4 text-sm text-white/50">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-white/50">{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={cn(
                    'h-12 w-full',
                    plan.popular
                      ? 'border-0 bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500'
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                  )}
                  asChild
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="bg-gradient-to-b from-transparent via-blue-950/10 to-transparent py-24 lg:py-32"
      >
        <div className="container-custom">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            {/* Left Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:sticky lg:top-32"
            >
              <motion.span
                variants={fadeInUp}
                className="mb-6 inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400"
              >
                FAQ
              </motion.span>
              <motion.h2
                variants={fadeInUp}
                className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
              >
                Questions{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  fréquentes
                </span>
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="mb-8 text-lg text-white/60"
              >
                Vous ne trouvez pas la réponse que vous cherchez ? Contactez
                notre équipe support.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Nous contacter
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - FAQ Items */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === i}
                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 lg:p-20"
          >
            {/* Background Elements */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-[120px]" />
            <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-400/20 blur-[120px]" />

            <div className="relative z-10 text-center">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                Prêt à transformer
                <br />
                votre gestion des plannings ?
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">
                Commencez dès maintenant à simplifier votre organisation avec
                SmartPlanning. Essai gratuit, sans engagement.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="h-14 bg-white px-8 text-base font-semibold text-blue-600 hover:bg-white/90"
                  asChild
                >
                  <Link href="/register">
                    Démarrer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-white/30 px-8 text-base text-white hover:bg-white/10"
                >
                  Demander une démo
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/5 py-16">
        <div className="container-custom">
          <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Link href="/" className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">
                  Smart<span className="text-cyan-400">Planning</span>
                </span>
              </Link>
              <p className="mb-6 text-sm text-white/50">
                La solution intelligente de gestion des plannings
                d&apos;entreprise.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="mb-4 font-semibold">Produit</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Tarifs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Intégrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="mb-4 font-semibold">Entreprise</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    À propos
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Carrières
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="mb-4 font-semibold">Légal</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    CGU
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    CGV
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-span-2 md:col-span-2 lg:col-span-1">
              <h4 className="mb-4 font-semibold">Newsletter</h4>
              <p className="mb-4 text-sm text-white/50">
                Recevez nos actualités et conseils planning.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 px-4 hover:from-blue-600 hover:to-cyan-500"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} SmartPlanning. Tous droits réservés.
            </p>
            <p className="text-sm text-white/40">
              Fait avec 💙 par{' '}
              <a
                href="https://christophe-dev-freelance.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 transition-colors hover:text-cyan-300"
              >
                Christophe Mostefaoui
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
