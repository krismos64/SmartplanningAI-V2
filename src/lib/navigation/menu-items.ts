/**
 * Navigation Menu Items - Source de données centralisée
 *
 * Utilisé par :
 * - Sidebar (src/components/layout/Sidebar.tsx)
 * - CommandPalette (src/components/ui/command-palette.tsx)
 *
 * @see SP-264 - Command Palette
 */

import {
  Home,
  Calendar,
  Brain,
  Plane,
  ClipboardList,
  Users,
  UsersRound,
  BarChart,
  Settings,
  Building,
  Activity,
  AlertCircle,
  CreditCard,
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  Keyboard,
  FileText,
  Plus,
  UserPlus,
  CalendarPlus,
  type LucideIcon,
} from 'lucide-react'

export type UserRole = 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

export interface NavigationItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  roles: UserRole[] | 'ALL'
  keywords?: string[]
  shortcut?: string
}

export interface ActionItem {
  id: string
  label: string
  icon: LucideIcon
  action: string
  roles: UserRole[] | 'ALL'
  keywords?: string[]
}

export interface ThemeItem {
  id: string
  label: string
  icon: LucideIcon
  theme: 'light' | 'dark' | 'system'
  keywords?: string[]
}

export interface HelpItem {
  id: string
  label: string
  icon: LucideIcon
  action: string
  keywords?: string[]
}

/**
 * Items de navigation principale
 */
export const navigationItems: NavigationItem[] = [
  // Dashboard standard
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/app/tableau-de-bord',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
    keywords: ['accueil', 'home', 'tableau de bord'],
    shortcut: 'G H',
  },
  // SYSTEM_ADMIN specific
  {
    id: 'admin-dashboard',
    label: 'Dashboard SaaS',
    icon: Activity,
    href: '/app/admin/dashboard',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['admin', 'saas', 'tableau de bord'],
  },
  {
    id: 'companies',
    label: 'Entreprises',
    icon: Building,
    href: '/app/admin/entreprises',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['company', 'entreprise', 'organisation'],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Activity,
    href: '/app/admin/surveillance',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['monitor', 'surveillance', 'performance'],
  },
  {
    id: 'logs',
    label: 'Logs système',
    icon: AlertCircle,
    href: '/app/admin/journaux',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['log', 'error', 'erreur', 'système'],
  },
  // DIRECTOR/MANAGER items
  {
    id: 'employees',
    label: 'Collaborateurs',
    icon: Users,
    href: '/app/tableau-de-bord/employes',
    roles: ['DIRECTOR', 'MANAGER'],
    keywords: ['employee', 'employé', 'personnel', 'staff'],
    shortcut: 'G E',
  },
  {
    id: 'teams',
    label: 'Équipes',
    icon: UsersRound,
    href: '/app/directeur/equipes',
    roles: ['DIRECTOR'],
    keywords: ['team', 'équipe', 'groupe'],
    shortcut: 'G T',
  },
  {
    id: 'billing',
    label: 'Facturation',
    icon: CreditCard,
    href: '/app/tableau-de-bord/facturation',
    roles: ['DIRECTOR'],
    keywords: ['billing', 'facturation', 'abonnement', 'paiement', 'stripe'],
    shortcut: 'G B',
  },
  // Common items
  {
    id: 'schedules',
    label: 'Plannings',
    icon: Calendar,
    href: '/app/tableau-de-bord/plannings',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
    keywords: ['planning', 'schedule', 'calendrier', 'horaire'],
    shortcut: 'G P',
  },
  {
    id: 'leaves',
    label: 'Congés',
    icon: Plane,
    href: '/app/tableau-de-bord/conges',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
    keywords: ['leave', 'congé', 'vacance', 'absence'],
    shortcut: 'G C',
  },
  {
    id: 'tasks',
    label: 'Notes perso',
    icon: ClipboardList,
    href: '/app/tableau-de-bord/taches',
    roles: 'ALL',
    keywords: ['note', 'perso', 'personnel', 'tâche', 'todo', 'à faire'],
    shortcut: 'G N',
  },
  {
    id: 'stats',
    label: 'Statistiques',
    icon: BarChart,
    href: '/stats',
    roles: ['DIRECTOR', 'MANAGER'],
    keywords: ['statistic', 'statistique', 'rapport', 'analytics'],
  },
  {
    id: 'incidents',
    label: 'Incidents',
    icon: AlertCircle,
    href: '/app/tableau-de-bord/incidents',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
    keywords: ['incident', 'problème', 'alerte', 'issue', 'note'],
    shortcut: 'G I',
  },
  {
    id: 'ai-planning',
    label: 'IA Planning',
    icon: Brain,
    href: '/ai-planning',
    roles: ['DIRECTOR', 'MANAGER'],
    keywords: ['ia', 'ai', 'intelligence', 'artificielle', 'automatique'],
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    href: '/app/parametres',
    roles: ['DIRECTOR'],
    keywords: ['setting', 'paramètre', 'configuration', 'préférence'],
  },
]

