/**
 * Landing page data and constants
 * Centralized data for features, pricing, FAQs, etc.
 */

import {
  Calendar,
  Users,
  Palmtree,
  LayoutDashboard,
  LayoutGrid,
  Bell,
  Zap,
  Clock,
  FileDown,
  CheckSquare,
  AlertTriangle,
  UserCog,
  ShieldCheck,
  FolderX,
  MessageSquare,
  Smartphone,
  Upload,
  MessagesSquare,
  Briefcase,
  UserSquare2,
  User,
  type LucideIcon,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  comingSoon?: boolean
}

export interface Step {
  number: string
  title: string
  description: string
  icon: LucideIcon
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
}

export interface VideoFeature {
  id: string
  title: string
  description: string
}

export interface RoleDemo {
  id: 'director' | 'manager' | 'employee'
  icon: LucideIcon
  label: string
  tagline: string
  videoId: string
  duration: string
  uploadDate: string
  description: string
  highlights: string[]
  color: string
  badgeColor: 'violet' | 'cyan' | 'emerald'
  thumbnail: string
}

// ============================================================================
// NAV LINKS
// ============================================================================

export const navLinks = [
  { href: '#role-demos', label: 'Par rôle' },
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
  },
  {
    icon: Users,
    title: 'Multi-équipes',
    description: 'Gérez plusieurs équipes et sites dans une seule interface.',
  },
  {
    icon: Palmtree,
    title: 'Gestion des congés',
    description:
      'Demandes et validations de congés en quelques clics avec workflow automatisé.',
  },
  {
    icon: LayoutDashboard,
    title: 'Tableaux de bord',
    description: 'Dashboards personnalisés par rôle avec métriques temps réel.',
  },
  {
    icon: CheckSquare,
    title: 'Gestion des tâches',
    description:
      'Todolist intégrée pour organiser et suivre les tâches de chaque employé.',
  },
  {
    icon: AlertTriangle,
    title: 'Suivi des incidents',
    description:
      'Tracez et gérez les incidents employés avec historique complet et rapports.',
  },
  {
    icon: FileDown,
    title: 'Exports PDF',
    description:
      'Exportez vos plannings et congés en PDF pour une consultation hors ligne.',
  },
  {
    icon: Bell,
    title: 'Notifications temps réel',
    description:
      'Alertes instantanées pour les changements de planning et événements importants.',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité des données RH',
    description:
      'Données cryptées et protégées. Conformité RGPD stricte, hébergement sécurisé en France. Confidentialité garantie.',
  },
  {
    icon: MessagesSquare,
    title: 'Messagerie interne',
    description:
      "Conversations en direct, par équipe ou en groupe. Envoyez des fichiers et images sans quitter l'outil. Zéro email interne.",
  },
  {
    icon: Upload,
    title: 'Import CSV / Excel',
    description:
      "Importez vos employés en masse depuis un fichier CSV ou Excel. Prévisualisation, validation en temps réel et rapport d'import détaillé inclus.",
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
    title: 'Utilisez au quotidien',
    description:
      'Les employés consultent leur planning et font leurs demandes de congés. Tout est centralisé et accessible.',
    icon: Calendar,
  },
]

// ============================================================================
// FAQs
// ============================================================================

