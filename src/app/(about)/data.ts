/**
 * About page data
 * Centralized data for the about page content
 */

import {
  Building2,
  Factory,
  Heart,
  Shield,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Users,
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
    gradient: 'from-blue-600 to-blue-500',
  },
  {
    id: 'proximite',
    icon: Heart,
    title: 'Proximité',
    description:
      "Un support réactif et à l'écoute de vos besoins. Nous construisons SmartPlanning avec nos utilisateurs, pour nos utilisateurs.",
    gradient: 'from-blue-500 to-blue-400',
  },
  {
    id: 'fiabilite',
    icon: Shield,
    title: 'Fiabilité',
    description:
      'Sécurité des données garantie et disponibilité maximale du service. Vos plannings sont accessibles quand vous en avez besoin.',
    gradient: 'from-blue-400 to-blue-300',
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
    color: 'bg-blue-600/20',
  },
  {
    id: 'managers',
    icon: Users,
    title: 'Managers & RH',
    description:
      "Responsables d'équipes et professionnels des ressources humaines",
    color: 'bg-blue-500/20',
  },
  {
    id: 'industrie',
    icon: Factory,
    title: 'Industrie',
    description:
      'Usines, ateliers et sites de production avec des équipes en rotation',
    color: 'bg-blue-400/20',
  },
  {
    id: 'sante',
    icon: Stethoscope,
    title: 'Santé',
    description: 'Cliniques, cabinets médicaux et établissements de soins',
    color: 'bg-blue-300/20',
  },
  {
    id: 'commerce',
    icon: ShoppingBag,
    title: 'Commerce & Services',
    description: 'Boutiques, restaurants, hôtels et entreprises de services',
    color: 'bg-blue-200/20',
  },
]

// ============================================================================
// MISSION DATA
// ============================================================================

export const mission = {
  title: 'Notre mission',
  highlight: 'Simplifier la gestion planning',
  subtitle: 'pour les TPE et PME',
  description: `Nous croyons que la gestion des plannings ne devrait pas être une source de stress.
    Trop d'entreprises perdent un temps précieux avec des outils inadaptés, des fichiers Excel complexes
    ou des tableaux blancs difficiles à maintenir.`,
  solution: `SmartPlanning est né de cette conviction : offrir une solution moderne, intuitive et accessible
    qui permet aux managers de se concentrer sur l'essentiel, leurs équipes et leur métier.`,
}