/**
 * Actions rapides pour la Command Palette
 */
export const actionItems: ActionItem[] = [
  {
    id: 'create-planning',
    label: 'Créer un planning',
    icon: CalendarPlus,
    action: 'create-planning',
    roles: ['DIRECTOR', 'MANAGER'],
    keywords: ['nouveau', 'new', 'créer', 'planning'],
  },
  {
    id: 'add-employee',
    label: 'Ajouter un employé',
    icon: UserPlus,
    action: 'add-employee',
    roles: ['DIRECTOR', 'MANAGER'],
    keywords: ['nouveau', 'new', 'ajouter', 'employé', 'collaborateur'],
  },
  {
    id: 'create-team',
    label: 'Créer une équipe',
    icon: Plus,
    action: 'create-team',
    roles: ['DIRECTOR'],
    keywords: ['nouveau', 'new', 'créer', 'équipe', 'team'],
  },
]

/**
 * Options de thème
 */
export const themeItems: ThemeItem[] = [
  {
    id: 'theme-light',
    label: 'Mode clair',
    icon: Sun,
    theme: 'light',
    keywords: ['light', 'clair', 'jour', 'blanc'],
  },
  {
    id: 'theme-dark',
    label: 'Mode sombre',
    icon: Moon,
    theme: 'dark',
    keywords: ['dark', 'sombre', 'nuit', 'noir'],
  },
  {
    id: 'theme-system',
    label: 'Thème système',
    icon: Monitor,
    theme: 'system',
    keywords: ['system', 'système', 'auto', 'automatique'],
  },
]

/**
 * Items d'aide
 */
export const helpItems: HelpItem[] = [
  {
    id: 'shortcuts',
    label: 'Raccourcis clavier',
    icon: Keyboard,
    action: 'show-shortcuts',
    keywords: ['shortcut', 'raccourci', 'clavier', 'keyboard'],
  },
  {
    id: 'documentation',
    label: 'Documentation',
    icon: FileText,
    action: 'open-docs',
    keywords: ['doc', 'documentation', 'aide', 'help'],
  },
  {
    id: 'help',
    label: 'Aide',
    icon: HelpCircle,
    action: 'open-help',
    keywords: ['help', 'aide', 'support', 'assistance'],
  },
]

/**
 * Filtre les items de navigation par rôle
 */
export function getNavigationItemsByRole(role: UserRole): NavigationItem[] {
  return navigationItems.filter(
    (item) => item.roles === 'ALL' || item.roles.includes(role)
  )
}

/**
 * Filtre les actions par rôle
 */
export function getActionItemsByRole(role: UserRole): ActionItem[] {
  return actionItems.filter(
    (item) => item.roles === 'ALL' || item.roles.includes(role)
  )
}

/**
 * Récupère le label d'un rôle
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    SYSTEM_ADMIN: 'Super Administrateur',
    DIRECTOR: 'Directeur',
    MANAGER: 'Manager',
    EMPLOYEE: 'Employé',
  }
  return labels[role] || 'Utilisateur'
}
