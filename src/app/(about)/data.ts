/**
 * About page data
 * Centralized data for the about page content
 */

import {
  Building2,
  Factory,
  ShoppingBag,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface Value {
  id: string
  title: string
  description: string
}

export interface Target {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

// ============================================================================
// VALUES DATA
// ============================================================================

export const values: Value[] = [
  {
    id: 'simplicite',
    title: 'Simplicité',
    description:
      'Une interface intuitive qui permet une prise en main rapide. Pas besoin de formation, commencez à planifier en quelques minutes.',
  },
  {
    id: 'proximite',
    title: 'Proximité',
    description:
      "Un support réactif et à l'écoute de vos besoins. Nous construisons SmartPlanning avec nos utilisateurs, pour nos utilisateurs.",
  },
  {
    id: 'fiabilite',
    title: 'Fiabilité',
    description:
      'Sécurité des données garantie et disponibilité maximale du service. Vos plannings sont accessibles quand vous en avez besoin.',
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
  },
  {
    id: 'managers',
    icon: Users,
    title: 'Managers & RH',
    description:
      "Responsables d'équipes et professionnels des ressources humaines",
  },
  {
    id: 'industrie',
    icon: Factory,
    title: 'Industrie',
    description:
      'Usines, ateliers et sites de production avec des équipes en rotation',
  },
  {
    id: 'sante',
    icon: Stethoscope,
    title: 'Santé',
    description: 'Cliniques, cabinets médicaux et établissements de soins',
  },
  {
    id: 'commerce',
    icon: ShoppingBag,
    title: 'Commerce & Services',
    description: 'Boutiques, restaurants, hôtels et entreprises de services',
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
