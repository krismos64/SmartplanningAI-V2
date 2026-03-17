'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Home,
  Calendar,
  Plane,
  ClipboardList,
  Users,
  UsersRound,
  CreditCard,
  Settings,
  Building,
  Activity,
  AlertCircle,
  BarChart3,
} from 'lucide-react'

import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type UserRole = 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

/**
 * Variantes de style pour la sidebar
 * - neon: Style néon bleu/violet par défaut (original)
 * - gradient-glass: Glassmorphism avec dégradé sophistiqué
 * - aurora: Aurores boréales animées (vert/cyan/violet)
 * - cosmic: Effet cosmique 3D avec étoiles et nébuleuses
 */
export type SidebarVariant = 'neon' | 'gradient-glass' | 'aurora' | 'cosmic'

interface SidebarProps {
  user: {
    name: string
    email: string
    role: UserRole
    organizationId?: string
    companyName?: string
  }
  /** Variante de style de la sidebar (défaut: 'neon') */
  variant?: SidebarVariant
}

interface MenuItem {
  id: string
  label: string
  icon: typeof Home
  href: string
  roles: UserRole[] | 'ALL'
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/app/tableau-de-bord',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
  },
  // SYSTEM_ADMIN specific items
  {
    id: 'admin-dashboard',
    label: 'Dashboard SaaS',
    icon: Activity,
    href: '/app/admin/dashboard',
    roles: ['SYSTEM_ADMIN'],
  },
  {
    id: 'companies',
    label: 'Entreprises',
    icon: Building,
    href: '/app/admin/entreprises',
    roles: ['SYSTEM_ADMIN'],
  },
  {
    id: 'admin-users',
    label: 'Utilisateurs',
    icon: Users,
    href: '/app/admin/utilisateurs',
    roles: ['SYSTEM_ADMIN'],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Activity,
    href: '/app/admin/surveillance',
    roles: ['SYSTEM_ADMIN'],
  },
  {
    id: 'stats',
    label: 'Statistiques',
    icon: BarChart3,
    href: '/app/admin/statistiques',
    roles: ['SYSTEM_ADMIN'],
  },
  {
    id: 'logs',
    label: 'Logs système',
    icon: AlertCircle,
    href: '/app/admin/journaux',
    roles: ['SYSTEM_ADMIN'],
  },
  // DIRECTOR items
  {
    id: 'employees',
    label: 'Collaborateurs',
    icon: Users,
    href: '/app/tableau-de-bord/employes',
    roles: ['DIRECTOR', 'MANAGER'],
  },
  {
    id: 'teams',
    label: 'Équipes',
    icon: UsersRound,
    href: '/app/directeur/equipes',
    roles: ['DIRECTOR'],
  },
  {
    id: 'schedules',
    label: 'Plannings',
    icon: Calendar,
    href: '/app/tableau-de-bord/plannings',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
  },
  {
    id: 'leaves',
    label: 'Congés',
    icon: Plane,
    href: '/app/tableau-de-bord/conges',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
  },
  {
    id: 'tasks',
    label: 'Notes perso',
    icon: ClipboardList,
    href: '/app/tableau-de-bord/taches',
    roles: 'ALL',
  },
  {
    id: 'incidents',
    label: 'Incidents',
    icon: AlertCircle,
    href: '/app/tableau-de-bord/incidents',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
  },
  {
    id: 'billing',
    label: 'Facturation',
    icon: CreditCard,
    href: '/app/tableau-de-bord/facturation',
    roles: ['DIRECTOR'],
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    href: '/app/parametres',
    roles: 'ALL',
  },
]

function getMenuItemsByRole(role: UserRole): MenuItem[] {
  return menuItems.filter(
    (item) => item.roles === 'ALL' || item.roles.includes(role)
  )
}

/**
 * Mapping des variantes vers les classes CSS
 */
const variantClasses: Record<SidebarVariant, string> = {
  neon: 'sidebar-neon',
  'gradient-glass': 'sidebar-gradient-glass',
  aurora: 'sidebar-aurora',
  cosmic: 'sidebar-cosmic',
}

export function Sidebar({ user, variant = 'neon' }: SidebarProps) {
  const pathname = usePathname()
  const filteredMenuItems = getMenuItemsByRole(user.role)
  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sidebarClassName = variantClasses[variant]

  return (
    <SidebarPrimitive className={sidebarClassName}>
      {/* Header */}
      <SidebarHeader className="border-b border-white/[0.06] p-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col"
        >
          <span className="sidebar-neon-title text-lg">
            {user.companyName || 'SmartPlanning'}
          </span>
          <span className="text-xs text-slate-400">
            {getRoleLabel(user.role)}
          </span>
        </motion.div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {filteredMenuItems.map((item, index) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <div
                      className="sidebar-nav-item w-full"
                      data-active={isActive}
                    >
                      <motion.div
                        className="sidebar-nav-icon"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      <motion.span
                        className="text-sm font-medium"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {item.label}
                      </motion.span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <Avatar className="sp-avatar-neon h-8 w-8 rounded-full">
            <AvatarFallback className="bg-transparent text-xs text-blue-300">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col overflow-hidden"
          >
            <span className="truncate text-sm font-medium text-slate-200">
              {user.name}
            </span>
            <span className="truncate text-xs text-slate-400">
              {user.email}
            </span>
          </motion.div>
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  )
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return 'Super Administrateur'
    case 'DIRECTOR':
      return 'Directeur'
    case 'MANAGER':
      return 'Manager'
    case 'EMPLOYEE':
      return 'Employé'
    default:
      return 'Utilisateur'
  }
}
