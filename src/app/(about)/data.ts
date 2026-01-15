/**
 * About page data
 * Centralized data for the about page content
 */

import {
  Sparkles,
  Heart,
  Shield,
  Building2,
  Users,
  Factory,
  Stethoscope,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface Value {
  id: string
  icon: LucideIcon
  title: string
  description: string
  gradient: string
}

export interface Target {
  id: string
  icon: LucideIcon
  title: string
  description: string
  color: string
}

// ============================================================================
// VALUES DATA
// ============================================================================

export const values: Value[] = [
  {
    id: 'simplicite',
    icon: Sparkles,
    title: 'Simplicité',
    description:
      'Une interface intuitive qui permet une prise en main rapide. Pas besoin de formation, commencez à planifier en quelques minutes.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'proximite',
    icon: Heart,
    title: 'Proximité',
    description:
      "Un support réactif et à l'écoute de vos besoins. Nous construisons SmartPlanning avec nos utilisateurs, pour nos utilisateurs.",
    gradient: 'from-pink-500 to-rose-400',
  },
  {
    id: 'fiabilite',
    icon: Shield,
    title: 'Fiabilité',
    description:
      'Sécurité des données garantie et disponibilité maximale du service. Vos plannings sont accessibles quand vous en avez besoin.',
    gradient: 'from-emerald-500 to-teal-400',
  },
]

// ============================================================================
// TARGET AUDIENCE DATA
// ============================================================================

export const targets: Target[] = [
  {
    id: 'tpe-pme',
    icon: Building2,
    title: 'TPE / PME',
    description:
      'Entreprises de 5 à 250 salariés cherchant à optimiser leur organisation',
    color: 'bg-blue-500/20',
  },
  {
    id: 'managers',
    icon: Users,
    title: 'Managers & RH',
    description:
      "Responsables d'équipes et professionnels des ressources humaines",
    color: 'bg-purple-500/20',
  },
  {
    id: 'industrie',
    icon: Factory,
    title: 'Industrie',
    description:
      'Usines, ateliers et sites de production avec des équipes en rotation',
    color: 'bg-amber-500/20',
  },
  {
    id: 'sante',
    icon: Stethoscope,
    title: 'Santé',
    description: 'Cliniques, cabinets médicaux et établissements de soins',
    color: 'bg-emerald-500/20',
  },
  {
    id: 'commerce',
    icon: ShoppingBag,
    title: 'Commerce & Services',
    description: 'Boutiques, restaurants, hôtels et entreprises de services',
    color: 'bg-rose-500/20',
  },
]

// ============================================================================
// MISSION DATA
// ============================================================================

export const mission = {
  title: 'Notre mission',
  highlight: 'Simplifier la gestion planning',
  subtitle: 'pour toutes les entreprises',
  description: `Nous croyons que la gestion des plannings ne devrait pas être une source de stress.
    Trop d'entreprises perdent un temps précieux avec des outils inadaptés, des fichiers Excel complexes
    ou des tableaux blancs difficiles à maintenir.`,
  solution: `SmartPlanning est né de cette conviction : offrir une solution moderne, intuitive et accessible
    qui permet aux managers de se concentrer sur l'essentiel — leurs équipes et leur métier.`,
}
