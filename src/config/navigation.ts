/**
 * Configuration de la navigation par rôle pour SmartPlanning
 *
 * @description Définit les menus de navigation conditionnels selon le rôle utilisateur.
 * Structure en sections pour organiser visuellement les liens dans la Sidebar.
 *
 * @see src/lib/permissions.ts pour la hiérarchie des rôles
 * @ticket SP-154
 */

import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertCircle,
  BarChart,
  Brain,
  Building,
  Calendar,
  ClipboardList,
  Home,
  Plane,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react'
import type { UserRole } from '@prisma/client'

/**
 * Item de navigation individuel
 */
export interface NavItem {
  /** Identifiant unique pour le rendu React */
  id: string
  /** Label affiché dans le menu */
  label: string
  /** Route de destination */
  href: string
  /** Icône Lucide */
  icon: LucideIcon
  /** Badge optionnel (ex: nombre de notifications) */
  badge?: number
  /** Description pour tooltip en mode collapsed */
  description?: string
}

/**
 * Section de navigation (groupe de liens)
 */
export interface NavSection {
  /** Identifiant unique de la section */
  id: string
  /** Titre optionnel affiché au-dessus du groupe */
  title?: string
  /** Items de navigation dans cette section */
  items: NavItem[]
}

/**
 * Configuration complète de navigation par rôle
 */
export type NavigationConfig = Record<UserRole, NavSection[]>

/**
 * Configuration de navigation pour chaque rôle
 *
 * Structure :
 * - SYSTEM_ADMIN : Dashboard SaaS + Gestion plateforme
 * - DIRECTOR : Dashboard + Gestion entreprise + Planning + Analytics
 * - MANAGER : Dashboard + Gestion équipe + Planning
 * - EMPLOYEE : Dashboard + Mon planning
 */
export const navigationConfig: NavigationConfig = {
  SYSTEM_ADMIN: [
    {
      id: 'main',
      items: [
        {
          id: 'admin-dashboard',
          label: 'Dashboard SaaS',
          href: '/app/admin/dashboard',
          icon: Activity,
          description: "Vue d'ensemble de la plateforme",
        },
        {
          id: 'companies',
          label: 'Entreprises',
          href: '/app/admin/companies',
          icon: Building,
          description: 'Gestion des entreprises clientes',
        },
      ],
    },
    {
      id: 'monitoring',
      title: 'Supervision',
      items: [
        {
          id: 'monitoring',
          label: 'Monitoring',
          href: '/app/admin/monitoring',
          icon: Activity,
          description: 'Surveillance système',
        },
        {
          id: 'logs',
          label: 'Logs système',
          href: '/app/admin/logs',
          icon: AlertCircle,
          description: 'Journal des événements',
        },
      ],
    },
    {
      id: 'settings',
      title: 'Configuration',
      items: [
        {
          id: 'settings',
          label: 'Paramètres',
          href: '/app/admin/settings',
          icon: Settings,
          description: 'Configuration plateforme',
        },
      ],
    },
  ],

  DIRECTOR: [
    {
      id: 'main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/app/director/dashboard',
          icon: Home,
          description: 'Tableau de bord directeur',
        },
      ],
    },
    {
      id: 'management',
      title: 'Gestion',
      items: [
        {
          id: 'employees',
          label: 'Employés',
          href: '/app/dashboard/employees',
          icon: Users,
          description: 'Gestion des collaborateurs',
        },
        {
          id: 'teams',
          label: 'Équipes',
          href: '/app/director/teams',
          icon: UsersRound,
          description: 'Gestion des équipes',
        },
      ],
    },
    {
      id: 'planning',
      title: 'Planning',
      items: [
        {
          id: 'schedules',
          label: 'Plannings',
          href: '/app/schedules',
          icon: Calendar,
          description: 'Gestion des plannings',
        },
        {
          id: 'leaves',
          label: 'Congés',
          href: '/app/leaves',
          icon: Plane,
          description: 'Demandes de congés',
        },
      ],
    },
    {
      id: 'analytics',
      title: 'Analyses',
      items: [
        {
          id: 'stats',
          label: 'Statistiques',
          href: '/app/stats',
          icon: BarChart,
          description: 'Rapports et indicateurs',
        },
        {
          id: 'ai-planning',
          label: 'IA Planning',
          href: '/app/ai-planning',
          icon: Brain,
          description: 'Optimisation automatique',
        },
      ],
    },
    {
      id: 'config',
      title: 'Configuration',
      items: [
        {
          id: 'settings',
          label: 'Paramètres',
          href: '/app/settings',
          icon: Settings,
          description: 'Configuration entreprise',
        },
      ],
    },
  ],

  MANAGER: [
    {
      id: 'main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/app/manager/dashboard',
          icon: Home,
          description: 'Tableau de bord manager',
        },
      ],
    },
    {
      id: 'team',
      title: 'Mon équipe',
      items: [
        {
          id: 'my-team',
          label: 'Mes collaborateurs',
          href: '/app/dashboard/employees',
          icon: Users,
          description: 'Membres de mon équipe',
        },
        {
          id: 'tasks',
          label: 'Tâches',
          href: '/app/tasks',
          icon: ClipboardList,
          description: 'Gestion des tâches',
        },
      ],
    },
    {
      id: 'planning',
      title: 'Planning',
      items: [
        {
          id: 'schedules',
          label: 'Plannings',
          href: '/app/schedules',
          icon: Calendar,
          description: "Planning de l'équipe",
        },
        {
          id: 'leaves',
          label: 'Congés',
          href: '/app/leaves',
          icon: Plane,
          description: 'Validation des congés',
        },
      ],
    },
    {
      id: 'analytics',
      title: 'Analyses',
      items: [
        {
          id: 'stats',
          label: 'Statistiques',
          href: '/app/stats',
          icon: BarChart,
          description: 'Performance équipe',
        },
        {
          id: 'incidents',
          label: 'Incidents',
          href: '/app/incidents',
          icon: AlertCircle,
          description: 'Gestion des incidents',
        },
      ],
    },
  ],

  EMPLOYEE: [
    {
      id: 'main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/app/dashboard',
          icon: Home,
          description: 'Mon tableau de bord',
        },
      ],
    },
    {
      id: 'planning',
      title: 'Mon planning',
      items: [
        {
          id: 'my-schedule',
          label: 'Mon planning',
          href: '/app/schedules',
          icon: Calendar,
          description: 'Consulter mes horaires',
        },
        {
          id: 'my-leaves',
          label: 'Mes congés',
          href: '/app/leaves',
          icon: Plane,
          description: 'Demander des congés',
        },
        {
          id: 'my-tasks',
          label: 'Mes tâches',
          href: '/app/tasks',
          icon: ClipboardList,
          description: 'Mes tâches assignées',
        },
      ],
    },
  ],
}

