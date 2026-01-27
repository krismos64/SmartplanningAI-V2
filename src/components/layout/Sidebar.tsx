'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type UserRole = 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

interface SidebarProps {
  user: {
    name: string
    email: string
    role: UserRole
    organizationId?: string
    companyName?: string
  }
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
    href: '/app/dashboard',
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
    href: '/app/admin/companies',
    roles: ['SYSTEM_ADMIN'],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Activity,
    href: '/app/admin/monitoring',
    roles: ['SYSTEM_ADMIN'],
  },
  {
    id: 'logs',
    label: 'Logs système',
    icon: AlertCircle,
    href: '/app/admin/logs',
    roles: ['SYSTEM_ADMIN'],
  },
  // DIRECTOR items
  {
    id: 'employees',
    label: 'Collaborateurs',
    icon: Users,
    href: '/app/dashboard/employees',
    roles: ['DIRECTOR', 'MANAGER'],
  },
  {
    id: 'teams',
    label: 'Équipes',
    icon: UsersRound,
    href: '/app/director/teams',
    roles: ['DIRECTOR'],
  },
  {
    id: 'schedules',
    label: 'Plannings',
    icon: Calendar,
    href: '/app/dashboard/schedules',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
  },
  {
    id: 'leaves',
    label: 'Congés',
    icon: Plane,
    href: '/leaves',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
  },
  {
    id: 'tasks',
    label: 'Tâches',
    icon: ClipboardList,
    href: '/tasks',
    roles: ['DIRECTOR', 'MANAGER', 'EMPLOYEE'],
  },
  {
    id: 'stats',
    label: 'Statistiques',
    icon: BarChart,
    href: '/stats',
    roles: ['DIRECTOR', 'MANAGER'],
  },
  {
    id: 'incidents',
    label: 'Incidents',
    icon: AlertCircle,
    href: '/incidents',
    roles: ['DIRECTOR', 'MANAGER'],
  },
  {
    id: 'ai-planning',
    label: 'IA Planning',
    icon: Brain,
    href: '/ai-planning',
    roles: ['DIRECTOR', 'MANAGER'],
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    href: '/settings',
    roles: ['DIRECTOR'],
  },
]

function getMenuItemsByRole(role: UserRole): MenuItem[] {
  return menuItems.filter(
    (item) => item.roles === 'ALL' || item.roles.includes(role)
  )
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const filteredMenuItems = getMenuItemsByRole(user.role)
  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <SidebarPrimitive className="border-r">
      {/* Header */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <span className="text-lg font-semibold">
                {user.companyName || 'SmartPlanning'}
              </span>
              <span className="text-xs text-muted-foreground">
                {getRoleLabel(user.role)}
              </span>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={isCollapsed ? 'mx-auto' : ''}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {filteredMenuItems.map((item, index) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            const menuButton = (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <motion.div
                      className="flex w-full items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      {!isCollapsed && (
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )

            // Show tooltip only when collapsed
            if (isCollapsed) {
              return (
                <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            }

            return menuButton
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t p-4">
        <div
          className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </motion.div>
          )}
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