export const faqs: FAQ[] = [
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer:
      "L'essai gratuit de 21 jours vous donne accès à toutes les fonctionnalités, sans restriction et sans carte bancaire.",
  },
  {
    question: 'Puis-je importer mes employés existants ?',
    answer:
      "Oui ! SmartPlanning intègre un outil d'import CSV et Excel complet : prévisualisez vos données, corrigez les erreurs en temps réel, puis importez tous vos employés en un clic. Un modèle de fichier est fourni pour vous guider.",
  },
  {
    question: "Combien d'utilisateurs puis-je ajouter ?",
    answer:
      "Il n'y a aucune limite ! Ajoutez autant d'employés que nécessaire. La facturation s'ajuste automatiquement à 2,90 € par employé et par mois.",
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Absolument. Nous utilisons un chiffrement AES-256, hébergement certifié ISO 27001 et conformité RGPD totale.',
  },
  {
    question: 'Quel support est disponible ?',
    answer:
      'Support email inclus pour tous les utilisateurs. Nous répondons sous 24h ouvrées.',
  },
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
  },
  {
    id: 'no-excel',
    icon: FolderX,
    title: 'Tout automatisé',
    description:
      'Vos plannings se construisent et se mettent à jour automatiquement, sans saisie manuelle.',
  },
  {
    id: 'communication',
    icon: MessageSquare,
    title: 'Communication intégrée',
    description:
      'Messagerie interne par équipe ou en groupe, avec notifications instantanées. Échangez directement dans l’outil.',
  },
  {
    id: 'centralized',
    icon: LayoutGrid,
    title: 'Tout centralisé',
    description:
      'Plannings, congés, tâches et incidents sur une seule plateforme.',
  },
  {
    id: 'mobile-realtime',
    icon: Smartphone,
    title: 'Planning sur mobile',
    description:
      'Vos employés consultent leur planning en temps réel sur leur téléphone, partout.',
  },
  {
    id: 'no-conflicts',
    icon: AlertTriangle,
    title: 'Zéro conflit d’horaires',
    description:
      'La détection automatique des chevauchements vous évite les erreurs de planification.',
  },
]

// ============================================================================
// ROLE DEMOS (Démos vidéo par rôle utilisateur)
// ============================================================================

export const roleDemos: RoleDemo[] = [
  {
    id: 'director',
    icon: Briefcase,
    label: 'Directeur',
    tagline: 'Pilotage global',
    videoId: 'K4bidIhB-LI',
    duration: '2:45',
    uploadDate: '2026-05-11T10:00:00+02:00',
    description:
      "Découvrez l'espace directeur de SmartPlanning : vue 360° de l'entreprise, pilotage multi-équipes, statistiques temps réel et gestion de la facturation.",
    highlights: [
      "Vue 360° de l'entreprise et de toutes les équipes",
      'Statistiques RH temps réel et tableaux de bord',
      'Gestion de la facturation per-seat automatique',
      "Configuration de l'entreprise et des managers",
      'Audit logs complets et conformité RGPD',
    ],
    color: 'from-violet-500 to-fuchsia-500',
    badgeColor: 'violet',
    thumbnail: '/images/demo-directeur.png',
  },
  {
    id: 'manager',
    icon: UserSquare2,
    label: 'Manager',
    tagline: 'Pilotage équipe',
    videoId: 'sy3ffTIj0ig',
    duration: '2:30',
    uploadDate: '2026-05-11T10:15:00+02:00',
    description:
      "Découvrez l'espace manager de SmartPlanning : création de plannings, validation de congés, messagerie interne et import CSV des employés.",
    highlights: [
      'Création et publication des plannings drag & drop',
      'Validation des demandes de congés en un clic',
      'Import CSV/Excel pour ajouter vos employés en masse',
      'Messagerie interne avec votre équipe',
      'Suivi des incidents et notes employés',
    ],
    color: 'from-cyan-500 to-blue-500',
    badgeColor: 'cyan',
    thumbnail: '/images/demo-manager.png',
  },
  {
    id: 'employee',
    icon: User,
    label: 'Employé',
    tagline: 'Mon quotidien',
    videoId: '8wJgk8i1uzQ',
    duration: '2:15',
    uploadDate: '2026-05-11T10:30:00+02:00',
    description:
      "Découvrez l'espace employé de SmartPlanning : consultation du planning, demandes de congés, notes personnelles et messagerie interne.",
    highlights: [
      'Consultation du planning personnel en temps réel',
      'Demande de congés en quelques clics',
      'Todolist privée pour organiser ses tâches',
      'Messagerie interne avec collègues et manager',
      'Export PDF du planning pour consultation offline',
    ],
    color: 'from-emerald-500 to-teal-500',
    badgeColor: 'emerald',
    thumbnail: '/images/demo-employe.png',
  },
]

// ============================================================================
// VIDEO FEATURES (Demo section)
// ============================================================================

export const videoFeatures: VideoFeature[] = [
  {
    id: 'intuitive',
    title: 'Interface intuitive',
    description: 'Dashboard clair, prise en main immédiate',
  },
  {
    id: 'key-features',
    title: 'Tout en un',
    description: 'Plannings, congés, messagerie et imports centralisés',
  },
  {
    id: 'results',
    title: 'Résultats concrets',
    description: 'Gagnez du temps dès le premier jour',
  },
]