/**
 * Récupère la configuration de navigation pour un rôle donné
 *
 * @param role - Rôle de l'utilisateur
 * @returns Sections de navigation pour ce rôle
 *
 * @example
 * const sections = getNavigationForRole('DIRECTOR')
 * // [{ id: 'main', items: [...] }, { id: 'management', title: 'Gestion', items: [...] }, ...]
 */
export function getNavigationForRole(role: UserRole): NavSection[] {
  return navigationConfig[role] ?? navigationConfig.EMPLOYEE
}

/**
 * Récupère tous les items de navigation à plat pour un rôle
 *
 * @param role - Rôle de l'utilisateur
 * @returns Liste plate de tous les NavItem
 *
 * @example
 * const items = getFlatNavigationItems('MANAGER')
 * // [{ id: 'dashboard', ... }, { id: 'my-team', ... }, ...]
 */
export function getFlatNavigationItems(role: UserRole): NavItem[] {
  const sections = getNavigationForRole(role)
  return sections.flatMap((section) => section.items)
}

/**
 * Vérifie si une route est accessible pour un rôle (présente dans sa navigation)
 *
 * @param href - Route à vérifier
 * @param role - Rôle de l'utilisateur
 * @returns true si la route est dans la navigation du rôle
 *
 * @example
 * isRouteInNavigation('/app/director/teams', 'DIRECTOR') // true
 * isRouteInNavigation('/app/director/teams', 'EMPLOYEE') // false
 */
export function isRouteInNavigation(href: string, role: UserRole): boolean {
  const items = getFlatNavigationItems(role)
  return items.some((item) => href.startsWith(item.href))
}

/**
 * Labels des sections pour les tests et l'accessibilité
 */
export const SECTION_LABELS: Record<string, string> = {
  main: 'Principal',
  management: 'Gestion',
  monitoring: 'Supervision',
  planning: 'Planning',
  analytics: 'Analyses',
  team: 'Mon équipe',
  config: 'Configuration',
  settings: 'Configuration',
}
