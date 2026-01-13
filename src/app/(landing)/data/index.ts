/**
 * Landing page data and constants
 * Centralized data for features, pricing, FAQs, etc.
 */

import {
  Calendar,
  Users,
  Palmtree,
  LayoutDashboard,
  Bell,
  FileSpreadsheet,
  Zap,
  Clock,
  Shield,
  type LucideIcon,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  color: string
}

export interface Step {
  number: string
  title: string
  description: string
  icon: LucideIcon
}

export interface Stat {
  value: number
  suffix: string
  label: string
  icon: LucideIcon
}

export interface PricingPlan {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  popular: boolean
}

export interface FAQ {
  question: string
  answer: string
}

// ============================================================================
// NAV LINKS
// ============================================================================

export const navLinks = [
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#pricing', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

// ============================================================================
// FEATURES
// ============================================================================

export const features: Feature[] = [
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

// ============================================================================
// HOW IT WORKS STEPS
// ============================================================================

export const steps: Step[] = [
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

// ============================================================================
// STATS
// ============================================================================

export const stats: Stat[] = [
  { value: 99.9, suffix: '%', label: 'Disponibilité', icon: Clock },
  { value: 24, suffix: '/7', label: 'Support', icon: Bell },
  { value: 256, suffix: '-bit', label: 'Chiffrement', icon: Shield },
  { value: 100, suffix: '%', label: 'RGPD', icon: Users },
]

// ============================================================================
// PRICING PLANS
// ============================================================================

export const pricingPlans: PricingPlan[] = [
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

// ============================================================================
// FAQs
// ============================================================================

export const faqs: FAQ[] = [
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
// FOOTER LINKS
// ============================================================================

export const footerLinks = {
  product: [
    { href: '#features', label: 'Fonctionnalités' },
    { href: '#pricing', label: 'Tarifs' },
    { href: '#', label: 'Intégrations' },
    { href: '#', label: 'Changelog' },
  ],
  company: [
    { href: '#', label: 'À propos' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Carrières' },
    { href: '#contact', label: 'Contact' },
  ],
  legal: [
    { href: '#', label: 'Confidentialité' },
    { href: '#', label: 'CGU' },
    { href: '#', label: 'Mentions légales' },
  ],
}

// ============================================================================
// SOCIAL LINKS
// ============================================================================

export const socialLinks = [
  { href: '#', label: 'Twitter', icon: 'Twitter' },
  { href: '#', label: 'LinkedIn', icon: 'Linkedin' },
  { href: '#', label: 'GitHub', icon: 'Github' },
]
