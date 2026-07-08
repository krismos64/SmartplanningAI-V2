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
  Upload,
  MessageSquare,
  MailCheck,
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
 *
 * Source unique de verite pour la Sidebar et la CommandPalette.
 * L'ordre definit ici est l'ordre d'affichage dans la Sidebar.
 */
export const navigationItems: NavigationItem[] = [
  // Dashboard standard (tous sauf SYSTEM_ADMIN)
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/app/dashboard',
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
  // Messages — 2e position pour tous les rôles (usage quotidien)
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    href: '/app/dashboard/messages',
    roles: 'ALL',
    keywords: ['messages', 'chat', 'conversation', 'messagerie', 'discussion'],
  },
  {
    id: 'companies',
    label: 'Entreprises',
    icon: Building,
    href: '/app/admin/companies',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['company', 'entreprise', 'organisation'],
  },
  {
    id: 'admin-users',
    label: 'Utilisateurs',
    icon: Users,
    href: '/app/admin/users',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['user', 'utilisateur', 'compte'],
  },
  {
    id: 'admin-subscriptions',
    label: 'Abonnements',
    icon: CreditCard,
    href: '/app/admin/subscriptions',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['subscription', 'abonnement', 'paiement', 'stripe', 'mrr'],
  },
  {
    id: 'admin-emails',
    label: 'Emails',
    icon: MailCheck,
    href: '/app/admin/emails',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['email', 'mail', 'délivrabilité', 'smtp', 'journal', 'log'],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Activity,
    href: '/app/admin/monitoring',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['monitor', 'surveillance', 'performance'],
  },
  {
    id: 'admin-stats',
    label: 'Statistiques',
    icon: BarChart,
    href: '/app/admin/stats',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['statistic', 'statistique', 'rapport', 'analytics'],
  },
  {
    id: 'logs',
    label: 'Logs système',
    icon: AlertCircle,
    href: '/app/admin/logs',
    roles: ['SYSTEM_ADMIN'],
    keywords: ['log', 'error', 'erreur', 'système'],
  },
  // DIRECTOR/MANAGER items
  {
    id: 'employees',
    label: 'Collaborateurs',
    icon: Users,
    href: '/app/dashboard/employees',
    roles: ['DIRECTOR', 'MANAGER'],
    keywords: ['employee', 'employé', 'personnel', 'staff'],
    shortcut: 'G E',
  },
  {
    id: 'import',
    label: 'Import',
    icon: Upload,
    href: '/app/dashboard/import',
    roles: ['SYSTEM_ADMIN', 'DIRECTOR'],
    keywords: ['import', 'csv', 'excel', 'importer', 'données'],
  },
  {
    id: 'teams',
    label: 'Équipes',
    icon: UsersRound,
    href: '/app/director/teams',
    roles: ['DIRECTOR'],
    keywords: ['team', 'équipe', 'groupe'],
    shortcut: 'G T',
  },
  // Common items
  {
    id: 'schedules',
    label: 'Plannings',
    icon: Calendar,
    href: '/app/dashboard/schedules',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
    keywords: ['planning', 'schedule', 'calendrier', 'horaire'],
    shortcut: 'G P',
  },
  {
    id: 'leaves',
    label: 'Congés',
    icon: Plane,
    href: '/app/dashboard/leaves',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
    keywords: ['leave', 'congé', 'vacance', 'absence'],
    shortcut: 'G C',
  },
  {
    id: 'tasks',
    label: 'Notes perso',
    icon: ClipboardList,
    href: '/app/dashboard/tasks',
    roles: 'ALL',
    keywords: ['note', 'perso', 'personnel', 'tâche', 'todo', 'à faire'],
    shortcut: 'G N',
  },
  {
    id: 'incidents',
    label: 'Incidents',
    icon: AlertCircle,
    href: '/app/dashboard/incidents',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
    keywords: ['incident', 'problème', 'alerte', 'issue', 'note'],
    shortcut: 'G I',
  },
  {
    id: 'billing',
    label: 'Facturation',
    icon: CreditCard,
    href: '/app/dashboard/billing',
    roles: ['DIRECTOR'],
    keywords: ['billing', 'facturation', 'abonnement', 'paiement', 'stripe'],
    shortcut: 'G B',
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    href: '/app/settings',
    roles: 'ALL',
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
