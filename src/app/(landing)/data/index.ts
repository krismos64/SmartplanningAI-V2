/**
 * Landing page data and constants
 * Centralized data for features, pricing, FAQs, etc.
 */

import {
  Calendar,
  Users,
  Users2,
  Palmtree,
  LayoutDashboard,
  LayoutGrid,
  Bell,
  FileSpreadsheet,
  Zap,
  Clock,
  Shield,
  FileDown,
  CheckSquare,
  AlertTriangle,
  UserCog,
  Sparkles,
  ShieldCheck,
  Monitor,
  Headphones,
  FolderX,
  MessageSquare,
  TrendingUp,
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
  comingSoon?: boolean
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

export interface Benefit {
  id: string
  icon: LucideIcon
  title: string
  description: string
  color: string
}

export interface VideoFeature {
  id: string
  title: string
  description: string
}

// ============================================================================
// NAV LINKS
// ============================================================================

export const navLinks = [
  { href: '#demo', label: 'Démo' },
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#how-it-works', label: 'Comment ça marche' },
  { href: '#benefits', label: 'Avantages' },
  { href: '#pricing', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

// ============================================================================
// FEATURES
// ============================================================================

export const features: Feature[] = [
  {
    icon: UserCog,
    title: 'Espaces dédiés',
    description:
      'Connexion sécurisée avec espaces personnalisés pour managers, employés et directeurs.',
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
    icon: CheckSquare,
    title: 'Gestion des tâches',
    description:
      'Todolist intégrée pour organiser et suivre les tâches de chaque employé.',
    color: 'from-cyan-500 to-blue-400',
  },
  {
    icon: AlertTriangle,
    title: 'Suivi des incidents',
    description:
      'Tracez et gérez les incidents employés avec historique complet et rapports.',
    color: 'from-rose-500 to-red-400',
  },
  {
    icon: FileDown,
    title: 'Exports PDF',
    description:
      'Exportez vos plannings et congés en PDF pour une consultation hors ligne.',
    color: 'from-indigo-500 to-violet-400',
  },
  {
    icon: Bell,
    title: 'Notifications temps réel',
    description:
      'Alertes instantanées pour les changements de planning et événements importants.',
    color: 'from-amber-500 to-orange-400',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité des données RH',
    description:
      'Données cryptées et protégées. Conformité RGPD stricte, hébergement sécurisé en France. Confidentialité garantie.',
    color: 'from-green-500 to-emerald-400',
  },
  {
    icon: Monitor,
    title: 'Interface multi-appareils',
    description:
      'Gérez vos plannings depuis ordinateur, tablette ou smartphone. Synchronisation en temps réel sur tous vos appareils.',
    color: 'from-sky-500 to-blue-400',
  },
  {
    icon: Headphones,
    title: 'Support réactif France',
    description:
      'Assistance en France avec réponse garantie sous 24h. Équipe dédiée pour résoudre vos problèmes rapidement.',
    color: 'from-pink-500 to-rose-400',
  },
  {
    icon: Sparkles,
    title: 'Plannings IA',
    description:
      'Création intelligente de plannings optimisés grâce à notre algorithme IA avancé.',
    color: 'from-violet-500 to-purple-400',
    comingSoon: true,
  },
]

// ============================================================================
// HOW IT WORKS STEPS
// ============================================================================

export const steps: Step[] = [
  {
    number: '01',
    title: 'Inscrivez votre entreprise',
    description:
      'Le directeur crée son compte, enregistre ses managers et configure ses équipes. Accès complet à toutes les données.',
    icon: Zap,
  },
  {
    number: '02',
    title: 'Organisez vos équipes',
    description:
      'Les managers gèrent leurs employés et créent les plannings de leurs équipes. Chaque rôle a son espace dédié.',
    icon: Users,
  },
  {
    number: '03',
    title: 'Simplifiez le quotidien',
    description:
      'Les employés consultent leur planning et font leurs demandes de congés. Tout est centralisé et accessible.',
    icon: Calendar,
  },
]

// ============================================================================
// STATS
// ============================================================================

export const stats: Stat[] = [
  { value: 24, suffix: 'h', label: 'Réponse support', icon: Clock },
  { value: 3, suffix: '', label: 'Rôles distincts', icon: Users },
  { value: 100, suffix: '%', label: 'Conforme RGPD', icon: Shield },
  { value: 100, suffix: '%', label: 'Hébergé en France', icon: Zap },
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

// ============================================================================
// BENEFITS (Why SmartPlanning section)
// ============================================================================

export const benefits: Benefit[] = [
  {
    id: 'time-saving',
    icon: Clock,
    title: 'Gain de temps',
    description:
      'Créez vos plannings en quelques clics au lieu de plusieurs heures.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'no-excel',
    icon: FolderX,
    title: 'Fini les fichiers Excel',
    description:
      'Plus de tableaux complexes à gérer, tout est automatisé et centralisé.',
    color: 'from-rose-500 to-pink-400',
  },
  {
    id: 'communication',
    icon: Users2,
    title: 'Communication fluide',
    description:
      'Managers et équipes connectés en temps réel, notifications instantanées.',
    color: 'from-purple-500 to-violet-400',
  },
  {
    id: 'centralized',
    icon: LayoutGrid,
    title: 'Tout centralisé',
    description:
      'Plannings, congés, tâches et incidents sur une seule plateforme.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'coordination',
    icon: MessageSquare,
    title: 'Meilleure coordination',
    description:
      'Visibilité totale sur les équipes pour une organisation optimale.',
    color: 'from-amber-500 to-orange-400',
  },
  {
    id: 'productivity',
    icon: TrendingUp,
    title: 'Productivité accrue',
    description:
      "Concentrez-vous sur l'essentiel, l'outil gère la complexité.",
    color: 'from-indigo-500 to-blue-400',
  },
]

// ============================================================================
// VIDEO FEATURES (Demo section)
// ============================================================================

export const videoFeatures: VideoFeature[] = [
  {
    id: 'intuitive',
    title: 'Interface intuitive',
    description: 'Découvrez la simplicité de notre dashboard',
  },
  {
    id: 'key-features',
    title: 'Fonctionnalités clés',
    description: 'Plannings, congés, équipes en un clic',
  },
  {
    id: 'results',
    title: 'Résultats concrets',
    description: 'Gagnez du temps dès le premier jour',
  },
]
